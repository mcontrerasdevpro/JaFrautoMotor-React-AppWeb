import os
from datetime import timedelta
from functools import wraps
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_mail import Mail, Message
from sqlalchemy import func
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Appointment, Service, Lead, ahora_utc
import validacion as v
from validacion import ErrorValidacion

load_dotenv()

app = Flask(__name__)
app.url_map.strict_slashes = False
# Ningún formulario necesita más; corta peticiones gigantes antes de procesarlas
app.config['MAX_CONTENT_LENGTH'] = 64 * 1024

# En Render la petición llega a través de un proxy: sin esto, el rate limit
# vería la IP del proxy y no la del cliente. TRUSTED_PROXIES = nº de proxies delante.
proxies = int(os.getenv("TRUSTED_PROXIES", "1"))
if proxies > 0:
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=proxies)

# CORS: solo los dominios de la web pueden llamar a la API desde el navegador.
# CORS_ORIGINS es una lista separada por comas; admite expresiones regulares.
ORIGENES_POR_DEFECTO = (
    "https://ja-frauto-motor-react-app-web.vercel.app,"
    "https://jafrautomotor.com,https://www.jafrautomotor.com,"
    "http://localhost:3000,http://127.0.0.1:3000"
)
cors_origins = [o.strip() for o in os.getenv("CORS_ORIGINS", ORIGENES_POR_DEFECTO).split(",") if o.strip()]
CORS(app, origins=cors_origins)

# CONFIGURACIÓN DE LA BASE DE DATOS (PostgreSQL en Neon)
# La URL se lee del .env (DATABASE_URL_POOLED).
database_url = os.getenv("DATABASE_URL_POOLED") or os.getenv("DATABASE_URL")
if not database_url:
    raise RuntimeError("Falta DATABASE_URL_POOLED (o DATABASE_URL) en el .env")
app.config['SQLALCHEMY_DATABASE_URI'] = database_url.replace("postgresql://", "postgresql+psycopg2://", 1)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# Neon cierra las conexiones inactivas; sin pool_pre_ping, SQLAlchemy intenta reusar
# una conexión ya cerrada y falla con "SSL connection has been closed unexpectedly".
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {"pool_pre_ping": True}

jwt_secret = os.getenv("JWT_SECRET_KEY")
if not jwt_secret:
    raise RuntimeError("Falta JWT_SECRET_KEY en el .env")
app.config['JWT_SECRET_KEY'] = jwt_secret
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=int(os.getenv("JWT_EXPIRES_HOURS", "12")))

# CONFIGURACIÓN DE ENVÍO DE EMAILS (Gmail SMTP)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")
app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")
app.config['MAIL_DEFAULT_SENDER'] = ("JaFrauto Motor", os.getenv("MAIL_USERNAME"))
# A dónde llegan los avisos de presupuestos y citas nuevas
TALLER_NOTIFY_EMAIL = os.getenv("TALLER_NOTIFY_EMAIL") or os.getenv("MAIL_USERNAME")

MIGRATE = Migrate(app, db)
db.init_app(app)
jwt = JWTManager(app)
mail = Mail(app)

# RATE LIMITING: contadores en memoria por defecto (sirve con un solo proceso).
# Con varios workers o instancias, apuntar RATELIMIT_STORAGE_URI a Redis.
limiter = Limiter(
    get_remote_address,
    app=app,
    storage_uri=os.getenv("RATELIMIT_STORAGE_URI", "memory://"),
)

# --- RESPUESTAS DE ERROR EN ESPAÑOL ---

@app.errorhandler(ErrorValidacion)
def error_validacion(e):
    return jsonify({"msg": str(e)}), 400

@app.errorhandler(429)
def demasiadas_peticiones(e):
    return jsonify({"msg": "Demasiados intentos. Espera unos minutos y vuelve a probar."}), 429

@app.errorhandler(413)
def peticion_demasiado_grande(e):
    return jsonify({"msg": "La petición es demasiado grande"}), 413

@jwt.expired_token_loader
def token_caducado(jwt_header, jwt_payload):
    return jsonify({"msg": "Tu sesión ha caducado. Vuelve a iniciar sesión.", "code": "token_expired"}), 401

@jwt.invalid_token_loader
def token_invalido(motivo):
    return jsonify({"msg": "Sesión no válida. Vuelve a iniciar sesión.", "code": "token_invalid"}), 401

@jwt.unauthorized_loader
def sin_token(motivo):
    return jsonify({"msg": "Necesitas iniciar sesión.", "code": "token_missing"}), 401

# --- EMAILS ---

def enviar_email(asunto, destinatario, cuerpo):
    """Envía un email si el SMTP está configurado. Nunca rompe la petición."""
    if not destinatario or not app.config['MAIL_USERNAME']:
        app.logger.info(f"Email sin enviar (SMTP no configurado): {asunto}")
        return
    try:
        mail.send(Message(subject=asunto, recipients=[destinatario], body=cuerpo))
    except Exception as e:
        app.logger.warning(f"No se pudo enviar el email '{asunto}': {e}")

def enviar_confirmacion_cita(appointment, user):
    lista_servicios = ", ".join(s.get("name", "") for s in (appointment.services_ordered or []))
    cuerpo = f"""Hola {user.name},

Tu cita en JaFrauto Motor ha sido registrada con éxito.

Fecha: {appointment.date}
Hora: {appointment.time}
Servicios: {lista_servicios}
Total estimado: {appointment.total_price}€

Francisco o Jacinto te contactarán pronto para confirmar los detalles.

JaFrauto Motor
"""
    enviar_email("Confirmación de tu cita - JaFrauto Motor", user.email, cuerpo)

def avisar_taller_cita(appointment):
    lista_servicios = ", ".join(s.get("name", "") for s in (appointment.services_ordered or []))
    cuerpo = f"""Nueva cita desde la web:

Cliente: {appointment.client_name}
Teléfono: {appointment.client_contact}
Fecha: {appointment.date} a las {appointment.time}
Servicios: {lista_servicios}
Total estimado: {appointment.total_price}€

Ref. cita: {appointment.id}
"""
    enviar_email(f"Nueva cita web - {appointment.date} {appointment.time}", TALLER_NOTIFY_EMAIL, cuerpo)

def avisar_taller_lead(lead):
    titulo = "Nueva solicitud de presupuesto" if lead.kind == "presupuesto" else "Nuevo mensaje de contacto"
    cuerpo = f"""{titulo} desde la web:

Nombre: {lead.name}
Teléfono: {lead.phone}
Email: {lead.email or '-'}
Vehículo: {lead.vehicle or '-'}
Matrícula: {lead.plate or '-'}

Mensaje:
{lead.message}

Ref. solicitud: {lead.id}
"""
    enviar_email(f"{titulo} - {lead.name}", TALLER_NOTIFY_EMAIL, cuerpo)

# --- UTILIDADES ---

def leer_json():
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        raise ErrorValidacion("No hay datos en la petición")
    return body

def usuario_actual():
    return db.session.get(User, int(get_jwt_identity()))

def buscar_usuario_por_email(email):
    return User.query.filter(func.lower(User.email) == email.lower()).first()

def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user = usuario_actual()
        if not user or not user.is_admin:
            return jsonify({"msg": "Acceso solo para administradores"}), 403
        return fn(*args, **kwargs)
    return wrapper

# --- RUTAS DE LA API ---

@app.route('/')
def sitemap():
    return "Servidor de JaFrauto Motor Encendido 🏁"

# --- AUTENTICACIÓN DE CLIENTES ---

@app.route('/register', methods=['POST'])
@limiter.limit("5 per hour")
def register():
    body = leer_json()

    name = v.texto(body.get("name"), "nombre", minimo=2)
    email = v.email(body.get("email"))
    phone = v.telefono(body.get("phone"))
    password = v.password(body.get("password"))
    v.acepta_privacidad(body.get("acepta_privacidad"))

    if buscar_usuario_por_email(email):
        return jsonify({"msg": "Ya existe una cuenta con ese email"}), 409

    new_user = User(
        name=name,
        email=email,
        phone=phone,
        password=generate_password_hash(password),
        privacy_accepted_at=ahora_utc()
    )
    db.session.add(new_user)
    db.session.commit()

    token = create_access_token(identity=str(new_user.id))
    return jsonify({"token": token, "user": new_user.serialize()}), 201

@app.route('/login', methods=['POST'])
@limiter.limit("5 per minute;30 per hour")
def login():
    body = leer_json()

    email = body.get("email")
    password = body.get("password")
    user = buscar_usuario_por_email(email) if isinstance(email, str) else None

    if not user or not isinstance(password, str) or not check_password_hash(user.password, password):
        return jsonify({"msg": "Credenciales inválidas"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.serialize()}), 200

@app.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user = usuario_actual()
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404
    return jsonify(user.serialize()), 200

@app.route('/me', methods=['PUT'])
@jwt_required()
def update_me():
    user = usuario_actual()
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    body = leer_json()

    nuevo_email = v.email(body.get("email", user.email))
    if nuevo_email != user.email.lower():
        otro = buscar_usuario_por_email(nuevo_email)
        if otro and otro.id != user.id:
            return jsonify({"msg": "Ya existe una cuenta con ese email"}), 409

    user.name = v.texto(body.get("name", user.name), "nombre", minimo=2)
    user.phone = v.telefono(body.get("phone", user.phone))
    user.email = nuevo_email
    db.session.commit()

    return jsonify(user.serialize()), 200

# --- CATÁLOGO DE SERVICIOS ---

@app.route('/services', methods=['GET'])
def get_services():
    services = Service.query.order_by(Service.id).all()
    return jsonify([s.serialize() for s in services]), 200

# --- CITAS ---

# RUTA PARA RECIBIR UNA CITA DESDE LA WEB (requiere estar registrado)
@app.route('/appointment', methods=['POST'])
@jwt_required()
@limiter.limit("10 per hour")
def add_appointment():
    user = usuario_actual()
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    body = leer_json()
    fecha = v.fecha_cita(body.get("date"))
    hora = v.hora_cita(body.get("time"))
    ids = v.lista_ids(body.get("service_ids"), "servicio")

    # El precio sale siempre del catálogo de la base de datos, nunca del cliente
    servicios = Service.query.filter(Service.id.in_(ids)).all()
    if len(servicios) != len(ids):
        raise ErrorValidacion("Alguno de los servicios elegidos no existe")
    servicios.sort(key=lambda s: ids.index(s.id))

    new_appointment = Appointment(
        user_id=user.id,
        client_name=user.name,
        client_contact=user.phone,
        date=fecha,
        time=hora,
        services_ordered=[{"id": s.id, "name": s.name, "price": s.price} for s in servicios],
        total_price=round(sum(s.price for s in servicios), 2)
    )

    db.session.add(new_appointment)
    db.session.commit()

    enviar_confirmacion_cita(new_appointment, user)
    avisar_taller_cita(new_appointment)

    return jsonify({"msg": "Cita registrada con éxito en el taller", "appointment": new_appointment.serialize()}), 201

# RUTA PARA QUE EL CLIENTE VEA SU PROPIO HISTORIAL DE CITAS
@app.route('/my-appointments', methods=['GET'])
@jwt_required()
def get_my_appointments():
    user_id = int(get_jwt_identity())
    appointments = Appointment.query.filter_by(user_id=user_id).order_by(Appointment.id.desc()).all()
    return jsonify([a.serialize() for a in appointments]), 200

# RUTA PARA QUE EL CLIENTE CANCELE SU PROPIA CITA PENDIENTE
@app.route('/appointment/<int:appointment_id>/cancel', methods=['PATCH'])
@jwt_required()
def cancel_appointment(appointment_id):
    user_id = int(get_jwt_identity())
    appointment = db.session.get(Appointment, appointment_id)

    if not appointment:
        return jsonify({"msg": "Cita no encontrada"}), 404
    if appointment.user_id != user_id:
        return jsonify({"msg": "No tienes permiso sobre esta cita"}), 403
    if appointment.status != "Pendiente":
        return jsonify({"msg": "Solo se pueden cancelar citas pendientes"}), 400

    appointment.status = "Cancelada"
    db.session.commit()

    return jsonify(appointment.serialize()), 200

# RUTA PARA QUE FRANCISCO Y JACINTO VEAN TODAS LAS CITAS
@app.route('/appointments', methods=['GET'])
@admin_required
def get_all_appointments():
    appointments = Appointment.query.order_by(Appointment.id.desc()).all()
    return jsonify([a.serialize() for a in appointments]), 200

# RUTA PARA QUE EL PANEL DE ADMIN ACTUALICE EL ESTADO DE UNA CITA
@app.route('/appointment/<int:appointment_id>/status', methods=['PATCH'])
@admin_required
def update_appointment_status(appointment_id):
    appointment = db.session.get(Appointment, appointment_id)
    if not appointment:
        return jsonify({"msg": "Cita no encontrada"}), 404

    body = leer_json()
    appointment.status = v.opcion(body.get("status"), v.ESTADOS_CITA, "status")
    db.session.commit()

    return jsonify(appointment.serialize()), 200

# --- PRESUPUESTOS Y CONTACTO (LEADS) ---

# RUTA PÚBLICA: formulario de presupuesto o de contacto (sin cuenta)
@app.route('/leads', methods=['POST'])
@limiter.limit("3 per minute;10 per day")
def add_lead():
    body = leer_json()
    v.acepta_privacidad(body.get("acepta_privacidad"))

    lead = Lead(
        kind=v.opcion(body.get("kind"), v.TIPOS_LEAD, "kind"),
        name=v.texto(body.get("name"), "nombre", minimo=2),
        phone=v.telefono(body.get("phone")),
        email=v.email_opcional(body.get("email")),
        vehicle=v.texto_opcional(body.get("vehicle"), "vehículo"),
        plate=v.matricula_opcional(body.get("plate")),
        message=v.texto(body.get("message"), "mensaje", minimo=5, maximo=2000, multilinea=True),
        privacy_accepted_at=ahora_utc()
    )
    db.session.add(lead)
    db.session.commit()

    avisar_taller_lead(lead)

    return jsonify({"msg": "Solicitud recibida", "id": lead.id}), 201

@app.route('/leads', methods=['GET'])
@admin_required
def get_leads():
    leads = Lead.query.order_by(Lead.created_at.desc()).all()
    return jsonify([l.serialize() for l in leads]), 200

@app.route('/leads/<int:lead_id>/status', methods=['PATCH'])
@admin_required
def update_lead_status(lead_id):
    lead = db.session.get(Lead, lead_id)
    if not lead:
        return jsonify({"msg": "Solicitud no encontrada"}), 404

    body = leer_json()
    lead.status = v.opcion(body.get("status"), v.ESTADOS_LEAD, "status")
    db.session.commit()

    return jsonify(lead.serialize()), 200

# --- CLIENTES (CRM) ---

# RUTA PARA QUE EL ADMIN VEA TODOS LOS CLIENTES REGISTRADOS
@app.route('/clients', methods=['GET'])
@admin_required
def get_all_clients():
    clients = User.query.order_by(User.name).all()
    return jsonify([c.serialize_admin() for c in clients]), 200

# RUTA PARA QUE EL ADMIN GUARDE UNA NOTA INTERNA SOBRE UN CLIENTE
@app.route('/clients/<int:user_id>/notes', methods=['PATCH'])
@admin_required
def update_client_notes(user_id):
    client = db.session.get(User, user_id)
    if not client:
        return jsonify({"msg": "Cliente no encontrado"}), 404

    body = leer_json()
    notas = body.get("notes", "")
    client.notes = v.texto(notas, "notas", maximo=5000, multilinea=True) if notas else None
    db.session.commit()

    return jsonify(client.serialize_admin()), 200

if __name__ == '__main__':
       app.run(host='127.0.0.1', port=3001, debug=True)

import hmac
import os
import secrets
from datetime import date, timedelta
from functools import wraps
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity, verify_jwt_in_request
)
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from sqlalchemy import func
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Appointment, Service, Lead, BlockedDay, ahora_utc
import agenda
import asistente
import notificaciones as aviso
import validacion as v
from validacion import ErrorValidacion

load_dotenv()

app = Flask(__name__)
app.url_map.strict_slashes = False
# Ningún formulario necesita más; corta peticiones gigantes antes de procesarlas
app.config['MAX_CONTENT_LENGTH'] = 64 * 1024

# Detrás de un proxy (Render, Easypanel...) la petición llega a través de él: sin esto,
# el rate limit vería la IP del proxy y no la del cliente. TRUSTED_PROXIES = nº de proxies delante.
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

# CONFIGURACIÓN DE ENVÍO DE EMAILS (Gmail SMTP; ver notificaciones.py para Resend)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")
app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")
app.config['MAIL_DEFAULT_SENDER'] = ("JaFrauto Motor", os.getenv("MAIL_USERNAME"))

# Clave con la que n8n llama a los endpoints internos (recordatorios)
N8N_API_KEY = os.getenv("N8N_API_KEY")

MIGRATE = Migrate(app, db)
db.init_app(app)
jwt = JWTManager(app)
aviso.mail.init_app(app)

# RATE LIMITING: contadores en memoria por defecto (sirve con un solo proceso).
# Con varios workers o instancias, apuntar RATELIMIT_STORAGE_URI a Redis.
limiter = Limiter(
    get_remote_address,
    app=app,
    storage_uri=os.getenv("RATELIMIT_STORAGE_URI", "memory://"),
)

# --- RESPUESTAS DE ERROR EN ESPAÑOL ---

@app.errorhandler(agenda.HuecoNoDisponible)
def hueco_no_disponible(e):
    return jsonify({"msg": str(e), "code": "slot_unavailable"}), 409

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

# --- UTILIDADES ---

def leer_json():
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        raise ErrorValidacion("No hay datos en la petición")
    return body

def usuario_actual():
    return db.session.get(User, int(get_jwt_identity()))

def usuario_opcional():
    """Usuario del token si viene uno válido; None si la petición es de un invitado."""
    verify_jwt_in_request(optional=True)
    identidad = get_jwt_identity()
    return db.session.get(User, int(identidad)) if identidad else None

def buscar_usuario_por_email(email):
    return User.query.filter(func.lower(User.email) == email.lower()).first()

def buscar_cita_por_token(token):
    if not isinstance(token, str) or not 20 <= len(token) <= 64:
        return None
    return Appointment.query.filter_by(manage_token=token).first()

def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user = usuario_actual()
        if not user or not user.is_admin:
            return jsonify({"msg": "Acceso solo para administradores"}), 403
        return fn(*args, **kwargs)
    return wrapper

def n8n_required(fn):
    """Endpoints internos que llama n8n con la cabecera X-API-Key."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        clave = request.headers.get("X-API-Key", "")
        if not N8N_API_KEY or not hmac.compare_digest(clave, N8N_API_KEY):
            return jsonify({"msg": "No autorizado"}), 401
        return fn(*args, **kwargs)
    return wrapper

EVENTO_POR_ESTADO = {
    "Confirmada": "cita.confirmada",
    "Completada": "cita.completada",
    "Cancelada": "cita.cancelada",
    "Pendiente": "cita.cambiada"
}

# --- RUTAS DE LA API ---

@app.route('/')
def sitemap():
    return "Servidor de JaFrauto Motor Encendido 🏁"

# La web la llama al abrir la reserva para despertar la API (Render gratuito se duerme)
# y n8n la usa como ping en horario de taller
@app.route('/health')
@limiter.exempt
def health():
    return jsonify({"ok": True}), 200

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
    db.session.flush()

    # Cuenta creada justo después de reservar como invitado: la cita pasa a su historial
    cita = buscar_cita_por_token(body.get("manage_token"))
    if cita and cita.user_id is None:
        cita.user_id = new_user.id

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

# --- AGENDA Y ASISTENTE ---

# Huecos libres por día (solo laborables, desde mañana)
@app.route('/availability', methods=['GET'])
def get_availability():
    desde = request.args.get("from")
    try:
        desde = date.fromisoformat(desde) if desde else None
    except ValueError:
        raise ErrorValidacion("La fecha 'from' no es válida")
    dias = request.args.get("days", "14")
    if not dias.isdigit():
        raise ErrorValidacion("El parámetro 'days' debe ser un número")
    return jsonify({
        "capacity": agenda.capacidad_franja(),
        "days": agenda.disponibilidad(desde, int(dias))
    }), 200

# El asistente orienta del síntoma al servicio (nunca diagnostica ni da precios)
@app.route('/assistant/suggest', methods=['POST'])
@limiter.limit("10 per minute;40 per hour")
def assistant_suggest():
    body = leer_json()
    servicios = Service.query.order_by(Service.id).all()
    return jsonify(asistente.sugerir(body.get("text"), servicios)), 200

# --- CITAS ---

# RUTA PARA RESERVAR UNA CITA: con cuenta (token) o como invitado
@app.route('/appointment', methods=['POST'])
@limiter.limit("10 per hour")
def add_appointment():
    user = usuario_opcional()
    body = leer_json()

    if user:
        nombre, telefono, email = user.name, user.phone, user.email
    else:
        v.acepta_privacidad(body.get("acepta_privacidad"))
        nombre = v.texto(body.get("name"), "nombre", minimo=2)
        telefono = v.telefono(body.get("phone"))
        email = v.email_opcional(body.get("email"))

    ids = v.lista_ids(body.get("service_ids"), "servicio")
    vehiculo = v.texto(body.get("vehicle"), "marca y modelo", minimo=2)
    matricula = v.matricula_opcional(body.get("plate"))
    if not matricula:
        raise ErrorValidacion("La matrícula es obligatoria")
    sintoma = v.texto_opcional(body.get("symptom"), "síntoma", maximo=1000, multilinea=True)
    origen = body.get("source") if body.get("source") in ("web", "asistente") else "web"

    # El precio sale siempre del catálogo de la base de datos, nunca del cliente
    servicios = Service.query.filter(Service.id.in_(ids)).all()
    if len(servicios) != len(ids):
        raise ErrorValidacion("Alguno de los servicios elegidos no existe")
    servicios.sort(key=lambda s: ids.index(s.id))

    # Valida fecha/hora, bloquea la franja y comprueba que queda plaza (sin dobles reservas)
    fecha, hora = agenda.reservar_hueco(body.get("date"), body.get("time"))

    new_appointment = Appointment(
        user_id=user.id if user else None,
        client_name=nombre,
        client_contact=telefono,
        client_email=email,
        date=fecha,
        time=hora,
        services_ordered=[{"id": s.id, "name": s.name, "price": s.price} for s in servicios],
        total_price=round(sum(s.price for s in servicios), 2),
        vehicle=vehiculo,
        plate=matricula,
        symptom=sintoma,
        source=origen,
        manage_token=secrets.token_urlsafe(24)
    )

    db.session.add(new_appointment)
    db.session.commit()

    aviso.enviar_confirmacion_cita(new_appointment)
    aviso.avisar_taller_cita(new_appointment)
    aviso.emitir_evento("cita.creada", new_appointment)

    return jsonify({
        "msg": "Cita registrada con éxito en el taller",
        "appointment": new_appointment.serialize(),
        "manage_token": new_appointment.manage_token
    }), 201

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
    if appointment.status not in agenda.ESTADOS_QUE_OCUPAN:
        return jsonify({"msg": "Esta cita ya no se puede cancelar"}), 400

    appointment.status = "Cancelada"
    db.session.commit()
    aviso.avisar_taller_cita(appointment, "Cita cancelada por el cliente")
    aviso.emitir_evento("cita.cancelada", appointment)

    return jsonify(appointment.serialize()), 200

# --- GESTIÓN DE LA CITA POR ENLACE (sin cuenta) ---

@app.route('/appointment/manage/<token>', methods=['GET'])
@limiter.limit("30 per hour")
def manage_get(token):
    cita = buscar_cita_por_token(token)
    if not cita:
        return jsonify({"msg": "No encontramos esa cita. Revisa el enlace o llámanos."}), 404
    return jsonify(cita.serialize_publico()), 200

@app.route('/appointment/manage/<token>/cancel', methods=['POST'])
@limiter.limit("10 per hour")
def manage_cancel(token):
    cita = buscar_cita_por_token(token)
    if not cita:
        return jsonify({"msg": "No encontramos esa cita. Revisa el enlace o llámanos."}), 404
    if cita.status not in agenda.ESTADOS_QUE_OCUPAN:
        return jsonify({"msg": "Esta cita ya no se puede cancelar"}), 400

    cita.status = "Cancelada"
    db.session.commit()
    aviso.avisar_taller_cita(cita, "Cita cancelada por el cliente")
    aviso.emitir_evento("cita.cancelada", cita)
    return jsonify(cita.serialize_publico()), 200

@app.route('/appointment/manage/<token>/reschedule', methods=['POST'])
@limiter.limit("10 per hour")
def manage_reschedule(token):
    cita = buscar_cita_por_token(token)
    if not cita:
        return jsonify({"msg": "No encontramos esa cita. Revisa el enlace o llámanos."}), 404
    if cita.status not in agenda.ESTADOS_QUE_OCUPAN:
        return jsonify({"msg": "Esta cita ya no se puede cambiar"}), 400

    body = leer_json()
    fecha, hora = agenda.reservar_hueco(body.get("date"), body.get("time"), excluir_id=cita.id)
    cita.date, cita.time = fecha, hora
    # Al cambiar de día vuelve a quedar pendiente de confirmar por el taller
    cita.status = "Pendiente"
    cita.reminder_sent_at = None
    db.session.commit()

    aviso.avisar_taller_cita(cita, "Cita cambiada por el cliente")
    aviso.emitir_evento("cita.cambiada", cita)
    return jsonify(cita.serialize_publico()), 200

# --- PANEL DEL TALLER ---

# RUTA PARA QUE FRANCISCO Y JACINTO VEAN TODAS LAS CITAS
@app.route('/appointments', methods=['GET'])
@admin_required
def get_all_appointments():
    appointments = Appointment.query.order_by(Appointment.date.desc(), Appointment.time.desc()).all()
    return jsonify([a.serialize() for a in appointments]), 200

# RUTA PARA QUE EL PANEL DE ADMIN ACTUALICE EL ESTADO DE UNA CITA
@app.route('/appointment/<int:appointment_id>/status', methods=['PATCH'])
@admin_required
def update_appointment_status(appointment_id):
    appointment = db.session.get(Appointment, appointment_id)
    if not appointment:
        return jsonify({"msg": "Cita no encontrada"}), 404

    body = leer_json()
    nuevo = v.opcion(body.get("status"), v.ESTADOS_CITA, "status")
    if nuevo != appointment.status:
        appointment.status = nuevo
        db.session.commit()
        aviso.emitir_evento(EVENTO_POR_ESTADO[nuevo], appointment)

    return jsonify(appointment.serialize()), 200

@app.route('/blocked-days', methods=['GET'])
@admin_required
def get_blocked_days():
    dias = BlockedDay.query.filter(BlockedDay.day >= v.hoy_en_taller()).order_by(BlockedDay.day).all()
    return jsonify([d.serialize() for d in dias]), 200

@app.route('/blocked-days', methods=['POST'])
@admin_required
def add_blocked_day():
    body = leer_json()
    bloqueado = agenda.bloquear_dia(body.get("date"), body.get("reason"))
    return jsonify({
        **bloqueado.serialize(),
        "citas_afectadas": agenda.citas_afectadas(bloqueado.day)
    }), 201

@app.route('/blocked-days/<int:blocked_id>', methods=['DELETE'])
@admin_required
def delete_blocked_day(blocked_id):
    bloqueado = db.session.get(BlockedDay, blocked_id)
    if not bloqueado:
        return jsonify({"msg": "Día no encontrado"}), 404
    db.session.delete(bloqueado)
    db.session.commit()
    return jsonify({"msg": "Día desbloqueado"}), 200

@app.route('/settings/agenda', methods=['GET'])
@admin_required
def get_agenda_settings():
    return jsonify({"capacity": agenda.capacidad_franja(), "slots": list(v.FRANJAS_CITA)}), 200

@app.route('/settings/agenda', methods=['PUT'])
@admin_required
def update_agenda_settings():
    body = leer_json()
    return jsonify({"capacity": agenda.guardar_capacidad(body.get("capacity"))}), 200

# --- ENDPOINTS INTERNOS PARA N8N ---

# Citas de mañana sin recordatorio enviado (n8n las pide una vez al día)
@app.route('/internal/reminders', methods=['GET'])
@n8n_required
def get_reminders():
    manana = (v.hoy_en_taller() + timedelta(days=1)).isoformat()
    citas = Appointment.query.filter(
        Appointment.date == manana,
        Appointment.status.in_(agenda.ESTADOS_QUE_OCUPAN),
        Appointment.reminder_sent_at.is_(None)
    ).order_by(Appointment.time).all()
    return jsonify([aviso.datos_cita(c) for c in citas]), 200

@app.route('/internal/appointments/<int:appointment_id>/reminded', methods=['POST'])
@n8n_required
def mark_reminded(appointment_id):
    cita = db.session.get(Appointment, appointment_id)
    if not cita:
        return jsonify({"msg": "Cita no encontrada"}), 404
    cita.reminder_sent_at = ahora_utc()
    db.session.commit()
    return jsonify({"ok": True}), 200

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

    aviso.avisar_taller_lead(lead)

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

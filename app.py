import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from flask_mail import Mail, Message
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Appointment, Service

load_dotenv()

app = Flask(__name__)
CORS(app)
app.url_map.strict_slashes = False

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

# CONFIGURACIÓN DE ENVÍO DE EMAILS (Gmail SMTP)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")
app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")
app.config['MAIL_DEFAULT_SENDER'] = ("JaFrauto Motor", os.getenv("MAIL_USERNAME"))

MIGRATE = Migrate(app, db)
db.init_app(app)
JWTManager(app)
mail = Mail(app)

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
    mensaje = Message(
        subject="Confirmación de tu cita - JaFrauto Motor",
        recipients=[user.email],
        body=cuerpo
    )
    mail.send(mensaje)

# --- RUTAS DE LA API ---

@app.route('/')
def sitemap():
    return "Servidor de JaFrauto Motor Encendido 🏁"

# --- AUTENTICACIÓN DE CLIENTES ---

@app.route('/register', methods=['POST'])
def register():
    body = request.get_json()
    if not body:
        return jsonify({"msg": "No hay datos en la petición"}), 400

    name = body.get("name")
    email = body.get("email")
    phone = body.get("phone")
    password = body.get("password")

    if not name or not email or not phone or not password:
        return jsonify({"msg": "Faltan campos obligatorios (name, email, phone, password)"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Ya existe una cuenta con ese email"}), 409

    new_user = User(
        name=name,
        email=email,
        phone=phone,
        password=generate_password_hash(password)
    )
    db.session.add(new_user)
    db.session.commit()

    token = create_access_token(identity=str(new_user.id))
    return jsonify({"token": token, "user": new_user.serialize()}), 201

@app.route('/login', methods=['POST'])
def login():
    body = request.get_json()
    if not body:
        return jsonify({"msg": "No hay datos en la petición"}), 400

    email = body.get("email")
    password = body.get("password")
    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password or ""):
        return jsonify({"msg": "Credenciales inválidas"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.serialize()}), 200

@app.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404
    return jsonify(user.serialize()), 200

@app.route('/me', methods=['PUT'])
@jwt_required()
def update_me():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    body = request.get_json()
    if not body:
        return jsonify({"msg": "No hay datos en la petición"}), 400

    nuevo_email = body.get("email", user.email)
    if nuevo_email != user.email and User.query.filter_by(email=nuevo_email).first():
        return jsonify({"msg": "Ya existe una cuenta con ese email"}), 409

    user.name = body.get("name", user.name)
    user.phone = body.get("phone", user.phone)
    user.email = nuevo_email
    db.session.commit()

    return jsonify(user.serialize()), 200

# --- CITAS ---

# RUTA PARA RECIBIR UNA CITA DESDE LA WEB (requiere estar registrado)
@app.route('/appointment', methods=['POST'])
@jwt_required()
def add_appointment():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    body = request.get_json()
    if not body:
        return jsonify({"msg": "No hay datos en la petición"}), 400

    new_appointment = Appointment(
        user_id=user.id,
        client_name=user.name,
        client_contact=user.phone,
        date=body.get("date"),
        time=body.get("time"),
        services_ordered=body.get("services"),
        total_price=body.get("total")
    )

    db.session.add(new_appointment)
    db.session.commit()

    try:
        enviar_confirmacion_cita(new_appointment, user)
    except Exception as e:
        app.logger.warning(f"No se pudo enviar el email de confirmación: {e}")

    return jsonify({"msg": "Cita registrada con éxito en el taller"}), 201

# RUTA PARA QUE EL CLIENTE VEA SU PROPIO HISTORIAL DE CITAS
@app.route('/my-appointments', methods=['GET'])
@jwt_required()
def get_my_appointments():
    user_id = int(get_jwt_identity())
    appointments = Appointment.query.filter_by(user_id=user_id).all()
    return jsonify([a.serialize() for a in appointments]), 200

# RUTA PARA QUE EL CLIENTE CANCELE SU PROPIA CITA PENDIENTE
@app.route('/appointment/<int:appointment_id>/cancel', methods=['PATCH'])
@jwt_required()
def cancel_appointment(appointment_id):
    user_id = int(get_jwt_identity())
    appointment = Appointment.query.get(appointment_id)

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
def get_all_appointments():
    appointments = Appointment.query.all()
    all_appointments = list(map(lambda x: x.serialize(), appointments))
    return jsonify(all_appointments), 200

# RUTA PARA QUE EL PANEL DE ADMIN ACTUALICE EL ESTADO DE UNA CITA
@app.route('/appointment/<int:appointment_id>/status', methods=['PATCH'])
def update_appointment_status(appointment_id):
    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return jsonify({"msg": "Cita no encontrada"}), 404

    body = request.get_json()
    nuevo_estado = body.get("status") if body else None
    if not nuevo_estado:
        return jsonify({"msg": "Falta el campo status"}), 400

    appointment.status = nuevo_estado
    db.session.commit()

    return jsonify(appointment.serialize()), 200

if __name__ == '__main__':
       app.run(host='127.0.0.1', port=3001, debug=True)

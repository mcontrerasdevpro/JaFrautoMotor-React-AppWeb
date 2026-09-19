import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
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

MIGRATE = Migrate(app, db)
db.init_app(app)
CORS(app)

# --- RUTAS DE LA API ---

@app.route('/')
def sitemap():
    return "Servidor de JaFrauto Motor Encendido 🏁"

# RUTA PARA RECIBIR UNA CITA DESDE LA WEB
@app.route('/appointment', methods=['POST'])
def add_appointment():
    body = request.get_json()

    # Validación básica
    if not body:
        return jsonify({"msg": "No hay datos en la petición"}), 400
    
    new_appointment = Appointment(
        client_name=body.get("client"),
        client_contact=body.get("contact"),
        date=body.get("date"),
        time=body.get("time"),
        services_ordered=body.get("services"),
        total_price=body.get("total")
    )

    db.session.add(new_appointment)
    db.session.commit()

    return jsonify({"msg": "Cita registrada con éxito en el taller"}), 201

# RUTA PARA QUE FRANCISCO Y JACINTO VEAN TODAS LAS CITAS
@app.route('/appointments', methods=['GET'])
def get_all_appointments():
    appointments = Appointment.query.all()
    all_appointments = list(map(lambda x: x.serialize(), appointments))
    return jsonify(all_appointments), 200

if __name__ == '__main__':
       app.run(host='127.0.0.1', port=3001, debug=True)
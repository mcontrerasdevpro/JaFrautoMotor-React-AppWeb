from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone

db = SQLAlchemy()


def ahora_utc():
    return datetime.now(timezone.utc)


class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(30), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(250), nullable=False)
    is_active = db.Column(db.Boolean(), default=True)
    is_admin = db.Column(db.Boolean(), nullable=False, default=False)
    notes = db.Column(db.Text, nullable=True)
    # Fecha en la que aceptó la política de privacidad (null en cuentas anteriores a la casilla)
    privacy_accepted_at = db.Column(db.DateTime(timezone=True), nullable=True)
    appointments = db.relationship('Appointment', backref='user', lazy=True)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "is_admin": self.is_admin
        }

    def serialize_admin(self):
        return {**self.serialize(), "notes": self.notes}

class Service(db.Model):
    __tablename__ = 'service'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(500))

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "price": self.price,
            "description": self.description
        }

class Appointment(db.Model):
    __tablename__ = 'appointment'
    id = db.Column(db.Integer, primary_key=True)
    # Null en las citas de invitado (reservadas sin cuenta)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    client_name = db.Column(db.String(100), nullable=False)
    client_contact = db.Column(db.String(100), nullable=False)
    client_email = db.Column(db.String(120), nullable=True)
    date = db.Column(db.String(50), nullable=False, index=True) # Fecha ISO AAAA-MM-DD (validada en la API)
    time = db.Column(db.String(20), nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default="Pendiente")
    services_ordered = db.Column(db.JSON, nullable=False)
    vehicle = db.Column(db.String(100), nullable=True)
    plate = db.Column(db.String(20), nullable=True)
    symptom = db.Column(db.Text, nullable=True)
    source = db.Column(db.String(20), nullable=False, default="web")  # web | asistente | panel
    # Enlace privado para que el cliente consulte, cambie o cancele sin cuenta
    manage_token = db.Column(db.String(64), unique=True, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), nullable=True, default=ahora_utc)
    reminder_sent_at = db.Column(db.DateTime(timezone=True), nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "client": self.client_name,
            "contact": self.client_contact,
            "email": self.client_email,
            "date": self.date,
            "time": self.time,
            "services": self.services_ordered,
            "total": self.total_price,
            "status": self.status,
            "vehicle": self.vehicle,
            "plate": self.plate,
            "symptom": self.symptom,
            "source": self.source,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

    def serialize_publico(self):
        """Lo que ve quien abre el enlace de gestión: sin ids internos ni notas."""
        return {
            "date": self.date,
            "time": self.time,
            "status": self.status,
            "client": self.client_name,
            "services": [s.get("name") for s in (self.services_ordered or [])],
            "total": self.total_price,
            "vehicle": self.vehicle,
            "plate": self.plate
        }

class BlockedDay(db.Model):
    """Día en que no se aceptan citas (festivo, vacaciones...). Lo gestiona el taller desde el panel."""
    __tablename__ = 'blocked_day'
    id = db.Column(db.Integer, primary_key=True)
    day = db.Column(db.Date, unique=True, nullable=False)
    reason = db.Column(db.String(120), nullable=True)

    def serialize(self):
        return {"id": self.id, "date": self.day.isoformat(), "reason": self.reason}

class Setting(db.Model):
    """Ajustes sencillos clave/valor (capacidad por franja, contador de uso de IA...)."""
    __tablename__ = 'setting'
    key = db.Column(db.String(60), primary_key=True)
    value = db.Column(db.String(200), nullable=False)

class Lead(db.Model):
    """Solicitud de presupuesto o mensaje de contacto enviado desde la web."""
    __tablename__ = 'lead'
    id = db.Column(db.Integer, primary_key=True)
    kind = db.Column(db.String(20), nullable=False)  # presupuesto | contacto
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(30), nullable=False)
    email = db.Column(db.String(120), nullable=True)
    vehicle = db.Column(db.String(100), nullable=True)
    plate = db.Column(db.String(20), nullable=True)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="Nuevo")
    privacy_accepted_at = db.Column(db.DateTime(timezone=True), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=ahora_utc)

    def serialize(self):
        return {
            "id": self.id,
            "kind": self.kind,
            "name": self.name,
            "phone": self.phone,
            "email": self.email,
            "vehicle": self.vehicle,
            "plate": self.plate,
            "message": self.message,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

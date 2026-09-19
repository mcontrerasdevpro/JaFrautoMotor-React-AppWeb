from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

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

class Appointment(db.Model):
    __tablename__ = 'appointment'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    client_name = db.Column(db.String(100), nullable=False)
    client_contact = db.Column(db.String(100), nullable=False)
    date = db.Column(db.String(50), nullable=False) # Guardamos como string para simplificar el envío desde React
    time = db.Column(db.String(20), nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default="Pendiente")
    services_ordered = db.Column(db.JSON, nullable=False) 

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "client": self.client_name,
            "contact": self.client_contact,
            "date": self.date,
            "time": self.time,
            "services": self.services_ordered,
            "total": self.total_price,
            "status": self.status
        }
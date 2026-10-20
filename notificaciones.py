"""Avisos que salen de la API: emails al cliente y al taller y webhooks para n8n.

Nada de esto puede romper una petición: si un envío falla se registra en el
log y la reserva sigue adelante.

- EMAIL_PROVIDER=smtp (por defecto, Gmail con Flask-Mail) o resend (API HTTP de
  Resend; necesita RESEND_API_KEY y un remitente de dominio verificado en EMAIL_FROM).
- N8N_WEBHOOK_URL + N8N_WEBHOOK_SECRET: cada evento de cita se envía firmado con
  HMAC-SHA256 en la cabecera X-JaFrauto-Signature ("sha256=<hex>").
- N8N_WEBHOOK_TOKEN (opcional): se envía en X-JaFrauto-Token para que el nodo
  Webhook de n8n lo compruebe con una credencial "Header Auth".
"""
import hashlib
import hmac
import json
import os
import threading
import urllib.request
from datetime import datetime, timezone
from flask import current_app
from flask_mail import Mail, Message

mail = Mail()

TELEFONO_TALLER = os.getenv("TALLER_TELEFONO", "953 121 814")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://ja-frauto-motor-react-app-web.vercel.app").rstrip("/")


def enlace_gestion(appointment):
    return f"{FRONTEND_URL}/cita/{appointment.manage_token}" if appointment.manage_token else None


def _lista_servicios(appointment):
    return ", ".join(s.get("name", "") for s in (appointment.services_ordered or []))


# --- EMAIL ---

def _enviar_resend(asunto, destinatario, cuerpo):
    datos = json.dumps({
        "from": os.getenv("EMAIL_FROM", "JaFrauto Motor <citas@jafrautomotor.com>"),
        "to": [destinatario],
        "subject": asunto,
        "text": cuerpo
    }).encode()
    peticion = urllib.request.Request(
        "https://api.resend.com/emails", data=datos, method="POST",
        headers={"Authorization": f"Bearer {os.getenv('RESEND_API_KEY', '')}", "Content-Type": "application/json"}
    )
    with urllib.request.urlopen(peticion, timeout=10):
        pass


def enviar_email(asunto, destinatario, cuerpo):
    """Envía un email si hay proveedor configurado. Nunca rompe la petición."""
    if not destinatario:
        return
    proveedor = os.getenv("EMAIL_PROVIDER", "smtp").lower()
    try:
        if proveedor == "resend":
            if not os.getenv("RESEND_API_KEY"):
                current_app.logger.info(f"Email sin enviar (falta RESEND_API_KEY): {asunto}")
                return
            _enviar_resend(asunto, destinatario, cuerpo)
        else:
            if not current_app.config.get('MAIL_USERNAME'):
                current_app.logger.info(f"Email sin enviar (SMTP no configurado): {asunto}")
                return
            mail.send(Message(subject=asunto, recipients=[destinatario], body=cuerpo))
    except Exception as e:
        current_app.logger.warning(f"No se pudo enviar el email '{asunto}': {e}")


def email_taller():
    return os.getenv("TALLER_NOTIFY_EMAIL") or current_app.config.get('MAIL_USERNAME')


def enviar_confirmacion_cita(appointment):
    enlace = enlace_gestion(appointment)
    cuerpo = f"""Hola {appointment.client_name},

Tu cita en JaFrauto Motor ha sido registrada con éxito.

Fecha: {appointment.date}
Hora: {appointment.time}
Servicios: {_lista_servicios(appointment)}
Vehículo: {appointment.vehicle or '-'} {appointment.plate or ''}
Total estimado: {appointment.total_price}€ (orientativo; el precio final lo confirma el taller)

Francisco o Jacinto te contactarán pronto para confirmar los detalles.
{f"Si necesitas cambiar o cancelar la cita: {enlace}" if enlace else ""}
Para cualquier urgencia, llámanos al {TELEFONO_TALLER}.

JaFrauto Motor
"""
    enviar_email("Confirmación de tu cita - JaFrauto Motor", appointment.client_email, cuerpo)


def avisar_taller_cita(appointment, titulo="Nueva cita desde la web"):
    cuerpo = f"""{titulo}:

Cliente: {appointment.client_name}
Teléfono: {appointment.client_contact}
Email: {appointment.client_email or '-'}
Fecha: {appointment.date} a las {appointment.time}
Servicios: {_lista_servicios(appointment)}
Vehículo: {appointment.vehicle or '-'}
Matrícula: {appointment.plate or '-'}
Síntoma: {appointment.symptom or '-'}
Total estimado: {appointment.total_price}€
Estado: {appointment.status}

Ref. cita: {appointment.id}
"""
    enviar_email(f"{titulo} - {appointment.date} {appointment.time}", email_taller(), cuerpo)


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
    enviar_email(f"{titulo} - {lead.name}", email_taller(), cuerpo)


# --- WEBHOOKS PARA N8N ---

def datos_cita(appointment):
    """Datos de una cita tal y como los recibe n8n (webhook y recordatorios)."""
    return {
        "id": appointment.id,
        "fecha": appointment.date,
        "hora": appointment.time,
        "estado": appointment.status,
        "servicios": [s.get("name") for s in (appointment.services_ordered or [])],
        "total_estimado": appointment.total_price,
        "cliente": {
            "nombre": appointment.client_name,
            "telefono": appointment.client_contact,
            "email": appointment.client_email
        },
        "vehiculo": appointment.vehicle,
        "matricula": appointment.plate,
        "enlace_gestion": enlace_gestion(appointment)
    }


def firmar(cuerpo_bytes, secreto):
    return "sha256=" + hmac.new(secreto.encode(), cuerpo_bytes, hashlib.sha256).hexdigest()


def _post_webhook(url, cuerpo, cabeceras, logger):
    try:
        peticion = urllib.request.Request(url, data=cuerpo, method="POST", headers=cabeceras)
        with urllib.request.urlopen(peticion, timeout=8):
            pass
    except Exception as e:
        logger.warning(f"No se pudo enviar el webhook a n8n: {e}")


def emitir_evento(evento, appointment):
    """Avisa a n8n de un cambio en una cita (cita.creada, cita.cambiada, cita.cancelada,
    cita.confirmada, cita.completada). Se envía en segundo plano para no retrasar la respuesta."""
    url = os.getenv("N8N_WEBHOOK_URL")
    secreto = os.getenv("N8N_WEBHOOK_SECRET")
    if not url or not secreto:
        return
    cuerpo = json.dumps({
        "evento": evento,
        "enviado_en": datetime.now(timezone.utc).isoformat(),
        "cita": datos_cita(appointment),
        "taller": {"nombre": "JaFrauto Motor", "telefono": TELEFONO_TALLER}
    }, ensure_ascii=False).encode()
    cabeceras = {"Content-Type": "application/json", "X-JaFrauto-Signature": firmar(cuerpo, secreto)}
    if os.getenv("N8N_WEBHOOK_TOKEN"):
        cabeceras["X-JaFrauto-Token"] = os.getenv("N8N_WEBHOOK_TOKEN")
    hilo = threading.Thread(
        target=_post_webhook,
        args=(url, cuerpo, cabeceras, current_app.logger),
        daemon=True
    )
    hilo.start()

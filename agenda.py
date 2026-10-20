"""Agenda del taller: franjas, capacidad, días bloqueados y huecos libres.

Las citas en estado Pendiente o Confirmada ocupan plaza; las Canceladas y
Completadas no. Para que dos reservas simultáneas no se lleven la última plaza
de una franja, se toma un bloqueo de Postgres por (fecha, hora) dentro de la
misma transacción en la que se cuenta y se inserta.
"""
import os
from datetime import date, timedelta
from sqlalchemy import func, text
from models import db, Appointment, BlockedDay, Setting
import validacion as v
from validacion import ErrorValidacion

ESTADOS_QUE_OCUPAN = ("Pendiente", "Confirmada")
CLAVE_CAPACIDAD = "capacidad_franja"
CAPACIDAD_POR_DEFECTO = int(os.getenv("CAPACIDAD_FRANJA", "3"))
CAPACIDAD_MAXIMA = 20


class HuecoNoDisponible(ErrorValidacion):
    """La franja está llena o el día está bloqueado (la API responde 409)."""


def capacidad_franja():
    ajuste = db.session.get(Setting, CLAVE_CAPACIDAD)
    try:
        return int(ajuste.value) if ajuste else CAPACIDAD_POR_DEFECTO
    except ValueError:
        return CAPACIDAD_POR_DEFECTO


def guardar_capacidad(valor):
    if not isinstance(valor, int) or isinstance(valor, bool) or not 1 <= valor <= CAPACIDAD_MAXIMA:
        raise ErrorValidacion(f"La capacidad debe ser un número entre 1 y {CAPACIDAD_MAXIMA}")
    ajuste = db.session.get(Setting, CLAVE_CAPACIDAD)
    if ajuste:
        ajuste.value = str(valor)
    else:
        db.session.add(Setting(key=CLAVE_CAPACIDAD, value=str(valor)))
    db.session.commit()
    return valor


def _ocupacion(desde_iso, hasta_iso, excluir_id=None):
    """{(fecha, hora): nº de citas que ocupan plaza} en el rango [desde, hasta]."""
    consulta = (
        db.session.query(Appointment.date, Appointment.time, func.count(Appointment.id))
        .filter(Appointment.date >= desde_iso, Appointment.date <= hasta_iso)
        .filter(Appointment.status.in_(ESTADOS_QUE_OCUPAN))
    )
    if excluir_id:
        consulta = consulta.filter(Appointment.id != excluir_id)
    return {(fecha, hora): n for fecha, hora, n in consulta.group_by(Appointment.date, Appointment.time)}


def disponibilidad(desde=None, dias=14):
    """Días laborables a partir de `desde` (por defecto mañana) con las plazas libres de cada franja."""
    manana = v.hoy_en_taller() + timedelta(days=1)
    inicio = max(desde or manana, manana)
    limite = v.hoy_en_taller() + timedelta(days=v.DIAS_MAXIMOS_RESERVA)
    dias = max(1, min(dias, 30))

    laborables = []
    dia = inicio
    while len(laborables) < dias and dia <= limite:
        if dia.weekday() < 5:
            laborables.append(dia)
        dia += timedelta(days=1)
    if not laborables:
        return []

    bloqueados = {
        b.day: b.reason
        for b in BlockedDay.query.filter(BlockedDay.day >= laborables[0], BlockedDay.day <= laborables[-1])
    }
    ocupacion = _ocupacion(laborables[0].isoformat(), laborables[-1].isoformat())
    capacidad = capacidad_franja()

    resultado = []
    for dia in laborables:
        fecha = dia.isoformat()
        if dia in bloqueados:
            resultado.append({"date": fecha, "blocked": True, "reason": bloqueados[dia], "slots": []})
            continue
        franjas = [
            {"time": hora, "free": max(capacidad - ocupacion.get((fecha, hora), 0), 0)}
            for hora in v.FRANJAS_CITA
        ]
        resultado.append({"date": fecha, "blocked": False, "reason": None, "slots": franjas})
    return resultado


def _bloquear_franja(fecha, hora):
    # Bloqueo transaccional de Postgres: se libera solo al hacer commit o rollback
    if db.engine.dialect.name == "postgresql":
        db.session.execute(text("SELECT pg_advisory_xact_lock(hashtext(:clave))"), {"clave": f"cita:{fecha}:{hora}"})


def reservar_hueco(fecha, hora, excluir_id=None):
    """Valida fecha y hora, bloquea la franja y comprueba que queda plaza.

    Debe llamarse dentro de la transacción que luego inserta o mueve la cita.
    `excluir_id` sirve para cambiar de hora una cita sin contarse a sí misma.
    """
    fecha = v.fecha_cita(fecha)
    hora = v.hora_cita(hora)
    bloqueado = BlockedDay.query.filter_by(day=date.fromisoformat(fecha)).first()
    if bloqueado:
        motivo = f" ({bloqueado.reason})" if bloqueado.reason else ""
        raise HuecoNoDisponible(f"Ese día el taller no da citas{motivo}. Elige otro día.")

    _bloquear_franja(fecha, hora)
    ocupadas = _ocupacion(fecha, fecha, excluir_id).get((fecha, hora), 0)
    if ocupadas >= capacidad_franja():
        raise HuecoNoDisponible("Esa hora se acaba de completar. Elige otra franja, por favor.")
    return fecha, hora


def bloquear_dia(valor, motivo=None):
    try:
        dia = date.fromisoformat(valor)
    except (TypeError, ValueError):
        raise ErrorValidacion("La fecha no es válida")
    if dia < v.hoy_en_taller():
        raise ErrorValidacion("No se puede bloquear un día que ya ha pasado")
    if BlockedDay.query.filter_by(day=dia).first():
        raise ErrorValidacion("Ese día ya está bloqueado")
    bloqueado = BlockedDay(day=dia, reason=v.texto_opcional(motivo, "motivo", maximo=120))
    db.session.add(bloqueado)
    db.session.commit()
    return bloqueado


def citas_afectadas(dia):
    """Citas activas en un día que se va a bloquear (para avisar al taller)."""
    return Appointment.query.filter(
        Appointment.date == dia.isoformat(), Appointment.status.in_(ESTADOS_QUE_OCUPAN)
    ).count()

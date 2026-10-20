"""Validación de los datos que llegan a la API.

Cada función devuelve el valor ya normalizado o lanza ErrorValidacion con un
mensaje en español que se puede enseñar tal cual al usuario.
"""
import re
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

ZONA_TALLER = ZoneInfo("Europe/Madrid")

# Horas de entrada que se ofrecen en la web (L-V 8:30-13:30 y 16:00-19:00)
FRANJAS_CITA = ("08:30", "10:00", "11:30", "13:00", "16:00", "17:30")
DIAS_MAXIMOS_RESERVA = 90

ESTADOS_CITA = ("Pendiente", "Confirmada", "Completada", "Cancelada")
ESTADOS_LEAD = ("Nuevo", "Contactado", "Cerrado")
TIPOS_LEAD = ("presupuesto", "contacto")

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$")
_TELEFONO_RE = re.compile(r"^[6789]\d{8}$")
_MATRICULA_RE = re.compile(r"^[A-Z0-9]{4,10}$")
_CONTROL_RE = re.compile(r"[\x00-\x1f\x7f]")


class ErrorValidacion(ValueError):
    pass


def texto(valor, campo, minimo=1, maximo=100, multilinea=False):
    if not isinstance(valor, str):
        raise ErrorValidacion(f"El campo {campo} es obligatorio")
    valor = valor.strip()
    if not valor:
        raise ErrorValidacion(f"El campo {campo} es obligatorio")
    if len(valor) < minimo:
        raise ErrorValidacion(f"El campo {campo} es demasiado corto")
    if len(valor) > maximo:
        raise ErrorValidacion(f"El campo {campo} no puede pasar de {maximo} caracteres")
    # En textos de una línea no admitimos saltos ni caracteres de control
    # (evita inyección de cabeceras si el texto acaba en un email)
    limpio = valor.replace("\n", "").replace("\r", "").replace("\t", "") if multilinea else valor
    if _CONTROL_RE.search(limpio):
        raise ErrorValidacion(f"El campo {campo} contiene caracteres no válidos")
    return valor


def texto_opcional(valor, campo, maximo=100, multilinea=False):
    if valor is None or (isinstance(valor, str) and not valor.strip()):
        return None
    return texto(valor, campo, maximo=maximo, multilinea=multilinea)


def email(valor):
    valor = texto(valor, "email", maximo=120).lower()
    if not _EMAIL_RE.match(valor):
        raise ErrorValidacion("El email no tiene un formato válido")
    return valor


def email_opcional(valor):
    if valor is None or (isinstance(valor, str) and not valor.strip()):
        return None
    return email(valor)


def telefono(valor):
    """Acepta teléfonos españoles (con o sin +34) y los guarda como +34XXXXXXXXX."""
    if not isinstance(valor, str):
        raise ErrorValidacion("El teléfono es obligatorio")
    numero = re.sub(r"[\s\-.()]", "", valor)
    if numero.startswith("+34"):
        numero = numero[3:]
    elif numero.startswith("0034"):
        numero = numero[4:]
    if not _TELEFONO_RE.match(numero):
        raise ErrorValidacion("El teléfono debe ser un número español de 9 cifras")
    return f"+34{numero}"


def password(valor):
    if not isinstance(valor, str) or len(valor) < 8:
        raise ErrorValidacion("La contraseña debe tener al menos 8 caracteres")
    if len(valor) > 128:
        raise ErrorValidacion("La contraseña no puede pasar de 128 caracteres")
    return valor


def matricula_opcional(valor):
    if valor is None or (isinstance(valor, str) and not valor.strip()):
        return None
    if not isinstance(valor, str):
        raise ErrorValidacion("La matrícula no es válida")
    limpia = re.sub(r"[\s\-]", "", valor).upper()
    if not _MATRICULA_RE.match(limpia):
        raise ErrorValidacion("La matrícula no es válida")
    return limpia


def acepta_privacidad(valor):
    if valor is not True:
        raise ErrorValidacion("Debes aceptar la política de privacidad")
    return True


def hoy_en_taller():
    return datetime.now(ZONA_TALLER).date()


def fecha_cita(valor):
    """Fecha ISO (AAAA-MM-DD) de lunes a viernes, desde mañana y sin pasar de 90 días."""
    try:
        dia = date.fromisoformat(valor)
    except (TypeError, ValueError):
        raise ErrorValidacion("La fecha no es válida")
    hoy = hoy_en_taller()
    if dia <= hoy:
        raise ErrorValidacion("La cita tiene que ser a partir de mañana")
    if dia > hoy + timedelta(days=DIAS_MAXIMOS_RESERVA):
        raise ErrorValidacion(f"Solo se puede reservar con {DIAS_MAXIMOS_RESERVA} días de antelación como máximo")
    if dia.weekday() >= 5:
        raise ErrorValidacion("El taller abre de lunes a viernes")
    return dia.isoformat()


def hora_cita(valor):
    if valor not in FRANJAS_CITA:
        raise ErrorValidacion("La hora elegida no está dentro del horario del taller")
    return valor


def opcion(valor, permitidos, campo):
    if valor not in permitidos:
        raise ErrorValidacion(f"El campo {campo} debe ser uno de: {', '.join(permitidos)}")
    return valor


def lista_ids(valor, campo, maximo=10):
    if not isinstance(valor, list) or not valor:
        raise ErrorValidacion(f"Elige al menos un {campo}")
    if len(valor) > maximo:
        raise ErrorValidacion(f"Como máximo {maximo} {campo}s por cita")
    if not all(isinstance(v, int) and not isinstance(v, bool) and v > 0 for v in valor):
        raise ErrorValidacion(f"La lista de {campo}s no es válida")
    if len(set(valor)) != len(valor):
        raise ErrorValidacion(f"Hay {campo}s repetidos")
    return valor

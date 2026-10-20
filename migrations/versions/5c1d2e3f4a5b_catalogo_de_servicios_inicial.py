"""catalogo de servicios inicial

Hasta ahora el catálogo y los precios solo existían en el front (Servicios.jsx)
y la API aceptaba el total que mandaba el cliente. Se cargan en la tabla service
para que el precio se calcule en el servidor. Solo inserta si la tabla está vacía.

Revision ID: 5c1d2e3f4a5b
Revises: 410395febe37
Create Date: 2026-10-20 14:40:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5c1d2e3f4a5b'
down_revision = '410395febe37'
branch_labels = None
depends_on = None

SERVICIOS = [
    {"id": 1, "name": "Cambio de Aceite", "price": 85, "description": "Mantenimiento esencial con aceite sintético de alta gama."},
    {"id": 2, "name": "Sistema de Frenos", "price": 120, "description": "Revisión y cambio de pastillas y discos para tu seguridad."},
    {"id": 3, "name": "Diagnosis Electrónica", "price": 45, "description": "Lectura de fallos con equipos de última generación."},
    {"id": 4, "name": "Neumáticos", "price": 100, "description": "Sustitución, equilibrado y alineación profesional."},
    {"id": 5, "name": "Aire Acondicionado", "price": 60, "description": "Carga de gas y revisión de fugas para el confort total."},
    {"id": 6, "name": "Revisión Pre-ITV", "price": 20, "description": "Chequeo de 50 puntos clave para pasar la ITV a la primera."},
]

service = sa.table(
    'service',
    sa.column('id', sa.Integer),
    sa.column('name', sa.String),
    sa.column('price', sa.Float),
    sa.column('description', sa.String),
)


def upgrade():
    bind = op.get_bind()
    existentes = bind.execute(sa.text("SELECT COUNT(*) FROM service")).scalar()
    if existentes:
        return

    op.bulk_insert(service, SERVICIOS)

    # Insertamos ids fijos (el front los usa para las imágenes): hay que avanzar
    # la secuencia o el siguiente INSERT sin id chocaría con el 1.
    if bind.dialect.name == "postgresql":
        bind.execute(sa.text(
            "SELECT setval(pg_get_serial_sequence('service', 'id'), (SELECT MAX(id) FROM service))"
        ))


def downgrade():
    ids = [s["id"] for s in SERVICIOS]
    op.execute(service.delete().where(service.c.id.in_(ids)))

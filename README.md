# JaFrauto Motor

Web del taller JaFrauto Motor: catálogo de servicios, reserva de citas para clientes registrados y panel interno de gestión para el taller.

## Stack

- **Frontend**: React + Vite, React Router, Bootstrap. Desplegado en [Vercel](https://vercel.com/).
- **Backend**: Flask + SQLAlchemy + Flask-Migrate, autenticación con JWT (Flask-JWT-Extended). Desplegado en [Render](https://render.com/).
- **Base de datos**: PostgreSQL en [Neon](https://neon.tech/).
- **Email**: confirmación de citas por Flask-Mail (SMTP de Gmail).

## Funcionalidad

- Catálogo de servicios y carrito de reserva (`/servicios`, `/urgente`).
- Registro/login de clientes; cada cita queda ligada a su cuenta.
- `/mi-cuenta`: historial de citas del cliente, cancelación y edición de datos de contacto.
- `/gestion` → `/panel-interno`: acceso solo para cuentas de administrador (`is_admin`), con:
  - pestaña **Solicitudes**: todas las citas reales, marcar como completada.
  - pestaña **Clientes**: listado de clientes registrados, su historial y notas internas.

## Desarrollo en local

### Backend (Flask)

1. Crea un entorno virtual e instala dependencias:
   ```sh
   python -m venv venv
   venv\Scripts\pip install -r requirements.txt   # Windows
   ```
2. Copia `.env.example` a `.env` y rellena los valores reales (connection string de Neon, `JWT_SECRET_KEY`, y opcionalmente `MAIL_USERNAME`/`MAIL_PASSWORD` para el email de confirmación).
3. Aplica las migraciones y arranca el servidor:
   ```sh
   set FLASK_APP=app.py
   venv\Scripts\python -m flask db upgrade
   venv\Scripts\python -m flask run --host 127.0.0.1 --port 3001
   ```

### Frontend (Vite)

1. Instala dependencias: `npm install`
2. Arranca el servidor de desarrollo: `npm run start`
3. Por defecto apunta al backend en `http://127.0.0.1:3001`. Para apuntar a otro backend, define `VITE_API_URL` en un `.env` de la raíz.

## Despliegue

- **Frontend**: Vercel, auto-deploy desde `master`. Variable de entorno `VITE_API_URL` apuntando a la URL del backend en Render.
- **Backend**: Render (Web Service, runtime Python 3).
  - Build Command: `pip install -r requirements.txt && flask db upgrade`
  - Start Command: `gunicorn app:app --bind 0.0.0.0:$PORT`
  - Variables de entorno: `DATABASE_URL_POOLED`, `JWT_SECRET_KEY`, `FLASK_APP=app.py`, y opcionalmente `MAIL_USERNAME`/`MAIL_PASSWORD`.

## Cuentas de administrador

No hay un endpoint público para crear administradores (por seguridad). Para dar de alta uno: la persona se registra normal desde `/registro`, y luego se activa manualmente `is_admin = True` para esa fila en la base de datos.

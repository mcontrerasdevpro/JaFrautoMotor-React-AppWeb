# JaFrauto Motor

Web del taller JaFrauto Motor: catálogo de servicios, reserva de citas para clientes registrados, formularios de presupuesto y contacto, y panel interno de gestión para el taller.

## Stack

- **Frontend**: React + Vite, React Router, Bootstrap. Desplegado en [Vercel](https://vercel.com/).
- **Backend**: Flask + SQLAlchemy + Flask-Migrate, autenticación con JWT (Flask-JWT-Extended) y rate limiting (Flask-Limiter). Desplegado en [Render](https://render.com/).
- **Base de datos**: PostgreSQL en [Neon](https://neon.tech/).
- **Email**: confirmación de citas y avisos al taller por Flask-Mail (SMTP de Gmail).

## Funcionalidad

- Catálogo de servicios (los precios vienen de la tabla `service`) y selección para la cita (`/servicios`, `/urgente`).
- Registro/login de clientes; cada cita queda ligada a su cuenta. El total lo calcula siempre el servidor.
- `/presupuesto` y el formulario de `/contacto`: guardan la solicitud (tabla `lead`) y avisan al taller por email. No requieren cuenta.
- `/mi-cuenta`: historial de citas del cliente, cancelación y edición de datos de contacto.
- `/gestion` → `/panel-interno`: acceso solo para cuentas de administrador (`is_admin`), con:
  - pestaña **Solicitudes**: todas las citas, confirmar y marcar como atendida.
  - pestaña **Clientes**: listado de clientes registrados, su historial y notas internas.
  - pestaña **Presupuestos y contacto**: solicitudes de la web y su estado (Nuevo, Contactado, Cerrado).
- RGPD: casilla de privacidad obligatoria en registro y formularios (se guarda la fecha) y banner de cookies con Aceptar/Rechazar; el mapa de Google solo se carga con consentimiento.

Los datos de contacto del taller (teléfonos, WhatsApp, dirección) están en `src/config.js`. Las franjas horarias de cita están en `src/config.js` y en `validacion.py` y deben coincidir.

## Desarrollo en local

### Backend (Flask)

1. Crea un entorno virtual e instala dependencias:
   ```sh
   python -m venv venv
   venv\Scripts\pip install -r requirements.txt   # Windows
   ```
2. Copia `.env.example` a `.env` y rellena los valores. Usa una base de datos de desarrollo (rama de Neon o Postgres local), nunca la de producción. Para un Postgres local con Docker:
   ```sh
   docker run -d --name jafrauto-pg -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=jafrauto -p 55432:5432 postgres:17-alpine
   # DATABASE_URL_POOLED=postgresql://postgres:dev@127.0.0.1:55432/jafrauto
   ```
   En local pon `TRUSTED_PROXIES=0` (no hay proxy delante).
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
4. Antes de subir cambios: `npm run lint` y `npm run build`.

## Despliegue

- **Frontend**: Vercel, auto-deploy desde `master`. Variable de entorno `VITE_API_URL` apuntando a la URL del backend en Render.
- **Backend**: Render (Web Service, runtime Python 3).
  - Build Command: `pip install -r requirements.txt && flask db upgrade`
  - Start Command: `gunicorn app:app --bind 0.0.0.0:$PORT`
  - Variables de entorno: `DATABASE_URL_POOLED`, `JWT_SECRET_KEY`, `FLASK_APP=app.py`, `CORS_ORIGINS`, `TALLER_NOTIFY_EMAIL` y opcionalmente `MAIL_USERNAME`/`MAIL_PASSWORD`, `JWT_EXPIRES_HOURS`, `TRUSTED_PROXIES`, `RATELIMIT_STORAGE_URI`. Ver `.env.example`.
  - El rate limit guarda los contadores en memoria: vale con un solo worker de gunicorn (el valor por defecto). Si se suben workers o instancias, configurar `RATELIMIT_STORAGE_URI` con Redis.

## Cuentas de administrador

No hay un endpoint público para crear administradores (por seguridad). Para dar de alta uno: la persona se registra normal desde `/registro`, y luego se activa manualmente `is_admin = True` para esa fila en la base de datos.

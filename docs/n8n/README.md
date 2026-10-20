# Flujos de n8n de JaFrauto Motor

Exportados de la instancia de n8n de NexuraIA. Están creados **desactivados** y con el
prefijo `[DEV]`. Ninguno guarda secretos dentro de los nodos: todo va en credenciales de n8n.

| Archivo | Flujo en n8n | Qué hace |
|---|---|---|
| `jafrauto-avisos-cita-whatsapp.json` | [DEV] JaFrauto — Avisos de cita por WhatsApp | Recibe los eventos de cita de la API y envía la plantilla de WhatsApp que toca (recibida, confirmada, cambiada, cancelada). |
| `jafrauto-recordatorio-24h.json` | [DEV] JaFrauto — Recordatorio de cita 24 h (WhatsApp) | A las 18:00 de domingo a jueves pide a la API las citas de mañana, manda el recordatorio y la marca como avisada. |
| `jafrauto-mantener-api-despierta.json` | [DEV] JaFrauto — Mantener API despierta (Render) | Llama a `/health` cada 10 min de L-V de 8:00 a 19:59 para que Render gratuito no duerma la API. Se apaga al pasar al VPS. |

## Contrato con la API

**Eventos** (`POST` al webhook `jafrauto-citas`): la API envía `{ evento, enviado_en, cita, taller }`.
- `evento`: `cita.creada`, `cita.cambiada`, `cita.cancelada`, `cita.confirmada` o `cita.completada`.
- `cita`: `id`, `fecha` (AAAA-MM-DD), `hora`, `estado`, `servicios`, `total_estimado`,
  `cliente { nombre, telefono (+34…), email }`, `vehiculo`, `matricula` y `enlace_gestion`.
- Cabeceras:
  - `X-JaFrauto-Token`: token que comprueba el nodo Webhook con la credencial Header Auth.
  - `X-JaFrauto-Signature`: firma HMAC-SHA256 del cuerpo (`sha256=<hex>`) con `N8N_WEBHOOK_SECRET`. Sirve para verificar la integridad si algún día hace falta.

**Recordatorios**:
- `GET /internal/reminders` devuelve las citas de mañana (Pendiente o Confirmada) que aún no tienen recordatorio.
- `POST /internal/appointments/<id>/reminded` marca una como avisada.
- Las dos llamadas usan la cabecera `X-API-Key`.

## Qué falta para activarlos

1. **API de WhatsApp Business (Meta Cloud API)** para el 953 121 814. Ahora mismo no sabemos
   si está dada de alta. Con la app normal de WhatsApp Business, n8n no puede enviar mensajes.
2. **Plantillas aprobadas en Meta**, en español. Hacen falta para escribir primero al cliente, fuera de la ventana de 24 h:
   - `jafrauto_cita_recibida`: nombre, fecha, hora, enlace
   - `jafrauto_cita_confirmada`: nombre, fecha, hora
   - `jafrauto_cita_cambiada`: nombre, fecha, hora, enlace
   - `jafrauto_cita_cancelada`: nombre, fecha
   - `jafrauto_recordatorio_cita`: nombre, hora, servicios, enlace
3. **Credenciales en n8n**, que se asignan en cada nodo:
   - *WhatsApp Business Cloud* en los nodos de WhatsApp. Después hay que elegir el número emisor, que ahora tiene el valor provisional `CONFIGURAR_PHONE_NUMBER_ID`.
   - *Header Auth* "JaFrauto webhook" (`X-JaFrauto-Token`) en el nodo Webhook.
   - *Header Auth* "JaFrauto API interna" (`X-API-Key`) en los dos nodos HTTP del recordatorio.
4. **Variables en la API** (Render y, más adelante, el VPS):
   - `N8N_WEBHOOK_URL` = URL de producción del webhook (`…/webhook/jafrauto-citas`)
   - `N8N_WEBHOOK_TOKEN`, `N8N_WEBHOOK_SECRET` y `N8N_API_KEY`: valores largos y aleatorios, los mismos que en las credenciales.
5. **Probar** con una cita de prueba y **activar**, con el OK de Miguel.

El flujo del ping no depende de WhatsApp y se puede activar en cuanto se haga el merge.

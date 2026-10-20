import { abrirPreferenciasCookies } from "../hooks/useConsentimiento";

export const Cookies = () => (
    <div className="container mt-1 pt-5 text-dark" style={{ minHeight: "80vh" }}>
        <h1 className="fw-bold border-bottom border-danger pb-3 mb-4 text-uppercase">
            Política de <span className="text-danger">Cookies</span>
        </h1>

        <p><strong>¿Qué son las cookies?</strong></p>
        <p>Una cookie es un fichero que se descarga en su ordenador al acceder a determinadas páginas web. Las cookies y tecnologías similares (como el almacenamiento local del navegador) permiten a una página web, entre otras cosas, recordar información sobre su visita.</p>

        <p className="mt-4"><strong>Qué usamos en JaFrauto Motor:</strong></p>
        <ul>
            <li>
                <strong>Almacenamiento técnico (imprescindible):</strong> guardamos en su navegador la sesión de su cuenta,
                los servicios que ha elegido para su cita y su decisión sobre las cookies. Es necesario para que la web
                funcione y no requiere consentimiento.
            </li>
            <li>
                <strong>Google Maps (terceros, opcional):</strong> el mapa con la ubicación del taller lo sirve Google, que puede
                instalar sus propias cookies. Solo se carga si acepta las cookies o pulsa &quot;Mostrar mapa aquí&quot;. Si las rechaza,
                verá un enlace para abrir la ubicación directamente en Google Maps.
            </li>
        </ul>
        <p>No usamos cookies de analítica ni de publicidad.</p>

        <p className="mt-4"><strong>Cómo cambiar su elección:</strong></p>
        <p>
            Puede cambiar su decisión en cualquier momento desde aquí o desde el enlace &quot;Configurar cookies&quot; del pie de página.
            También puede borrar las cookies desde la configuración de su navegador.
        </p>
        <button type="button" className="btn btn-outline-danger rounded-0 fw-bold" onClick={abrirPreferenciasCookies}>
            CONFIGURAR COOKIES
        </button>
    </div>
);

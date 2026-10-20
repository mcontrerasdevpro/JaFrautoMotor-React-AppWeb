import { Link } from "react-router-dom";
import useConsentimiento, { guardarConsentimiento } from "../hooks/useConsentimiento";

export const CookieBanner = () => {
    const consentimiento = useConsentimiento();

    // undefined = aún sin leer (prerender); solo se muestra si no ha elegido
    if (consentimiento !== null) return null;

    return (
        <div className="fixed-bottom bg-dark text-white p-3 shadow-lg border-top border-danger" style={{ zIndex: 9999 }}
            role="dialog" aria-live="polite" aria-label="Aviso de cookies">
            <div className="container d-md-flex align-items-center justify-content-between">
                <p className="small mb-2 mb-md-0 me-3">
                    Usamos almacenamiento técnico imprescindible para que la web funcione (sesión y servicios elegidos).
                    Si aceptas, también cargamos Google Maps, que instala cookies de Google.
                    Más información en la <Link to="/cookies" className="text-danger fw-bold">política de cookies</Link>.
                </p>
                <div className="d-flex gap-2 flex-shrink-0">
                    <button onClick={() => guardarConsentimiento("rechazadas")} className="btn btn-outline-light btn-sm fw-bold rounded-0 px-4">
                        RECHAZAR
                    </button>
                    <button onClick={() => guardarConsentimiento("aceptadas")} className="btn btn-danger btn-sm fw-bold rounded-0 px-4">
                        ACEPTAR
                    </button>
                </div>
            </div>
        </div>
    );
};

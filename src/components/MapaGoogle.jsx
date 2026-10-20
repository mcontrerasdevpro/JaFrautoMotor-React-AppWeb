import PropTypes from "prop-types";
import { TALLER } from "../config";
import useConsentimiento, { guardarConsentimiento } from "../hooks/useConsentimiento";
import { Icono } from "./Icono";

// El iframe de Google Maps instala cookies de terceros: solo se carga con consentimiento
export const MapaGoogle = ({ altoMinimo = "110px", oscuro = false }) => {
    const consentimiento = useConsentimiento();

    if (consentimiento === "aceptadas") {
        return (
            <iframe
                title="Ubicación de JaFrauto Motor en Google Maps"
                src={TALLER.mapaEmbed}
                width="100%"
                height="100%"
                style={{ border: 0, display: "block", minHeight: altoMinimo }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade">
            </iframe>
        );
    }

    return (
        <div className={`d-flex flex-column align-items-center justify-content-center text-center p-3 h-100 ${oscuro ? "bg-black text-white-50" : "bg-light text-secondary"}`}
            style={{ minHeight: altoMinimo }}>
            <Icono nombre="map-location-dot" className="fa-2x text-danger mb-2" />
            <p className="small mb-2">
                {TALLER.direccion.calle}, {TALLER.direccion.zona}, {TALLER.direccion.cp} {TALLER.direccion.ciudad}
            </p>
            <div className="d-flex flex-wrap gap-2 justify-content-center">
                <a href={TALLER.comoLlegar} target="_blank" rel="noopener noreferrer" className="btn btn-danger btn-sm rounded-0 fw-bold">
                    VER EN GOOGLE MAPS
                </a>
                <button type="button" onClick={() => guardarConsentimiento("aceptadas")}
                    className={`btn btn-sm rounded-0 ${oscuro ? "btn-outline-light" : "btn-outline-dark"}`}>
                    Mostrar mapa aquí (acepta cookies de Google)
                </button>
            </div>
        </div>
    );
};

MapaGoogle.propTypes = {
    altoMinimo: PropTypes.string,
    oscuro: PropTypes.bool
};

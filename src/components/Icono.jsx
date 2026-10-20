import PropTypes from "prop-types";
import { ICONOS } from "../data/iconos";

// Icono de Font Awesome como SVG en línea: se ve en el HTML prerenderizado sin
// cargar la hoja de estilos ni las fuentes de Font Awesome.
// `nombre` admite "phone" o "fa-phone". Es decorativo salvo que se pase `titulo`.
export const Icono = ({ nombre, className = "", titulo }) => {
    const definicion = ICONOS[nombre.replace(/^fa-/, "")];
    if (!definicion) return null;
    const [ancho, alto, , , trazado] = definicion.icon;

    return (
        <svg
            className={`icono ${className}`.trim()}
            viewBox={`0 0 ${ancho} ${alto}`}
            aria-hidden={titulo ? undefined : "true"}
            role={titulo ? "img" : undefined}
            focusable="false"
        >
            {titulo && <title>{titulo}</title>}
            {Array.isArray(trazado)
                ? trazado.map((d) => <path key={d} fill="currentColor" d={d} />)
                : <path fill="currentColor" d={trazado} />}
        </svg>
    );
};

Icono.propTypes = {
    nombre: PropTypes.string.isRequired,
    className: PropTypes.string,
    titulo: PropTypes.string
};

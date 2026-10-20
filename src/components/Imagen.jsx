import PropTypes from "prop-types";
import anchosPorFoto from "../data/imagenes.json";

// Foto optimizada (AVIF y WebP en varios anchos, generada con `npm run imagenes`).
// `prioridad` para la imagen principal de la página (LCP): carga inmediata y alta prioridad.
export const Imagen = ({ nombre, alt, sizes = "100vw", prioridad = false, className, style, width, height }) => {
    const anchos = anchosPorFoto[nombre];
    if (!anchos) return null;
    const srcset = (formato) => anchos.map((a) => `/img/${nombre}-${a}.${formato} ${a}w`).join(", ");
    const mayor = anchos[anchos.length - 1];

    return (
        <picture>
            <source type="image/avif" srcSet={srcset("avif")} sizes={sizes} />
            <source type="image/webp" srcSet={srcset("webp")} sizes={sizes} />
            <img
                src={`/img/${nombre}-${mayor}.webp`}
                alt={alt}
                className={className}
                style={style}
                width={width}
                height={height}
                loading={prioridad ? "eager" : "lazy"}
                decoding={prioridad ? "sync" : "async"}
                // React 18 aún no reconoce fetchPriority: en minúsculas llega tal cual al HTML
                // eslint-disable-next-line react/no-unknown-property
                fetchpriority={prioridad ? "high" : undefined}
            />
        </picture>
    );
};

Imagen.propTypes = {
    nombre: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
    sizes: PropTypes.string,
    prioridad: PropTypes.bool,
    className: PropTypes.string,
    style: PropTypes.object,
    width: PropTypes.number,
    height: PropTypes.number
};

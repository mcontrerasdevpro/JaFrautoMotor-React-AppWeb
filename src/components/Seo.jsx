import PropTypes from "prop-types";
import { Head } from "vite-react-ssg";
import { SITIO } from "../config";
import { DATOS_TALLER } from "../data/datosEstructurados";

// Title, description, canonical, Open Graph y JSON-LD de cada página prerenderizada
export const Seo = ({ titulo, descripcion, ruta, jsonLd = [], noindex = false }) => {
    const url = `${SITIO.url}${ruta === "/" ? "/" : ruta}`;
    const tituloCompleto = ruta === "/" ? titulo : `${titulo} | JaFrauto Motor`;
    const indexar = SITIO.indexar && !noindex;

    return (
        <Head>
            <html lang="es" />
            <title>{tituloCompleto}</title>
            <meta name="description" content={descripcion} />
            <link rel="canonical" href={url} />
            <meta name="robots" content={indexar ? "index, follow" : "noindex, nofollow"} />
            <meta property="og:type" content="website" />
            <meta property="og:locale" content="es_ES" />
            <meta property="og:site_name" content="JaFrauto Motor" />
            <meta property="og:title" content={tituloCompleto} />
            <meta property="og:description" content={descripcion} />
            <meta property="og:url" content={url} />
            <meta property="og:image" content={`${SITIO.url}${SITIO.imagenSocial}`} />
            <meta name="twitter:card" content="summary_large_image" />
            <script type="application/ld+json">{JSON.stringify(DATOS_TALLER)}</script>
            {jsonLd.map((datos, i) => (
                <script key={i} type="application/ld+json">{JSON.stringify(datos)}</script>
            ))}
        </Head>
    );
};

Seo.propTypes = {
    titulo: PropTypes.string.isRequired,
    descripcion: PropTypes.string.isRequired,
    ruta: PropTypes.string.isRequired,
    jsonLd: PropTypes.arrayOf(PropTypes.object),
    noindex: PropTypes.bool
};

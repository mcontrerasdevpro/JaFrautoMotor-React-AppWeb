import { Link, useParams } from "react-router-dom";
import { Seo } from "../components/Seo";
import { DATOS_TALLER } from "../data/datosEstructurados";
import { Imagen } from "../components/Imagen";
import { SITIO, TALLER } from "../config";
import { PAGINAS_SERVICIO, paginaPorSlug } from "../data/paginasServicio";
import { NotFound } from "./NotFound";
import { Icono } from "../components/Icono";

// Página de un servicio con intención local ("cambio de embrague en Jaén")
export const ServicioDetalle = () => {
    const { slug } = useParams();
    const pagina = paginaPorSlug(slug);
    if (!pagina) return <NotFound />;

    const ruta = `/servicios/${pagina.slug}`;
    const enlaceCita = `/reservar?servicio=${pagina.slug}`;
    const otros = PAGINAS_SERVICIO.filter((p) => p.slug !== pagina.slug);

    const jsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "Service",
            name: pagina.titulo,
            serviceType: pagina.nombre,
            description: pagina.descripcion,
            url: `${SITIO.url}${ruta}`,
            areaServed: { "@type": "City", name: "Jaén" },
            provider: { "@id": DATOS_TALLER["@id"] }
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
                { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITIO.url}/` },
                { "@type": "ListItem", position: 2, name: "Servicios", item: `${SITIO.url}/servicios` },
                { "@type": "ListItem", position: 3, name: pagina.nombre, item: `${SITIO.url}${ruta}` }
            ]
        },
        {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: pagina.faq.map((f) => ({
                "@type": "Question",
                name: f.pregunta,
                acceptedAnswer: { "@type": "Answer", text: f.respuesta }
            }))
        }
    ];

    return (
        <div className="text-dark">
            <Seo titulo={pagina.titulo} descripcion={pagina.descripcion} ruta={ruta} jsonLd={jsonLd} />

            <div className="container py-4 py-lg-5">
                <nav aria-label="Migas de pan" className="small mb-3">
                    <ol className="breadcrumb mb-0">
                        <li className="breadcrumb-item"><Link to="/" className="text-danger">Inicio</Link></li>
                        <li className="breadcrumb-item"><Link to="/servicios" className="text-danger">Servicios</Link></li>
                        <li className="breadcrumb-item active" aria-current="page">{pagina.nombre}</li>
                    </ol>
                </nav>

                <div className="row g-4 g-lg-5 align-items-center mb-5">
                    <div className="col-lg-6">
                        <h1 className="fw-bold text-uppercase mb-3">{pagina.titulo}</h1>
                        {pagina.intro.map((parrafo) => <p key={parrafo} className="text-secondary">{parrafo}</p>)}
                        <div className="d-flex flex-column flex-sm-row gap-2 mt-4">
                            <Link to={enlaceCita} className="btn btn-danger btn-lg fw-bold rounded-0 px-4">
                                <Icono nombre="calendar-check" className="me-2" />PEDIR CITA
                            </Link>
                            <a href={TALLER.telefono.href} className="btn btn-outline-dark btn-lg fw-bold rounded-0 px-4">
                                <Icono nombre="phone" className="me-2" />{TALLER.telefono.texto}
                            </a>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <Imagen nombre={pagina.imagen} alt={`${pagina.nombre} en el taller JaFrauto Motor de Jaén`} prioridad
                            sizes="(min-width: 992px) 50vw, 100vw" className="w-100 shadow-lg"
                            style={{ maxHeight: "380px", objectFit: "cover", borderLeft: "8px solid #fa0606" }} />
                    </div>
                </div>

                <div className="row g-4 mb-5">
                    <section className="col-md-6">
                        <div className="h-100 p-4 bg-white shadow-sm border-top border-4 border-danger">
                            <h2 className="h4 fw-bold">Qué incluye</h2>
                            <ul className="mb-0">
                                {pagina.incluye.map((item) => <li key={item} className="mb-2">{item}</li>)}
                            </ul>
                        </div>
                    </section>
                    <section className="col-md-6">
                        <div className="h-100 p-4 bg-dark text-white shadow-sm border-top border-4 border-danger">
                            <h2 className="h4 fw-bold">Cuándo traer el coche</h2>
                            <ul className="mb-0">
                                {pagina.senales.map((item) => <li key={item} className="mb-2">{item}</li>)}
                            </ul>
                        </div>
                    </section>
                </div>

                <section className="mb-5" aria-labelledby="faq-titulo">
                    <h2 id="faq-titulo" className="h4 fw-bold mb-3">Preguntas frecuentes</h2>
                    {pagina.faq.map((f) => (
                        <details key={f.pregunta} className="border-bottom py-3">
                            <summary className="fw-bold" style={{ cursor: "pointer" }}>{f.pregunta}</summary>
                            <p className="text-secondary mt-2 mb-0">{f.respuesta}</p>
                        </details>
                    ))}
                </section>

                <section className="bg-danger text-white p-4 p-md-5 mb-5 text-center">
                    <h2 className="h3 fw-bold">¿Lo revisamos?</h2>
                    <p className="mb-4">Taller en Calle Bedmar 118, Polígono Los Olivares (Jaén). Lunes a viernes, 8:30-13:30 y 16:00-19:00.</p>
                    <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
                        <Link to={enlaceCita} className="btn btn-light fw-bold rounded-0 px-4 text-danger">PEDIR CITA ONLINE</Link>
                        <a href={TALLER.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-outline-light fw-bold rounded-0 px-4">
                            <Icono nombre="whatsapp" className="me-2" />ESCRÍBENOS
                        </a>
                    </div>
                </section>

                <section aria-labelledby="otros-titulo">
                    <h2 id="otros-titulo" className="h5 fw-bold text-uppercase mb-3">Otros servicios en Jaén</h2>
                    <div className="d-flex flex-wrap gap-2">
                        {otros.map((p) => (
                            <Link key={p.slug} to={`/servicios/${p.slug}`} className="btn btn-outline-dark btn-sm rounded-0">{p.nombre}</Link>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

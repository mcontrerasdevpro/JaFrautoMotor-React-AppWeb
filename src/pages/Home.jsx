import { Link } from "react-router-dom";
import { TALLER } from "../config";
import { Imagen } from "../components/Imagen";
import { Seo } from "../components/Seo";
import { Confianza } from "../components/Confianza";
import { Icono } from "../components/Icono";

const DATOS = [
    { dato: "+15 años", texto: "de experiencia en Jaén" },
    { dato: "Eurorepar", texto: "taller de la red" },
    { dato: "Citroën · Peugeot", texto: "y DS: especialistas" },
    { dato: "L-V", texto: "8:30–13:30 · 16:00–19:00" }
];

// Servicios destacados con foto real; el resto va como etiquetas
const DESTACADOS = [
    { slug: "diagnosis-electronica-jaen", titulo: "Diagnosis electrónica", foto: "diagnosis", resumen: "Testigos encendidos, tirones o pérdida de potencia." },
    { slug: "frenos-jaen", titulo: "Frenos", foto: "sistemafrenos", resumen: "Pastillas, discos y líquido de frenos." },
    { slug: "pre-itv-jaen", titulo: "Pre-ITV", foto: "preitv", resumen: "Revisamos los puntos clave para pasar la inspección." },
    { slug: "cambio-de-aceite-revision-jaen", titulo: "Aceite y revisión", foto: "cambioaceite", resumen: "Mantenimiento según el plan del fabricante." }
];

const OTROS = [
    { slug: "cambio-de-embrague-jaen", titulo: "Embrague" },
    { slug: "kit-de-distribucion-jaen", titulo: "Distribución" },
    { slug: "aire-acondicionado-coche-jaen", titulo: "Aire acondicionado" },
    { slug: "codificacion-de-llaves-jaen", titulo: "Codificación de llaves" }
];

const PASOS = [
    { titulo: "Cuéntanos qué le pasa", texto: "Te orientamos al servicio adecuado. Si es una avería urgente, llámanos." },
    { titulo: "Elige día y hora", texto: "Con los huecos libres reales del taller." },
    { titulo: "Listo, sin crear cuenta", texto: "Recibes un enlace para consultar, cambiar o anular tu cita." }
];

export const Home = () => {
    return (
        // El margen negativo anula el hueco inferior del <main> para que la última sección toque el pie
        <div style={{ marginBottom: "-50px" }}>
            <Seo titulo="JaFrauto Motor | Taller mecánico en Jaén" descripcion="Taller mecánico en el Polígono Los Olivares de Jaén, especialista en Citroën, Peugeot y DS. Diagnosis, frenos, embrague, pre-ITV y aire acondicionado. Red Eurorepar. Pide cita online o llama al 953 121 814." ruta="/" />

            {/* PORTADA */}
            <section className="hero-racing">
                <div className="hero-racing__foto">
                    <Imagen nombre="portada" alt="Interior del taller JaFrauto Motor con coches en los elevadores" prioridad
                        sizes="(min-width: 992px) 64vw, 100vw" />
                </div>
                <div className="hero-racing__contenido">
                    <div className="container">
                        <div className="col-lg-7 col-xl-6 px-0">
                            <h1 className="hero-racing__titulo">
                                <span className="hero-racing__antetitulo">Taller mecánico en Jaén</span>
                                Precisión en <em>cada kilómetro</em>
                            </h1>
                            <p className="hero-racing__texto mb-4">
                                Mecánica integral, diagnosis avanzada y pre-ITV en el Polígono Los Olivares, con repuestos oficiales.
                            </p>
                            <div className="hero-racing__acciones">
                                <Link to="/reservar" className="btn btn-racing">Pedir cita<span className="d-none d-lg-inline">&nbsp;online</span></Link>
                                <a href={TALLER.telefono.href} className="btn btn-borde btn-borde--claro">
                                    Llamar<span className="d-none d-lg-inline">&nbsp;· {TALLER.telefono.texto}</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* DATOS DEL TALLER */}
            <section className="banda-datos" aria-label="El taller en datos">
                <div className="container px-0 px-lg-3">
                    <ul className="banda-datos__lista">
                        {DATOS.map((d) => (
                            <li className="banda-datos__item" key={d.dato}>
                                <strong>{d.dato}</strong>
                                <span>{d.texto}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* 01 · SERVICIOS */}
            <section className="seccion seccion-clara" aria-labelledby="servicios-titulo">
                <div className="container">
                    <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
                        <div>
                            <p className="antetitulo">01 · Servicios</p>
                            <h2 id="servicios-titulo" className="titulo-seccion">Lo que hacemos en el taller</h2>
                        </div>
                        <Link to="/servicios" className="enlace-flecha">Todos los servicios →</Link>
                    </div>
                    <div className="row g-3">
                        {DESTACADOS.map((s, i) => (
                            <div className={i === 0 ? "col-12 col-lg-3" : "col-6 col-lg-3"} key={s.slug}>
                                <Link to={`/servicios/${s.slug}`} className="tarjeta-foto">
                                    <Imagen nombre={s.foto} alt="" sizes="(min-width: 992px) 25vw, (min-width: 576px) 50vw, 100vw" />
                                    <span className="tarjeta-foto__texto">
                                        <span className="tarjeta-foto__titulo">{s.titulo}</span>
                                        <span className="tarjeta-foto__resumen d-none d-md-block">{s.resumen}</span>
                                    </span>
                                </Link>
                            </div>
                        ))}
                    </div>
                    <ul className="list-unstyled d-flex flex-wrap gap-2 mt-4 mb-0">
                        {OTROS.map((s) => (
                            <li key={s.slug}><Link to={`/servicios/${s.slug}`} className="etiqueta-servicio">{s.titulo}</Link></li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* 02 · CITA ONLINE */}
            <section className="seccion seccion-oscura seccion-oscura--2" aria-labelledby="cita-titulo">
                <div className="container">
                    <p className="antetitulo">02 · Cita online</p>
                    <h2 id="cita-titulo" className="titulo-seccion mb-4 mb-lg-5">En boxes en tres pasos</h2>
                    <ol className="row g-4 list-unstyled mb-4 mb-lg-5">
                        {PASOS.map((p, i) => (
                            <li className="col-md-4" key={p.titulo}>
                                <div className="paso">
                                    <span className="paso__numero" aria-hidden="true">0{i + 1}</span>
                                    <h3 className="paso__titulo">{p.titulo}</h3>
                                    <p className="texto-suave mb-0">{p.texto}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                    <div className="d-flex flex-wrap align-items-center gap-3 gap-md-4">
                        <Link to="/reservar" className="btn btn-racing">Empezar mi cita</Link>
                        <a href={TALLER.telefono.href} className="enlace-flecha">
                            <Icono nombre="car-burst" className="me-2" />¿Avería urgente? Llama al {TALLER.telefono.texto}
                        </a>
                    </div>
                </div>
            </section>

            {/* 03 · EL TALLER */}
            <section className="seccion seccion-oscura" aria-labelledby="taller-titulo">
                <div className="container">
                    <div className="row g-4 gy-5 g-lg-5 align-items-center">
                        <div className="col-lg-6">
                            <div className="foto-diagonal">
                                <Imagen nombre="taller" alt="Mecánicos de JaFrauto Motor trabajando en el taller" sizes="(min-width: 992px) 50vw, 100vw" />
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <p className="antetitulo">03 · El taller</p>
                            <h2 id="taller-titulo" className="titulo-seccion mb-3">Más que un taller, tu equipo de confianza</h2>
                            <p className="texto-suave fs-5 mb-4">
                                Francisco y Jacinto llevan más de 15 años reparando coches en Jaén. Taller de la red Eurorepar,
                                con diagnosis de última generación y especial experiencia en Citroën, Peugeot y DS.
                            </p>
                            <Link to="/taller" className="enlace-flecha">Conoce el taller →</Link>
                        </div>
                    </div>
                </div>
            </section>

            <Confianza />

            {/* 04 · DÓNDE ESTAMOS */}
            <section className="ubicacion" aria-labelledby="ubicacion-titulo">
                <div className="ubicacion__foto">
                    <Imagen nombre="fachada" alt="Fachada de la nave de JaFrauto Motor en el Polígono Los Olivares" sizes="100vw" />
                </div>
                <div className="ubicacion__contenido">
                    <div className="container">
                        <div className="col-lg-6 col-xl-5 px-0">
                            <p className="antetitulo">04 · Dónde estamos</p>
                            <h2 id="ubicacion-titulo" className="titulo-seccion mb-3">Polígono Los Olivares</h2>
                            <p className="fs-5 mb-2">{TALLER.direccion.calle} · {TALLER.direccion.cp} {TALLER.direccion.ciudad}</p>
                            <p className="texto-suave mb-4">Lunes a viernes: 8:30–13:30 y 16:00–19:00.<br />
                                ¿Prefieres escribir? Mándanos una foto de la avería por WhatsApp.</p>
                            <div className="d-flex flex-wrap gap-3">
                                <a href={TALLER.comoLlegar} target="_blank" rel="noopener noreferrer" className="btn btn-racing">
                                    <Icono nombre="location-dot" className="me-2" />Cómo llegar
                                </a>
                                <a href={TALLER.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-success btn-borde">
                                    <Icono nombre="whatsapp" className="me-2" />WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

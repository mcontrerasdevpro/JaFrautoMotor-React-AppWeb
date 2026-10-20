import { Link } from "react-router-dom";
import { TALLER } from "../config";
import { PAGINAS_SERVICIO } from "../data/paginasServicio";
import { MapaGoogle } from "./MapaGoogle";
import { abrirPreferenciasCookies } from "../hooks/useConsentimiento";
import { Icono } from "./Icono";

export const Footer = () => (
    <footer className="footer-racing text-white pt-5 pb-2 mt-auto">
        <div className="container text-center text-md-start">
            <div className="row g-4 align-items-start">

                {/* COLUMNA 1: IDENTIDAD (Un poco más estrecha) */}
                <div className="col-md-3">
                    <p className="logo-jafrauto mb-3">
                        JAFRAUTO<span>MOTOR</span>
                    </p>
                    <p className="small texto-footer mb-4">
                        Tu taller de confianza en Jaén. Calidad y rapidez en el Polígono de los Olivares.
                    </p>
                    <div className="d-flex gap-3 justify-content-center justify-content-md-start">
                        <a href="https://www.facebook.com/jafrauto/" target="_blank" rel="noopener noreferrer" aria-label="JaFrauto Motor en Facebook" className="btn btn-outline-light btn-sm rounded-circle"><Icono nombre="facebook-f" /></a>
                        <a href="https://www.instagram.com/jafrauto/" target="_blank" rel="noopener noreferrer" aria-label="JaFrauto Motor en Instagram" className="btn btn-outline-light btn-sm rounded-circle"><Icono nombre="instagram" /></a>
                        <a href="https://www.tiktok.com/tag/jafrautomotor" target="_blank" rel="noopener noreferrer" aria-label="JaFrauto Motor en TikTok" className="btn btn-outline-light btn-sm rounded-circle"><Icono nombre="tiktok" /></a>
                    </div>
                </div>

                {/* COLUMNA 2: MENÚ (Ahora al lado de Identidad) */}
                <div className="col-md-2 offset-md-1">
                    <h2 className="h6 fw-bold text-uppercase text-danger mb-4">Menú</h2>
                    <ul className="list-unstyled small">
                        <li className="mb-2"><Link to="/" className="texto-footer text-decoration-none hover-red">Inicio</Link></li>
                        <li className="mb-2"><Link to="/taller" className="texto-footer text-decoration-none hover-red">Taller</Link></li>
                        <li className="mb-2"><Link to="/servicios" className="texto-footer text-decoration-none hover-red">Servicios</Link></li>
                        <li className="mb-2"><Link to="/presupuesto" className="texto-footer text-decoration-none hover-red">Presupuesto</Link></li>
                        <li className="mb-2"><Link to="/contacto" className="texto-footer text-decoration-none hover-red">Contacto</Link></li>
                    </ul>
                </div>

                {/* COLUMNA 3: CONTACTO Y MAPA (Ocupa el resto de la fila) */}
                <div className="col-md-6 text-center text-md-start"> {/* Añadido text-center para móvil */}
                    <h2 className="h6 fw-bold text-uppercase text-danger mb-4">Contacto y Ubicación</h2>
                    <div className="row g-3">
                        {/* Datos de contacto */}
                        <div className="col-sm-6">
                            <ul className="list-unstyled small mb-0">
                                {/* Ajustada la dirección: justify-content-center para móvil y start para PC */}
                                <li className="mb-2 texto-footer d-flex align-items-start justify-content-center justify-content-md-start">
                                    <Icono nombre="location-dot" className="me-2 text-danger mt-1" />
                                    <span>Calle Bedmar, 118, Pol. Olivares<br />23009 Jaén</span>
                                </li>
                                <li className="mb-2">
                                    <a href={TALLER.telefono.href} className="text-white fw-bold text-decoration-none hover-red d-block">
                                        <Icono nombre="phone" className="me-2 text-danger" />{TALLER.telefono.texto} (taller)
                                    </a>
                                </li>
                                {TALLER.moviles.map((m) => (
                                    <li className="mb-2" key={m.href}>
                                        <a href={m.href} className="texto-footer text-decoration-none hover-red d-block">
                                            <Icono nombre="mobile-screen" className="me-2 text-danger" />{m.texto} ({m.nombre})
                                        </a>
                                    </li>
                                ))}
                                <li>
                                    <a href={`mailto:${TALLER.email}`} className="texto-footer text-decoration-none hover-red d-block text-truncate">
                                        <Icono nombre="envelope" className="me-2 text-danger" />{TALLER.email}
                                    </a>
                                </li>
                            </ul>
                        </div>
                        {/* Mapa */}
                        <div className="col-sm-6">
                            <div className="shadow-sm border border-secondary overflow-hidden mx-auto" style={{ borderRadius: "8px", maxWidth: "300px" }}>
                                <MapaGoogle oscuro altoMinimo="150px" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ESPECIALIDADES (enlazado interno a las páginas de servicio) */}
            <div className="border-top border-secondary mt-4 pt-3">
                <h2 className="h6 fw-bold text-uppercase text-danger mb-3">Servicios en Jaén</h2>
                <ul className="list-unstyled d-flex flex-wrap justify-content-center justify-content-md-start gap-3 small mb-0">
                    {PAGINAS_SERVICIO.map((p) => (
                        <li key={p.slug}><Link to={`/servicios/${p.slug}`} className="texto-footer text-decoration-none hover-red">{p.nombre}</Link></li>
                    ))}
                </ul>
            </div>

            {/* BARRA INFERIOR LEGAL */}
            <div className="border-top border-secondary mt-4 pt-3 pb-3">
                <div className="row align-items-center">
                    <div className="col-md-7 text-center text-md-start">
                        <p className="small texto-footer mb-0">
                            COPYRIGHT &nbsp; © {new Date().getFullYear()} JAFRAUTO MOTOR | <Icono nombre="wrench" className="text-danger mx-1" />Desarrollo y diseño Web realizado por Miguel Contreras.
                        </p>
                    </div>
                    <div className="col-md-5 text-center text-md-end mt-2 mt-md-0">
                        <Link to="/avisoLegal" className="texto-footer text-decoration-none small mx-2 hover-red">Aviso Legal</Link>
                        <Link to="/politicaPrivacidad" className="texto-footer text-decoration-none small mx-2 hover-red">Privacidad</Link>
                        <Link to="/cookies" className="texto-footer text-decoration-none small mx-2 hover-red">Cookies</Link>
                        <button type="button" onClick={abrirPreferenciasCookies} className="btn btn-link p-0 texto-footer text-decoration-none small mx-2 hover-red align-baseline">Configurar cookies</button>
                    </div>
                </div>
            </div>
        </div>
    </footer>
);
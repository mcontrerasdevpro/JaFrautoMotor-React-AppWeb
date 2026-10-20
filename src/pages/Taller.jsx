import { Link } from "react-router-dom";
import { Imagen } from "../components/Imagen";
import { Seo } from "../components/Seo";
import { Icono } from "../components/Icono";


export const Taller = () => {
    return (
        <div className="container py-4 py-lg-5 text-dark">
            <Seo titulo="Sobre nuestro taller en Jaén" descripcion="Conoce JaFrauto Motor: taller mecánico de Francisco y Jacinto en el Polígono Los Olivares de Jaén, con más de 15 años de experiencia y equipos de diagnosis de última generación." ruta="/taller" />
            {/* SECCIÓN 1: INTRODUCCIÓN CON IMAGEN */}
            <div className="row align-items-center g-4 g-lg-5 mb-5">
                {/* COLUMNA DE TEXTO */}
                <div className="col-lg-6">
                    <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                        <h1 className="fw-bold display-4 mb-0 text-uppercase">
                            Sobre <span className="text-danger">Nosotros</span>
                        </h1>
                        {/* EL DISTINTIVO AL LADO DEL TÍTULO */}
                        <div className="bg-dark text-white p-3 shadow d-inline-block border-start border-4 border-danger ms-2"
                            style={{ minWidth: "160px", transform: "skewX(-10deg)" }}> {/* Inclinación estilo Racing */}
                            <div style={{ transform: "skewX(10deg)" }}> {/* Revertimos inclinación en el texto para que se lea recto */}
                                <h4 className="fw-bold mb-0 text-danger text-center">+15 AÑOS</h4>
                                <p className="small mb-0 text-uppercase fw-bold text-center" style={{ fontSize: "0.6rem", letterSpacing: "1px" }}>
                                    Experiencia Real
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-danger mb-4" style={{ width: "80px", height: "5px" }}></div>
                    <p className="lead fw-bold text-secondary">
                        JaFrauto Motor: Más que un taller, tu centro de confianza en Jaén.
                    </p>
                    <p className="text-muted">
                        Ubicados en el corazón del Polígono de los Olivares, nacimos con la misión de ofrecer un servicio de mecánica integral donde la <strong>transparencia</strong> y la <strong>rapidez</strong> son nuestra prioridad.
                    </p>
                    <p className="text-muted">
                        Contamos con un equipo de mecánicos apasionados por el motor, liderados por Francisco y Jacinto, con más de 15 años de experiencia en el sector. Utilizamos tecnología de diagnosis de última generación para asegurar que tu vehículo reciba el mejor trato posible.
                    </p>
                </div>
                <div className="col-lg-6">
                    <div className="position-relative">
                        <Imagen
                            nombre="taller"
                            alt="Interior del taller JaFrauto Motor con elevadores y mecánicos trabajando"
                            sizes="(min-width: 992px) 50vw, 100vw"
                            width={1197}
                            height={1059}
                            className="img-fluid shadow-lg"
                            style={{
                                borderLeft: "8px solid #fa0606",
                                objectFit: "cover",
                                width: "100%",
                                height: "auto"
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* SECCIÓN 2: NUESTROS VALORES (Cards Rojas) */}
            <div className="row g-4 mb-5 text-center">
                <div className="col-md-4">
                    <div className="p-4 border-0 shadow-sm bg-light h-100">
                        <Icono nombre="microchip" className="fa-3x text-danger mb-3" />
                        <h5 className="fw-bold text-uppercase">Alta Tecnología</h5>
                        <p className="small text-muted">Equipos de diagnosis multimarca para detectar averías con precisión quirúrgica.</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="p-4 border-0 shadow-sm bg-danger text-white h-100">
                        <Icono nombre="handshake-angle" className="fa-3x mb-3" />
                        <h5 className="fw-bold text-uppercase text-white">Transparencia</h5>
                        <p className="small">Presupuestos cerrados y explicación detallada de cada reparación. Sin sorpresas en la factura.</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="p-4 border-0 shadow-sm bg-light h-100">
                        <Icono nombre="clock" className="fa-3x text-danger mb-3" />
                        <h5 className="fw-bold text-uppercase">Rapidez</h5>
                        <p className="small text-muted">Sabemos que tu tiempo es oro. Optimizamos procesos para entregas en tiempo récord.</p>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 3: INSTALACIONES Y LLAMADA A LA ACCIÓN */}
            <div className="bg-dark text-white p-5 rounded shadow-lg text-center position-relative overflow-hidden">
                <div className="position-relative" style={{ zIndex: 1 }}>
                    <h2 className="fw-bold mb-3">¿Tu coche necesita una revisión?</h2>
                    <p className="mb-4 opacity-75 mx-auto" style={{ maxWidth: "600px" }}>
                        Pásate por nuestra nave en el Polígono de los Olivares y realizaremos una inspección visual gratuita de los puntos de seguridad de tu vehículo.
                    </p>
                    <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
                        <Link to="/contacto" className="btn btn-danger btn-lg px-5 rounded-0 fw-bold">DÓNDE ESTAMOS</Link>
                        <Link to="/servicios" className="btn btn-outline-light btn-lg px-5 rounded-0 fw-bold">VER SERVICIOS</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
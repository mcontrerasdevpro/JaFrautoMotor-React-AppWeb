import { Link } from "react-router-dom";
import { TALLER } from "../config";

export const Home = () => {
    const estiloPulso = (
        <style>{`
            @keyframes pulse-blanco-fuerte {
                0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.8); }
                70% { box-shadow: 0 0 0 20px rgba(255, 255, 255, 0); }
                100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
            }
            .boton-latido {
                animation: pulse-blanco-fuerte 2s infinite !important;
                border: 2px solid white !important;
                position: relative;
                z-index: 10;
            }
            /* Ajuste para que el rasgado no ensanche la web en móvil */
            .hero-section { overflow: hidden; position: relative; min-height: 85vh; background-color: #1a1a1a; }
            .hero-capa { background: rgba(0,0,0,0.6); }
            @media (min-width: 992px) {
                .hero-capa { background: linear-gradient(115deg, rgba(26,26,26,1) 0%, rgba(26,26,26,0.9) 45%, rgba(26,26,26,0) 70%); }
            }
        `}</style>
    );

    return (
        <div className="bg-light text-dark">
            {estiloPulso}

            <div className="bg-danger py-2 shadow-sm" style={{ position: 'relative', zIndex: 10 }}>
                <div className="container">
                    <div className="d-flex justify-content-center align-items-center flex-wrap gap-3">
                        <span className="text-white fw-bold small text-uppercase d-none d-md-inline" style={{ letterSpacing: '1px' }}>
                            Especialistas en:
                        </span>
                        <div className="d-flex align-items-center gap-3">
                            <span className="text-white fw-black h6 mb-0">CITROËN</span>
                            <span className="text-white opacity-50">|</span>
                            <span className="text-white fw-black h6 mb-0">PEUGEOT</span>
                            <span className="text-white opacity-50">|</span>
                            <span className="text-white fw-black h6 mb-0">DS AUTOMOBILES</span>
                        </div>
                    </div>
                </div>
            </div>

            <section className="hero-section">
                {/* 1. FONDO: Imagen del taller (Se adapta en móvil) */}
                <div className="position-absolute top-0 end-0 h-100 w-100" style={{
                    backgroundImage: 'linear-gradient(to right, rgba(26,26,26,1) 0%, rgba(26,26,26,0.6) 50%, rgba(26,26,26,1) 100%), url("/Portada.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: 1
                }}></div>

                {/* 2. CAPA DIAGONAL IZQUIERDA (Sutil en móvil, fuerte en PC) */}
                <div className="position-absolute top-0 start-0 h-100 w-100 hero-capa" style={{ zIndex: 2 }}></div>

                {/* 3. EL "RASGADO" - FIBRA DE CARBONO (Solo visible en pantallas grandes) */}
                <div className="position-absolute h-100 d-none d-lg-block" style={{
                    left: '45%',
                    width: '100px',
                    zIndex: 3,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    boxShadow: '-20px 0 30px rgba(0,0,0,0.5)',
                    transform: 'skewX(-15deg)',
                    borderLeft: '4px solid #fa0606'
                }}></div>

                {/* 4. CONTENIDO RESPONSIVO */}
                <div className="container position-relative h-100 d-flex align-items-center" style={{ zIndex: 4, minHeight: '85vh' }}>
                    <div className="row w-100 justify-content-center justify-content-lg-start">
                        <div className="col-lg-7 col-xl-6 text-center text-lg-start pt-5 pt-lg-0">
                            <h1 className="display-1 fw-bold mb-3 text-uppercase text-white" style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)' }}>
                                JaFrauto <span className="text-danger">Motor</span>
                            </h1>
                            <h2 className="h4 fw-light mb-4 border-start border-danger border-4 ps-3 text-white">
                                Confianza y Precisión en cada Kilómetro
                            </h2>
                            <p className="lead mb-5 text-white-50 mx-auto mx-lg-0" style={{ maxWidth: '500px' }}>
                                Especialistas en mecánica integral, diagnosis avanzada y servicios urgentes con repuestos oficiales en Jaén.
                            </p>
                            <div className="d-flex flex-column flex-md-row gap-3 justify-content-center justify-content-lg-start mb-4">
                                <Link to="/servicios" className="btn btn-danger btn-lg px-5 py-3 fw-bold shadow-lg rounded-0">
                                    VER SERVICIOS
                                </Link>
                                <a href={TALLER.telefono.href} className="btn btn-outline-light btn-lg px-5 py-3 fw-bold rounded-0 boton-latido">
                                    <i className="fa-solid fa-phone me-2"></i>URGENCIAS: {TALLER.telefono.texto}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECCIÓN DE SERVICIOS - Responsiva con row-cols */}
            <div className="container py-5 mt-n5 position-relative" style={{ zIndex: 5 }}>
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 justify-content-center">
                    <div className="col">
                        <div className="card border-0 shadow-lg p-4 h-100 hover-top rounded-0">
                            <div className="mb-3 text-danger"><i className="fa-solid fa-screwdriver-wrench fa-3x"></i></div>
                            <h4 className="fw-bold text-uppercase">Mecánica General</h4>
                            <p className="text-muted small">Desde cambios de aceite hasta reparaciones complejas de motor.</p>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card border-0 shadow-lg p-4 h-100 bg-danger text-white hover-top rounded-0">
                            <div className="mb-3 text-white"><i className="fa-solid fa-car-burst fa-3x"></i></div>
                            <h4 className="fw-bold text-uppercase">Asistencia Urgente</h4>
                            <p className="small">¿Te has quedado tirado? Prioridad máxima para averías en carretera.</p>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card border-0 shadow-lg p-4 h-100 hover-top rounded-0 bg-white">
                            <div className="mb-3 text-danger"><i className="fa-solid fa-shield-halved fa-3x"></i></div>
                            <h4 className="fw-bold text-uppercase">Revisión Pre-ITV</h4>
                            <p className="text-muted small">Revisamos 50 puntos clave para que pases la inspección sin sustos.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* BANNER WHATSAPP RESPONSIVO */}
            <section className="bg-white py-5 border-top border-bottom border-light">
                <div className="container text-center px-4">
                    <h2 className="fw-bold mb-4">¿Hablamos por <span className="text-danger">WhatsApp</span>?</h2>
                    <p className="mb-4 mx-auto" style={{ maxWidth: '600px' }}>Envíanos una foto de tu avería o la ficha técnica y te damos presupuesto inmediato.</p>
                    <a href={TALLER.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-success btn-lg px-5 shadow rounded-0">
                        <i className="fa-brands fa-whatsapp me-2"></i> CONSULTAR AHORA
                    </a>
                </div>
            </section>
        </div>
    );
};
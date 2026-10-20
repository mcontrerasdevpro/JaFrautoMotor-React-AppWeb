import { TALLER } from "../config";
import { MapaGoogle } from "../components/MapaGoogle";
import { FormularioContacto } from "../components/FormularioContacto";
import { Imagen } from "../components/Imagen";
import { Seo } from "../components/Seo";
import { Icono } from "../components/Icono";

export const Contacto = () => {
    return (
        <div className="container py-4 py-lg-5 text-dark">
            <Seo titulo="Contacto y cómo llegar" descripcion="JaFrauto Motor: Calle Bedmar 118, Polígono Los Olivares, 23009 Jaén. Lunes a viernes de 8:30 a 13:30 y de 16:00 a 19:00. Teléfono 953 121 814." ruta="/contacto" />
            {/* ENCABEZADO */}
            <div className="text-center text-md-start mb-4">
                <h1 className="fw-bold display-4 mb-0 text-uppercase">
                    Nuestras <span className="text-danger">Instalaciones</span>
                </h1>
                <div className="bg-danger mt-2 mb-4" style={{ width: "100px", height: "5px" }}></div>
            </div>

            {/* FOTO DE LA FACHADA - El "Visual Check" para el cliente */}
            <div className="col-12 mb-5">
                <div className="position-relative shadow-lg overflow-hidden"
                    style={{ borderRadius: "15px", border: "1px solid #ddd" }}>

                    {/* IMAGEN DE GRAN FORMATO */}
                    <Imagen
                        nombre="fachada"
                        prioridad
                        alt="Fachada de la nave de JaFrauto Motor en el Polígono Los Olivares de Jaén"
                        sizes="100vw"
                        className="w-100 d-block"
                        style={{
                            height: "auto",           /* Se adapta al ancho */
                            minHeight: "550px",       /* LE DAMOS MÁS CUERPO (Casi pantalla completa) */
                            maxHeight: "750px",       /* Evitamos que se pierda el resto de la página */
                            objectFit: "cover",       /* Mantiene la proporción sin deformar */
                            objectPosition: "center", /* Centra la vista en la puerta de la nave */
                            borderBottom: "10px solid #fa0606" /* Franja roja más gruesa para impacto */
                        }}
                    />

                    {/* INDICADOR DE NAVE 3 (Estilo Racing) */}
                    <div className="position-absolute bottom-0 end-0 bg-dark text-white p-4 m-4 shadow-lg border-start border-5 border-danger"
                        style={{ transform: "skewX(-15deg)", zIndex: 10 }}>
                        <div style={{ transform: "skewX(15deg)" }}>
                            <h2 className="fw-bold mb-0 text-uppercase">NAVE <span className="text-danger"></span></h2>
                            <p className="small mb-0 opacity-75 fw-bold text-uppercase" style={{ letterSpacing: '2px' }}>Entrada Principal</p>
                        </div>
                    </div>
                </div>

            </div>


            {/* FILA DE INFO Y MAPA */}
            <div className="row g-4 mb-5">
                {/* INFO DE CONTACTO */}
                <div className="col-lg-4">
                    <div className="bg-dark text-white p-4 h-100 shadow-lg border-start border-4 border-danger">
                        <h2 className="h4 fw-bold mb-4 text-danger text-uppercase">Datos de Interés</h2>

                        <div className="mb-4">
                            <h3 className="h6 fw-bold text-uppercase small texto-footer">Dirección:</h3>
                            <p className="mb-0">{TALLER.direccion.calle}, Nave</p>
                            <p>{TALLER.direccion.zona}, {TALLER.direccion.cp} {TALLER.direccion.ciudad}</p>
                        </div>

                        <div className="mb-4">
                            <h3 className="h6 fw-bold text-uppercase small texto-footer">Teléfonos:</h3>
                            <p className="mb-1">
                                <a href={TALLER.telefono.href} className="text-white fw-bold text-decoration-none">{TALLER.telefono.texto}</a> (taller)
                            </p>
                            {TALLER.moviles.map((m) => (
                                <p className="mb-1" key={m.href}>
                                    <a href={m.href} className="text-white text-decoration-none">{m.texto}</a> ({m.nombre})
                                </p>
                            ))}
                        </div>

                        <div className="mb-4">
                            <h3 className="h6 fw-bold text-uppercase small texto-footer">Horario:</h3>
                            <p className="mb-1">Lunes a Viernes:</p>
                            <p className="fw-bold text-danger">08:30 - 13:30 | 16:00 - 19:00</p>
                            <p className="mb-1">Sábados y domingos:</p>
                            <p className="fw-bold text-danger">Cerrado</p>
                        </div>

                        <a
                            href={TALLER.comoLlegar}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-danger w-100 fw-bold rounded-0 py-2 mt-2 shadow"
                        >
                            <Icono nombre="route" className="me-2" />CÓMO LLEGAR
                        </a>
                    </div>
                </div>

                {/* MAPA GRANDE */}
                <div className="col-lg-8">
                    <div className="shadow-lg h-100" style={{ minHeight: "400px", borderRadius: "10px", overflow: "hidden", border: "1px solid #ddd" }}>
                        <MapaGoogle altoMinimo="400px" />
                    </div>
                </div>
            </div>

            {/* FORMULARIO DE CONTACTO */}
            <div className="row g-4 mb-5">
                <div className="col-lg-4">
                    <h2 className="fw-bold text-uppercase">Escríbenos</h2>
                    <div className="bg-danger mt-2 mb-3" style={{ width: "80px", height: "4px" }}></div>
                    <p className="text-secondary">
                        ¿Tienes una duda o quieres que te llamemos? Déjanos tu mensaje y te respondemos en horario de taller.
                    </p>
                    <p className="text-secondary mb-2">Si lo prefieres:</p>
                    <div className="d-grid gap-2">
                        <a href={TALLER.telefono.href} className="btn btn-dark rounded-0 fw-bold">
                            <Icono nombre="phone" className="me-2" />LLAMAR AL {TALLER.telefono.texto}
                        </a>
                        <a href={TALLER.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-success rounded-0 fw-bold">
                            <Icono nombre="whatsapp" className="me-2" />ESCRIBIR POR WHATSAPP
                        </a>
                    </div>
                </div>
                <div className="col-lg-8">
                    <div className="card border-0 shadow-lg p-4 bg-white border-top border-5 border-danger">
                        <FormularioContacto />
                    </div>
                </div>
            </div>
        </div>
    );
};

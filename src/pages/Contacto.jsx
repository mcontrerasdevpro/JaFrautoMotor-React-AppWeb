export const Contacto = () => {
    return (
        <div className="container mt-1 pt-4 text-dark">
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
                    <img
                        src="/FachadaTaller.png"
                        alt="Fachada Principal JaFrauto Motor"
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
                        <h4 className="fw-bold mb-4 text-danger text-uppercase">Datos de Interés</h4>

                        <div className="mb-4">
                            <h6 className="fw-bold text-uppercase small text-secondary">Dirección:</h6>
                            <p className="mb-0">Calle Bedmar, 118, Nave</p>
                            <p>Pol. los Olivares, 23009 Jaén</p>
                        </div>

                        <div className="mb-4">
                            <h6 className="fw-bold text-uppercase small text-secondary">Teléfonos:</h6>
                            <p className="mb-1">637 830 670 (Francisco)</p>
                            <p>659 603 058 (Jacinto)</p>
                        </div>

                        <div className="mb-4">
                            <h6 className="fw-bold text-uppercase small text-secondary">Horario:</h6>
                            <p className="mb-1">Lunes a Viernes:</p>
                            <p className="fw-bold text-danger">08:30 - 13:30 | 16:00 - 19:00</p>
                            <p className="mb-1">Sabados y Domingos:</p>
                            <p className="fw-bold text-danger">Cerrado</p>
                        </div>

                        <a
                            href="https://www.google.com/maps"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-danger w-100 fw-bold rounded-0 py-2 mt-2 shadow"
                        >
                            <i className="fa-solid fa-route me-2"></i>CÓMO LLEGAR
                        </a>
                    </div>
                </div>

                {/* MAPA GRANDE */}
                <div className="col-lg-8">
                    <div className="shadow-lg h-100" style={{ minHeight: "400px", borderRadius: "10px", overflow: "hidden", border: "1px solid #ddd" }}>
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3152.864032769776!2d-3.7903449!3d37.7932261!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6dd785dd31629f%3A0xdb2725b0e85794e2!2sJafrautomotor!5e0!3m2!1ses!2ses!4v1773799069849!5m2!1ses!2ses"
                            width="100%"
                            height="100%"
                            style={{ border: 0, display: "block", minHeight: "110px" }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade">
                        </iframe>
                    </div>
                </div>
            </div>
        </div>
    );
};
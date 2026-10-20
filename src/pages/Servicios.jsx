import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { apiFetch } from "../api";
import { TALLER } from "../config";

// Nombre, descripción y precio vienen de la API; aquí solo va la parte visual por id
const PRESENTACION = {
    1: { icon: "fa-oil-can", image: "/cambioaceite.jpg" },
    2: { icon: "fa-circle-stop", image: "/sistemafrenos.jpg" },
    3: { icon: "fa-microchip", image: "/diagnosis.png" },
    4: { icon: "fa-compact-disc", image: "/neumaticos.png" },
    5: { icon: "fa-snowflake", image: "/aireacondicionado.jpg" },
    6: { icon: "fa-clipboard-check", image: "/preitv.png" }
};
const PRESENTACION_POR_DEFECTO = { icon: "fa-screwdriver-wrench", image: "/TallerMecanico.png" };

export const Servicios = () => {
    const { store, dispatch } = useGlobalReducer();
    const { urgente, busqueda } = store;
    const [cargando, setCargando] = useState(store.servicios.length === 0);
    const [error, setError] = useState("");

    useEffect(() => {
        apiFetch("/services")
            .then((data) => {
                const catalogo = data.map((s) => ({
                    id: s.id,
                    name: s.name,
                    description: s.description || "",
                    precio: s.price,
                    ...(PRESENTACION[s.id] || PRESENTACION_POR_DEFECTO)
                }));
                dispatch({ type: "set_servicios", payload: catalogo });
                setError("");
            })
            .catch((err) => setError(err.message))
            .finally(() => setCargando(false));
    }, [dispatch]);

    const serviciosFiltrados = store.servicios.filter(serv =>
        serv.name.toLowerCase().includes((busqueda || "").toLowerCase()) ||
        serv.description.toLowerCase().includes((busqueda || "").toLowerCase())
    );

    const manejarUrgente = (servicio) => {
        dispatch({ type: 'toggle_urgente', payload: servicio });
    };

     return (
        <div className="container mt-1 pt-4 text-dark">
            <div className="text-center mb-5">
                <h1 className="fw-bold display-4">NUESTROS <span className="text-danger">SERVICIOS</span></h1>
                <p className="text-muted lead">Selecciona los mantenimientos que necesites para obtener tu presupuesto.</p>
            </div>

            {error && store.servicios.length === 0 && (
                <div className="alert alert-warning text-center">
                    No hemos podido cargar el catálogo ahora mismo. Llámanos al{" "}
                    <a href={TALLER.telefono.href} className="fw-bold">{TALLER.telefono.texto}</a> y te atendemos.
                </div>
            )}

            <div className="row g-4">
                {cargando ? (
                    <div className="col-12 text-center py-5 text-muted">
                        <div className="spinner-border text-danger mb-3" role="status"></div>
                        <p>Cargando servicios...</p>
                    </div>
                ) : serviciosFiltrados.length > 0 ? (
                    serviciosFiltrados.map((serv) => {
                        const estaEnUrgente = urgente.some(item => item.id === serv.id);

                        return (
                            <div className="col-md-6 col-lg-4" key={serv.id}>
                                <div className="card h-100 shadow-sm border-0 overflow-hidden">
                                    <div className="position-relative">
                                        <div className="position-absolute top-0 start-0 m-3" style={{ zIndex: 10 }}>
                                            <span className="bg-dark text-white fw-bold px-3 py-1 shadow-sm border-start border-4 border-danger">
                                                {serv.precio}€
                                            </span>
                                        </div>

                                        <img src={serv.image} className="card-img-top" alt={serv.name} loading="lazy" style={{ height: "200px", objectFit: "cover" }} />
                                        <div className="position-absolute top-0 end-0 m-3">
                                            <i className={`fa-solid ${serv.icon} fa-2x text-white p-2 bg-danger rounded`}></i>
                                        </div>
                                    </div>

                                    <div className="card-body d-flex flex-column">
                                        <h5 className="card-title fw-bold text-uppercase">{serv.name}</h5>
                                        <p className="card-text text-secondary small flex-grow-1">{serv.description}</p>

                                        <button
                                            onClick={() => manejarUrgente(serv)}
                                            className={`btn w-100 fw-bold mt-3 rounded-0 py-2 transition-all ${estaEnUrgente ? "btn-dark" : "btn-outline-danger"}`}
                                        >
                                            {estaEnUrgente ? (
                                                <> <i className="fa-solid fa-check me-2"></i>AÑADIDO A CITA</>
                                            ) : (
                                                <> <i className="fa-solid fa-plus me-2"></i>AÑADIR A MI CITA</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : busqueda && (
                    /* Mensaje por si no hay resultados */
                    <div className="col-12 text-center py-5">
                        <h3 className="text-muted">No hay resultados para &quot;{busqueda}&quot;</h3>
                        <button className="btn btn-outline-danger mt-3" onClick={() => dispatch({ type: 'set_busqueda', payload: "" })}>
                            Limpiar búsqueda
                        </button>
                    </div>
                )}
            </div>

            {/* Banner inferior de acción rápida */}
            <div className="bg-danger text-white p-4 mt-5 rounded shadow text-center">
                <h3 className="fw-bold">¿No encuentras lo que buscas?</h3>
                <p className="mb-4">Llámanos directamente y cuéntanos qué le ocurre a tu vehículo.</p>
                <a
                    href={TALLER.telefono.href}
                    className="btn btn-light btn-lg px-5 fw-bold text-danger text-center shadow"
                >
                    LLAMAR AHORA <br />
                    {TALLER.telefono.texto}
                </a>
            </div>
        </div>
    );
};
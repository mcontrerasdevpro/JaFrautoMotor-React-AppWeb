import { useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { apiFetch } from "../api";
import { CATALOGO_INICIAL } from "../data/catalogoInicial";
import { TALLER } from "../config";
import { Imagen } from "../components/Imagen";
import { Seo } from "../components/Seo";
import { Icono } from "../components/Icono";
import { PAGINAS_SERVICIO } from "../data/paginasServicio";
import { Link } from "react-router-dom";

// Nombre, descripción y precio vienen de la API; aquí solo va la parte visual por id
const PRESENTACION = {
    1: { icon: "fa-oil-can", foto: "cambioaceite" },
    2: { icon: "fa-circle-stop", foto: "sistemafrenos" },
    3: { icon: "fa-microchip", foto: "diagnosis" },
    4: { icon: "fa-compact-disc", foto: "neumaticos" },
    5: { icon: "fa-snowflake", foto: "aireacondicionado" },
    6: { icon: "fa-clipboard-check", foto: "preitv" }
};
const PRESENTACION_POR_DEFECTO = { icon: "fa-screwdriver-wrench", foto: "taller" };

const aTarjeta = (s) => ({
    id: s.id,
    name: s.name,
    description: s.description || "",
    precio: s.price,
    ...(PRESENTACION[s.id] || PRESENTACION_POR_DEFECTO)
});

export const Servicios = () => {
    const { store, dispatch } = useGlobalReducer();
    const { urgente, busqueda } = store;

    // Se pinta con el catálogo inicial (también en el HTML prerenderizado) y la API lo
    // actualiza al cargar; si la API no responde, se queda el inicial
    useEffect(() => {
        apiFetch("/services")
            .then((data) => dispatch({ type: "set_servicios", payload: data.map(aTarjeta) }))
            .catch(() => null);
    }, [dispatch]);

    const catalogo = store.servicios.length ? store.servicios : CATALOGO_INICIAL.map(aTarjeta);
    const serviciosFiltrados = catalogo.filter(serv =>
        serv.name.toLowerCase().includes((busqueda || "").toLowerCase()) ||
        serv.description.toLowerCase().includes((busqueda || "").toLowerCase())
    );

    const manejarUrgente = (servicio) => {
        dispatch({ type: 'toggle_urgente', payload: servicio });
    };

     return (
        <div className="container py-4 py-lg-5 text-dark">
            <Seo titulo="Servicios de taller mecánico en Jaén" descripcion="Cambio de aceite, frenos, diagnosis electrónica, neumáticos, aire acondicionado y pre-ITV en Jaén. Elige el servicio y pide cita online en JaFrauto Motor." ruta="/servicios" />
            <div className="text-center mb-5">
                <h1 className="fw-bold display-4">NUESTROS <span className="text-danger">SERVICIOS</span></h1>
                <p className="text-muted lead">Selecciona los mantenimientos que necesites para obtener tu presupuesto.</p>
                <div className="position-relative mx-auto mt-4" style={{ maxWidth: "420px" }}>
                    <label htmlFor="buscar-servicio" className="visually-hidden">Buscar servicio</label>
                    <input
                        id="buscar-servicio"
                        type="text"
                        inputMode="search"
                        className="form-control border-danger shadow-none bg-light rounded-0 pe-5"
                        placeholder="Buscar servicio (frenos, aceite, ITV...)"
                        value={busqueda || ""}
                        onChange={(e) => dispatch({ type: "set_busqueda", payload: e.target.value })}
                    />
                    <Icono nombre="magnifying-glass" className="position-absolute end-0 top-50 translate-middle-y me-3 text-danger opacity-50" />
                </div>
            </div>

            <div className="row g-4">
                {serviciosFiltrados.length > 0 ? (
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

                                        <Imagen nombre={serv.foto} alt={serv.name} sizes="(min-width: 992px) 33vw, (min-width: 768px) 50vw, 100vw" className="card-img-top" style={{ height: "200px", objectFit: "cover" }} />
                                        <div className="position-absolute top-0 end-0 m-3">
                                            <Icono nombre={serv.icon} className="fa-2x text-white p-2 bg-danger rounded" />
                                        </div>
                                    </div>

                                    <div className="card-body d-flex flex-column">
                                        <h2 className="h5 card-title fw-bold text-uppercase">{serv.name}</h2>
                                        <p className="card-text text-secondary small flex-grow-1">{serv.description}</p>

                                        <button
                                            onClick={() => manejarUrgente(serv)}
                                            className={`btn w-100 fw-bold mt-3 rounded-0 py-2 transition-all ${estaEnUrgente ? "btn-dark" : "btn-outline-danger"}`}
                                        >
                                            {estaEnUrgente ? (
                                                <> <Icono nombre="check" className="me-2" />AÑADIDO A CITA</>
                                            ) : (
                                                <> <Icono nombre="plus" className="me-2" />AÑADIR A MI CITA</>
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
                        <p className="h3 text-muted">No hay resultados para &quot;{busqueda}&quot;</p>
                        <button className="btn btn-outline-danger mt-3" onClick={() => dispatch({ type: 'set_busqueda', payload: "" })}>
                            Limpiar búsqueda
                        </button>
                    </div>
                )}
            </div>

            {/* Páginas de cada especialidad (SEO local y enlazado interno) */}
            <section className="mt-5" aria-labelledby="especialidades-titulo">
                <h2 id="especialidades-titulo" className="h4 fw-bold text-uppercase mb-3">Especialidades del taller en Jaén</h2>
                <div className="row g-3">
                    {PAGINAS_SERVICIO.map((p) => (
                        <div className="col-sm-6 col-lg-3" key={p.slug}>
                            <Link to={`/servicios/${p.slug}`} className="d-flex align-items-center gap-2 p-3 h-100 bg-white shadow-sm text-dark text-decoration-none border-start border-4 border-danger">
                                <Icono nombre={p.icono} className="text-danger" />
                                <span className="fw-bold">{p.nombre}</span>
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* Banner inferior de acción rápida */}
            <div className="bg-danger text-white p-4 mt-5 rounded shadow text-center">
                <h2 className="h3 fw-bold">¿No encuentras lo que buscas?</h2>
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
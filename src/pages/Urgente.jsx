import { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { apiFetch } from "../api";
import { TALLER, FRANJAS_CITA } from "../config";

// Fecha local en formato AAAA-MM-DD (toISOString usaría UTC y podría cambiar el día)
const fechaLocal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const Urgente = () => {
    const { store, dispatch } = useGlobalReducer();
    const { urgente } = store;

    const [seleccionado, setSeleccionado] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");
    const [citaConfirmada, setCitaConfirmada] = useState(null);

    // ESTADOS DEL FORMULARIO
    const [fecha, setFecha] = useState("");
    const [hora, setHora] = useState("");

    const totalEuros = urgente?.reduce((acc, item) => acc + (item.precio || 0), 0) || 0;

    const manejarReserva = async (e) => {
        e.preventDefault();
        setError("");
        setCargando(true);

        try {
            // Solo mandamos qué servicios son: el precio lo calcula el servidor
            const data = await apiFetch("/appointment", {
                method: "POST",
                token: store.token,
                body: {
                    date: fecha,
                    time: hora,
                    service_ids: urgente.map(s => s.id)
                }
            });

            setCitaConfirmada(data.appointment);
            window.scrollTo(0, 0);
            dispatch({ type: "vaciar_urgente" });
            setFecha("");
            setHora("");
        } catch (error) {
            setError(error.message || "Hubo un problema al reservar. Llámanos y te atendemos.");
        } finally {
            setCargando(false);
        }
    };

    if (seleccionado) {
        return (
            <div className="container mt-5 pt-5 text-center text-white">
                <div className="p-5 bg-dark border border-danger rounded shadow-lg">
                    <h2 className="text-danger fw-bold">DETALLES: {seleccionado.name}</h2>
                    <p className="mt-3 lead">{seleccionado.description}</p>
                    <button className="btn btn-outline-light mt-4" onClick={() => setSeleccionado(null)}>Volver al Carrito</button>
                </div>
            </div>
        );
    }

    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const fechaMinima = fechaLocal(manana);
    const limite = new Date();
    limite.setDate(limite.getDate() + 90);
    const fechaMaxima = fechaLocal(limite);

    const cambiarFecha = (valor) => {
        setFecha(valor);
        const dia = new Date(`${valor}T12:00:00`).getDay();
        setError(dia === 0 || dia === 6 ? "El taller abre de lunes a viernes. Elige otro día." : "");
    };

    if (citaConfirmada) {
        return (
            <div className="container mt-5 pt-5 text-dark text-center" style={{ minHeight: "70vh" }}>
                <div className="card border-0 shadow-lg p-5 bg-white mx-auto" style={{ maxWidth: "640px" }}>
                    <i className="fa-solid fa-calendar-check fa-4x text-danger mb-4"></i>
                    <h1 className="h2 fw-bold">¡CITA REGISTRADA!</h1>
                    <p className="lead text-secondary mb-1">
                        {citaConfirmada.date} a las {citaConfirmada.time} · Total estimado {citaConfirmada.total}€
                    </p>
                    <p className="text-secondary">Francisco o Jacinto te contactarán para confirmarla. Te hemos enviado un email con los detalles.</p>
                    <button className="btn btn-danger mt-3 px-5 rounded-0 fw-bold mx-auto" onClick={() => setCitaConfirmada(null)}>VOLVER</button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5 pt-5 text-dark">
            <div className="bg-danger p-4 rounded-0 mb-5 shadow-lg text-center text-white">
                <h1 className="fw-bold mb-2">🚨 ASISTENCIA MECÁNICA INMEDIATA</h1>
                <p className="mb-0 opacity-75 text-uppercase small fw-bold" style={{ letterSpacing: '2px' }}>Llámanos ahora para grúa o avería grave</p>
                <a href={TALLER.telefono.href} className="btn btn-light fw-bold mt-3 px-5 py-2 text-danger shadow rounded-0 text-center">
                    LLAMAR AHORA <br /> {TALLER.telefono.texto}
                </a>
            </div>

            <div className="row g-5">
                <div className="col-lg-7">
                    <h2 className="fw-bold mb-4 border-start border-4 border-danger ps-3 text-uppercase">
                        Mi Reserva de <span className="text-danger">Reparación</span> ({urgente?.length || 0})
                    </h2>

                    {!urgente || urgente.length === 0 ? (
                        <div className="py-5 border border-secondary rounded border-dashed text-center bg-light">
                            <i className="fa-solid fa-cart-plus fa-3x text-muted mb-3"></i>
                            <h3 className="text-secondary">Tu selección está vacía.</h3>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-3">
                            {urgente.map((fav) => (
                                <article key={fav.id} className="card border-0 shadow-sm rounded-0 border-start border-danger border-4">
                                    <div className="card-body d-flex align-items-center justify-content-between p-3">
                                        <div className="d-flex align-items-center">
                                            <img src={fav.image} alt={fav.name} style={{ width: "60px", height: "60px", objectFit: "cover" }} className="me-3" />
                                            <div>
                                                <h6 className="mb-0 fw-bold text-uppercase">{fav.name}</h6>
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className="text-danger fw-bold">{fav.precio}€</span>
                                                    <button onClick={() => setSeleccionado(fav)} className="btn btn-link p-0 text-muted small text-decoration-none border-start ps-2">Ver info</button>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="btn btn-outline-secondary btn-sm border-0" onClick={() => dispatch({ type: 'toggle_urgente', payload: fav })}>
                                            <i className="fa-solid fa-trash-can"></i>
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>

                <div className="col-lg-5">
                    <div className="card bg-dark text-white p-4 rounded-0 shadow-lg sticky-top" style={{ top: '120px' }}>
                        <h4 className="fw-bold mb-4 text-uppercase border-bottom border-danger pb-2 text-danger text-center">Resumen de Reserva</h4>

                        <div className="d-flex justify-content-between mb-4 border-bottom border-secondary pb-2">
                            <span className="h5 fw-bold">TOTAL ESTIMADO:</span>
                            <span className="h5 fw-bold text-danger">{totalEuros}€</span>
                        </div>

                        <form onSubmit={manejarReserva}>
                            <div className="mb-3">
                                <label htmlFor="cita-fecha" className="small fw-bold text-uppercase opacity-75 mb-2">Día de la cita</label>
                                <input id="cita-fecha" type="date" min={fechaMinima} max={fechaMaxima} className="form-control bg-white text-dark border-0 rounded-0 py-2"
                                    required value={fecha} onChange={(e) => cambiarFecha(e.target.value)} />
                                <div className="small opacity-75 mt-1">De lunes a viernes</div>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="cita-hora" className="small fw-bold text-uppercase opacity-75 mb-2">Hora preferente</label>
                                <select id="cita-hora" className="form-select bg-white text-dark border-0 rounded-0 py-2"
                                    required value={hora} onChange={(e) => setHora(e.target.value)}>
                                    <option value="">Seleccionar hora...</option>
                                    {Object.entries(FRANJAS_CITA).map(([turno, horas]) => (
                                        <optgroup label={turno} key={turno}>
                                            {horas.map((h) => <option key={h}>{h}</option>)}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>

                            {error && <div className="alert alert-danger small">{error}</div>}

                            <button type="submit" className="btn btn-danger w-100 fw-bold py-3 mt-3 rounded-0 shadow-lg text-uppercase" disabled={!urgente?.length || cargando}>
                                <i className="fa-solid fa-calendar-check me-2"></i>
                                {cargando ? "PROCESANDO..." : `RESERVAR CITA (${totalEuros}€)`}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
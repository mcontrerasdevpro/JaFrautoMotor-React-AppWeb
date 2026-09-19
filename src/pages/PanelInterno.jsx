import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

export const PanelInterno = () => {
    const [citas, setCitas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Protección: Si no hay clave en la sesión, fuera
    useEffect(() => {
        if (sessionStorage.getItem("admin_auth") !== "true") {
            navigate("/");
        }
    }, [navigate]);

    const cargarCitas = async () => {
        setCargando(true);
        try {
            const data = await apiFetch("/appointments");
            setCitas(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarCitas();
    }, []);

    const cerrarSesion = () => {
        sessionStorage.removeItem("admin_auth");
        navigate("/");
    };

    const marcarAtendida = async (id) => {
        try {
            await apiFetch(`/appointment/${id}/status`, { method: "PATCH", body: { status: "Completada" } });
            cargarCitas();
        } catch (err) {
            setError(err.message);
        }
    };

    const pendientes = citas.filter(c => c.status === "Pendiente");

    return (
        <div className="container mt-5 pt-5 text-dark" style={{ minHeight: "85vh" }}>
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-danger pb-3">
                <h1 className="fw-bold m-0 text-uppercase">🛠 GESTIÓN <span className="text-danger">INTERNA</span></h1>
                <button className="btn btn-outline-dark btn-sm fw-bold" onClick={cerrarSesion}>
                    <i className="fa-solid fa-power-off me-2"></i>CERRAR SESIÓN
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-4 mb-5">
                {/* INDICADORES RÁPIDOS */}
                <div className="col-md-4">
                    <div className="card bg-danger text-white p-4 shadow border-0 rounded-0">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-uppercase fw-bold opacity-75 mb-1 small">Citas en espera</h6>
                                <h2 className="display-4 fw-bold mb-0">{pendientes.length}</h2>
                            </div>
                            <i className="fa-solid fa-calendar-check fa-3x opacity-25"></i>
                        </div>
                    </div>
                </div>
                {/* Puedes añadir más tarjetas aquí (ej: total euros, clientes nuevos) */}
            </div>

            {/* TABLA DE CITAS SOLICITADAS */}
            <div className="card border-0 shadow-lg rounded-0 overflow-hidden">
                <div className="card-header bg-dark text-white py-3">
                    <h5 className="mb-0 fw-bold"><i className="fa-solid fa-list me-2 text-danger"></i> SOLICITUDES RECIBIDAS</h5>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light text-uppercase small fw-bold">
                                <tr>
                                    <th className="ps-4 py-3">Cliente</th>
                                    <th>Servicios</th>
                                    <th>Fecha</th>
                                    <th>Importe</th>
                                    <th>Estado</th>
                                    <th className="text-end pe-4">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cargando ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted">Cargando...</td>
                                    </tr>
                                ) : citas.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted italic">
                                            No hay citas pendientes de procesar.
                                        </td>
                                    </tr>
                                ) : (
                                    citas.map((cita) => (
                                        <tr key={cita.id}>
                                            <td className="ps-4">
                                                <div className="fw-bold">{cita.client}</div>
                                                <small className="text-muted">{cita.contact} · Ref: {cita.id}</small>
                                            </td>
                                            <td className="small">
                                                {(cita.services || []).map(s => s.name).join(", ")}
                                            </td>
                                            <td className="small">{cita.date} {cita.time}</td>
                                            <td>
                                                <span className="fw-bold text-danger">{cita.total}€</span>
                                            </td>
                                            <td>
                                                <span className={`badge px-3 rounded-pill small ${
                                                    cita.status === "Pendiente" ? "bg-warning text-dark" :
                                                    cita.status === "Cancelada" ? "bg-secondary" : "bg-success"
                                                }`}>{cita.status}</span>
                                            </td>
                                            <td className="text-end pe-4">
                                                {cita.status === "Pendiente" && (
                                                    <button
                                                        className="btn btn-sm btn-outline-danger border-0"
                                                        onClick={() => marcarAtendida(cita.id)}
                                                        title="Completar y archivar"
                                                    >
                                                        <i className="fa-solid fa-check-double me-1"></i> ATENDIDA
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

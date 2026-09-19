import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { apiFetch } from "../api";

const FilaCliente = ({ cliente, citasDelCliente, token, onNotasGuardadas }) => {
    const [abierto, setAbierto] = useState(false);
    const [notas, setNotas] = useState(cliente.notes || "");
    const [guardando, setGuardando] = useState(false);

    const guardarNotas = async () => {
        setGuardando(true);
        try {
            const actualizado = await apiFetch(`/clients/${cliente.id}/notes`, {
                method: "PATCH", token, body: { notes: notas }
            });
            onNotasGuardadas(actualizado);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <>
            <tr style={{ cursor: "pointer" }} onClick={() => setAbierto(!abierto)}>
                <td className="ps-4">
                    <div className="fw-bold">{cliente.name}</div>
                    <small className="text-muted">{cliente.email}</small>
                </td>
                <td className="small">{cliente.phone}</td>
                <td className="small">{citasDelCliente.length}</td>
                <td className="text-end pe-4">
                    <i className={`fa-solid fa-chevron-${abierto ? "up" : "down"} text-muted`}></i>
                </td>
            </tr>
            {abierto && (
                <tr>
                    <td colSpan="4" className="bg-light p-4">
                        <h6 className="fw-bold text-uppercase small mb-3">Historial de citas</h6>
                        {citasDelCliente.length === 0 ? (
                            <p className="text-muted small">Este cliente todavía no ha solicitado ningún servicio.</p>
                        ) : (
                            <ul className="list-unstyled small mb-4">
                                {citasDelCliente.map(c => (
                                    <li key={c.id} className="mb-1">
                                        <strong>{c.date} {c.time}</strong> — {(c.services || []).map(s => s.name).join(", ")} ({c.total}€) — <span className="fw-bold">{c.status}</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <h6 className="fw-bold text-uppercase small mb-2">Notas internas</h6>
                        <textarea
                            className="form-control bg-white border-secondary mb-2"
                            rows="3"
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Ej: cliente habitual, pendiente de pagar la última revisión..."
                        />
                        <button
                            className="btn btn-sm btn-dark rounded-0"
                            onClick={(e) => { e.stopPropagation(); guardarNotas(); }}
                            disabled={guardando}
                        >
                            {guardando ? "GUARDANDO..." : "GUARDAR NOTA"}
                        </button>
                    </td>
                </tr>
            )}
        </>
    );
};

export const PanelInterno = () => {
    const { store, dispatch } = useGlobalReducer();
    const [tab, setTab] = useState("solicitudes");
    const [citas, setCitas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const cargarCitas = async () => {
        try {
            const data = await apiFetch("/appointments", { token: store.token });
            setCitas(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const cargarClientes = async () => {
        try {
            const data = await apiFetch("/clients", { token: store.token });
            setClientes(data);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        setCargando(true);
        Promise.all([cargarCitas(), cargarClientes()]).finally(() => setCargando(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cerrarSesion = () => {
        dispatch({ type: "logout" });
        navigate("/");
    };

    const marcarAtendida = async (id) => {
        try {
            await apiFetch(`/appointment/${id}/status`, { method: "PATCH", token: store.token, body: { status: "Completada" } });
            cargarCitas();
        } catch (err) {
            setError(err.message);
        }
    };

    const actualizarClienteLocal = (clienteActualizado) => {
        setClientes(clientes.map(c => c.id === clienteActualizado.id ? clienteActualizado : c));
    };

    const pendientes = citas.filter(c => c.status === "Pendiente");
    const clientesFiltrados = clientes.filter(c =>
        c.name.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.email.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="container mt-5 pt-5 text-dark" style={{ minHeight: "85vh" }}>
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-danger pb-3">
                <h1 className="fw-bold m-0 text-uppercase">🛠 GESTIÓN <span className="text-danger">INTERNA</span></h1>
                <button className="btn btn-outline-dark btn-sm fw-bold" onClick={cerrarSesion}>
                    <i className="fa-solid fa-power-off me-2"></i>CERRAR SESIÓN
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-4 mb-4">
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
                <div className="col-md-4">
                    <div className="card bg-dark text-white p-4 shadow border-0 rounded-0">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-uppercase fw-bold opacity-75 mb-1 small">Clientes registrados</h6>
                                <h2 className="display-4 fw-bold mb-0">{clientes.length}</h2>
                            </div>
                            <i className="fa-solid fa-users fa-3x opacity-25"></i>
                        </div>
                    </div>
                </div>
            </div>

            {/* PESTAÑAS */}
            <ul className="nav nav-tabs mb-0">
                <li className="nav-item">
                    <button className={`nav-link fw-bold ${tab === "solicitudes" ? "active text-danger" : "text-dark"}`}
                        onClick={() => setTab("solicitudes")}>
                        <i className="fa-solid fa-list me-2"></i>SOLICITUDES
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link fw-bold ${tab === "clientes" ? "active text-danger" : "text-dark"}`}
                        onClick={() => setTab("clientes")}>
                        <i className="fa-solid fa-users me-2"></i>CLIENTES
                    </button>
                </li>
            </ul>

            {tab === "solicitudes" && (
                <div className="card border-0 shadow-lg rounded-0 overflow-hidden">
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
            )}

            {tab === "clientes" && (
                <div className="card border-0 shadow-lg rounded-0 overflow-hidden">
                    <div className="card-header bg-white py-3">
                        <input
                            type="text"
                            className="form-control border-danger"
                            style={{ maxWidth: "320px" }}
                            placeholder="Buscar cliente por nombre o email..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light text-uppercase small fw-bold">
                                    <tr>
                                        <th className="ps-4 py-3">Cliente</th>
                                        <th>Teléfono</th>
                                        <th>Nº citas</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cargando ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-5 text-muted">Cargando...</td>
                                        </tr>
                                    ) : clientesFiltrados.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-5 text-muted">
                                                No hay clientes que coincidan con la búsqueda.
                                            </td>
                                        </tr>
                                    ) : (
                                        clientesFiltrados.map((cliente) => (
                                            <FilaCliente
                                                key={cliente.id}
                                                cliente={cliente}
                                                citasDelCliente={citas.filter(c => c.user_id === cliente.id)}
                                                token={store.token}
                                                onNotasGuardadas={actualizarClienteLocal}
                                            />
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { apiFetch } from "../api";
import { PestanaAgenda } from "../components/panel/PestanaAgenda";
import { Icono } from "../components/Icono";

const COLOR_ESTADO = {
    Pendiente: "bg-warning text-dark",
    Confirmada: "bg-primary",
    Completada: "bg-success",
    Cancelada: "bg-secondary",
    Nuevo: "bg-danger",
    Contactado: "bg-primary",
    Cerrado: "bg-secondary"
};

const ESTADOS_LEAD = ["Nuevo", "Contactado", "Cerrado"];

const formatearFecha = (iso) => iso ? new Date(iso).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" }) : "";

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
                    <Icono nombre={abierto ? "chevron-up" : "chevron-down"} className="text-muted" />
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

FilaCliente.propTypes = {
    cliente: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string,
        email: PropTypes.string,
        phone: PropTypes.string,
        notes: PropTypes.string
    }).isRequired,
    citasDelCliente: PropTypes.array.isRequired,
    token: PropTypes.string,
    onNotasGuardadas: PropTypes.func.isRequired
};

export const PanelInterno = () => {
    const { store, dispatch } = useGlobalReducer();
    const [tab, setTab] = useState("solicitudes");
    const [citas, setCitas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [leads, setLeads] = useState([]);
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

    const cargarLeads = async () => {
        try {
            const data = await apiFetch("/leads", { token: store.token });
            setLeads(data);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        setCargando(true);
        Promise.all([cargarCitas(), cargarClientes(), cargarLeads()]).finally(() => setCargando(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cerrarSesion = () => {
        dispatch({ type: "logout" });
        navigate("/");
    };

    const cambiarEstadoCita = async (id, status) => {
        try {
            await apiFetch(`/appointment/${id}/status`, { method: "PATCH", token: store.token, body: { status } });
            cargarCitas();
        } catch (err) {
            setError(err.message);
        }
    };

    const cambiarEstadoLead = async (id, status) => {
        try {
            const actualizado = await apiFetch(`/leads/${id}/status`, { method: "PATCH", token: store.token, body: { status } });
            setLeads(leads.map(l => l.id === id ? actualizado : l));
        } catch (err) {
            setError(err.message);
        }
    };

    const actualizarClienteLocal = (clienteActualizado) => {
        setClientes(clientes.map(c => c.id === clienteActualizado.id ? clienteActualizado : c));
    };

    const pendientes = citas.filter(c => c.status === "Pendiente");
    const leadsNuevos = leads.filter(l => l.status === "Nuevo");
    const clientesFiltrados = clientes.filter(c =>
        c.name.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.email.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="container py-4 py-lg-5 text-dark" style={{ minHeight: "85vh" }}>
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-danger pb-3">
                <h1 className="fw-bold m-0 text-uppercase">🛠 GESTIÓN <span className="text-danger">INTERNA</span></h1>
                <button className="btn btn-outline-dark btn-sm fw-bold" onClick={cerrarSesion}>
                    <Icono nombre="power-off" className="me-2" />CERRAR SESIÓN
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
                            <Icono nombre="calendar-check" className="fa-3x opacity-25" />
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
                            <Icono nombre="users" className="fa-3x opacity-25" />
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card bg-white text-dark p-4 shadow border-0 rounded-0 border-start border-5 border-danger">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-uppercase fw-bold opacity-75 mb-1 small">Presupuestos nuevos</h6>
                                <h2 className="display-4 fw-bold mb-0">{leadsNuevos.length}</h2>
                            </div>
                            <Icono nombre="file-invoice" className="fa-3x opacity-25" />
                        </div>
                    </div>
                </div>
            </div>

            {/* PESTAÑAS */}
            <ul className="nav nav-tabs mb-0">
                <li className="nav-item">
                    <button className={`nav-link fw-bold ${tab === "solicitudes" ? "active text-danger" : "text-dark"}`}
                        onClick={() => setTab("solicitudes")}>
                        <Icono nombre="list" className="me-2" />SOLICITUDES
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link fw-bold ${tab === "clientes" ? "active text-danger" : "text-dark"}`}
                        onClick={() => setTab("clientes")}>
                        <Icono nombre="users" className="me-2" />CLIENTES
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link fw-bold ${tab === "presupuestos" ? "active text-danger" : "text-dark"}`}
                        onClick={() => setTab("presupuestos")}>
                        <Icono nombre="file-invoice" className="me-2" />PRESUPUESTOS Y CONTACTO
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link fw-bold ${tab === "agenda" ? "active text-danger" : "text-dark"}`}
                        onClick={() => setTab("agenda")}>
                        <Icono nombre="calendar-days" className="me-2" />AGENDA
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
                                        <th>Vehículo</th>
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
                                            <td colSpan="7" className="text-center py-5 text-muted">Cargando...</td>
                                        </tr>
                                    ) : citas.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-5 text-muted italic">
                                                No hay citas pendientes de procesar.
                                            </td>
                                        </tr>
                                    ) : (
                                        citas.map((cita) => (
                                            <tr key={cita.id}>
                                                <td className="ps-4">
                                                    <div className="fw-bold">
                                                        {cita.client}
                                                        {!cita.user_id && <span className="badge bg-light text-dark border ms-2">Invitado</span>}
                                                    </div>
                                                    <a href={`tel:${cita.contact}`} className="small text-decoration-none">{cita.contact}</a>
                                                    <small className="text-muted"> · Ref: {cita.id}</small>
                                                </td>
                                                <td className="small">
                                                    {cita.vehicle || "-"}
                                                    {cita.plate && <div className="text-muted">{cita.plate}</div>}
                                                </td>
                                                <td className="small" style={{ minWidth: "180px" }}>
                                                    {(cita.services || []).map(s => s.name).join(", ")}
                                                    {cita.symptom && <div className="text-muted fst-italic" style={{ whiteSpace: "pre-line" }}>{cita.symptom}</div>}
                                                </td>
                                                <td className="small">{cita.date} {cita.time}</td>
                                                <td>
                                                    <span className="fw-bold text-danger">{cita.total}€</span>
                                                </td>
                                                <td>
                                                    <span className={`badge px-3 rounded-pill small ${COLOR_ESTADO[cita.status] || "bg-secondary"}`}>{cita.status}</span>
                                                </td>
                                                <td className="text-end pe-4 text-nowrap">
                                                    {cita.status === "Pendiente" && (
                                                        <button
                                                            className="btn btn-sm btn-outline-primary border-0"
                                                            onClick={() => cambiarEstadoCita(cita.id, "Confirmada")}
                                                            title="Confirmar la cita con el cliente"
                                                        >
                                                            <Icono nombre="check" className="me-1" /> CONFIRMAR
                                                        </button>
                                                    )}
                                                    {(cita.status === "Pendiente" || cita.status === "Confirmada") && (
                                                        <button
                                                            className="btn btn-sm btn-outline-danger border-0"
                                                            onClick={() => cambiarEstadoCita(cita.id, "Completada")}
                                                            title="Completar y archivar"
                                                        >
                                                            <Icono nombre="check-double" className="me-1" /> ATENDIDA
                                                        </button>
                                                    )}
                                                    {(cita.status === "Pendiente" || cita.status === "Confirmada") && (
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary border-0"
                                                            onClick={() => window.confirm(`¿Cancelar la cita de ${cita.client}?`) && cambiarEstadoCita(cita.id, "Cancelada")}
                                                            title="Cancelar la cita"
                                                        >
                                                            <Icono nombre="xmark" className="me-1" /> CANCELAR
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

            {tab === "presupuestos" && (
                <div className="card border-0 shadow-lg rounded-0 overflow-hidden">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light text-uppercase small fw-bold">
                                    <tr>
                                        <th className="ps-4 py-3">Cliente</th>
                                        <th>Tipo</th>
                                        <th>Vehículo</th>
                                        <th style={{ minWidth: "260px" }}>Mensaje</th>
                                        <th>Recibido</th>
                                        <th className="pe-4">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cargando ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-5 text-muted">Cargando...</td>
                                        </tr>
                                    ) : leads.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-5 text-muted">
                                                Todavía no ha llegado ninguna solicitud desde la web.
                                            </td>
                                        </tr>
                                    ) : (
                                        leads.map((lead) => (
                                            <tr key={lead.id}>
                                                <td className="ps-4">
                                                    <div className="fw-bold">{lead.name}</div>
                                                    <a href={`tel:${lead.phone}`} className="small text-decoration-none">{lead.phone}</a>
                                                    {lead.email && <div className="small text-muted">{lead.email}</div>}
                                                </td>
                                                <td className="small text-capitalize">{lead.kind}</td>
                                                <td className="small">
                                                    {lead.vehicle || "-"}
                                                    {lead.plate && <div className="text-muted">{lead.plate}</div>}
                                                </td>
                                                <td className="small" style={{ whiteSpace: "pre-line" }}>{lead.message}</td>
                                                <td className="small text-nowrap">{formatearFecha(lead.created_at)}</td>
                                                <td className="pe-4">
                                                    <select
                                                        className={`form-select form-select-sm fw-bold border-0 text-white ${COLOR_ESTADO[lead.status]}`}
                                                        value={lead.status}
                                                        onChange={(e) => cambiarEstadoLead(lead.id, e.target.value)}
                                                        aria-label={`Estado de la solicitud de ${lead.name}`}
                                                    >
                                                        {ESTADOS_LEAD.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
                                                    </select>
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

            {tab === "agenda" && <PestanaAgenda token={store.token} />}
        </div>
    );
};

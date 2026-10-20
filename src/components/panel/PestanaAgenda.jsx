import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { apiFetch } from "../../api";
import { textoFecha } from "../../utils/fechas";
import { Icono } from "../Icono";

// Pestaña "Agenda" del panel: plazas por franja y días sin citas (festivos, vacaciones)
export const PestanaAgenda = ({ token }) => {
    const [capacidad, setCapacidad] = useState(3);
    const [franjas, setFranjas] = useState([]);
    const [bloqueados, setBloqueados] = useState([]);
    const [nuevoDia, setNuevoDia] = useState("");
    const [motivo, setMotivo] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        Promise.all([
            apiFetch("/settings/agenda", { token }),
            apiFetch("/blocked-days", { token })
        ])
            .then(([ajustes, dias]) => {
                setCapacidad(ajustes.capacity);
                setFranjas(ajustes.slots);
                setBloqueados(dias);
            })
            .catch((err) => setError(err.message));
    }, [token]);

    const avisar = (texto) => {
        setError("");
        setMensaje(texto);
    };

    const guardarCapacidad = async (e) => {
        e.preventDefault();
        try {
            const data = await apiFetch("/settings/agenda", { method: "PUT", token, body: { capacity: Number(capacidad) } });
            setCapacidad(data.capacity);
            avisar(`Guardado: ${data.capacity} coches por franja.`);
        } catch (err) {
            setError(err.message);
        }
    };

    const bloquear = async (e) => {
        e.preventDefault();
        try {
            const data = await apiFetch("/blocked-days", { method: "POST", token, body: { date: nuevoDia, reason: motivo } });
            setBloqueados([...bloqueados, data].sort((a, b) => a.date.localeCompare(b.date)));
            setNuevoDia("");
            setMotivo("");
            avisar(data.citas_afectadas > 0
                ? `Día bloqueado. Ojo: ya hay ${data.citas_afectadas} cita(s) ese día; avisa a esos clientes.`
                : "Día bloqueado. Ya no se podrán pedir citas ese día.");
        } catch (err) {
            setError(err.message);
        }
    };

    const desbloquear = async (id) => {
        try {
            await apiFetch(`/blocked-days/${id}`, { method: "DELETE", token });
            setBloqueados(bloqueados.filter((d) => d.id !== id));
            avisar("Día desbloqueado.");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="card border-0 shadow-lg rounded-0 p-4">
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            {mensaje && <div className="alert alert-success" role="status">{mensaje}</div>}

            <div className="row g-4">
                <div className="col-lg-5">
                    <h2 className="h5 fw-bold text-uppercase">Plazas por franja</h2>
                    <p className="small text-secondary">
                        Cuántos coches podéis recibir a la misma hora. Franjas de entrada: {franjas.join(" · ")} (lunes a viernes).
                    </p>
                    <form onSubmit={guardarCapacidad} className="d-flex gap-2 align-items-end">
                        <div>
                            <label htmlFor="agenda-capacidad" className="small fw-bold text-muted">COCHES POR FRANJA</label>
                            <input id="agenda-capacidad" type="number" min={1} max={20} className="form-control" style={{ width: "110px" }}
                                value={capacidad} onChange={(e) => setCapacidad(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-dark rounded-0 fw-bold">GUARDAR</button>
                    </form>
                </div>

                <div className="col-lg-7">
                    <h2 className="h5 fw-bold text-uppercase">Días sin citas</h2>
                    <p className="small text-secondary">Festivos, vacaciones o días en que no queráis recibir reservas por la web.</p>
                    <form onSubmit={bloquear} className="row g-2 align-items-end mb-3">
                        <div className="col-sm-5">
                            <label htmlFor="agenda-dia" className="small fw-bold text-muted">DÍA</label>
                            <input id="agenda-dia" type="date" className="form-control" value={nuevoDia}
                                onChange={(e) => setNuevoDia(e.target.value)} required />
                        </div>
                        <div className="col-sm-4">
                            <label htmlFor="agenda-motivo" className="small fw-bold text-muted">MOTIVO</label>
                            <input id="agenda-motivo" className="form-control" placeholder="Ej: Festivo local" maxLength={120}
                                value={motivo} onChange={(e) => setMotivo(e.target.value)} />
                        </div>
                        <div className="col-sm-3 d-grid">
                            <button type="submit" className="btn btn-danger rounded-0 fw-bold">BLOQUEAR</button>
                        </div>
                    </form>
                    {bloqueados.length === 0 ? (
                        <p className="small text-muted">No hay días bloqueados.</p>
                    ) : (
                        <ul className="list-group list-group-flush">
                            {bloqueados.map((d) => (
                                <li key={d.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                                    <span>
                                        <span className="fw-bold">{textoFecha(d.date)}</span>
                                        {d.reason && <span className="text-muted small"> · {d.reason}</span>}
                                    </span>
                                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => desbloquear(d.id)}
                                        aria-label={`Desbloquear ${d.date}`}>
                                        <Icono nombre="unlock" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

PestanaAgenda.propTypes = {
    token: PropTypes.string
};

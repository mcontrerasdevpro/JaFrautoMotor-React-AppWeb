import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { apiFetch } from "../api";

export const MiCuenta = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const [name, setName] = useState(store.usuario?.name || "");
    const [email, setEmail] = useState(store.usuario?.email || "");
    const [phone, setPhone] = useState(store.usuario?.phone || "");
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    const cargarCitas = async () => {
        try {
            const citas = await apiFetch("/my-appointments", { token: store.token });
            dispatch({ type: "set_citas", payload: citas });
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        cargarCitas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cerrarSesion = () => {
        dispatch({ type: "logout" });
        navigate("/");
    };

    const guardarPerfil = async (e) => {
        e.preventDefault();
        setMensaje("");
        setError("");
        setGuardando(true);
        try {
            const user = await apiFetch("/me", { method: "PUT", token: store.token, body: { name, email, phone } });
            dispatch({ type: "set_usuario", payload: { user, token: store.token } });
            setMensaje("Datos actualizados correctamente.");
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    const cancelarCita = async (id) => {
        try {
            await apiFetch(`/appointment/${id}/cancel`, { method: "PATCH", token: store.token });
            cargarCitas();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container mt-5 pt-5 text-dark" style={{ minHeight: "85vh" }}>
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-danger pb-3">
                <h1 className="fw-bold m-0 text-uppercase">MI <span className="text-danger">CUENTA</span></h1>
                <button className="btn btn-outline-dark btn-sm fw-bold" onClick={cerrarSesion}>
                    <i className="fa-solid fa-power-off me-2"></i>CERRAR SESIÓN
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {mensaje && <div className="alert alert-success">{mensaje}</div>}

            <div className="row g-4">
                <div className="col-lg-5">
                    <div className="card border-0 shadow-lg rounded-0">
                        <div className="card-header bg-dark text-white py-3">
                            <h5 className="mb-0 fw-bold"><i className="fa-solid fa-user me-2 text-danger"></i>MIS DATOS</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={guardarPerfil}>
                                <div className="mb-3">
                                    <label className="small fw-bold text-muted">NOMBRE Y APELLIDOS</label>
                                    <input type="text" className="form-control bg-light border-0 py-2"
                                        value={name} onChange={(e) => setName(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label className="small fw-bold text-muted">EMAIL</label>
                                    <input type="email" className="form-control bg-light border-0 py-2"
                                        value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label className="small fw-bold text-muted">TELÉFONO</label>
                                    <input type="tel" className="form-control bg-light border-0 py-2"
                                        value={phone} onChange={(e) => setPhone(e.target.value)} required />
                                </div>
                                <button type="submit" className="btn btn-danger w-100 fw-bold rounded-0" disabled={guardando}>
                                    {guardando ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-lg-7">
                    <div className="card border-0 shadow-lg rounded-0 overflow-hidden">
                        <div className="card-header bg-dark text-white py-3">
                            <h5 className="mb-0 fw-bold"><i className="fa-solid fa-calendar-check me-2 text-danger"></i>MIS CITAS</h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light text-uppercase small fw-bold">
                                        <tr>
                                            <th className="ps-3 py-3">Fecha</th>
                                            <th>Importe</th>
                                            <th>Estado</th>
                                            <th className="text-end pe-3">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {store.citas.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="text-center py-5 text-muted">
                                                    Todavía no has solicitado ningún servicio.
                                                </td>
                                            </tr>
                                        ) : (
                                            store.citas.map((cita) => (
                                                <tr key={cita.id}>
                                                    <td className="ps-3">
                                                        <div className="fw-bold">{cita.date} {cita.time}</div>
                                                    </td>
                                                    <td className="fw-bold text-danger">{cita.total}€</td>
                                                    <td>
                                                        <span className={`badge px-3 rounded-pill small ${
                                                            cita.status === "Pendiente" ? "bg-warning text-dark" :
                                                            cita.status === "Cancelada" ? "bg-secondary" : "bg-success"
                                                        }`}>{cita.status}</span>
                                                    </td>
                                                    <td className="text-end pe-3">
                                                        {cita.status === "Pendiente" && (
                                                            <button className="btn btn-sm btn-outline-danger border-0"
                                                                onClick={() => cancelarCita(cita.id)}>
                                                                <i className="fa-solid fa-xmark me-1"></i>CANCELAR
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
            </div>
        </div>
    );
};

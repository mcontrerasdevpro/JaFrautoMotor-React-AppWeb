import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../api";
import { TALLER } from "../config";
import { SelectorHueco } from "../components/reserva/SelectorHueco";
import { textoFecha } from "../utils/fechas";
import { Icono } from "../components/Icono";

const ACTIVAS = ["Pendiente", "Confirmada"];

// Página del enlace privado de la cita: consultar, cambiar de día o cancelar sin cuenta
export const GestionCita = () => {
    const { token } = useParams();
    const [cita, setCita] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [aviso, setAviso] = useState("");
    const [modo, setModo] = useState(null); // null | "cambiar" | "cancelar"
    const [hueco, setHueco] = useState(null);
    const [recargar, setRecargar] = useState(0);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        apiFetch(`/appointment/manage/${encodeURIComponent(token)}`)
            .then(setCita)
            .catch((err) => setError(err.message))
            .finally(() => setCargando(false));
    }, [token]);

    const ejecutar = async (accion, body) => {
        setEnviando(true);
        setError("");
        try {
            const actualizada = await apiFetch(`/appointment/manage/${encodeURIComponent(token)}/${accion}`, { method: "POST", body });
            setCita(actualizada);
            setModo(null);
            setHueco(null);
            setAviso(accion === "cancel" ? "Tu cita se ha cancelado. Gracias por avisarnos." : "Cita cambiada. El taller la confirmará de nuevo.");
            window.scrollTo(0, 0);
        } catch (err) {
            setError(err.message);
            if (err.code === "slot_unavailable") setRecargar((n) => n + 1);
        } finally {
            setEnviando(false);
        }
    };

    if (cargando) {
        return <div className="container py-5 text-center text-muted"><div className="spinner-border text-danger" role="status"></div></div>;
    }

    if (!cita) {
        return (
            <div className="container py-5 text-dark text-center" style={{ maxWidth: "640px" }}>
                <Icono nombre="link-slash" className="fa-3x text-danger mb-3" />
                <h1 className="h3 fw-bold">No encontramos esta cita</h1>
                <p className="text-secondary">{error || "Revisa el enlace del email."} Si lo prefieres, llámanos al{" "}
                    <a href={TALLER.telefono.href} className="fw-bold text-danger">{TALLER.telefono.texto}</a>.</p>
                <Link to="/reservar" className="btn btn-danger rounded-0 fw-bold">PEDIR UNA CITA NUEVA</Link>
            </div>
        );
    }

    const activa = ACTIVAS.includes(cita.status);
    const colorEstado = { Pendiente: "bg-warning text-dark", Confirmada: "bg-primary", Completada: "bg-success", Cancelada: "bg-secondary" }[cita.status];

    return (
        <div className="container py-4 py-lg-5 text-dark" style={{ maxWidth: "860px" }}>
            <h1 className="fw-bold text-uppercase mb-4">Tu <span className="text-danger">cita</span></h1>

            {aviso && <div className="alert alert-success" role="status">{aviso}</div>}
            {error && <div className="alert alert-danger" role="alert">{error}</div>}

            <div className="card border-0 shadow-lg rounded-0 border-top border-5 border-danger p-4 mb-4">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                    <div>
                        <p className="h4 fw-bold mb-1">{textoFecha(cita.date)} · {cita.time}</p>
                        <p className="mb-1">{cita.services.join(", ")}</p>
                        <p className="text-secondary small mb-0">{cita.vehicle} · {cita.plate} · a nombre de {cita.client}</p>
                    </div>
                    <span className={`badge rounded-pill px-3 py-2 ${colorEstado}`}>{cita.status}</span>
                </div>
                {activa && !modo && (
                    <div className="d-flex flex-column flex-sm-row gap-2 mt-4">
                        <button type="button" className="btn btn-outline-dark rounded-0 fw-bold" onClick={() => setModo("cambiar")}>
                            <Icono nombre="calendar-days" className="me-2" />CAMBIAR DÍA U HORA
                        </button>
                        <button type="button" className="btn btn-outline-danger rounded-0 fw-bold" onClick={() => setModo("cancelar")}>
                            <Icono nombre="xmark" className="me-2" />CANCELAR CITA
                        </button>
                    </div>
                )}
            </div>

            {modo === "cancelar" && (
                <div className="card border-0 shadow rounded-0 p-4">
                    <p className="fw-bold mb-3">¿Seguro que quieres cancelar la cita?</p>
                    <div className="d-flex gap-2">
                        <button type="button" className="btn btn-danger rounded-0 fw-bold" disabled={enviando} onClick={() => ejecutar("cancel")}>
                            {enviando ? "Cancelando..." : "SÍ, CANCELAR"}
                        </button>
                        <button type="button" className="btn btn-outline-dark rounded-0" onClick={() => setModo(null)}>NO, VOLVER</button>
                    </div>
                </div>
            )}

            {modo === "cambiar" && (
                <div className="card border-0 shadow rounded-0 p-4">
                    <SelectorHueco valor={hueco} onChange={setHueco} recargar={recargar} />
                    <div className="d-flex flex-column flex-sm-row gap-2 mt-3">
                        <button type="button" className="btn btn-danger rounded-0 fw-bold" disabled={!hueco || enviando}
                            onClick={() => ejecutar("reschedule", hueco)}>
                            {enviando ? "Guardando..." : "GUARDAR CAMBIO"}
                        </button>
                        <button type="button" className="btn btn-outline-dark rounded-0" onClick={() => setModo(null)}>VOLVER</button>
                    </div>
                </div>
            )}

            <p className="small text-muted mt-4">
                ¿Dudas? Llámanos al <a href={TALLER.telefono.href} className="text-danger fw-bold">{TALLER.telefono.texto}</a> o{" "}
                <a href={TALLER.whatsapp} target="_blank" rel="noopener noreferrer" className="text-success fw-bold">escríbenos por WhatsApp</a>.
            </p>
        </div>
    );
};

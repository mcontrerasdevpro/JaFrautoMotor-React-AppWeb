import { useState } from "react";
import { apiFetch } from "../api";
import { CasillaPrivacidad } from "./CasillaPrivacidad";
import { Icono } from "./Icono";

const FORMULARIO_VACIO = { name: "", phone: "", email: "", message: "" };

export const FormularioContacto = () => {
    const [form, setForm] = useState(FORMULARIO_VACIO);
    const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [enviado, setEnviado] = useState(false);
    const [error, setError] = useState("");

    const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

    const enviar = async (e) => {
        e.preventDefault();
        setError("");
        setEnviando(true);
        try {
            await apiFetch("/leads", {
                method: "POST",
                body: { ...form, kind: "contacto", acepta_privacidad: aceptaPrivacidad }
            });
            setEnviado(true);
            setForm(FORMULARIO_VACIO);
            setAceptaPrivacidad(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setEnviando(false);
        }
    };

    if (enviado) {
        return (
            <div className="text-center py-4" role="status">
                <Icono nombre="circle-check" className="fa-3x text-success mb-3" />
                <h3 className="h5 fw-bold">¡Mensaje enviado!</h3>
                <p className="text-secondary mb-3">Te responderemos lo antes posible en horario de taller.</p>
                <button type="button" className="btn btn-outline-danger rounded-0 fw-bold" onClick={() => setEnviado(false)}>
                    ENVIAR OTRO MENSAJE
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={enviar}>
            <div className="row g-3">
                <div className="col-md-6">
                    <label htmlFor="contacto-nombre" className="small fw-bold text-muted">NOMBRE</label>
                    <input id="contacto-nombre" type="text" className="form-control bg-light border-0 py-2" autoComplete="name"
                        maxLength={100} value={form.name} onChange={cambiar("name")} required />
                </div>
                <div className="col-md-6">
                    <label htmlFor="contacto-telefono" className="small fw-bold text-muted">TELÉFONO</label>
                    <input id="contacto-telefono" type="tel" className="form-control bg-light border-0 py-2" autoComplete="tel"
                        placeholder="600 000 000" value={form.phone} onChange={cambiar("phone")} required />
                </div>
                <div className="col-12">
                    <label htmlFor="contacto-email" className="small fw-bold text-muted">EMAIL (OPCIONAL)</label>
                    <input id="contacto-email" type="email" className="form-control bg-light border-0 py-2" autoComplete="email"
                        maxLength={120} value={form.email} onChange={cambiar("email")} />
                </div>
                <div className="col-12">
                    <label htmlFor="contacto-mensaje" className="small fw-bold text-muted">MENSAJE</label>
                    <textarea id="contacto-mensaje" className="form-control bg-light border-0 py-2" rows="4"
                        minLength={5} maxLength={2000} value={form.message} onChange={cambiar("message")} required></textarea>
                </div>
            </div>

            <CasillaPrivacidad id="contacto-privacidad" checked={aceptaPrivacidad} onChange={setAceptaPrivacidad} />

            {error && <div className="alert alert-danger small mt-3 mb-0" role="alert">{error}</div>}

            <button type="submit" className="btn btn-danger w-100 fw-bold py-3 mt-3 rounded-0 shadow text-uppercase" disabled={enviando}>
                {enviando ? "Enviando..." : "Enviar mensaje"}
            </button>
        </form>
    );
};

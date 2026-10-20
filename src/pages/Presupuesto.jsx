import { useState } from "react";
import { apiFetch } from "../api";
import { TALLER } from "../config";
import { CasillaPrivacidad } from "../components/CasillaPrivacidad";

const FORMULARIO_VACIO = { vehicle: "", plate: "", message: "", name: "", phone: "", email: "" };

export const Presupuesto = () => {
    const [form, setForm] = useState(FORMULARIO_VACIO);
    const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
    const [enviado, setEnviado] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");

    const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setEnviando(true);
        try {
            await apiFetch("/leads", {
                method: "POST",
                body: { ...form, kind: "presupuesto", acepta_privacidad: aceptaPrivacidad }
            });
            setEnviado(true);
            window.scrollTo(0, 0);
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
            <div className="container mt-5 pt-5 text-center text-dark" style={{ minHeight: "70vh" }}>
                <div className="card border-0 shadow-lg p-5 bg-white">
                    <i className="fa-solid fa-paper-plane fa-4x text-danger mb-4"></i>
                    <h2 className="fw-bold">¡SOLICITUD ENVIADA!</h2>
                    <p className="lead text-secondary">Hemos recibido los datos de tu vehículo. Francisco o Jacinto te contactarán pronto con una valoración.</p>
                    <p className="text-secondary">Si es urgente, llámanos al <a href={TALLER.telefono.href} className="fw-bold text-danger">{TALLER.telefono.texto}</a>.</p>
                    <button className="btn btn-danger mt-3 px-5 rounded-0 fw-bold mx-auto" onClick={() => setEnviado(false)}>VOLVER</button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5 pt-4 text-dark">
            <div className="row g-5">
                {/* Columna de Texto Informativo */}
                <div className="col-lg-5">
                    <h1 className="fw-bold display-4 text-uppercase">Solicita tu <span className="text-danger">Presupuesto</span></h1>
                    <p className="text-secondary mt-3">Describe el problema de tu vehículo y adjunta los datos necesarios. Te daremos una estimación profesional sin compromiso.</p>

                    <div className="mt-5">
                        <div className="d-flex align-items-center mb-4">
                            <div className="bg-danger text-white p-3 rounded-circle me-3">
                                <i className="fa-solid fa-file-invoice-dollar"></i>
                            </div>
                            <div>
                                <h6 className="fw-bold mb-0">Sin compromiso</h6>
                                <p className="small text-muted mb-0">Te explicamos qué necesita el coche antes de tocar nada.</p>
                            </div>
                        </div>
                        <div className="d-flex align-items-center mb-4">
                            <div className="bg-dark text-white p-3 rounded-circle me-3">
                                <i className="fa-solid fa-bolt"></i>
                            </div>
                            <div>
                                <h6 className="fw-bold mb-0">Respuesta Rápida</h6>
                                <p className="small text-muted mb-0">Recibe tu valoración en menos de 24h laborales.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna del Formulario Técnico */}
                <div className="col-lg-7">
                    <div className="card border-0 shadow-lg p-4 bg-white border-top border-5 border-danger">
                        <form onSubmit={handleSubmit}>
                            <h2 className="h5 fw-bold mb-4 text-uppercase border-bottom pb-2">Información del Vehículo</h2>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="pres-vehiculo" className="small fw-bold text-muted">MARCA Y MODELO</label>
                                    <input id="pres-vehiculo" type="text" className="form-control bg-light border-0 py-2" placeholder="Ej: Peugeot 308"
                                        maxLength={100} value={form.vehicle} onChange={cambiar("vehicle")} required />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="pres-matricula" className="small fw-bold text-muted">MATRÍCULA (OPCIONAL)</label>
                                    <input id="pres-matricula" type="text" className="form-control bg-light border-0 py-2 text-uppercase" placeholder="1234-ABC"
                                        maxLength={12} value={form.plate} onChange={cambiar("plate")} />
                                </div>
                            </div>

                            <h2 className="h5 fw-bold mb-4 text-uppercase border-bottom pb-2 mt-4">Detalles de la Avería</h2>
                            <div className="mb-4">
                                <label htmlFor="pres-mensaje" className="small fw-bold text-muted">DESCRIPCIÓN DEL PROBLEMA</label>
                                <textarea id="pres-mensaje" className="form-control bg-light border-0 py-2" rows="4" placeholder="¿Qué le ocurre al coche? Ruido, golpe, revisión oficial..."
                                    minLength={5} maxLength={2000} value={form.message} onChange={cambiar("message")} required></textarea>
                            </div>

                            <h2 className="h5 fw-bold mb-4 text-uppercase border-bottom pb-2 mt-4">Datos Personales</h2>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="pres-nombre" className="small fw-bold text-muted">TU NOMBRE</label>
                                    <input id="pres-nombre" type="text" className="form-control bg-light border-0 py-2" autoComplete="name"
                                        maxLength={100} value={form.name} onChange={cambiar("name")} required />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="pres-telefono" className="small fw-bold text-muted">TELÉFONO</label>
                                    <input id="pres-telefono" type="tel" className="form-control bg-light border-0 py-2" autoComplete="tel" placeholder="600 000 000"
                                        value={form.phone} onChange={cambiar("phone")} required />
                                </div>
                                <div className="col-12 mb-1">
                                    <label htmlFor="pres-email" className="small fw-bold text-muted">EMAIL (OPCIONAL)</label>
                                    <input id="pres-email" type="email" className="form-control bg-light border-0 py-2" autoComplete="email"
                                        maxLength={120} value={form.email} onChange={cambiar("email")} />
                                </div>
                            </div>

                            <CasillaPrivacidad id="pres-privacidad" checked={aceptaPrivacidad} onChange={setAceptaPrivacidad} />

                            {error && <div className="alert alert-danger small mt-3 mb-0" role="alert">{error}</div>}

                            <button type="submit" className="btn btn-danger w-100 fw-bold py-3 mt-4 rounded-0 shadow text-uppercase" disabled={enviando}>
                                {enviando ? "Enviando..." : "Enviar Solicitud de Presupuesto"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

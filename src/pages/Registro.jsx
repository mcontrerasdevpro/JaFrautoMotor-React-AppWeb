import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { apiFetch } from "../api";
import { CasillaPrivacidad } from "../components/CasillaPrivacidad";

export const Registro = () => {
    const { dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    const manejarSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setCargando(true);
        try {
            const data = await apiFetch("/register", {
                method: "POST",
                body: { name, email, phone, password, acepta_privacidad: aceptaPrivacidad }
            });
            dispatch({ type: "set_usuario", payload: data });
            navigate("/urgente");
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="container-fluid d-flex align-items-center justify-content-center bg-dark text-white py-5 px-3" style={{ minHeight: "75vh" }}>
            <div className="card bg-black border-danger p-4 shadow-lg text-white" style={{ width: "100%", maxWidth: "380px" }}>
                <div className="text-center mb-4">
                    <h1 className="h2 fw-bold">CREAR <span className="text-danger">CUENTA</span></h1>
                    <p className="small text-secondary">Regístrate para solicitar servicios del taller</p>
                </div>

                <form onSubmit={manejarSubmit}>
                    <div className="mb-3">
                        <label htmlFor="reg-nombre" className="form-label small text-uppercase">Nombre y apellidos</label>
                        <input id="reg-nombre" type="text" className="form-control bg-dark text-white border-secondary" autoComplete="name"
                            maxLength={100} value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="reg-email" className="form-label small text-uppercase">Email</label>
                        <input id="reg-email" type="email" className="form-control bg-dark text-white border-secondary" autoComplete="email"
                            maxLength={120} value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="reg-telefono" className="form-label small text-uppercase">Teléfono</label>
                        <input id="reg-telefono" type="tel" className="form-control bg-dark text-white border-secondary" autoComplete="tel"
                            placeholder="600 000 000" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="reg-password" className="form-label small text-uppercase">Contraseña</label>
                        <input id="reg-password" type="password" className="form-control bg-dark text-white border-secondary" autoComplete="new-password"
                            aria-describedby="reg-password-ayuda" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} maxLength={128} required />
                        <div id="reg-password-ayuda" className="form-text text-secondary">Mínimo 8 caracteres.</div>
                    </div>

                    <CasillaPrivacidad id="reg-privacidad" checked={aceptaPrivacidad} onChange={setAceptaPrivacidad} oscuro />

                    {error && <div className="text-danger small mt-3" role="alert">{error}</div>}

                    <button type="submit" className="btn btn-danger w-100 fw-bold py-2 mt-3" disabled={cargando}>
                        {cargando ? "CREANDO CUENTA..." : "REGISTRARME"}
                    </button>
                    <p className="text-center text-secondary small mt-3 mb-0">
                        ¿Ya tienes cuenta? <Link to="/login" className="text-danger">Inicia sesión</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { apiFetch } from "../api";

export const Registro = () => {
    const { dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    const manejarSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setCargando(true);
        try {
            const data = await apiFetch("/register", { method: "POST", body: { name, email, phone, password } });
            dispatch({ type: "set_usuario", payload: data });
            navigate("/urgente");
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-dark text-white" style={{ marginTop: "-100px" }}>
            <div className="card bg-black border-danger p-4 shadow-lg" style={{ width: "380px" }}>
                <div className="text-center mb-4">
                    <h2 className="fw-bold">CREAR <span className="text-danger">CUENTA</span></h2>
                    <p className="small text-secondary">Regístrate para solicitar servicios del taller</p>
                </div>

                <form onSubmit={manejarSubmit}>
                    <div className="mb-3">
                        <label className="form-label small text-uppercase">Nombre y apellidos</label>
                        <input type="text" className="form-control bg-dark text-white border-secondary"
                            value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small text-uppercase">Email</label>
                        <input type="email" className="form-control bg-dark text-white border-secondary"
                            value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small text-uppercase">Teléfono</label>
                        <input type="tel" className="form-control bg-dark text-white border-secondary"
                            value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small text-uppercase">Contraseña</label>
                        <input type="password" className={`form-control bg-dark text-white border-${error ? "danger" : "secondary"}`}
                            value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
                        {error && <div className="text-danger small mt-2">{error}</div>}
                    </div>
                    <button type="submit" className="btn btn-danger w-100 fw-bold py-2" disabled={cargando}>
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

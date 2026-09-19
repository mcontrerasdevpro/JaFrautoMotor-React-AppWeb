import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { apiFetch } from "../api";

export const Login = () => {
    const { dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    const manejarSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setCargando(true);
        try {
            const data = await apiFetch("/login", { method: "POST", body: { email, password } });
            dispatch({ type: "set_usuario", payload: data });
            navigate(location.state?.from || "/urgente");
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-dark text-white" style={{ marginTop: "-100px" }}>
            <div className="card bg-black border-danger p-4 shadow-lg" style={{ width: "350px" }}>
                <div className="text-center mb-4">
                    <h2 className="fw-bold">INICIAR <span className="text-danger">SESIÓN</span></h2>
                    <p className="small text-secondary">Accede a tu cuenta para solicitar servicios</p>
                </div>

                <form onSubmit={manejarSubmit}>
                    <div className="mb-3">
                        <label className="form-label small text-uppercase">Email</label>
                        <input type="email" className="form-control bg-dark text-white border-secondary"
                            value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small text-uppercase">Contraseña</label>
                        <input type="password" className={`form-control bg-dark text-white border-${error ? "danger" : "secondary"}`}
                            value={password} onChange={(e) => setPassword(e.target.value)} required />
                        {error && <div className="text-danger small mt-2">{error}</div>}
                    </div>
                    <button type="submit" className="btn btn-danger w-100 fw-bold py-2" disabled={cargando}>
                        {cargando ? "ENTRANDO..." : "ENTRAR"}
                    </button>
                    <p className="text-center text-secondary small mt-3 mb-0">
                        ¿No tienes cuenta? <Link to="/registro" className="text-danger">Regístrate</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

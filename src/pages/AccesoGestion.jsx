import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { apiFetch } from "../api";

export const AccesoGestion = () => {
    const { dispatch } = useGlobalReducer();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    const verificar = async (e) => {
        e.preventDefault();
        setError(false);
        setCargando(true);
        try {
            const data = await apiFetch("/login", { method: "POST", body: { email, password } });
            if (!data.user.is_admin) {
                setError(true);
                setMensaje("Esta cuenta no tiene permisos de administrador");
                return;
            }
            dispatch({ type: "set_usuario", payload: data });
            navigate("/panel-interno");
        } catch (err) {
            setError(true);
            setMensaje(err.message || "Código incorrecto");
            setPassword("");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-dark text-white" style={{ marginTop: "-100px" }}>
            <div className="card bg-black border-danger p-4 shadow-lg" style={{ width: "350px" }}>
                <div className="text-center mb-4">
                    <h2 className="fw-bold">JAFRAUTO <span className="text-danger">ADMIN</span></h2>
                    <p className="small text-secondary">Acceso Restringido - Personal Autorizado</p>
                </div>

                <form onSubmit={verificar}>
                    <div className="mb-3">
                        <label className="form-label small text-uppercase">Email</label>
                        <input
                            type="email"
                            className={`form-control bg-dark text-white border-${error ? 'danger' : 'secondary'}`}
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError(false); }}
                            autoFocus
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small text-uppercase">Contraseña</label>
                        <input
                            type="password"
                            className={`form-control bg-dark text-white border-${error ? 'danger' : 'secondary'} text-center fs-4`}
                            style={{ letterSpacing: "5px" }}
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(false); }}
                            required
                        />
                        {error && <div className="text-danger small mt-2 text-center">{mensaje}</div>}
                    </div>
                    <button type="submit" className="btn btn-danger w-100 fw-bold py-2" disabled={cargando}>
                        {cargando ? "ENTRANDO..." : "ENTRAR AL SISTEMA"}
                    </button>
                    <button type="button" onClick={() => navigate("/")} className="btn btn-link btn-sm w-100 text-secondary mt-3">Cancelar</button>
                </form>
            </div>
        </div>
    );
};

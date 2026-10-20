import { Navigate, Outlet, useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const ProtectedRoute = () => {
    const { store, restaurado } = useGlobalReducer();
    const location = useLocation();

    // Hasta cargar la sesión guardada no sabemos si hay usuario: no redirigir todavía
    if (!restaurado) return null;

    if (!store.token) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return <Outlet />;
};

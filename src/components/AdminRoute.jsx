import { Navigate, Outlet } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const AdminRoute = () => {
    const { store, restaurado } = useGlobalReducer();

    // Hasta cargar la sesión guardada no sabemos si hay usuario: no redirigir todavía
    if (!restaurado) return null;

    if (!store.usuario?.is_admin) {
        return <Navigate to="/gestion" replace />;
    }

    return <Outlet />;
};

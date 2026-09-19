import { Navigate, Outlet } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const AdminRoute = () => {
    const { store } = useGlobalReducer();

    if (!store.usuario?.is_admin) {
        return <Navigate to="/gestion" replace />;
    }

    return <Outlet />;
};

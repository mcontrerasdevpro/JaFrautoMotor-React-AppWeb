import { useContext, useReducer, createContext, useEffect } from "react";
import PropTypes from "prop-types";
import storeReducer, { initialStore } from "../store";
import { EVENTO_SESION_CADUCADA } from "../api";

const StoreContext = createContext();

export function StoreProvider({ children }) {
    // Arrancamos con lo que haya guardado en localStorage (si existe)
    const [store, dispatch] = useReducer(storeReducer, initialStore());

    // Cada vez que cambia el store lo guardamos en el navegador
    useEffect(() => {
        localStorage.setItem("taller_app_data", JSON.stringify(store));
    }, [store]);

    // Si la API dice que el token ya no vale, cerramos la sesión en el navegador
    useEffect(() => {
        const cerrarSesion = () => dispatch({ type: "sesion_caducada" });
        window.addEventListener(EVENTO_SESION_CADUCADA, cerrarSesion);
        return () => window.removeEventListener(EVENTO_SESION_CADUCADA, cerrarSesion);
    }, []);

    return (
        <StoreContext.Provider value={{ store, dispatch }}>
            {children}
        </StoreContext.Provider>
    );
}

StoreProvider.propTypes = {
    children: PropTypes.node
};

// eslint-disable-next-line react-refresh/only-export-components
export default function useGlobalReducer() {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error("useGlobalReducer debe usarse dentro de un StoreProvider");
    }
    return context;
}

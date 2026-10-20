import { useContext, useReducer, createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import storeReducer, { estadoInicial, guardar, leerGuardado } from "../store";
import { EVENTO_SESION_CADUCADA } from "../api";

const StoreContext = createContext();

// En una página prerenderizada el HTML se generó sin datos del navegador: hay que
// hidratar con el estado inicial y cargar lo guardado justo después. En el resto
// (rutas privadas, que se renderizan solo en el cliente) se lee al momento.
const esHidratacion = () =>
    typeof document === "undefined" || document.querySelector("[data-server-rendered=true]") !== null;

export function StoreProvider({ children }) {
    const [hidratando] = useState(esHidratacion);
    const [store, dispatch] = useReducer(storeReducer, undefined, () => (hidratando ? estadoInicial : leerGuardado()));
    const [restaurado, setRestaurado] = useState(!hidratando);

    useEffect(() => {
        if (hidratando) {
            dispatch({ type: "restaurar", payload: leerGuardado() });
            setRestaurado(true);
        }
    }, [hidratando]);

    // Cada vez que cambia el store lo guardamos (nunca antes de haber cargado lo anterior)
    useEffect(() => {
        if (restaurado) guardar(store);
    }, [store, restaurado]);

    // Si la API dice que el token ya no vale, cerramos la sesión en el navegador
    useEffect(() => {
        const cerrarSesion = () => dispatch({ type: "sesion_caducada" });
        window.addEventListener(EVENTO_SESION_CADUCADA, cerrarSesion);
        return () => window.removeEventListener(EVENTO_SESION_CADUCADA, cerrarSesion);
    }, []);

    return (
        <StoreContext.Provider value={{ store, dispatch, restaurado }}>
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

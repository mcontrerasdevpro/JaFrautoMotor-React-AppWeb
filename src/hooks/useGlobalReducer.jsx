// Import necessary hooks and functions from React.
import { useContext, useReducer, createContext, useEffect } from "react";
import storeReducer, { initialStore } from "../store";

const StoreContext = createContext();

export function StoreProvider({ children }) {
    // 1. Inicializamos con lo que haya en localStorage (si existe) gracias a tu función initialStore()
    const [store, dispatch] = useReducer(storeReducer, initialStore());

    // 2. MAGIA: Cada vez que el store cambie (añadas un favorito o cargues personajes), 
    // lo guardamos automáticamente en el navegador.
    useEffect(() => {
        localStorage.setItem("taller_app_data", JSON.stringify(store));
    }, [store]);

    return (
        <StoreContext.Provider value={{ store, dispatch }}>
            {children}
        </StoreContext.Provider>
    );
}

export default function useGlobalReducer() {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error("useGlobalReducer debe usarse dentro de un StoreProvider");
    }
    return context;
}
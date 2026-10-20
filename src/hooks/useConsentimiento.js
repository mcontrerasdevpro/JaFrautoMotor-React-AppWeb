import { useEffect, useState } from "react";

// Consentimiento de cookies de terceros (hoy solo Google Maps).
// Valores: "aceptadas" | "rechazadas" | null (todavía no ha elegido)
// | undefined (aún no se ha leído: durante el prerender y la hidratación)
const CLAVE = "jafrauto_consentimiento_cookies";
const EVENTO = "jafrauto:consentimiento";

const leer = () => {
    try {
        const valor = localStorage.getItem(CLAVE);
        return valor === "aceptadas" || valor === "rechazadas" ? valor : null;
    } catch {
        return null;
    }
};

export const guardarConsentimiento = (valor) => {
    try {
        if (valor) localStorage.setItem(CLAVE, valor);
        else localStorage.removeItem(CLAVE);
    } catch {
        // Sin localStorage (modo privado estricto): el banner volverá a salir
    }
    window.dispatchEvent(new Event(EVENTO));
};

// Vuelve a mostrar el banner para cambiar la elección
export const abrirPreferenciasCookies = () => guardarConsentimiento(null);

export default function useConsentimiento() {
    // Se lee después de montar para que el HTML prerenderizado y el cliente coincidan
    const [consentimiento, setConsentimiento] = useState(undefined);

    useEffect(() => {
        const actualizar = () => setConsentimiento(leer());
        actualizar();
        window.addEventListener(EVENTO, actualizar);
        return () => window.removeEventListener(EVENTO, actualizar);
    }, []);

    return consentimiento;
}

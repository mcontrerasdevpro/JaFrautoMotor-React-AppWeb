export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";

// Se lanza cuando la API rechaza el token (caducado o no válido) para cerrar la sesión
export const EVENTO_SESION_CADUCADA = "jafrauto:sesion-caducada";

export async function apiFetch(path, { method = "GET", body, token } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    let resp;
    try {
        resp = await fetch(`${API_URL}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });
    } catch {
        throw new Error("No se ha podido conectar con el servidor. Inténtalo de nuevo o llámanos.");
    }

    const data = await resp.json().catch(() => null);

    if (!resp.ok) {
        if (resp.status === 401 && token) {
            window.dispatchEvent(new Event(EVENTO_SESION_CADUCADA));
        }
        const error = new Error(data?.msg || "Error en la petición al servidor");
        error.status = resp.status;
        error.code = data?.code;
        throw error;
    }

    return data;
}

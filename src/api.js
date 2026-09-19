export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";

export async function apiFetch(path, { method = "GET", body, token } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const resp = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });

    const data = await resp.json().catch(() => null);

    if (!resp.ok) {
        throw new Error(data?.msg || "Error en la petición al servidor");
    }

    return data;
}

// Fechas ISO (AAAA-MM-DD) mostradas en español. Se fija el mediodía para que
// el cambio de zona horaria nunca mueva el día.
const aFecha = (iso) => new Date(`${iso}T12:00:00`);

export const textoFecha = (iso) => {
    const texto = aFecha(iso).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
};

export const partesFecha = (iso) => {
    const fecha = aFecha(iso);
    return {
        semana: fecha.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", ""),
        numero: fecha.getDate(),
        mes: fecha.toLocaleDateString("es-ES", { month: "short" }).replace(".", "")
    };
};

export const diaSiguiente = (iso) => {
    const fecha = aFecha(iso);
    fecha.setDate(fecha.getDate() + 1);
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
};

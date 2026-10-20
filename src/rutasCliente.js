// Rutas que solo tienen sentido en el navegador (sesión, formularios con estado,
// enlaces privados): no se prerenderizan y el servidor las sirve con un shell vacío
// (app-shell.html). Lo usan vite.config.js y scripts/despues-del-build.mjs.
export const RUTAS_SOLO_CLIENTE = [
    "/login",
    "/registro",
    "/gestion",
    "/reservar",
    "/urgente",
    "/mi-cuenta",
    "/panel-interno",
    "/cita"
];

export const esRutaSoloCliente = (ruta) => {
    // vite-react-ssg puede pasar las rutas sin la barra inicial
    const normal = ruta.startsWith("/") ? ruta : `/${ruta}`;
    return RUTAS_SOLO_CLIENTE.some((r) => normal === r || normal.startsWith(`${r}/`));
};

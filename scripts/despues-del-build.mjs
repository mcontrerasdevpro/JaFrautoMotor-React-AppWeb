// Se ejecuta después de `vite-react-ssg build` (ver "build" en package.json):
// - app-shell.html: HTML sin prerenderizar para las rutas que solo existen en el
//   navegador (panel, mi cuenta, reservar, enlaces de cita). El servidor las reescribe a él.
// - 404.html: página de error para Vercel / el VPS.
// - sitemap.xml y robots.txt según el entorno (VITE_INDEXAR, VITE_SITE_URL).
import { readFile, writeFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { RUTAS_SOLO_CLIENTE } from "../src/rutasCliente.js";

const DIST = "dist";
const SITIO = (process.env.VITE_SITE_URL || "https://jafrautomotor.com").replace(/\/$/, "");
const INDEXAR = process.env.VITE_INDEXAR === "true";
// Páginas prerenderizadas que no van al sitemap (llevan noindex)
const FUERA_DEL_SITEMAP = ["/404", "/avisoLegal", "/politicaPrivacidad", "/cookies"];

// --- app-shell.html ---
const portada = await readFile(join(DIST, "index.html"), "utf8");
const inicioRoot = portada.indexOf('<div id="root" data-server-rendered="true">');
const finRoot = portada.indexOf("<script>window.__VITE_REACT_SSG_HASH__");
if (inicioRoot === -1 || finRoot === -1) {
    throw new Error("No se encuentra el contenedor #root prerenderizado en dist/index.html");
}
const shell = (portada.slice(0, inicioRoot) + '<div id="root"></div>\n' + portada.slice(finRoot))
    // Quitamos las etiquetas de la portada (título, descripción, canonical, JSON-LD...)
    .replace(/<(title|script)[^>]*data-rh="true"[^>]*>[\s\S]*?<\/\1>/g, "")
    .replace(/<(meta|link)[^>]*data-rh="true"[^>]*>/g, "")
    .replace("<head>", '<head><title>JaFrauto Motor</title><meta name="robots" content="noindex, nofollow">');
await writeFile(join(DIST, "app-shell.html"), shell);

// --- 404.html ---
await writeFile(join(DIST, "404.html"), await readFile(join(DIST, "404", "index.html"), "utf8"));

// --- sitemap.xml ---
async function paginas(carpeta, ruta = "") {
    const encontradas = [];
    for (const nombre of await readdir(carpeta)) {
        const completa = join(carpeta, nombre);
        if ((await stat(completa)).isDirectory()) {
            encontradas.push(...await paginas(completa, `${ruta}/${nombre}`));
        } else if (nombre === "index.html") {
            encontradas.push(ruta || "/");
        }
    }
    return encontradas;
}
const hoy = new Date().toISOString().slice(0, 10);
const urls = (await paginas(DIST))
    .filter((ruta) => !FUERA_DEL_SITEMAP.includes(ruta))
    .sort()
    .map((ruta) => `  <url><loc>${SITIO}${ruta === "/" ? "/" : ruta}</loc><lastmod>${hoy}</lastmod></url>`);
await writeFile(
    join(DIST, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`
);

// --- robots.txt ---
const robots = INDEXAR
    ? ["User-agent: *", "Allow: /", ...RUTAS_SOLO_CLIENTE.map((r) => `Disallow: ${r}`), "", `Sitemap: ${SITIO}/sitemap.xml`, ""]
    // Demo (vercel.app): no indexar hasta migrar el dominio
    : ["User-agent: *", "Disallow: /", ""];
await writeFile(join(DIST, "robots.txt"), robots.join("\n"));

console.log(`[después del build] app-shell.html, 404.html, sitemap.xml (${urls.length} URLs), robots.txt (${INDEXAR ? "indexable" : "noindex"})`);

// Genera versiones WebP y AVIF de las fotos de fotos/ en varios anchos (public/img/).
// Uso: npm run imagenes   (solo hace falta al añadir o cambiar una foto)
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

// nombre de salida -> foto original en fotos/ (no se publica; las versiones web van a public/img/)
export const FOTOS = {
    portada: "Portada.png",
    fachada: "FachadaTaller.png",
    taller: "TallerMecanico.png",
    cambioaceite: "cambioaceite.jpg",
    sistemafrenos: "sistemafrenos.jpg",
    diagnosis: "diagnosis.png",
    neumaticos: "neumaticos.png",
    aireacondicionado: "aireacondicionado.jpg",
    preitv: "preitv.png"
};

const ANCHOS = [480, 800, 1200];

await mkdir("public/img", { recursive: true });
const manifiesto = {};

for (const [nombre, original] of Object.entries(FOTOS)) {
    const imagen = sharp(`fotos/${original}`);
    const { width } = await imagen.metadata();
    // No ampliamos: si la foto es más pequeña que el ancho, se usa su tamaño real
    const anchos = [...new Set(ANCHOS.map((a) => Math.min(a, width)))];
    for (const ancho of anchos) {
        const base = imagen.clone().resize({ width: ancho, withoutEnlargement: true });
        await base.clone().webp({ quality: 72 }).toFile(`public/img/${nombre}-${ancho}.webp`);
        await base.clone().avif({ quality: 50 }).toFile(`public/img/${nombre}-${ancho}.avif`);
    }
    manifiesto[nombre] = anchos;
    console.log(`${nombre}: ${anchos.join(", ")} px`);
}

// Anchos disponibles de cada foto, para el srcset del componente Imagen
await writeFile("src/data/imagenes.json", `${JSON.stringify(manifiesto, null, 2)}\n`);

// Imagen para compartir en redes (Open Graph): JPG de 1200 px
await sharp("fotos/Portada.png").resize({ width: 1200 }).jpeg({ quality: 78, mozjpeg: true }).toFile("public/img/portada-1200.jpg");
console.log("portada-1200.jpg para Open Graph");

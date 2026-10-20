import { SITIO, TALLER } from "../config";

// Datos estructurados del taller: van en todas las páginas
export const DATOS_TALLER = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "@id": `${SITIO.url}/#taller`,
    name: "JaFrauto Motor",
    description: "Taller mecánico en el Polígono Los Olivares de Jaén: mecánica general, diagnosis electrónica, frenos, embrague, distribución, pre-ITV y aire acondicionado. Taller de la red Eurorepar.",
    url: SITIO.url,
    image: `${SITIO.url}${SITIO.imagenSocial}`,
    telephone: "+34953121814",
    email: TALLER.email,
    address: {
        "@type": "PostalAddress",
        streetAddress: "Calle Bedmar, 118, Pol. Los Olivares",
        addressLocality: "Jaén",
        addressRegion: "Jaén",
        postalCode: "23009",
        addressCountry: "ES"
    },
    geo: { "@type": "GeoCoordinates", latitude: 37.7932261, longitude: -3.7903449 },
    openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:30", closes: "13:30" },
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "16:00", closes: "19:00" }
    ],
    areaServed: { "@type": "City", name: "Jaén" },
    sameAs: ["https://www.facebook.com/jafrauto/", "https://www.instagram.com/jafrauto/"]
};

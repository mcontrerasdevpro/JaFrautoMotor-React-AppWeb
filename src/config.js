// Datos de contacto del taller: cada número se cambia solo aquí.

const WHATSAPP_NUMERO = "34659603058";
const WHATSAPP_MENSAJE = "Hola, os escribo desde la web de JaFrauto Motor. Quería pedir cita / información sobre mi coche.";

export const TALLER = {
    nombre: "JaFrauto Motor",
    telefono: { texto: "953 121 814", href: "tel:+34953121814" },
    moviles: [
        { nombre: "Francisco", texto: "637 830 670", href: "tel:+34637830670" },
        { nombre: "Jacinto", texto: "659 603 058", href: "tel:+34659603058" }
    ],
    email: "jafrautomotor@gmail.com",
    whatsapp: `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(WHATSAPP_MENSAJE)}`,
    direccion: { calle: "Calle Bedmar, 118", zona: "Pol. Los Olivares", cp: "23009", ciudad: "Jaén" },
    comoLlegar: "https://www.google.com/maps/dir/?api=1&destination=" +
        encodeURIComponent("JaFrauto Motor, Calle Bedmar 118, 23009 Jaén"),
    mapaEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3152.864032769776!2d-3.7903449!3d37.7932261!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6dd785dd31629f%3A0xdb2725b0e85794e2!2sJafrautomotor!5e0!3m2!1ses!2ses!4v1773799069849!5m2!1ses!2ses"
};

// Horas de entrada que se ofrecen al reservar (deben coincidir con FRANJAS_CITA de validacion.py)
export const FRANJAS_CITA = {
    "Mañana": ["08:30", "10:00", "11:30", "13:00"],
    "Tarde": ["16:00", "17:30"]
};

import { TALLER } from "../config";
import { Icono } from "./Icono";

// Sellos de confianza que ya tiene el taller y acceso a sus reseñas de Google.
// No mostramos reseñas copiadas: solo el enlace a las reales.
const SELLOS = [
    { icono: "screwdriver-wrench", titulo: "Taller Eurorepar", texto: "Formamos parte de la red de talleres Eurorepar." },
    { icono: "handshake-angle", titulo: "Acuerdo con Innovación Sindical", texto: "Condiciones especiales para sus afiliados." },
    { icono: "shield-halved", titulo: "Patrocinadores del Jaén Paraíso Interior FS", texto: "Apoyamos el deporte de nuestra ciudad." }
];

export const Confianza = () => (
    <section className="bg-white py-5 border-top" aria-labelledby="confianza-titulo">
        <div className="container">
            <h2 id="confianza-titulo" className="fw-bold text-center mb-4">
                Por qué confiar en <span className="text-danger">JaFrauto Motor</span>
            </h2>
            <div className="row g-3 mb-4">
                {SELLOS.map((s) => (
                    <div className="col-md-4" key={s.titulo}>
                        <div className="d-flex align-items-start gap-3 p-3 h-100 border-start border-4 border-danger bg-light">
                            <Icono nombre={s.icono} className="fa-2x text-danger flex-shrink-0" />
                            <div>
                                <h3 className="h6 fw-bold mb-1">{s.titulo}</h3>
                                <p className="small text-secondary mb-0">{s.texto}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="text-center">
                <p className="mb-2 text-secondary">¿Quieres saber qué opinan nuestros clientes?</p>
                <a href={TALLER.resenasGoogle} target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark rounded-0 fw-bold">
                    VER RESEÑAS EN GOOGLE
                </a>
            </div>
        </div>
    </section>
);

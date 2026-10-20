import { Link } from "react-router-dom";
import { TALLER } from "../config";
import { Icono } from "./Icono";

// Barra fija en móvil con las tres acciones que más convierten en un taller
export const BarraMovil = () => (
    <nav className="barra-movil d-md-none" aria-label="Acciones rápidas">
        <a href={TALLER.telefono.href} className="barra-movil__accion">
            <Icono nombre="phone" />
            <span>Llamar</span>
        </a>
        <a href={TALLER.whatsapp} target="_blank" rel="noopener noreferrer" className="barra-movil__accion barra-movil__whatsapp">
            <Icono nombre="whatsapp" />
            <span>WhatsApp</span>
        </a>
        <Link to="/reservar" className="barra-movil__accion barra-movil__cita">
            <Icono nombre="calendar-check" />
            <span>Pedir cita</span>
        </Link>
    </nav>
);

import { Link } from "react-router-dom";
import { TALLER } from "../config";
import { Seo } from "../components/Seo";
import { Icono } from "../components/Icono";

export const NotFound = () => (
    <div className="container py-5 text-dark text-center" style={{ minHeight: "70vh" }}>
        <Seo titulo="Página no encontrada" descripcion="La página que buscas no existe." ruta="/404" noindex />
        <p className="display-1 fw-bold text-danger mb-0">404</p>
        <h1 className="fw-bold text-uppercase mb-3">Esta página no existe</h1>
        <p className="text-secondary mx-auto mb-4" style={{ maxWidth: "520px" }}>
            Puede que el enlace esté mal escrito o que la página se haya movido. Desde aquí puedes volver al inicio,
            ver nuestros servicios o llamarnos directamente.
        </p>
        <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
            <Link to="/" className="btn btn-danger fw-bold rounded-0 px-4">VOLVER AL INICIO</Link>
            <Link to="/servicios" className="btn btn-outline-dark fw-bold rounded-0 px-4">VER SERVICIOS</Link>
            <a href={TALLER.telefono.href} className="btn btn-outline-dark fw-bold rounded-0 px-4">
                <Icono nombre="phone" className="me-2" />{TALLER.telefono.texto}
            </a>
        </div>
    </div>
);

import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { TALLER } from "../config";
import { Icono } from "./Icono";

const ENLACES = [
  { to: "/", texto: "INICIO", end: true },
  { to: "/taller", texto: "TALLER" },
  { to: "/servicios", texto: "SERVICIOS" },
  { to: "/promociones", texto: "PROMOCIONES" },
  { to: "/presupuesto", texto: "PRESUPUESTO" },
  { to: "/contacto", texto: "CONTACTO" }
];

export const Navbar = () => {
  const { store } = useGlobalReducer();
  const { pathname } = useLocation();
  // El menú móvil lo controla React (no el JS de Bootstrap) para poder cerrarlo al navegar
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    setAbierto(false);
  }, [pathname]);

  const totalServicios = store.urgente.length;

  return (
    <nav className="navbar navbar-expand-xl navbar-racing px-3 px-xl-4 py-2" data-bs-theme="dark"
      aria-label="Navegación principal">
      <div className="container-fluid px-0">

        {/* LOGO: enlaza a /gestion a propósito (acceso interno del taller) */}
        <NavLink to="/gestion" className="navbar-brand m-0 p-0 me-xl-4 logo-jafrauto">
          JAFRAUTO<span>MOTOR</span>
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          aria-controls="navbarContent"
          aria-expanded={abierto}
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setAbierto(!abierto)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${abierto ? "show" : ""}`} id="navbarContent">

          <ul className="navbar-nav me-auto mt-2 mt-xl-0 gap-xl-1">
            {ENLACES.map(({ to, texto, end }) => (
              <li className="nav-item" key={to}>
                <NavLink to={to} end={end} className={({ isActive }) =>
                  `nav-link text-nowrap px-xl-2 ${isActive ? "active" : ""}`}>
                  {texto}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="d-flex flex-column flex-xl-row align-items-stretch align-items-xl-center gap-2 gap-xl-3 my-2 my-xl-0">
            <a href={TALLER.telefono.href} className="navbar-racing__telefono d-none d-xl-inline">
              <Icono nombre="phone" className="me-2" />{TALLER.telefono.texto}
            </a>
            <NavLink
              to="/reservar"
              className={({ isActive }) =>
                `btn btn-racing btn-racing--sm position-relative text-nowrap ${isActive ? "active" : ""}`
              }
            >
              Pedir cita
              {totalServicios > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-light text-dark">
                  {totalServicios}
                  <span className="visually-hidden"> servicios elegidos</span>
                </span>
              )}
            </NavLink>

            {store.usuario ? (
              <NavLink to="/mi-cuenta" className="nav-link text-nowrap">
                <Icono nombre="user" className="me-1 small" /> {store.usuario.name?.split(" ")[0]?.toUpperCase()}
              </NavLink>
            ) : (
              <NavLink to="/login" className="nav-link text-nowrap">
                <Icono nombre="user" className="me-1 small" /> ACCEDER
              </NavLink>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

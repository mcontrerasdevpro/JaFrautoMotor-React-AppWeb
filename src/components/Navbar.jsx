import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

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
    <nav className="navbar navbar-expand-xl bg-white shadow-sm px-3 px-xl-4 py-2" style={{ borderBottom: "3px solid #fa0606" }}
      aria-label="Navegación principal">
      <div className="container-fluid px-0">

        {/* LOGO: enlaza a /gestion a propósito (acceso interno del taller) */}
        <NavLink to="/gestion" className="navbar-brand fw-bold text-black m-0 p-0 me-xl-4 logo-jafrauto">
          JAFRAUTO<span className="text-danger">MOTOR</span>
        </NavLink>

        <button
          className="navbar-toggler border-danger shadow-none"
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
                  `nav-link fw-bold text-nowrap px-xl-2 ${isActive ? "text-danger" : "text-black"}`}>
                  {texto}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="d-flex flex-column flex-xl-row align-items-stretch align-items-xl-center gap-2 gap-xl-3 my-2 my-xl-0">
            <NavLink
              to="/reservar"
              className={({ isActive }) =>
                `btn fw-bold position-relative rounded-0 text-nowrap pulse-urgente ${isActive ? "bg-danger text-white" : "btn-outline-danger"}`
              }
            >
              <i className="fa-solid fa-calendar-check me-2"></i>PEDIR CITA
              {totalServicios > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-dark border border-white">
                  {totalServicios}
                  <span className="visually-hidden"> servicios elegidos</span>
                </span>
              )}
            </NavLink>

            {store.usuario ? (
              <NavLink to="/mi-cuenta" className="nav-link fw-bold text-black text-nowrap">
                <i className="fa-solid fa-user me-1 small"></i> {store.usuario.name?.split(" ")[0]?.toUpperCase()}
              </NavLink>
            ) : (
              <NavLink to="/login" className="nav-link fw-bold text-black text-nowrap">
                <i className="fa-solid fa-user me-1 small"></i> ACCEDER
              </NavLink>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

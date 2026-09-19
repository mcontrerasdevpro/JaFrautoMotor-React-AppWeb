import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Navbar = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate(); // <--- ESTA ES LA LÍNEA QUE FALTABA
  
  const [busqueda, setBusqueda] = useState("");
  const totalUrgentes = store?.urgente?.length || 0;
  const totalEuros = store.urgente.reduce((acc, item) => acc + (Number(item.precio) || 0), 0);

  const handleBusqueda = (e) => {
    const valor = e.target.value;
    setBusqueda(valor);

    // Actualizamos el store siempre para que el filtro funcione en tiempo real
    dispatch({ type: "set_busqueda", payload: valor });

    // Si el usuario escribe algo, lo mandamos a la página de servicios
    if (valor.length > 0) {
      navigate("/servicios");
    }
  };

  return (
    <nav className="navbar navbar-expand-xl px-4 py-2 sticky-top shadow-sm"
      style={{ backgroundColor: "#ffffff", borderBottom: "3px solid #fa0606" }}>
      <div className="container-fluid">

        {/* LOGO */}
        <NavLink
          to="/gestion"
          className="navbar-brand fw-bold fs-3 text-black m-0 p-0 me-4"
          style={{
            position: "relative",
            zIndex: 9999,
            display: "inline-block",
            cursor: "pointer",
            pointerEvents: "auto"
          }}
        >
          JAFRAUTO<span className="text-danger">MOTOR</span>
        </NavLink>

        {/* BOTÓN HAMBURGUESA */}
        <button
          className="navbar-toggler border-danger shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">

          {/* --- MENÚ DE NAVEGACIÓN PRINCIPAL --- */}
          <ul className="navbar-nav mb-2 mb-xl-0 gap-2">
            <li className="nav-item">
              <NavLink to="/" className={({ isActive }) =>
                `nav-link fw-bold ${isActive ? "text-danger" : "text-black"}`}>
                <i className="fa-solid fa-house me-1 small"></i> INICIO
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/taller" className={({ isActive }) =>
                `nav-link fw-bold ${isActive ? "text-danger" : "text-black"}`}>TALLER</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/servicios" className={({ isActive }) =>
                `nav-link fw-bold ${isActive ? "text-danger" : "text-black"}`}>SERVICIOS</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/promociones" className={({ isActive }) =>
                `nav-link fw-bold ${isActive ? "text-danger" : "text-black"}`}>PROMOCIONES</NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/presupuesto"
                className={({ isActive }) =>
                  `nav-link fw-bold ${isActive ? "text-danger" : "text-black"}`
                }
              >
                SOLICITAR PRESUPUESTO
              </NavLink>
            </li>
          </ul>

          {/* --- BUSCADOR --- */}
          <div className="mx-auto my-3 my-xl-0 d-flex align-items-center gap-2">
            <div style={{ position: "relative", width: "240px" }}>
              <input
                type="text"
                className="form-control border-danger shadow-none bg-light"
                placeholder="Buscar servicio..."
                style={{ borderRadius: "0", fontSize: "0.85rem" }}
                value={busqueda}
                onChange={handleBusqueda}
              />
              <i className="fa-solid fa-magnifying-glass position-absolute end-0 top-50 translate-middle-y me-3 text-danger opacity-50"></i>
            </div>
          </div>

          {/* --- BOTÓN MI CITA / RESERVAR --- */}
          <div className="ms-xl-4 d-grid d-xl-block">
            <NavLink
              to="/urgente"
              className={({ isActive }) =>
                `btn fw-bold position-relative rounded-0 pulse-urgente ${isActive ? "bg-danger text-white" : "btn-outline-danger"}`
              }
              style={{ transition: "0.3s", zIndex: 9999, pointerEvents: "auto" }}
            >
              <i className="fa-solid fa-cart-shopping me-2"></i>
              RESERVAR: ({totalEuros}€)
              {store.urgente.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-dark border border-white">
                  {store.urgente.length}
                </span>
              )}
            </NavLink>
          </div>

          {/* --- CUENTA DE CLIENTE --- */}
          <div className="ms-xl-3 d-flex align-items-center gap-2 my-2 my-xl-0">
            {store.usuario ? (
              <NavLink to="/mi-cuenta" className="nav-link fw-bold text-black">
                <i className="fa-solid fa-user me-1 small"></i> {store.usuario.name?.split(" ")[0]?.toUpperCase()}
              </NavLink>
            ) : (
              <>
                <NavLink to="/login" className="nav-link fw-bold text-black">Iniciar sesión</NavLink>
                <NavLink to="/registro" className="btn btn-sm btn-outline-danger rounded-0 fw-bold">Registrarse</NavLink>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};
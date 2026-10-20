import { Navigate } from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { AvisoLegal } from "./pages/AvisoLegal";
import { Presupuesto } from "./pages/Presupuesto";
import { PoliticaPrivacidad } from "./pages/PoliticaPrivacidad";
import { Servicios } from "./pages/Servicios";
import { ServicioDetalle } from "./pages/ServicioDetalle";
import { Contacto } from "./pages/Contacto";
import { Taller } from "./pages/Taller";
import { Promociones } from "./pages/Promociones";
import { Cookies } from "./pages/Cookies";
import { NotFound } from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { StoreProvider } from "./hooks/useGlobalReducer";
import { PAGINAS_SERVICIO } from "./data/paginasServicio";

// Páginas que solo se usan en el navegador (reserva, sesión, panel): se cargan bajo
// demanda para que las páginas públicas no descarguen su código
const bajoDemanda = (cargar, nombre) => () => cargar().then((m) => ({ Component: m[nombre] }));

export const routes = [
  {
    // Todas las rutas cuelgan del Layout (navbar, footer, cookies y WhatsApp)
    path: "/",
    element: <StoreProvider><Layout /></StoreProvider>,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: "taller", element: <Taller /> },
      { path: "servicios", element: <Servicios /> },
      {
        path: "servicios/:slug",
        element: <ServicioDetalle />,
        getStaticPaths: () => PAGINAS_SERVICIO.map((p) => `servicios/${p.slug}`)
      },
      { path: "promociones", element: <Promociones /> },
      { path: "presupuesto", element: <Presupuesto /> },
      { path: "contacto", element: <Contacto /> },
      { path: "avisoLegal", element: <AvisoLegal /> },
      { path: "politicaPrivacidad", element: <PoliticaPrivacidad /> },
      { path: "cookies", element: <Cookies /> },
      { path: "404", element: <NotFound /> },

      { path: "login", lazy: bajoDemanda(() => import("./pages/Login"), "Login") },
      { path: "registro", lazy: bajoDemanda(() => import("./pages/Registro"), "Registro") },
      { path: "gestion", lazy: bajoDemanda(() => import("./pages/AccesoGestion"), "AccesoGestion") },
      { path: "reservar", lazy: bajoDemanda(() => import("./pages/Reservar"), "Reservar") },
      { path: "cita/:token", lazy: bajoDemanda(() => import("./pages/GestionCita"), "GestionCita") },
      // Enlace antiguo de la reserva (antes pedía cuenta)
      { path: "urgente", element: <Navigate to="/reservar" replace /> },

      // Rutas que requieren estar registrado/logueado
      { element: <ProtectedRoute />, children: [{ path: "mi-cuenta", lazy: bajoDemanda(() => import("./pages/MiCuenta"), "MiCuenta") }] },

      // Rutas que requieren cuenta de administrador
      { element: <AdminRoute />, children: [{ path: "panel-interno", lazy: bajoDemanda(() => import("./pages/PanelInterno"), "PanelInterno") }] },

      { path: "*", element: <NotFound /> }
    ]
  }
];

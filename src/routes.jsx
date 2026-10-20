import {
    createBrowserRouter,
    createRoutesFromElements,
    Navigate,
    Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { AvisoLegal } from "./pages/AvisoLegal";
import { Presupuesto } from "./pages/Presupuesto";
import { PoliticaPrivacidad } from "./pages/PoliticaPrivacidad";
import { Servicios } from "./pages/Servicios";
import { Contacto } from "./pages/Contacto";
import { Taller } from "./pages/Taller";
import { Promociones } from "./pages/Promociones";
import { Reservar } from "./pages/Reservar";
import { GestionCita } from "./pages/GestionCita";
import { AccesoGestion } from "./pages/AccesoGestion";
import { PanelInterno } from "./pages/PanelInterno";
import { Cookies } from "./pages/Cookies";
import { Login } from "./pages/Login";
import { Registro } from "./pages/Registro";
import { MiCuenta } from "./pages/MiCuenta";
import { NotFound } from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";

export const router = createBrowserRouter(
    createRoutesFromElements(
      // Todas las rutas cuelgan del Layout (navbar, footer, cookies y WhatsApp)
      <Route path="/" element={<Layout />} errorElement={<NotFound />}>

        <Route path="/" element={<Home />} />
        <Route path="/avisoLegal" element={<AvisoLegal />} />
        <Route path="/presupuesto" element={<Presupuesto />} />
        <Route path="/politicaPrivacidad" element={<PoliticaPrivacidad />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/taller" element={<Taller />} />
        <Route path="/promociones" element={<Promociones />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/gestion" element={<AccesoGestion />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/reservar" element={<Reservar />} />
        <Route path="/cita/:token" element={<GestionCita />} />
        {/* Enlace antiguo de la reserva (antes pedía cuenta) */}
        <Route path="/urgente" element={<Navigate to="/reservar" replace />} />

        {/* Rutas que requieren estar registrado/logueado */}
        <Route element={<ProtectedRoute />}>
          <Route path="/mi-cuenta" element={<MiCuenta />} />
        </Route>

        {/* Rutas que requieren cuenta de administrador */}
        <Route element={<AdminRoute />}>
          <Route path="/panel-interno" element={<PanelInterno />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    )
);

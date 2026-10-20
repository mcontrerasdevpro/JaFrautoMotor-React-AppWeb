import { Outlet } from "react-router-dom";
import { Head } from "vite-react-ssg";
import fuenteTitulos from "@fontsource/barlow-condensed/files/barlow-condensed-latin-800-normal.woff2?url";
import ScrollToTop from "../components/ScrollToTop";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { CookieBanner } from "../components/CookieBanner";
import { TALLER } from "../config";
import { Icono } from "../components/Icono";
import { BarraMovil } from "../components/BarraMovil";

export const Layout = () => {
    return (
        /* Contenedor principal con Flexbox para empujar el footer al fondo */
        <div style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh"
        }}>
            <ScrollToTop />

            {/* Precarga de la fuente de títulos: evita que el titular de portada se redibuje tarde (LCP) */}
            <Head>
                <link rel="preload" href={fuenteTitulos} as="font" type="font/woff2" crossOrigin="" />
            </Head>

            {/* Header pegajoso: ocupa su propio alto, así el contenido nunca queda debajo ni deja hueco */}
            <header className="sticky-top" style={{ zIndex: 4000 }}>
                <Navbar />
            </header>

            <main style={{
                flex: "1 0 auto",
                paddingBottom: "50px",
                position: "relative"
            }}>
                <Outlet />
            </main>

            {/* BANNER DE COOKIES: Aparece sobre el footer cuando es necesario */}
            <CookieBanner />

            <Footer />

            <BarraMovil />

            {/* BOTÓN WHATSAPP */}
            <a href={TALLER.whatsapp} target="_blank" rel="noopener noreferrer"
                className="btn-whatsapp shadow-lg" aria-label="Escríbenos por WhatsApp">
                <Icono nombre="whatsapp" />
            </a>
        </div>
    );
};

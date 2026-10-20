import { Outlet } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { CookieBanner } from "../components/CookieBanner";
import { TALLER } from "../config";

export const Layout = () => {
    return (
        /* Contenedor principal con Flexbox para empujar el footer al fondo */
        <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            minHeight: "100vh" 
        }}>
            <ScrollToTop />

            {/* HEADER SIEMPRE FIJO */}
            <header style={{ position: "fixed", top: 0, width: "100%", zIndex: 4000 }}>
                <Navbar />
            </header>

            {/* CONTENIDO PRINCIPAL */}
            <main style={{ 
                flex: "1 0 auto",
                paddingTop: "100px",
                paddingBottom: "50px",
                position: "relative"
            }}>
                <Outlet />
            </main>

            {/* BANNER DE COOKIES: Aparece sobre el footer cuando es necesario */}
            <CookieBanner />

            <Footer />

            {/* BOTÓN WHATSAPP */}
            <a href={TALLER.whatsapp} target="_blank" rel="noopener noreferrer"
                className="btn-whatsapp shadow-lg" aria-label="Escríbenos por WhatsApp">
                <i className="fa-brands fa-whatsapp"></i>
            </a>

            <style>{`
                .btn-whatsapp {
                    position: fixed; 
                    right: 20px; 
                    bottom: 30px; 
                    background: #25d366; 
                    color: white; 
                    border-radius: 50%;
                    width: 60px; height: 60px; 
                    display: flex;
                    align-items: center; justify-content: center;
                    font-size: 30px; z-index: 5000; text-decoration: none;
                    transition: transform 0.3s ease;
                }
                .btn-whatsapp:hover { transform: scale(1.1); color: white; }
                
                /* Ajuste responsivo para que el banner de cookies no tape el botón en móviles */
                @media (max-width: 768px) {
                    .btn-whatsapp {
                        bottom: 100px; /* Lo subimos temporalmente si el banner está activo */
                    }
                }
            `}</style>
        </div>
    );
};
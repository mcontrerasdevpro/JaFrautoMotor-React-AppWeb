import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Al cambiar de página volvemos arriba; si no, se quedaría el scroll de la vista anterior
const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

export default ScrollToTop;

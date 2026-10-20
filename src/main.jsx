import { ViteReactSSG } from 'vite-react-ssg'
import 'bootstrap/dist/css/bootstrap.min.css'
// Tipografía de la marca alojada en la propia web: solo latín y los dos estilos de títulos
import '@fontsource/barlow-condensed/latin-800.css'
import '@fontsource/barlow-condensed/latin-800-italic.css'
import './index.css'
import { routes } from "./routes";

// En el build genera el HTML de cada página pública; en el navegador hidrata
// (o renderiza desde cero en las rutas que solo existen en el cliente)
export const createRoot = ViteReactSSG({ routes })

import { ViteReactSSG } from 'vite-react-ssg'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import { routes } from "./routes";

// En el build genera el HTML de cada página pública; en el navegador hidrata
// (o renderiza desde cero en las rutas que solo existen en el cliente)
export const createRoot = ViteReactSSG({ routes })

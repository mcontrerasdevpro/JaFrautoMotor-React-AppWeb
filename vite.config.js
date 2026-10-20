import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { esRutaSoloCliente } from './src/rutasCliente.js'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000
    },
    build: {
        outDir: 'dist'
    },
    // Prerenderizado (vite-react-ssg): una carpeta con index.html por página pública
    ssgOptions: {
        dirStyle: 'nested',
        includedRoutes(paths) {
            return paths.filter((ruta) => ruta !== '*' && !ruta.includes(':') && !esRutaSoloCliente(ruta))
        },
        // Extrae el CSS crítico de cada página y carga el resto sin bloquear
        beastiesOptions: {
            preload: 'swap'
        }
    }
})

import { purgeCSSPlugin } from "@fullhuman/postcss-purgecss";

// En el build de producción quitamos de Bootstrap las clases que la web no usa
// (de ~230 KB a una fracción). En desarrollo se carga entero.
const purgar = purgeCSSPlugin({
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    safelist: {
        // Clases que se montan con plantillas (`bg-${color}`, `btn-${...}`...) o que
        // pone React según el estado
        standard: [
            /^(bg|btn|text|border)-(danger|dark|secondary|primary|success|warning)$/,
            /^btn-outline-(danger|dark|light|secondary)$/,
            "show",
            "active",
            "collapsing"
        ]
    }
});

export default {
    plugins: process.env.NODE_ENV === "production" ? [purgar] : []
};

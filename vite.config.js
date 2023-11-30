import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
    root: "src",
    build: {
        outDir: path.resolve(__dirname, "dist"),
        rollupOptions: {
            input: {
                index: path.resolve(__dirname, "src/index.html"),
                about: path.resolve(__dirname, "src/about.html"),
                bots: path.resolve(__dirname, "src/bots.html"),
                build: path.resolve(__dirname, "src/build.html"),
                hacks: path.resolve(__dirname, "src/hacks.html"),
                lore: path.resolve(__dirname, "src/lore.html"),
                parts: path.resolve(__dirname, "src/parts.html"),
                rif: path.resolve(__dirname, "src/rif.html"),
                simulator: path.resolve(__dirname, "src/simulator.html"),
                wiki: path.resolve(__dirname, "src/wiki.html"),
            },
        },
    },
});

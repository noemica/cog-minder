import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

declare const __dirname: string;

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
                combat: path.resolve(__dirname, "src/combat.html"),
                hacks: path.resolve(__dirname, "src/hacks.html"),
                lore: path.resolve(__dirname, "src/lore.html"),
                parts: path.resolve(__dirname, "src/parts.html"),
                rif: path.resolve(__dirname, "src/rif.html"),
                simulator: path.resolve(__dirname, "src/simulator.html"),
                wiki: path.resolve(__dirname, "src/wiki.html"),
            },
        },
    },
    plugins: [react()],
});

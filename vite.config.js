import { defineConfig } from "vite";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                index: "./index.html",
                about: "./src/about.html",
                bots: "./src/bots.html",
                build: "./src/build.html",
                hacks: "./src/hacks.html",
                lore: "./src/lore.html",
                parts: "./src/parts.html",
                rif: "./src/rif.html",
                simulator: "./src/simulator.html",
                wiki: "./src/wiki.html",
            },
        },
    },
});

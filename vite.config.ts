import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

declare const __dirname: string;

export default defineConfig({
    root: "src",
    base: `/cog-minder/`,
    build: {
        outDir: path.resolve(__dirname, "dist"),
        rollupOptions: {
            input: {
                index: path.resolve(__dirname, "src/index.html"),
            },
        },
    },
    plugins: [react()],
});

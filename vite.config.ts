import react from "@vitejs/plugin-react";
import * as child from "child_process";
import path from "path";
import { defineConfig } from "vite";

declare const __dirname: string;

const commit = child.execSync("git rev-parse --short HEAD").toString();

export default defineConfig({
    root: "src",
    base: `/cog-minder/`,
    build: {
        outDir: path.resolve(__dirname, "dist"),
        rollupOptions: {
            input: {
                404: path.resolve(__dirname, "src/404.html"),
                index: path.resolve(__dirname, "src/index.html"),
            },
        },
    },
    define: {
        __COMMIT_HASH__: JSON.stringify(commit),
    },
    plugins: [react()],
});

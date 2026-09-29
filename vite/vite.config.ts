import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "node:path";

// Secondary build target: the same React tree bundled into ONE self-contained
// index.html (JS + CSS inlined). Used for hosts that serve a single page plus
// static files, e.g. a claude.ai artifact. Page images stay as files in docs/.
export default defineConfig({
  root: path.resolve(__dirname),
  publicDir: path.resolve(__dirname, "../public"),
  base: "./",
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: { alias: { "@": path.resolve(__dirname, "../src") } },
  build: { outDir: path.resolve(__dirname, "../dist"), emptyOutDir: true },
});

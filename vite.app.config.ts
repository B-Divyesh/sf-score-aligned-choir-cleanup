import { defineConfig } from "vite";

export default defineConfig({
  root: "app",
  base: "./",
  publicDir: "../public",
  build: { outDir: "../dist/app", emptyOutDir: true, target: "es2022" },
  server: { port: 1420, strictPort: true },
  clearScreen: false,
});

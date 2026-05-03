import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Cambiá "padel-app" por el nombre exacto de tu repositorio en GitHub
export default defineConfig({
  plugins: [react()],
  base: "/padel-app/",   // ← debe coincidir con el nombre del repo
});

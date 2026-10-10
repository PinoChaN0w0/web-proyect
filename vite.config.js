import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Si despliegas en un subdirectorio (ej. GitHub Pages: /web-proyect/),
// cambia base por "/web-proyect/".
export default defineConfig({
  base: "/",
  plugins: [react()],
});

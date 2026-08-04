import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configuración estándar de Vite + React.
// No hace falta tocar nada aquí para que funcione en Vercel.
export default defineConfig({
  plugins: [react()],
});

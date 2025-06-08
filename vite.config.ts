// vite.config.js
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import vitePluginInjectDataLocator from "./plugins/vite-plugin-inject-data-locator";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vitePluginInjectDataLocator()],
  server: {
    allowedHosts: true,
    // Opcional: reduce logs molestos
    middlewareMode: false,
  },
  // Suprimir warnings innecesarios en desarrollo
  define: { 
    'process.env': {},
  },
  // Optimizar build para producción
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        }
      }
    }
  }
});
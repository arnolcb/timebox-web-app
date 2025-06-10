// vite.config.ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import vitePluginInjectDataLocator from "./plugins/vite-plugin-inject-data-locator";

export default defineConfig({
  plugins: [react(), vitePluginInjectDataLocator()],
  // NO usar base aquí para Vercel
  server: {
    allowedHosts: true,
    middlewareMode: false,
  },
  define: {
    'process.env': {},
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          ui: ['@heroui/react']
        }
      }
    }
  }
});
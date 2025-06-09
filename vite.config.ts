// vite.config.ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import vitePluginInjectDataLocator from "./plugins/vite-plugin-inject-data-locator.ts";

export default defineConfig({
  plugins: [react(), vitePluginInjectDataLocator()],
  base: "/app/",
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
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        }
      }
    }
  }
});
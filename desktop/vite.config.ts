import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Tauri expects the dev server on a fixed port
  server: {
    port: 5173,
    strictPort: true,
  },
  // Vite's env vars exposed to the frontend
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    // Tauri uses Chromium; no need for legacy targets
    target: "chrome120",
    outDir: "dist",
  },
});

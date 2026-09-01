import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Tauri expects the dev server on a fixed port
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"], // Avoid EBUSY errors on Rust target build files
    },
  },
  // Vite's env vars exposed to the frontend
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    // Tauri uses Chromium; no need for legacy targets
    target: "chrome120",
    outDir: "dist",
  },
});

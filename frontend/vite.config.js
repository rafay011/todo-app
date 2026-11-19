import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev mode (npm run dev), send /api calls to the backend on port 8000.
// In Docker, nginx does this job instead (see nginx.conf).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
});

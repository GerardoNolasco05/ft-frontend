// vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Prefer the name we standardized on
  const target =
    env.VITE_API_BASE ||
    env.VITE_BACKEND ||       // legacy support if you still have it locally
    "http://localhost:5000";  // dev fallback

  return {
    plugins: [react(), tailwindcss()],
    server: {
      // Only used by `npm run dev`
      proxy: {
        "/coaches":   { target, changeOrigin: true },
        "/clients":   { target, changeOrigin: true },
        "/exercises": { target, changeOrigin: true },
        "/workouts":  { target, changeOrigin: true },
      },
    },
  };
});

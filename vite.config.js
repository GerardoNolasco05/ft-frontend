import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.VITE_BACKEND || "http://localhost:5000";

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        "/coaches": { target, changeOrigin: true },
        "/clients": { target, changeOrigin: true },
        "/exercises": { target, changeOrigin: true },
        "/workouts": { target, changeOrigin: true },
      },
    },
  };
});

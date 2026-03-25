import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function parseAllowedHosts(rawValue?: string) {
  if (!rawValue?.trim()) return true;

  return rawValue
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      host: env.DEV_SERVER_HOST || "0.0.0.0",
      port: Number(env.DEV_SERVER_PORT || 5173),
      allowedHosts: parseAllowedHosts(env.DEV_ALLOWED_HOSTS),
      proxy: {
        "/api": {
          target: env.DEV_API_PROXY_TARGET || "http://127.0.0.1:8090",
          changeOrigin: true,
        },
        "/ws": {
          target: env.DEV_WS_PROXY_TARGET || "ws://127.0.0.1:8080",
          ws: true,
          changeOrigin: true,
        },
      },
    },
  };
});

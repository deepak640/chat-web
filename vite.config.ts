import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // loadEnv returns string values for env vars; pass '' to get all keys
  const env = loadEnv(mode, process.cwd(), "");
  // prefer VITE_PUBLIC_URL (Vite convention), fall back to PUBLIC_URL (CRA-style), then '/'
  const base = env.VITE_PUBLIC_BASE_URL;

  return {
    base,
    server: {
      host: "::",
      port: 8080,
      proxy: {
        "/v1": {
          target: base,
          changeOrigin: true,
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(
      Boolean
    ),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});

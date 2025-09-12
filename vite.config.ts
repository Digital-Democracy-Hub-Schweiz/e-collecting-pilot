import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api/address-search': {
        target: 'https://osbapi.liip.ch',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/address-search/, '/address-search'),
        secure: true,
        headers: {
          'Accept': 'application/json',
        }
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    // Falls der Dep-Optimizer auf fehlerhafte Chunks läuft, hier ausschließen
    exclude: [
      "lovable-tagger",
    ],
  },
}));

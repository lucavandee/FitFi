import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ESM-only; géén require() gebruiken
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // Routeert alle imports van 'lucide-react' naar onze lichte shim
      "lucide-react": path.resolve(__dirname, "src/ui/icons/lucide-shim.tsx"),
    },
  },
  server: { port: 3000, strictPort: true },
});
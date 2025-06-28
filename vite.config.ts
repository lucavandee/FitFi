import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "automatic",         // Voor React 17+ JSX
      jsxImportSource: "react",        // Nodig voor dingen zoals emotion / styled-components
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Hiermee werkt @/ naar src/
    },
  },
  optimizeDeps: {
    exclude: ["lucide-react"], // Vermijd pre-bundling voor deze lib
  },
  server: {
    port: 3000,    // Start lokale server op poort 3000
    open: true,    // Open browser automatisch
  },
  build: {
    outDir: "dist",     // Output folder
    sourcemap: true,    // Handig voor debugging
  },
});

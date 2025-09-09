import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: {  "@": path.resolve(__dirname, "src")  , "lucide-react": require("node:path").resolve(__dirname, "src/ui/icons/lucide-shim.tsx") } },
});

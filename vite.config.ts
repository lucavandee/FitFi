import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ command }) => {
  const isDev = command === "serve";
  
  return {
    plugins: [
      react(),
      // Color guard plugin - alleen in development voor performance
      isDev && {
        name: "fitfi-color-guard",
        transform(code: string, id: string) {
          // Skip node_modules en non-source files
          if (id.includes("node_modules") || !id.includes("/src/")) {
            return null;
          }

          // Zoek naar hardcoded hex kleuren en grijs-patronen
          const hexColorRegex = /#[0-9a-fA-F]{3,8}/g;
          const grayClassRegex = /(?:text-|bg-|border-)gray-\d+/g;
          const redClassRegex = /(?:text-|bg-|border-)red-\d+/g;
          const blueClassRegex = /(?:text-|bg-|border-)blue-\d+/g;
          
          const hexMatches = code.match(hexColorRegex);
          const grayMatches = code.match(grayClassRegex);
          const redMatches = code.match(redClassRegex);
          const blueMatches = code.match(blueClassRegex);
          
          if (hexMatches || grayMatches || redMatches || blueMatches) {
            const relativePath = path.relative(process.cwd(), id);
            console.warn(`\n⚠️  FitFi Color Guard - Hardcoded colors found in ${relativePath}:`);
            
            if (hexMatches) {
              console.warn(`   Hex colors: ${hexMatches.join(", ")}`);
              console.warn(`   → Consider using CSS custom properties: var(--color-*)`);
            }
            
            if (grayMatches) {
              console.warn(`   Gray classes: ${grayMatches.join(", ")}`);
              console.warn(`   → Use: text-muted, text-ink, bg-surface, border-ui`);
            }
            
            if (redMatches) {
              console.warn(`   Red classes: ${redMatches.join(", ")}`);
              console.warn(`   → Use: text-[color:var(--color-danger)]`);
            }
            
            if (blueMatches) {
              console.warn(`   Blue classes: ${blueMatches.join(", ")}`);
              console.warn(`   → Use: text-[color:var(--color-primary)]`);
            }
            
            console.warn(`   See tokens in: src/styles/tokens.css\n`);
          }
          
          return null; // Geen transformatie, alleen waarschuwingen
        }
      }
    ].filter(Boolean),
    
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src")
      }
    },
    
    server: {
      port: 5173,
      strictPort: false,
    },
    
    build: {
      sourcemap: false,
    },
  };
});
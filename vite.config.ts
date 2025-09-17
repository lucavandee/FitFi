// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => {
  const isDev = command === "serve";

  return {
    plugins: [
      react(),
      // Color guard plugin - alleen in development voor warnings (geen transform)
      isDev && {
        name: "fitfi-color-guard",
        transform(code: string, id: string) {
          if (id.includes("node_modules") || !id.includes("/src/")) return null;

          const hasHex = /#[0-9A-Fa-f]{3,8}\b/.test(code);
          const grayTailwind = /(text|bg|border|from|to|via)-(slate|gray|zinc|neutral|stone)-\d{2,3}/.test(code);
          const redTailwind = /(text|bg|border|from|to|via)-red-\d{2,3}/.test(code);
          const blueTailwind = /(text|bg|border|from|to|via)-(blue|sky|indigo)-\d{2,3}/.test(code);

          if (hasHex || grayTailwind || redTailwind || blueTailwind) {
            console.warn(`\n[fitfi-color-guard] Potential hard-coded color usage in: ${id}`);
            const hexMatches = code.match(/#[0-9A-Fa-f]{3,8}\b/g);
            const grayMatches = code.match(/(?:text|bg|border|from|to|via)-(?:slate|gray|zinc|neutral|stone)-\d{2,3}/g);
            const redMatches = code.match(/(?:text|bg|border|from|to|via)-red-\d{2,3}/g);
            const blueMatches = code.match(/(?:text|bg|border|from|to|via)-(?:blue|sky|indigo)-\d{2,3}/g);

            if (hexMatches) {
              console.warn(`   Hex colors: ${hexMatches.join(", ")}`);
              console.warn(`   → Gebruik CSS custom properties: var(--color-*) in tokens.css`);
            }
              console.warn(`   Gray classes: ${grayMatches.join(", ")}`);
              console.warn(`   → Gebruik: text-muted, text, bg-surface, border-ui`);
            }
            if (redMatches) {
              console.warn(`   Red classes: ${redMatches.join(", ")}`);
              console.warn(`   → Gebruik: [color:var(--color-danger)] utilities`);
      '@': '/src'
            if (blueMatches) {
              console.warn(`   Blue classes: ${blueMatches.join(", ")}`);
              console.warn(`   → Gebruik: [color:var(--color-primary)] utilities`);
            }
            console.warn(`   Zie tokens: src/styles/tokens.css\n`);
          }

          return null;
        }
      }
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": new URL("./src", import.meta.url).pathname
      }
    },
    server: { port: 5173, strictPort: false },
    build: { sourcemap: false }
  };
});
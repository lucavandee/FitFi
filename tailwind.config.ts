import type { Config } from "tailwindcss";

export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    extend: {
      // We gebruiken vooral CSS-variabelen uit tokens, extensie hier is optioneel
    }
  },
  safelist: [
    /* Handig voor arbitrary var-classes die soms door de scanner gemist worden */
    "bg-[var(--color-bg)]",
    "text-[var(--color-text)]",
    "border-[var(--color-border)]",
    "shadow-[var(--shadow-soft)]",
    "shadow-[var(--shadow-ring)]"
  ],
  plugins: []
} satisfies Config;
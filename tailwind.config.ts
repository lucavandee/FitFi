// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        text: "var(--color-text)",
        muted: "var(--color-muted)",
        primary: "var(--color-primary)",
        primary600: "var(--ff-color-primary-600)",
        primary700: "var(--ff-color-primary-700)",
        accent: "var(--color-accent)",
        border: "var(--color-border)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
      },
      fontFamily: {
        heading: ["Montserrat", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["Lato", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        ring: "var(--shadow-ring)",
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        "2xl": "var(--radius-2xl)",
      },
      ringColor: {
        brand: "var(--ff-color-primary-600)",
      },
      ringOffsetColor: {
        surface: "var(--color-surface)",
      },
      ringOffsetWidth: {
        2: "2px",
      },
    },
    container: {
      center: true,
      padding: "1rem",
    },
  },
  plugins: [],
} satisfies Config;
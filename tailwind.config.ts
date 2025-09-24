// /tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  // ⬇️ Houd basis-utilities altijd beschikbaar (failsafe bij purge)
  safelist: [
    // Spacing
    { pattern: /^(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml)-(0|1|2|3|4|5|6|8|10|12|16|20|24|32)$/ },
    // Flex/Grid/Gaps/Alignment
    { pattern: /^(flex|grid)$/ },
    { pattern: /^(items|justify)-(start|center|end|between)$/ },
    { pattern: /^gap-(1|2|3|4|6|8|10|12)$/ },
    { pattern: /^grid-cols-(1|2|3|4|6|12)$/ },
    // Typography & display
    { pattern: /^(text|leading|tracking|font)-(xs|sm|base|lg|xl|2xl|3xl|4xl|medium|semibold|bold)$/ },
    { pattern: /^(hidden|block|inline|inline-block|sr-only)$/ },
    // Rounding & borders & shadows
    { pattern: /^(rounded|rounded-(sm|md|lg|xl|2xl))$/ },
    { pattern: /^shadow(-(sm|md|lg))?$/ },
    { pattern: /^border(-(0|2))?$/ },
    // Colors op tokens
    { pattern: /^(bg|text|border)-(bg|surface|text|muted|primary|primary600|primary700|accent|border)$/ },
    // Positioning
    { pattern: /^(relative|absolute|sticky|top-0)$/ },
    // Width/Max-width
    { pattern: /^(w|max-w)-(full|screen|xs|sm|md|lg|xl|2xl|3xl)$/ },
  ],
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
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },
    },
  },
  plugins: [],
} satisfies Config;
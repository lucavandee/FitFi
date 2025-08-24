/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // FitFi brand tokens
        accent: "#89CFF0", // Turquoise
        "text-dark": "#0D1B2A", // Midnight Blue
        surface: "#F6F6F6", // Light Grey
        ink: "#0D1B2A", // Alias for text-dark
        muted: "#6B7280", // Muted gray
        midnight: "#0D1B2A",
        turquoise: "#89CFF0",
        surface: {
          DEFAULT: "#FFFFFF",
          light: "#F6F6F6",
        },
        brandPurple: "#6E2EB7",
        brandPink: "#B043FF",
        brandPurpleLight: "#ECE7FB",
        navy: "#0A0E23",
        foundersGradientFrom: "#6E2EB7",
        foundersGradientTo: "#B043FF",
        foundersCardBg: "#FFFFFF",
        foundersCardBgDark: "#1E1B2E",
        brandGradientFrom: "#6E2EB7",
        brandGradientTo: "#B043FF",
        primary: {
          DEFAULT: "#0D1B2A",
          50: "#E8F4FD",
          100: "#D1E9FB",
          200: "#A3D3F7",
          300: "#75BDF3",
          400: "#47A7EF",
          500: "#1991EB",
          600: "#147BC6",
          700: "#0F65A1",
          800: "#0A4F7C",
          900: "#0D1B2A",
        },
        accent: {
          DEFAULT: "#0ea5e9", // Improved contrast ratio
          50: "#F0FBFF",
          100: "#E1F7FF",
          200: "#C3EFFF",
          300: "#A5E7FF",
          400: "#87DFFF",
          500: "#0ea5e9",
          600: "#6BB7D8",
          700: "#4D9FC0",
          800: "#2F87A8",
          900: "#116F90",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          light: "#F6F6F6",
        },
      },
      boxShadow: {
        soft: "0 6px 24px rgba(13,27,42,0.06)",
        xl: "0 20px 40px rgba(13,27,42,0.12)",
        founders: "0 10px 40px rgba(0, 0, 0, 0.06)",
        card: "0 8px 30px rgba(0, 0, 0, 0.06)",
        "founders-dark": "0 10px 40px rgba(0, 0, 0, 0.3)",
        glass: "0 8px 32px rgba(31, 38, 135, 0.37)",
        menu: "0 10px 32px rgba(0, 0, 0, 0.08)",
      },
      fontFamily: {
        heading: ["Montserrat", "ui-sans-serif", "system-ui"],
        body: ["Lato", "ui-sans-serif", "system-ui"],
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
      },
      spacing: {
        "2xl": "1.25rem",
      },
      spacing: {
        18: "4.5rem",
        72: "4.5rem", // Header height
        88: "22rem",
        128: "32rem",
      },
      height: {
        header: "4.5rem", // 72px
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "bounce-gentle": "bounceGentle 2s infinite",
        "count-up": "countUp 0.8s ease-out",
        "progress-fill": "progressFill 0.8s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        countUp: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        progressFill: {
          "0%": { strokeDashoffset: "283" },
          "100%": { strokeDashoffset: "var(--progress-offset)" },
        },
      },
    },
  },
  plugins: [],
  safelist: ["text-gradient", "text-gradient-soft"],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // FitFi Brand Colors
        'midnight': '#0D1B2A',
        'accent': '#89CFF0', 
        'surface': '#F6F6F6',
        'ink': '#0D1B2A',
        'muted': '#6B7280',
        // FitFi brand tokens
        accent: "#89CFF0",        // Turquoise
        "text-dark": "#0D1B2A",   // Midnight Blue
        surface: "#F6F6F6",       // Light Grey
        ink: "#0D1B2A",
        muted: "#6B7280",
        midnight: "#0D1B2A",
        // semantic
        primary: "#0D1B2A",
        secondary: "#89CFF0"
      },
      fontFamily: {
        sans: ["Lato", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["Montserrat", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        card: "0 10px 30px rgba(13,27,42,0.06)"
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem"
      }
    }
  },
  plugins: []
};
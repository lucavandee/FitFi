/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#0D1B2A",
        accent: "#89CFF0",
        surface: "#F6F6F6",
        white: "#FFFFFF",
      },
      fontFamily: {
        heading: ["Montserrat", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Lato", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Montserrat", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 10px 30px rgba(13,27,42,0.06)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
    },
  },
  plugins: [],
};
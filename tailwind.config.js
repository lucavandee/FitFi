/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0D1B2A',       // nachtblauw (dark mode background)
        'primary-light': '#334155',
        'primary-dark': '#091421',
        secondary: '#89CFF0',     // helder turquoise (CTA + highlights)
        accent: '#F6F6F6',        // kaart-achtergrond
        body: '#E2E8F0',          // algemene tekst op dark bg
        'text-dark': '#111827',   // tekst op licht bg
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
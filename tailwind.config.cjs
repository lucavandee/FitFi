/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  // optioneel; gebruikt door veel shadcn/ui componenten
  plugins: [require('tailwindcss-animate')],
};
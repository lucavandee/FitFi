/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html','./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // voeg brandPurple toe (bestaande kleuren ongemoeid laten)
        brandPurple: '#6E59A5',
      },
    },
  },
  safelist: [
    'text-brandPurple',
    'border-brandPurple',
    'ring-brandPurple',
    'focus:ring-brandPurple/40',
  ],
  plugins: [
    // laat deze regel alleen staan als we de plugin willen gebruiken:
    // require('tailwindcss-animate'),
  ],
};
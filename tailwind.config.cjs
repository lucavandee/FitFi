/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brandPurple: '#6E59A5',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
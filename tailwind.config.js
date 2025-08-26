/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // FitFi palette (bestaande keys behouden, we voegen brandPurple toe)
        brandPurple: '#6E59A5',
      },
    },
  },
  // BELANGRIJK: 'safelist' is een property, geen variabele.
  safelist: [
    'text-brandPurple',
    'border-brandPurple',
    'ring-brandPurple',
    'focus:ring-brandPurple/40',
  ],
  plugins: [],
};
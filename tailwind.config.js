/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
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
  plugins: [],
};
import { defineConfig } from 'vite';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Orange accent color
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
      },
      spacing: {
        '128': '32rem',
      },
      fontSize: {
        'h1': ['2.5rem', { lineHeight: '1.2' }],
        'h2': ['1.75rem', { lineHeight: '1.3' }],
      },
    },
  },
  plugins: [],
};
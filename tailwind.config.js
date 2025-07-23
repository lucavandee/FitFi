/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
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
        
        // Legacy support for existing components
        midnight: '#0D1B2A',
        turquoise: '#89CFF0',
        'turquoise-dark': '#6FB8D1',
        'light-grey': '#F6F6F6',
        white: '#FFFFFF',
        'text-primary': '#0D1B2A',
        'text-secondary': '#333333',
        
        // Orange accent color (legacy support)
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
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        '128': '32rem',
      },
      fontSize: {
        h1: ['2.5rem', { lineHeight: '1.2' }],
        h2: ['1.75rem', { lineHeight: '1.3' }],
        base: ['1rem', { lineHeight: '1.6' }],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
    },
  },
  corePlugins: {
    backgroundColor: true,
    textColor: true,
    borderColor: true,
    ringColor: true,
    gradientColorStops: true,
  },
  plugins: [],
};
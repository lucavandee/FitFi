/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Primary brand colors
        primary: '#0D1B2A',
        'primary-light': '#334155',
        'primary-dark': '#091421',
        secondary: '#89CFF0',
        accent: '#F6F6F6',
        body: '#E2E8F0',
        'text-dark': '#111827',
        
        // Extended color palette
        midnight: '#0D1B2A',
        turquoise: '#89CFF0',
        'turquoise-dark': '#6FB8D1',
        'light-grey': '#F6F6F6',
        white: '#FFFFFF',
        'text-primary': '#0D1B2A',
        'text-secondary': '#333333',
        'error-red': '#E03E3E',
        'success-green': '#22C55E',
        'info-blue': '#3B82F6',
        
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
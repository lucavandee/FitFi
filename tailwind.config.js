/** @type {import('tailwindcss').Config} */
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
        // FitFi Brand Colors
        midnight:         '#0D1B2A',  // hoofdkleur, achtergronden
        turquoise:        '#89CFF0',  // primaire accent
        'turquoise-dark': '#6FB8D1',  // hover/accent donkerder
        'light-grey':     '#F6F6F6',  // kaart-achtergronden
        white:            '#FFFFFF',  // secundaire cards
        'text-primary':   '#0D1B2A',  // koppen
        'text-secondary': '#333333',  // body tekst
        'error-red':      '#E03E3E',  // foutmeldingen
        'success-green':  '#22C55E',  // succesmeldingen
        'info-blue':      '#3B82F6',  // informatie
        
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
        6:  '1.5rem',
        8:  '2rem',
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
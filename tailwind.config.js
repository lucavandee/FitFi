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
        // FitFi Brand Design Tokens
        midnight: '#0D1B2A',       // brand background
        turquoise: '#89CFF0',      // primary accent & CTA
        'turquoise-dark': '#6BB6D6', // hover state for turquoise
        lightGrey: '#F6F6F6',      // card backgrounds → .bg-light-grey
        cardWhite: '#FFFFFF',      // card headers/modals → .bg-card-white
        textPrimary: '#0D1B2A',    // headings → .text-text-primary
        textSecondary: '#333333',  // body text → .text-text-secondary
        
        // Extended palette for dark mode and variations
        midnight: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
          950: '#0D1B2A', // Primary midnight
        },
        turquoise: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#89CFF0', // Primary turquoise
          500: '#14b8a6',
          600: '#6BB6D6', // turquoise-dark
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        lightGrey: {
          50: '#F6F6F6', // Primary lightGrey
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
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
      borderWidth: {
        '0.5': '0.5px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
    corePlugins: {
      ringColor: true,
    },
  },
  plugins: [],
};
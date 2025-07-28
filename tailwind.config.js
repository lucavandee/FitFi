/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0D1B2A',
          50: '#E8F4FD',
          100: '#D1E9FB',
          200: '#A3D3F7',
          300: '#75BDF3',
          400: '#47A7EF',
          500: '#1991EB',
          600: '#147BC6',
          700: '#0F65A1',
          800: '#0A4F7C',
          900: '#0D1B2A'
        },
        accent: {
          DEFAULT: '#0ea5e9', // Improved contrast ratio
          50: '#F0FBFF',
          100: '#E1F7FF',
          200: '#C3EFFF',
          300: '#A5E7FF',
          400: '#87DFFF',
          500: '#0ea5e9',
          600: '#6BB7D8',
          700: '#4D9FC0',
          800: '#2F87A8',
          900: '#116F90'
        },
        surface: {
          DEFAULT: '#FFFFFF',
          light: '#F6F6F6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif']
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        }
      }
    },
  },
  plugins: [],
}
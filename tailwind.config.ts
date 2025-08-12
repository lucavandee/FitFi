import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#0D1B2A',
        turquoise: '#89CFF0',
        brand: {
          primary: '#0D1B2A',
          accent: '#89CFF0',
        },
      },
      borderRadius: {
        '2xl': '1.25rem',
      },
      boxShadow: {
        soft: '0 6px 24px rgba(13,27,42,0.06)',
        xl: '0 20px 40px rgba(13,27,42,0.12)',
      },
      container: {
        center: true,
        padding: '1rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
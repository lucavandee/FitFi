import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'montserrat': ['Montserrat', 'system-ui', 'sans-serif'],
        'lato': ['Lato', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Design tokens mapping - sync met tokens.css
        'bg': 'var(--color-bg)',
        'surface': 'var(--color-surface)',
        'text': 'var(--color-text)',
        'muted': 'var(--color-muted)',
        'primary': 'var(--color-primary)',
        'accent': 'var(--color-accent)',
        'border': 'var(--color-border)',
        'success': 'var(--color-success)',
        'warning': 'var(--color-warning)',
        'danger': 'var(--color-danger)',
        // FitFi primaire CTA kleuren
        'ff-primary-600': 'var(--ff-color-primary-600)',
        'ff-primary-700': 'var(--ff-color-primary-700)',
      },
      borderRadius: {
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      boxShadow: {
        'soft': 'var(--shadow-soft)',
        'ring': 'var(--shadow-ring)',
      },
    },
  },
  plugins: [],
};

export default config;
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Montserrat', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial'],
        sans: ['Lato', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'Apple Color Emoji', 'Segoe UI Emoji'],
      },
      borderRadius: {
        lg: 'var(--ff-radius-lg)',
        xl: 'var(--ff-radius-xl)',
        '2xl': 'var(--ff-radius-2xl)',
      },
      boxShadow: {
        soft: 'var(--ff-shadow-soft)',
      },
      colors: {
        bg: 'var(--ff-color-bg)',
        surface: 'var(--ff-color-surface)',
        text: 'var(--ff-color-text)',
        muted: 'var(--ff-color-muted)',
        primary: 'var(--ff-color-primary)',
      },
    },
  },
  safelist: [
    'focus-visible',
    'sr-only',
    'focus:not-sr-only',
  ],
  corePlugins: {
    preflight: true,
  },
};
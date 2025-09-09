/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: { extend: {} },
  plugins: [],
      colors: {
        primary: {
          DEFAULT: 'var(--ff-color-primary)',
          600: 'var(--ff-color-primary-600)',
          700: 'var(--ff-color-primary-700)',
        },
        bg: 'var(--ff-color-bg)',
        surface: 'var(--ff-color-surface)',
        border: 'var(--ff-color-border)',
        muted: 'var(--ff-color-muted)',
        text: 'var(--ff-color-text)',
        accent: 'var(--ff-color-accent)',
        success: 'var(--ff-color-success)',
        warning: 'var(--ff-color-warning)',
        danger: 'var(--ff-color-danger)',
      },
      borderRadius: {
        xs: 'var(--ff-radius-xs)',
        sm: 'var(--ff-radius-sm)',
        md: 'var(--ff-radius-md)',
        lg: 'var(--ff-radius-lg)',
        xl: 'var(--ff-radius-xl)',
      },
      boxShadow: {
        sm: 'var(--ff-shadow-sm)',
        md: 'var(--ff-shadow-md)',
        lg: 'var(--ff-shadow-lg)',
      },
      spacing: {
        1: 'var(--ff-space-1)',
        2: 'var(--ff-space-2)',
        3: 'var(--ff-space-3)',
        4: 'var(--ff-space-4)',
        5: 'var(--ff-space-5)',
        6: 'var(--ff-space-6)',
        8: 'var(--ff-space-8)',
        10: 'var(--ff-space-10)',
        12: 'var(--ff-space-12)',
      },
      fontFamily: {
        sans: 'var(--ff-font-sans)',
      },
};

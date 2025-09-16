/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  safelist: [
    'fixed','inset-0','right-6','rounded-xl','rounded-2xl','rounded-full',
    'shadow-lg','border','text-sm','text-lg','max-w-md','overflow-hidden',
    'z-[2147483647]','px-5','py-4','pb-3','pt-1','space-y-3','gap-2','flex','items-end','justify-end'
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { xl: "1200px", "2xl": "1400px" }
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--ff-color-primary)",
          600: "var(--ff-color-primary-600)",
          700: "var(--ff-color-primary-700)"
        },
        bg: "var(--ff-color-bg)",
        surface: "var(--ff-color-surface)",
        border: "var(--ff-color-border)",
        text: "var(--ff-color-text)",
        muted: "var(--ff-color-muted)",
        success: "var(--ff-color-success)",
        warning: "var(--ff-color-warning)",
        danger: "var(--ff-color-danger)"
      },
      borderRadius: {
        xs: "var(--ff-radius-xs)",
        sm: "var(--ff-radius-sm)",
        md: "var(--ff-radius-md)",
        lg: "var(--ff-radius-lg)",
        xl: "var(--ff-radius-xl)"
      },
      boxShadow: {
        sm: "var(--ff-shadow-sm)",
        md: "var(--ff-shadow-md)",
        lg: "var(--ff-shadow-lg)"
      },
      fontFamily: {
        sans: ["var(--ff-font-sans)"]
      },
      fontSize: {
        xs: "var(--ff-text-xs)",
        sm: "var(--ff-text-sm)",
        base: "var(--ff-text-base)",
        md: "var(--ff-text-md)",
        lg: "var(--ff-text-lg)",
        xl: "var(--ff-text-xl)",
        "2xl": "var(--ff-text-2xl)",
        "3xl": "var(--ff-text-3xl)"
      }
    }
  },
  plugins: []
};
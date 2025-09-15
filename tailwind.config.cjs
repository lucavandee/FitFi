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
        // Match de tokens (—color-*)
        primary: {
          DEFAULT: "var(--color-primary)",
          600: "var(--ff-color-primary-600)",
          700: "var(--ff-color-primary-700)"
        },
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        text: "var(--color-text)",
        "text-dark": "var(--color-text)",   // tbv utilities/typography.css
        muted: "var(--color-muted)",
        accent: "var(--color-accent)",
        border: "var(--color-border)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)"
      },
      fontFamily: {
        heading: ["Montserrat", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["Lato", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Lato", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      borderRadius: {
        xs: "var(--radius-xs, 8px)",
        sm: "var(--radius-sm, 12px)",
        md: "var(--radius-md, 14px)",
        lg: "var(--radius-lg, 16px)",
        xl: "var(--radius-xl, 20px)"
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        ring: "var(--shadow-ring)"
      },
      ringColor: {
        brand: "var(--ff-color-primary-600)"
      },
      ringOffsetColor: {
        surface: "var(--color-surface)"
      }
    }
  },
  plugins: []
};
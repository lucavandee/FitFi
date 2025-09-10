/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}"
  ],
  safelist: [
    // Launcher container + button
    "fixed","right-6","pointer-events-none","rounded-full","h-14","w-14","p-0",
    "shadow-lg","pointer-events-auto","z-[10000]","z-[2147483647]"
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
        muted: "var(--ff-color-muted)",
        text: "var(--ff-color-text)",
        accent: "var(--ff-color-accent)",
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
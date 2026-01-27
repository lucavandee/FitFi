// /tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    // Override default spacing to enforce 8px grid
    spacing: {
      px: '1px',
      0: '0',
      0.5: '0.125rem',  // 2px - rarely used
      1: '0.25rem',     // 4px - tight spacing only
      2: '0.5rem',      // 8px ✅
      3: '0.75rem',     // 12px ✅
      4: '1rem',        // 16px ✅
      5: '1.25rem',     // 20px ✅
      6: '1.5rem',      // 24px ✅
      7: '1.75rem',     // 28px ✅
      8: '2rem',        // 32px ✅
      10: '2.5rem',     // 40px ✅
      12: '3rem',       // 48px ✅
      14: '3.5rem',     // 56px ✅
      16: '4rem',       // 64px ✅
      20: '5rem',       // 80px ✅
      24: '6rem',       // 96px ✅
      28: '7rem',       // 112px ✅
      32: '8rem',       // 128px ✅
    },
    extend: {
      colors: {
        // Base colors
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        text: "var(--color-text)",
        muted: "var(--color-muted)",
        border: "var(--color-border)",

        // Primary (Brand Taupe) - Full scale
        primary: {
          25: "var(--ff-color-primary-25)",
          50: "var(--ff-color-primary-50)",
          100: "var(--ff-color-primary-100)",
          200: "var(--ff-color-primary-200)",
          300: "var(--ff-color-primary-300)",
          400: "var(--ff-color-primary-400)",
          500: "var(--ff-color-primary-500)",  // Base
          600: "var(--ff-color-primary-600)",  // Hover
          700: "var(--ff-color-primary-700)",  // CTA (AA compliant)
          800: "var(--ff-color-primary-800)",
          900: "var(--ff-color-primary-900)",
          DEFAULT: "var(--ff-color-primary-500)",
        },

        // Accent - Full scale
        accent: {
          50: "var(--ff-color-accent-50)",
          100: "var(--ff-color-accent-100)",
          200: "var(--ff-color-accent-200)",
          300: "var(--ff-color-accent-300)",
          400: "var(--ff-color-accent-400)",
          500: "var(--ff-color-accent-500)",
          600: "var(--ff-color-accent-600)",
          700: "var(--ff-color-accent-700)",
          800: "var(--ff-color-accent-800)",
          900: "var(--ff-color-accent-900)",
          DEFAULT: "var(--ff-color-accent-300)",
        },

        // Status colors - Full scales
        success: {
          50: "var(--ff-color-success-50)",
          100: "var(--ff-color-success-100)",
          200: "var(--ff-color-success-200)",
          300: "var(--ff-color-success-300)",
          400: "var(--ff-color-success-400)",
          500: "var(--ff-color-success-500)",
          600: "var(--ff-color-success-600)",
          700: "var(--ff-color-success-700)",
          800: "var(--ff-color-success-800)",
          900: "var(--ff-color-success-900)",
          DEFAULT: "var(--color-success)",
        },
        warning: {
          50: "var(--ff-color-warning-50)",
          600: "var(--ff-color-warning-600)",
          DEFAULT: "var(--color-warning)",
        },
        danger: {
          50: "var(--ff-color-danger-50)",
          100: "var(--ff-color-danger-100)",
          200: "var(--ff-color-danger-200)",
          300: "var(--ff-color-danger-300)",
          400: "var(--ff-color-danger-400)",
          500: "var(--ff-color-danger-500)",
          600: "var(--ff-color-danger-600)",
          700: "var(--ff-color-danger-700)",
          800: "var(--ff-color-danger-800)",
          900: "var(--ff-color-danger-900)",
          DEFAULT: "var(--color-danger)",
        },

        // Neutral/Gray scale
        gray: {
          50: "var(--ff-color-neutral-50)",
          100: "var(--ff-color-neutral-100)",
          200: "var(--ff-color-neutral-200)",
          300: "var(--ff-color-neutral-300)",
          400: "var(--ff-color-neutral-400)",
          500: "var(--ff-color-neutral-500)",
          600: "var(--ff-color-neutral-600)",
          700: "var(--ff-color-neutral-700)",
          800: "var(--ff-color-neutral-800)",
          900: "var(--ff-color-neutral-900)",
        },

        // CTA colors
        cta: {
          50: "var(--ff-cta-50)",
          100: "var(--ff-cta-100)",
          200: "var(--ff-cta-200)",
          300: "var(--ff-cta-300)",
          400: "var(--ff-cta-400)",
          500: "var(--ff-cta-500)",
          600: "var(--ff-cta-600)",
          700: "var(--ff-cta-700)",
          800: "var(--ff-cta-800)",
          900: "var(--ff-cta-900)",
          DEFAULT: "var(--ff-cta-500)",
        },
      },

      fontFamily: {
        heading: ["Montserrat", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["Lato", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Lato", "ui-sans-serif", "system-ui", "sans-serif"], // Default
      },

      fontSize: {
        // Our typography scale (enforced)
        'xs': ['0.75rem', { lineHeight: '1.4' }],      // 12px - Caption
        'sm': ['0.875rem', { lineHeight: '1.5' }],     // 14px - Body Small
        'base': ['1rem', { lineHeight: '1.6' }],       // 16px - Body
        'lg': ['1.125rem', { lineHeight: '1.6' }],     // 18px - Body Large
        'xl': ['1.25rem', { lineHeight: '1.4' }],      // 20px - H4
        '2xl': ['1.5rem', { lineHeight: '1.3' }],      // 24px - H3
        '3xl': ['2rem', { lineHeight: '1.25' }],       // 32px - H2
        '4xl': ['2.5rem', { lineHeight: '1.2' }],      // 40px - H1
        '5xl': ['3.5rem', { lineHeight: '1.1' }],      // 56px - Display
      },

      boxShadow: {
        // Only 2 shadows allowed
        soft: "var(--shadow-soft)",
        ring: "var(--shadow-ring)",
        // Override Tailwind defaults to prevent misuse
        sm: "var(--shadow-soft)",    // Redirect to soft
        md: "var(--shadow-soft)",    // Redirect to soft
        lg: "var(--shadow-soft)",    // Redirect to soft
        xl: "var(--shadow-soft)",    // Redirect to soft
        '2xl': "var(--shadow-soft)", // Redirect to soft
      },

      borderRadius: {
        lg: "var(--radius-lg)",      // 1rem (16px)
        xl: "var(--radius-xl)",      // 1.25rem (20px) - BUTTONS
        "2xl": "var(--radius-2xl)",  // 1.5rem (24px)
      },

      minHeight: {
        // Standard component heights
        'button': '48px',      // Standard button/input
        'button-sm': '40px',   // Small button
        'button-icon': '44px', // Icon-only button
      },

      maxWidth: {
        'container': '72rem',  // 1152px - Standard container
      },
    },
  },
  plugins: [],
} satisfies Config;
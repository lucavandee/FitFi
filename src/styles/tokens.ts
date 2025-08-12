/**
 * FitFi Design System Tokens
 * Apple meets Lululemon meets OpenAI aesthetic
 */

// Brand Colors - FitFi Core Palette
export const colors = {
  // Primary Brand Colors
  midnight: {
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
  
  turquoise: {
    DEFAULT: '#89CFF0',
    50: '#F0FBFF',
    100: '#E1F7FF',
    200: '#C3EFFF',
    300: '#A5E7FF',
    400: '#87DFFF',
    500: '#89CFF0',
    600: '#6BB7D8',
    700: '#4D9FC0',
    800: '#2F87A8',
    900: '#116F90'
  },
  
  // Neutral Grays
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827'
  },
  
  // Surface Colors
  white: '#FFFFFF',
  lightGray: '#F6F6F6',
  
  // Semantic Colors
  success: {
    50: '#F0FDF4',
    500: '#22C55E',
    600: '#16A34A'
  },
  warning: {
    50: '#FFFBEB',
    500: '#F59E0B',
    600: '#D97706'
  },
  error: {
    50: '#FEF2F2',
    500: '#EF4444',
    600: '#DC2626'
  }
} as const;

// Border Radius
export const radius = {
  none: '0',
  sm: '0.375rem',    // 6px
  md: '0.5rem',      // 8px
  lg: '0.75rem',     // 12px
  xl: '1rem',        // 16px
  '2xl': '1.5rem',   // 24px - Default voor kaarten
  '3xl': '2rem',     // 32px
  full: '9999px'
} as const;

// Shadows
export const shadows = {
  soft: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  card: '0 8px 30px rgba(0, 0, 0, 0.06)',
  glass: '0 8px 32px rgba(31, 38, 135, 0.37)'
} as const;

// Spacing Scale (8px base)
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  40: '10rem',    // 160px
  48: '12rem',    // 192px
  56: '14rem',    // 224px
  64: '16rem'     // 256px
} as const;

// Typography
export const typography = {
  fontFamily: {
    heading: ['Montserrat', 'system-ui', 'sans-serif'],
    body: ['Lato', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'monospace']
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }]
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  }
} as const;

// Transitions
export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  spring: '300ms cubic-bezier(0.34, 1.56, 0.64, 1)'
} as const;

// Z-Index Scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800
} as const;

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

// Animation Presets
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  }
} as const;

// Component Variants
export const variants = {
  button: {
    primary: {
      bg: colors.turquoise.DEFAULT,
      text: colors.midnight.DEFAULT,
      hover: colors.turquoise[600],
      shadow: shadows.medium
    },
    secondary: {
      bg: colors.midnight.DEFAULT,
      text: colors.white,
      hover: colors.midnight[800],
      shadow: shadows.soft
    },
    outline: {
      bg: 'transparent',
      text: colors.turquoise.DEFAULT,
      border: colors.turquoise.DEFAULT,
      hover: colors.turquoise.DEFAULT
    },
    ghost: {
      bg: 'transparent',
      text: colors.gray[700],
      hover: colors.gray[100]
    }
  },
  card: {
    default: {
      bg: colors.white,
      shadow: shadows.card,
      radius: radius['2xl'],
      padding: spacing[6]
    },
    elevated: {
      bg: colors.white,
      shadow: shadows.xl,
      radius: radius['3xl'],
      padding: spacing[8]
    },
    glass: {
      bg: 'rgba(255, 255, 255, 0.8)',
      shadow: shadows.glass,
      radius: radius['2xl'],
      backdrop: 'blur(12px)'
    }
  }
} as const;

// Export default theme object
export const theme = {
  colors,
  radius,
  shadows,
  spacing,
  typography,
  transitions,
  zIndex,
  breakpoints,
  animations,
  variants
} as const;

export default theme;
/**
 * Design System Theme - Extracted from Figma design tokens (Rideshare UI Kit)
 * 
 * Provides color palette, radii, spacing, and semantic tokens for consistent
 * usage across components and screens. Use with Tailwind classes where possible
 * or import constants for dynamic styles / dark mode logic.
 */

export const colors = {
  // Brand
  primary: '#4c5df9',
  primaryDark: '#3b4dd9',

  // Blues (from Figma Blue scale)
  blue: {
    20: '#dbdffe',
    40: '#b7befd',
    60: '#949efb',
    80: '#707dfa',
    100: '#4c5df9',
  },

  // Oranges (from Figma)
  orange: {
    20: '#feebdd',
    40: '#fcd7bb',
    60: '#fbc398',
    80: '#f9af76',
    100: '#f89b54',
  },

  // Success / Alert / Danger
  success: '#38c976',
  alert: '#ffa23a',
  danger: '#fe5050',

  // Dark surfaces (Dark Version + Gary Dark from Figma)
  dark: {
    bg: '#121826',           // 1st fill
    surface: '#1e293b',      // 2nd fill / surfaces
    surfaceAlt: '#161a21',   // Gary Dark/100
    border: '#334155',
  },

  // Light surfaces
  light: {
    bg: '#f8fafc',
    surface: '#ffffff',
    inputBg: '#f1f3f5',
    border: '#e5e7eb',
  },

  // Grays (Gary scale from Figma)
  gray: {
    20: '#ececef',
    40: '#d9d9df',
    60: '#c5c7d0',
    80: '#b2b4c0',
    100: '#9fa1b0',
  },

  // Gary Dark scale
  grayDark: {
    20: '#d0d1d3',
    40: '#a2a3a6',
    60: '#73767a',
    80: '#45484d',
    100: '#161a21',
  },

  // Text colors
  text: {
    primary: '#1c1f2a',
    secondary: '#6b7280',
    muted: '#90959e',
    inverse: '#ffffff',
    onDark: '#ffffff',
  },

  // Common
  white: '#ffffff',
  black: '#000000',
} as const

export const radii = {
  sm: '8px',
  md: '12px',   // common button/input
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  full: '9999px',
} as const

export const spacing = {
  // Used for consistent padding/gaps in components
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
} as const

export const typography = {
  // Reference for Figma text styles (actual font in app uses Inter/Poppins fallback)
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  fontFamilyHeading: "'Poppins', 'Inter', system-ui, sans-serif",
  // Sizes used in screens
  sizes: {
    xs: '12px',
    sm: '14px',
    base: '15px',
    md: '16px',
    lg: '17px',
    xl: '18px',
    '2xl': '20px',
    '3xl': '32px',
    '4xl': '52px',
  },
} as const

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  card: '0 1px 3px rgba(0, 0, 0, 0.08)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
} as const

// Semantic tokens for easy dark/light switching in components
export const getSemanticColors = (isDark: boolean) => ({
  bg: isDark ? colors.dark.bg : colors.light.bg,
  surface: isDark ? colors.dark.surface : colors.light.surface,
  inputBg: isDark ? colors.dark.surface : colors.light.inputBg,
  text: isDark ? colors.text.inverse : colors.text.primary,
  textSecondary: isDark ? 'rgba(255,255,255,0.7)' : colors.text.secondary,
  border: isDark ? colors.dark.border : colors.light.border,
  primary: colors.primary,
})

export type ColorKey = keyof typeof colors
export type RadiusKey = keyof typeof radii

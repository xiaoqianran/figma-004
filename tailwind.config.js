/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // === Figma design tokens - Rideshare UI Kit (synced with src/theme.ts) ===
        primary: '#4c5df9',
        'primary-dark': '#3b4dd9',

        // Dark mode surfaces
        'dark-bg': '#121826',
        'dark-surface': '#1e293b',
        'dark-surface-alt': '#161a21',
        'gary-dark': '#161a21',

        // Light surfaces
        'light-bg': '#f8fafc',
        'input-bg': '#f1f3f5',

        // Blue scale
        'blue-20': '#dbdffe',
        'blue-40': '#b7befd',
        'blue-60': '#949efb',
        'blue-80': '#707dfa',
        'blue-100': '#4c5df9',

        // Grays
        'gray-20': '#ececef',
        'gray-40': '#d9d9df',
        'gray-60': '#c5c7d0',
        'gray-80': '#b2b4c0',
        'gray-100': '#9fa1b0',

        // Semantic / status
        success: '#38c976',
        alert: '#ffa23a',
        danger: '#fe5050',
        orange: '#f89b54',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.08)',
        'card-dark': '0 1px 3px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
}

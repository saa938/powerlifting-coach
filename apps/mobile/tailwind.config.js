/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Liftly design system — dark, black + electric-blue.
        iron: {
          900: '#0A0A0B',
          800: '#131316',
          700: '#1C1C21',
          600: '#26262D',
          500: '#3A3A44',
        },
        chalk: {
          DEFAULT: '#F5F6F8',
          muted: '#A1A1AA',
          faint: '#6B6B73',
        },
        blood: {
          DEFAULT: '#2F6BFF',
          bright: '#4C86FF',
          dim: '#1E3A8A',
        },
        green: { signal: '#22C55E' },
        amber: { signal: '#F59E0B' },
        red: { signal: '#EF4444' },
      },
      fontFamily: {
        display: ['SpaceGrotesk_600SemiBold'],
        'display-bold': ['SpaceGrotesk_700Bold'],
        sans: ['Inter_400Regular'],
        'sans-medium': ['Inter_500Medium'],
        'sans-semibold': ['Inter_600SemiBold'],
      },
    },
  },
  plugins: [],
};

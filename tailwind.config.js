/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      'sans': ['"DynaPuff"', 'system-ui'],
      'dynapuff': ['"DynaPuff"', 'system-ui'],
      'montserrat': ['"Montserrat"', 'sans-serif'],
    },
    extend: {
      colors: {
        'primary': {
          50: '#f0f8ff',
          100: '#e1f2ff',
          200: '#c3e5ff',
          300: '#a5d8ff',
          400: '#87cbff',
          500: '#3da8ff',
          600: '#2d96e6',
          700: '#1e84cc',
          800: '#0f72b3',
          900: '#006099',
        },
        'secondary': {
          50: '#fffbf0',
          100: '#fff7e1',
          200: '#ffefc3',
          300: '#ffe7a5',
          400: '#ffdf87',
          500: '#ffb800',
          600: '#e6a600',
          700: '#cc9400',
          800: '#b38200',
          900: '#997000',
        },
        'success': {
          500: '#6b8e23', // Warmer, more muted green (olive drab)
          600: '#556b1d',
        },
        'error': {
          500: '#8b0000', // Maroon-like red
          600: '#660000',
        }
      }
    },
  },
  plugins: [],
}

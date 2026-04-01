/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          300: '#e4c97a',
          400: '#d4a853',
          500: '#c9a84c',
          600: '#a8872a',
        },
        navy: {
          800: '#1a1a30',
          900: '#0f0f1e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'selector',
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#737DFE',
          700: '#5c64d6',
        },
      },
    },
  },
  plugins: [],
};

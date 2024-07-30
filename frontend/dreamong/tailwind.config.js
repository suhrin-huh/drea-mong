/** @type {import('tailwindcss').Config} */
export default {
  darkmode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
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

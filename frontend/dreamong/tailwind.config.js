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
      backgroundImage: {
        'tag-gradient': 'linear-gradient(180deg, #ECE8FF 8%, #F9F8FF 55%, #FCFBFF 76%, #FFFFFF 100%)',
      },
    },
  },
  plugins: [],
};

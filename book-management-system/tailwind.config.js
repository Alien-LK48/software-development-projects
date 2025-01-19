/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./**/*.{html,js}', './node_modules/flowbite/**/*.js'],
  theme: {
    extend: {
      fontFamily: {
        lato: ['Lato', 'sans-serif', 'SiyamRupali'],
      },
      keyframes: {
        loader: {
          '0%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(180deg)' },
          '50%': { transform: 'rotate(180deg)' },
          '75%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'loader-inner': {
          '0%': { height: '0%' },
          '25%': { height: '0%' },
          '50%': { height: '100%' },
          '75%': { height: '100%' },
          '100%': { height: '0%' },
        },
      },
      animation: {
        loader: 'loader 2s infinite ease',
        'loader-inner': 'loader-inner 2s infinite ease-in',
      },
    },
  },
  plugins: [
    require('daisyui'),
    require('flowbite/plugin'),
  ],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: '#36454F',
        salmon: '#FA8072',
      },
      fontFamily: {
        'dosis': ['Dosis', 'sans-serif'],
        'bitter': ['Bitter', 'serif'],
      },
    },
  },
  plugins: [],
}


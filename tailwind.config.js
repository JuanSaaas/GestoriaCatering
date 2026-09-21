/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F7F2ED',
        'paper-2': '#FFFDF9',
        ink: '#2A2622',
        'ink-soft': '#6B5F52',
        wine: '#7A1F2B',
        'wine-dark': '#54151E',
        gold: '#AE8148',
        'gold-light': '#C9A876',
        olive: '#4B5E45',
      },
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

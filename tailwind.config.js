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
        // Paleta de la interfaz del CRM
        surface: '#F5F4F1',
        line: '#E6E2DB',
      },
      boxShadow: {
        card: '0 1px 2px rgba(36,27,22,0.05), 0 1px 3px rgba(36,27,22,0.04)',
        'card-hover': '0 4px 12px rgba(36,27,22,0.10)',
        bar: '0 1px 0 rgba(36,27,22,0.06), 0 4px 16px rgba(36,27,22,0.05)',
      },
      keyframes: {
        'slide-in': { from: { transform: 'translateX(24px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
      },
      animation: {
        'slide-in': 'slide-in 0.22s ease-out',
        'fade-in': 'fade-in 0.18s ease-out',
      },
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

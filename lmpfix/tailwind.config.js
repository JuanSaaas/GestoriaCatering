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
        // Paleta de la interfaz del CRM: blanco / negro / aviso / espera
        surface: '#F4F4F5',
        line: '#E5E5E5',
        wait: '#EAB308',
        warning: '#DC2626',
        success: '#16A34A',
        info: '#2563EB',
      },
      boxShadow: {
        card: '0 1px 2px rgba(10,10,10,0.05), 0 1px 3px rgba(10,10,10,0.04)',
        'card-hover': '0 4px 12px rgba(10,10,10,0.10)',
        bar: '0 1px 0 rgba(10,10,10,0.06), 0 4px 16px rgba(10,10,10,0.05)',
      },
      keyframes: {
        'slide-in': { from: { transform: 'translateX(24px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        kenburns: { from: { transform: 'scale(1)' }, to: { transform: 'scale(1.06)' } },
        'bounce-slow': { '0%, 100%': { transform: 'translate(-50%, 0)' }, '50%': { transform: 'translate(-50%, 8px)' } },
      },
      animation: {
        'slide-in': 'slide-in 0.22s ease-out',
        'fade-in': 'fade-in 0.18s ease-out',
        kenburns: 'kenburns 8s ease-out forwards',
        'bounce-slow': 'bounce-slow 2.2s ease-in-out infinite',
      },
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

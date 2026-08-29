/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#0a0a0f',
        'brand-cyan': '#00d4ff',
        'brand-violet': '#7c3aed',
        'brand-green': '#00ff87',
        'brand-red': '#ff3b5c',
        'card-bg': '#13131a',
        'card-border': '#1e1e2e',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

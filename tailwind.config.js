/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        body: ['Poppins', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'serif'],
        script: ['"Pinyon Script"', 'cursive'], // ganti ke "Shelley Script" jika berlisensi terpasang
        serif2: ['"EB Garamond"', 'serif'],
      },
      colors: {
        burgundy: { deep: '#4A0E22', mid: '#7A2040' },
        gold: { warm: '#C9A227', light: '#E8C458' },
        cream: '#F8F3EC',
        ink: '#2C0E1A', // almost black
      },
    },
  },
  plugins: [],
}

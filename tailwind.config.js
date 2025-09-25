/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ebook-bg-black': '#000000',
        'ebook-text-black': '#000000',
        'ebook-bg-white': '#ffffff',
        'ebook-text-white': '#ffffff',
        'ebook-bg-yellow': '#ffff99',
        'ebook-text-yellow': '#000000',
      },
      fontFamily: {
        'serif': ['serif'],
        'sans': ['sans-serif'],
        'mono': ['monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [],
}

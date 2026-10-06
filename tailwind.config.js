/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#243c2c',
        lime: '#d4f884',
        forest: {
          bg: '#102a20',
          light: '#e7ede1',
        },
        green: {
          primary: '#729844',
          light: '#d8e7c6',
          dark: '#253629',
        },
      },
      fontFamily: {
        sans: ['Be Vietnam Pro', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

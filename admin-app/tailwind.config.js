/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rasoi: {
          green: '#1F4D3A',
          dark: '#143326',
          lightGreen: '#EBF3EE',
          gold: '#F2B01E',
          goldDark: '#D49510',
          goldLight: '#FEF6E4',
          cream: '#F7F9F3',
          red: '#C8372D',
          ok: '#2e7d4f',
          mut: '#5d6b62',
          line: '#dce3d6'
        }
      },
      fontFamily: {
        heading: ['"Baloo 2"', 'system-ui', 'sans-serif'],
        body: ['Hind', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}

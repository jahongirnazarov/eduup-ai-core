/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.html",
    "./src/**/*.ts",
    "./src/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        chalkboard: {
          dark: '#1a3a1a',
          medium: '#2d5a2d',
          light: '#3d7a3d'
        },
        bluebook: {
          blue: '#1a4480',
          light: '#4a90e2',
          background: '#f5f5f5'
        },
        ielts: {
          red: '#c8102e',
          gray: '#f8f9fa',
          dark: '#2c3e50'
        }
      },
      fontFamily: {
        chalk: ['"Chalkboard SE"', '"Comic Sans MS"', cursive],
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}

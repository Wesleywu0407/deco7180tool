/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1D9E75',
        'primary-dark': '#178a63',
        'primary-light': '#e6f7f2',
        'tag-blue': '#3B82F6',
        'tag-purple': '#7C3AED',
        'tag-amber': '#D97706',
        'tag-pink': '#EC4899',
        'tag-green': '#10B981',
        'summary-bg': '#F5F5F0',
        'focus-card': '#1D9E75',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

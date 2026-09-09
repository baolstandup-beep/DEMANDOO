/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        demandoo: {
          50: '#f6faf9',
          100: '#e6f5f4',
          200: '#c2e9e6',
          300: '#8ed6d1',
          400: '#4fbab4',
          500: '#079c94', // Main Demandoo V4 Teal (#079C94)
          600: '#056b66', // Dark Teal (#056B66)
          700: '#065753',
          800: '#094643',
          900: '#0c3b39',
          dark: '#102a43', // Navy Blue (#102A43)
          card: '#ffffff',
          accent: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(16, 185, 129, 0.08)',
        'elevated': '0 10px 30px -5px rgba(15, 23, 42, 0.08)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'pulse-subtle': 'pulseSubtle 3s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
      },
    },
  },
  plugins: [],
}

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
          50: '#eef8f6',
          100: '#d5f2ec',
          200: '#aee4d9',
          300: '#76d0c0',
          400: '#3eb8a4',
          500: '#008577', // Brand Logo Teal (#008577)
          600: '#006d62',
          700: '#00574e',
          800: '#03453f',
          900: '#053934',
          dark: '#0A1E4A', // Brand Deep Navy Blue
          blue: {
            50: '#eef4ff',
            100: '#dce8fe',
            200: '#c0d6fe',
            300: '#94bdfc',
            400: '#609afa',
            500: '#183e94', // Brand Logo Blue (#183E94)
            600: '#13327d',
            700: '#0f2766',
            800: '#0d2153',
            900: '#0a1a42',
            950: '#060f29',
          },
          teal: {
            50: '#eef8f6',
            100: '#d5f2ec',
            200: '#aee4d9',
            300: '#76d0c0',
            400: '#3eb8a4',
            500: '#008577', // Brand Logo Teal (#008577)
            600: '#006d62',
            700: '#00574e',
            800: '#03453f',
            900: '#053934',
          },
          card: '#ffffff',
          accent: '#f59e0b',
          'accent-glow': '#fbbf24',
        },
        brand: {
          blue: '#183e94',
          teal: '#008577',
          dark: '#0A1E4A',
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
        'float': 'float 6s ease-in-out infinite',
        'mesh': 'mesh 15s ease infinite',
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
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        mesh: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}

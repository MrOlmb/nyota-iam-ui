/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        sidebar: {
          background: 'hsl(0 0% 98%)',
          foreground: 'hsl(240 5.3% 26.1%)',
          primary: 'hsl(240 5.9% 10%)',
          'primary-foreground': 'hsl(0 0% 98%)',
          accent: 'hsl(240 4.8% 95.9%)',
          'accent-foreground': 'hsl(240 5.9% 10%)',
          border: 'hsl(220 13% 91%)',
          ring: 'hsl(217.2 91.2% 59.8%)',
        },
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-out': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out',
        'slide-out': 'slide-out 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
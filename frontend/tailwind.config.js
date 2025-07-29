/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#ede9fe',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        secondary: {
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
        },
        error: {
          100: '#fee2e2',
          600: '#dc2626',
        },
        warning: {
          100: '#fed7aa',
          600: '#d97706',
        },
        info: {
          100: '#dbeafe',
          600: '#2563eb',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
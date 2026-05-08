/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        surface: {
          base:   'rgb(var(--color-bg-base) / <alpha-value>)',
          card:   'rgb(var(--color-bg-surface) / <alpha-value>)',
          raised: 'rgb(var(--color-bg-raised) / <alpha-value>)',
          border: 'rgb(var(--color-bg-border) / <alpha-value>)',
        },
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 8px 2px rgba(99,179,237,0.15)' },
          '50%':       { opacity: '0.7', boxShadow: '0 0 20px 6px rgba(99,179,237,0.35)' },
        },
        'terminal-cursor': {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'pulse-glow':       'pulse-glow 2s ease-in-out infinite',
        'cursor-blink':     'terminal-cursor 1s step-end infinite',
        'spin-slow':        'spin-slow 8s linear infinite',
        'spin-reverse-med': 'spin-slow 5s linear infinite reverse',
        'spin-fast':        'spin-slow 3s linear infinite',
        'shimmer':          'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}

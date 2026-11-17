export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        cyber: {
          blue: '#0284c7',
          cyan: '#06b6d4',
          emerald: '#059669',
          amber: '#d97706',
          rose: '#e11d48',
          purple: '#9333ea',
        }
      },
      boxShadow: {
        'glow-brand': '0 4px 20px -2px rgba(124, 58, 237, 0.25)',
        'glow-cyan': '0 4px 20px -2px rgba(6, 182, 212, 0.25)',
        'glow-emerald': '0 4px 20px -2px rgba(5, 150, 105, 0.25)',
        'glow-rose': '0 4px 20px -2px rgba(225, 29, 72, 0.25)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
      }
    },
  },
  plugins: [],
}

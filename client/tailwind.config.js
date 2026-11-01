/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        noir: {
          950: '#06090e',
          900: '#0B0F19',
          850: '#101726',
          800: '#151F33',
          700: '#1E2D4A',
          600: '#2A3F66',
        },
        gold: {
          300: '#FDE047',
          400: '#F5D061',
          500: '#D4AF37',
          600: '#B89726',
          700: '#8C731A',
        },
      },
      fontFamily: {
        serif: ['Cinzel', 'Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(212, 175, 55, 0.25)',
        'noir-card': '0 10px 30px -10px rgba(0, 0, 0, 0.7)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#e6edf3',
          100: '#d4dbe0',
          200: '#cdd9e5',
          300: '#9da7b3',
          400: '#768390',
          500: '#484f58',
          600: '#30363d',
          700: '#21262d',
          800: '#161b22',
          900: '#0d1117',
        },
        gold: {
          50: '#faf6ee',
          100: '#f3e9d0',
          200: '#e0c486',
          300: '#d4b06a',
          400: '#c8a45c',
          500: '#b8924a',
          600: '#9c7a3c',
          700: '#7a5f30',
          800: '#5c4824',
          900: '#3e3018',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Sora', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

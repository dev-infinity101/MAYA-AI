/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: 'rgba(20, 20, 20, 0.6)',
        primary: '#00FFB2', // Neon Mint
        secondary: '#00C9FF', // Electric Blue
        text: {
            primary: '#FFFFFF',
            secondary: '#BFBFBF'
        }
      },
      fontFamily: {
        mono: ['"Geist Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #00FFB2 0deg, #00C9FF 180deg, #00FFB2 360deg)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}

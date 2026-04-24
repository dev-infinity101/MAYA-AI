/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background:        '#FFFCF5',
        surface:           '#FFFFFF',
        'surface-warm':    '#FEF3DC',
        'surface-sidebar': '#FEF8EE',
        primary:           '#C4610A',
        'primary-light':   '#F5A623',
        secondary:         '#057A55',
        text: {
          primary:   '#1C1007',
          secondary: '#6B5540',
          muted:     '#A08060',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans:    ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      keyframes: {
        'glow-move': {
          '0%':   { transform: 'translate(-50%, -50%) rotate(0deg)' },
          '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' },
        },
        'matrix-glitch-1': {
          '0%, 100%': { transform: 'translate(0)', opacity: '1' },
          '33%':      { transform: 'translate(-20px, -10px)', opacity: '0.85' },
          '66%':      { transform: 'translate(20px, 10px)', opacity: '1' },
        },
        'matrix-glitch-2': {
          '0%, 100%': { transform: 'translate(0)', opacity: '1' },
          '50%':      { transform: 'translate(15px, -20px)', opacity: '0.9' },
        },
        'slow-glitch': {
          '0%, 100%': { transform: 'translate(0) rotate(0deg) skew(0deg)', filter: 'brightness(1)' },
          '25%':      { transform: 'translate(-25px, 15px) rotate(1deg) skew(0.5deg)', filter: 'brightness(1.2)' },
          '50%':      { transform: 'translate(25px, -25px) rotate(-1deg) skew(-0.5deg)', filter: 'brightness(0.8)' },
          '75%':      { transform: 'translate(-15px, -15px) rotate(0.5deg) skew(0deg)', filter: 'brightness(1.15)' },
        },
        'rgb-split-r': {
          '0%, 100%': { transform: 'translate(0)' },
          '50%':      { transform: 'translate(-12px, 0)' },
        },
        'rgb-split-b': {
          '0%, 100%': { transform: 'translate(0)' },
          '50%':      { transform: 'translate(12px, 0)' },
        },
        'scanline-move': {
          '0%':   { top: '-100%' },
          '100%': { top: '100%' },
        },
        'noise-jitter': {
          '0%, 100%': { transform: 'translate(0,0)' },
          '10%':      { transform: 'translate(-1%,-1%)' },
          '20%':      { transform: 'translate(1%,1%)' },
          '30%':      { transform: 'translate(-2%,0%)' },
          '40%':      { transform: 'translate(2%,2%)' },
          '50%':      { transform: 'translate(-1%,1%)' },
          '60%':      { transform: 'translate(1%,-1%)' },
          '70%':      { transform: 'translate(0%,2%)' },
          '80%':      { transform: 'translate(-2%,-2%)' },
          '90%':      { transform: 'translate(1%,0%)' },
        },
        'pixel-flicker': {
          '0%, 100%': { opacity: '0.1' },
          '50%':      { opacity: '0.4' },
          '25%, 75%': { opacity: '0.2' },
        },
        'pixel-move': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%':  { transform: 'translate(var(--pixel-distort), calc(-1 * var(--pixel-distort)))' },
          '50%':  { transform: 'translate(calc(-1 * var(--pixel-distort)), var(--pixel-distort))' },
          '75%':  { transform: 'translate(var(--pixel-distort), var(--pixel-distort))' },
        },
      },
      animation: {
        'glow-move':       'glow-move 10s linear infinite',
        'matrix-glitch-1': 'matrix-glitch-1 0.15s ease-in-out infinite',
        'matrix-glitch-2': 'matrix-glitch-2 0.12s ease-in-out infinite',
        'slow-glitch':     'slow-glitch 1.5s ease-in-out infinite',
        'rgb-split-r':     'rgb-split-r 1.5s ease-in-out infinite',
        'rgb-split-b':     'rgb-split-b 1.5s ease-in-out infinite',
        'scanline-move':   'scanline-move 4s linear infinite',
        'noise-jitter':    'noise-jitter 0.1s steps(1) infinite',
        'pixel-flicker':   'pixel-flicker 0.15s steps(1) infinite',
        'pixel-move':      'pixel-move 0.15s steps(1) infinite',
      },
    },
  },
  plugins: [],
}

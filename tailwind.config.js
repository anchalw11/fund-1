/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'electric-blue': '#0066FF',
        'cyber-purple': '#7B2EFF',
        'neon-green': '#9B87DB',
        'subtle-electric': '#B3D9FF',
        'subtle-cyber': '#D4C7FF',
        'subtle-sage': '#C7E7C7',
        'deep-space': '#0A0E27',
      },
      fontFamily: {
        'heading': ['Rajdhani', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-reverse': 'float-reverse 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'float-reverse': {
          '0%': { transform: 'translateY(0px) rotate(-15deg)' },
          '50%': { transform: 'translateY(-10px) rotate(-20deg)' },
          '100%': { transform: 'translateY(0px) rotate(-15deg)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(155, 135, 219, 0.1)' },
          '100%': { boxShadow: '0 0 15px rgba(155, 135, 219, 0.15)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

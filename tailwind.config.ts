import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.ts'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], syne: ['Syne', 'sans-serif'], anton: ['Anton', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'], playfair: ['Playfair Display', 'serif'],
        space: ['Space Grotesk', 'sans-serif'], bungee: ['Bungee', 'cursive'], bebas: ['Bebas Neue', 'sans-serif'],
        righteous: ['Righteous', 'cursive'], cinzel: ['Cinzel', 'serif'], outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        studio: {
          950: '#090a0f', 900: '#0e1117', 850: '#131722', 800: '#1a1f2c', 700: '#282e3f',
          accent: '#6366f1', accentHover: '#4f46e5', glow: '#38bdf8',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

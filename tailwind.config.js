/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        nature: {
          50: '#f0fdf5',
          100: '#dcfce8',
          200: '#bbf7d1',
          300: '#86efad',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        ocean: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh': 'radial-gradient(at 40% 20%, hsla(160, 100%, 80%, 0.4) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(180, 100%, 85%, 0.4) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(140, 100%, 75%, 0.3) 0px, transparent 50%)',
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.15)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.15)',
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};

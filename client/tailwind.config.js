/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        situ: {
          950: '#070b12',
          900: '#0b1320',
          850: '#0f1b2d',
          800: '#15243b',
          700: '#1e3250',
          600: '#2b4772',
          500: '#3b629b',
          400: '#5a86c6',
          300: '#8baee2',
          200: '#bcd4f3',
          100: '#e3effc',
        },
        domain: {
          land: '#10b981',       // Emerald
          air: '#06b6d4',        // Cyan radar
          cyber: '#8b5cf6',      // Purple
          ew: '#f59e0b',         // Amber / EW disruption
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}

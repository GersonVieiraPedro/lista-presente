/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // 'title' chamará a Playfair, 'body' chamará a Montserrat
        title: ['var(--font-playfair)', 'serif'],
        body: ['var(--font-montserrat)', 'sans-serif'],
      },

      keyframes: {
        pulseScale: {
          '0%, 100%': { transform: 'scale(1)', opacity: 1 },
          '50%': { transform: 'scale(1.05)', opacity: 0.7 },
        },
      },
      animation: {
        pulseScale: 'pulseScale 1s ease-in-out infinite',
      },
    },
  },

  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF8FC', // Brighter base requested
        textPrimary: '#111827', // Stronger dark for text
        curvePink: '#DF8CBA',  // Logo Pink
        curvePurple: '#A675A2', // Logo Purple
        curveDark: '#1E1726',
        curveAction: '#D17AAB', // Added for pill buttons
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      backgroundImage: {
        'curve-gradient': 'linear-gradient(135deg, #DF8CBA 0%, #A675A2 100%)',
        'curve-dark-gradient': 'linear-gradient(135deg, #2D233F 0%, #171221 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.05)',
        'premium': '0px 15px 40px -10px rgba(166, 117, 162, 0.35)',
        'premium-hover': '0px 20px 50px -5px rgba(223, 140, 186, 0.45)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '3rem',
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      }
    },
  },
  plugins: [],
}

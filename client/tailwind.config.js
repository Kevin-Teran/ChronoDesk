module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Mantenemos tus colores personalizados
        light: {
          background: "#f8f7fc",
          card: "#ffffff",
          header: "#d3cce8",
          border: "#a594c7",
          primaryText: "#2a1d3d",
          secondaryText: "#4a3b6e",
          button: "#6a5a8f",
          hover: "#8c7ab6",
          urgent: "#ff8787",
        },
        dark: {
          background: "#36295e",
          card: "#423469",
          header: "#372a5f",
          border: "#382b60",
          primaryText: "#e0e0e0",
          secondaryText: "#b8a9d9",
          button: "#5d4a8c",
          hover: "#7f6ab6",
          urgent: "#ff6b6b",
        },
        brand: {
          main: "#423469",
          premium: "#ffd700",
          shadowLight: "#382a5f20",
          shadowDark: "#5d4a8c10",
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in': 'slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(-5px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'brand-light': '0 4px 14px 0 rgba(56, 42, 95, 0.12)',
        'brand-dark': '0 4px 14px 0 rgba(93, 74, 140, 0.06)',
      },
      backdropBlur: {
        sm: '4px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
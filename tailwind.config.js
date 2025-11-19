// tailwind.config.js
const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050816", // fondo profundo futurista
        foreground: "#f9fafb",

        card: "rgba(15,23,42,0.92)",
        cardBorder: "rgba(148,163,184,0.5)",

        muted: "#9ca3af",
        mutedForeground: "#9ca3af",

        accent: "#38bdf8", // azul cian elegante
        accentSoft: "rgba(56,189,248,0.12)",

        gold: "#e4c787",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        soft: "0 22px 70px rgba(15,23,42,0.6)",
        card: "0 18px 50px rgba(15,23,42,0.7)",
      },
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
        display: ["Sora", ...fontFamily.sans],
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#ffffff",
          fg: "#000000",
          primary: "#F9C51B",
          danger: "#D54F54",
          green: {
            50:"#f2f7f3",100:"#dfeee4",200:"#bddcc6",300:"#94c4a5",
            400:"#6dad86",500:"#4b906b",600:"#3b7457",700:"#2f5d47",800:"#274b3a",900:"#1f3c2f"
          },
          brown: {
            50:"#f7f3f0",100:"#efe6df",200:"#dfcfc0",300:"#c6aa92",
            400:"#a68066",500:"#8a654d",600:"#6e503e",700:"#5a4235",800:"#4a372d",900:"#3d2e26"
          }
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,.06)",
        inset: "inset 2px 2px 6px rgba(0,0,0,.06), inset -2px -2px 6px rgba(255,255,255,.7)"
      },
      borderRadius: { xl2: "1.25rem" }
    },
  },
  plugins: [],
};

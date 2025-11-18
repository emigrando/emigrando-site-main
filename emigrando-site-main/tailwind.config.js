// tailwind.config.mjs
import { fontFamily } from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f5f5f7",
        foreground: "#020617",
        card: "#ffffff",
        cardBorder: "#e2e8f0",
        muted: "#e5e7eb",
        mutedForeground: "#6b7280",
        accent: "#2563eb",
        accentSoft: "#dbeafe",
        danger: "#ef4444",
        success: "#22c55e",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        soft: "0 18px 60px rgba(15, 23, 42, 0.08)",
        card: "0 18px 40px rgba(15, 23, 42, 0.06)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "SF Pro Text",
          "SF Pro Display",
          ...fontFamily.sans,
        ],
      },
    },
  },
  plugins: [],
};

import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f8fafc",
          100: "#edf2f7",
          200: "#dbe4ee",
          300: "#c3d0df",
          400: "#8a97a8",
          500: "#5d6b7d",
          600: "#3f4c5d",
          700: "#253142",
          800: "#1a2230",
          900: "#101722",
          950: "#0a0e15",
        },
        lava: {
          50: "#fff1ee",
          100: "#ffdcd5",
          500: "#ef5a3c",
          600: "#d93d28",
          700: "#a8291d",
        },
        ionian: {
          50: "#eefbfb",
          100: "#d4f3f1",
          500: "#1b9aaa",
          600: "#107f8e",
          700: "#0b5f6c",
        },
        citrus: {
          100: "#fff3bf",
          400: "#f7c948",
          600: "#b7791f",
        },
        basil: {
          100: "#e4f5df",
          500: "#47a447",
          700: "#286f35",
        },
      },
      boxShadow: {
        soft: "0 12px 36px rgba(16, 23, 34, 0.10)",
      },
      opacity: {
        6: "0.06",
        8: "0.08",
        15: "0.15",
      },
      borderRadius: {
        card: "8px",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FAFAF7",
        ink: {
          DEFAULT: "#1C1B19",
          soft: "#514E48",
          faint: "#8B877E",
        },
        forest: {
          DEFAULT: "#2F4538",
          dark: "#22332A",
          light: "#3E5C4B",
        },
        brass: {
          DEFAULT: "#C08A3E",
          dark: "#A8752F",
          light: "#E4B978",
        },
        line: "#E7E3D9",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(28,27,25,0.04), 0 8px 24px -12px rgba(28,27,25,0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
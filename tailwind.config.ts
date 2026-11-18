import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: "#111111",
          50: "#222222",
          100: "#1a1a1a",
          900: "#111111",
          950: "#0a0a0a",
        },
        muted: {
          DEFAULT: "#888888",
          light: "#aaaaaa",
          dark: "#555555",
        },
        surface: {
          light: "#F5F5F5",
          DEFAULT: "#FAFAFA",
          dark: "#141414",
        },
        accent: {
          gold: "#D4AF37",
          green: "#10B981",
          red: "#EF4444",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-outfit)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;


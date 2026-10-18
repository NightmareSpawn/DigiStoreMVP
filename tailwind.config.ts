import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Vazirmatn", "Tahoma", "Arial", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#fff3f0",
          100: "#ffe1da",
          500: "#f94e1e",
          600: "#e6400f",
          700: "#c2330a",
        },
      },
    },
  },
  plugins: [],
};

export default config;

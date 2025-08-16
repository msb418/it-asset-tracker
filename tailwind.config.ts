import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7ff",
          100: "#dcebff",
          200: "#b8d6ff",
          300: "#8abaff",
          400: "#5a9bff",
          500: "#387eff",
          600: "#2463e6",
          700: "#1b4cc0",
          800: "#183f9a",
          900: "#173776",
        }
      }
    },
  },
  plugins: [],
};
export default config;

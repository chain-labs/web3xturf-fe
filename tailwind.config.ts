import type { Config } from "tailwindcss";
const defaultTheme = require("tailwindcss/defaultTheme");
import { BACKGROUND_MEDIA } from "./src/constants";
import { BG_GRADIENT } from "./src/copy";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "url-bg": `url('${BACKGROUND_MEDIA}')`,
        "gradient-url": `url('${BG_GRADIENT}')`,
      },
      fontFamily: {
        SpaceGrotesk: ['"Space Grotesk"', ...defaultTheme.fontFamily.serif],
      },
      colors: {
        "black-text": "#293748",
      },
      keyframes: {
        "spin-element": {
          "0%": { transform: "translate(-50%, 40%) rotate(0deg)" },
          "50%": { transform: "translate(-50%, 40%) rotate(180deg)" },
          "100%": { transform: "translate(-50%, 40%) rotate(360deg)" },
        },
      },
      animation: {
        "spin-element": "spin-element 120s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";
const defaultTheme = require("tailwindcss/defaultTheme");

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
        "url-bg":
          "url('https://ik.imagekit.io/chainlabs/Simplr_Events/Popcorn%20Day%20Solid%20Background%20(2)_VIh_lXHkh.png?updatedAt=1704393666681')",
      },
      fontFamily: {
        MountainsofChristmas: [
          '"Mountains of Christmas"',
          ...defaultTheme.fontFamily.serif,
        ],
        PlayfairDisplay: [
          '"Playfair Display"',
          ...defaultTheme.fontFamily.serif,
        ],
        Sacramentp: ['"Sacramento"', ...defaultTheme.fontFamily.serif],
      },
    },
  },
  plugins: [],
};
export default config;

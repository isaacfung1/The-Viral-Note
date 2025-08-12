import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        spotifyGreen: "#1cd95d",
        spotifyGray: "#121212"
      },
      fontFamily: {
        gotham: "Gotham Medium, sans-serif",
      }
    },
  },
  plugins: [],
} satisfies Config;

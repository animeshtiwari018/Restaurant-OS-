/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#A33215", // Burnt Terracotta / Deep Rust
          dark: "#822700",
          light: "#CB4914",
          container: "#CB4914",
          fixed: "#FFDBCF",
          dim: "#FFB59C",
        },
        surface: {
          DEFAULT: "#FAF8F5", // Warm Cream
          cream: "#FAF7F2",
          container: "#F4EFE6", // Stone container surfaces
          low: "#FAF2EE",
          lowest: "#FFFFFF",
          high: "#EAE8E5",
          highest: "#EFEAE2",
          variant: "#E4E2DF",
          dim: "#DBD7CE",
        },
        hairline: "#F0ECE4",
        outline: {
          DEFAULT: "#8D7168",
          variant: "#F0ECE4",
          subtle: "#E8E3DA",
        },
        emerald: {
          state: "#16A34A",
          surface: "#DCFCE7",
        },
        amber: {
          state: "#D97706",
          surface: "#FBEBE8",
          warning: "#FEF3C7",
        },
        on: {
          primary: "#FFFFFF",
          surface: "#1B1C1A",
          surfaceVariant: "#594139",
        },
      },
      borderRadius: {
        "2xl": "1rem", // 16px - inner cards/buttons
        "3xl": "1.5rem", // 24px - main cards/drawers
        "4xl": "2rem",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        display: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        headline: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
      },
      boxShadow: {
        ambient: "0 2px 12px -2px rgba(60, 40, 25, 0.05), 0 4px 16px -4px rgba(60, 40, 25, 0.08)",
        drawer: "0 -8px 30px -4px rgba(45, 25, 15, 0.12)",
      },
    },
  },
  plugins: [],
};

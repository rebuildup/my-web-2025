import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Custom color scheme based on documents/02_style.md
      colors: {
        primary: "#0000ff", // 原色の青 (Primary Blue)
        base: "#222222", // ダークグレー (Dark Grey)
        background: "#222222", // 背景：単色 ベースカラー
        foreground: "#ffffff", // Text on dark background
        accent: "#0000ff", // Same as primary for consistency
      },

      // Breakpoint-based container system
      screens: {
        xs: "384px",
        sm: "768px",
        md: "1024px",
        lg: "1280px",
      },

      // Container max-widths for each breakpoint
      maxWidth: {
        "container-xs": "384px",
        "container-sm": "768px",
        "container-md": "1024px",
        "container-lg": "1280px",
      },

      // 1:1.618 golden ratio system
      fontSize: {
        "ratio-xs": "0.618rem",
        "ratio-sm": "1rem",
        "ratio-base": "1.618rem",
        "ratio-lg": "2.618rem",
        "ratio-xl": "4.236rem",
        "ratio-2xl": "6.854rem",
      },

      // Font families based on documents/02_style.md
      fontFamily: {
        // Adobe Fonts
        "neue-haas": ["neue-haas-grotesk-display", "sans-serif"],
        "zen-kaku": ["zen-kaku-gothic-new", "sans-serif"],

        // Google Fonts
        "noto-jp": ["Noto Sans JP", "sans-serif"],
        shippori: ["Shippori Antique B1", "sans-serif"],

        // Default fallbacks
        sans: ["Noto Sans JP", "sans-serif"],
        heading: ["neue-haas-grotesk-display", "sans-serif"],
        accent: ["zen-kaku-gothic-new", "sans-serif"],
      },

      // Remove default decorations (no shadows, rounded corners, gradients)
      boxShadow: {
        none: "none",
      },
      borderRadius: {
        none: "0",
      },

      // Golden ratio spacing
      spacing: {
        "ratio-xs": "0.618rem",
        "ratio-sm": "1rem",
        "ratio-base": "1.618rem",
        "ratio-lg": "2.618rem",
        "ratio-xl": "4.236rem",
        "ratio-2xl": "6.854rem",
      },

      // Line heights based on golden ratio
      lineHeight: {
        "ratio-tight": "1.618",
        "ratio-normal": "2.618",
        "ratio-loose": "4.236",
      },
    },
  },
  plugins: [],
};

export default config;

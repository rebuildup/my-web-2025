import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Custom color scheme - ダークテーマに統一
      colors: {
        // Original design colors
        primary: {
          DEFAULT: "#ffffff", // 白色をプライマリに
          foreground: "#222222",
        },
        base: "#222222", // ダークグレー (Dark Grey)
        background: "#222222", // 背景：ダークグレー
        foreground: "#ffffff", // Text on dark background
        accent: {
          DEFAULT: "#0000ff", // 青色をアクセントに
          foreground: "#ffffff",
        },

        // UI component colors
        card: {
          DEFAULT: "#222222",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#333333",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#444444",
          foreground: "#cccccc",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        border: "#ffffff",
        input: "#333333",
        ring: "#0000ff",
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

      // テキストサイズはCSSで直接定義

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

      // マージン拡大 - テキストサイズの1.2倍以上
      spacing: {
        "ratio-xs": "1.2rem",
        "ratio-sm": "1.944rem",
        "ratio-base": "3.146rem",
        "ratio-lg": "5.089rem",
        "ratio-xl": "8.235rem",
        "ratio-2xl": "13.324rem",
      },

      // 行間をテキストサイズの1.2倍以上に
      lineHeight: {
        "ratio-tight": "1.2",
        "ratio-normal": "1.5",
        "ratio-loose": "1.8",
      },
    },
  },
  plugins: [],
};

export default config;

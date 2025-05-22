/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e6f1ff",
          100: "#cce3ff",
          200: "#99c8ff",
          300: "#66acff",
          400: "#3391ff",
          500: "#0075ff",
          600: "#005ecc",
          700: "#004699",
          800: "#002f66",
          900: "#001733",
        },
        dark: {
          100: "#383838",
          200: "#303030",
          300: "#282828",
          400: "#232323",
          500: "#1f1f1f",
          600: "#1a1a1a",
          700: "#171717",
          800: "#121212",
          900: "#0a0a0a",
        },
        light: {
          100: "#ffffff",
          200: "#f7f7f7",
          300: "#f0f0f0",
          400: "#e0e0e0",
          500: "#c2c2c2",
          600: "#a0a0a0",
          700: "#787878",
          800: "#4f4f8f",
          900: "#2c2c2c",
        },
      },
      fontFamily: {
        sans: ['"adobe-clean"', "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ['"adobe-caslon-pro"', "ui-serif", "Georgia", "serif"],
        mono: ['"source-code-pro"', "ui-monospace", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "bounce-sm": "bounceSm 2s infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        bounceSm: {
          "0%, 100%": {
            transform: "translateY(-5px)",
            animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)",
          },
          "50%": {
            transform: "translateY(0)",
            animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

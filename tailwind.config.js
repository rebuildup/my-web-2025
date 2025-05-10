/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary blue color with variations
        primary: {
          50: "#e6f1ff",
          100: "#cce3ff",
          200: "#99c8ff",
          300: "#66acff",
          400: "#3391ff",
          500: "#0075ff", // Main primary blue (原色の青)
          600: "#005ecc",
          700: "#004699",
          800: "#002f66",
          900: "#001733",
        },
        // Dark theme colors
        dark: {
          100: "#383838",
          200: "#303030",
          300: "#282828",
          400: "#232323",
          500: "#1f1f1f", // Main dark background
          600: "#1a1a1a",
          700: "#171717",
          800: "#121212",
          900: "#0a0a0a",
        },
        // Light neutral colors for dark theme
        light: {
          100: "#ffffff",
          200: "#f7f7f7",
          300: "#f0f0f0",
          400: "#e0e0e0",
          500: "#c2c2c2",
          600: "#a0a0a0",
          700: "#787878",
          800: "#4f4f4f",
          900: "#2c2c2c",
        },
      },
      boxShadow: {
        smooth: "0 4px 14px 0 rgba(0, 0, 0, 0.2)",
        hover: "0 10px 25px rgba(0, 0, 0, 0.3)",
        card: "0 4px 6px rgba(0, 0, 0, 0.3)",
        "card-hover": "0 10px 15px rgba(0, 0, 0, 0.4)",
        inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.25)",
        focus: "0 0 0 3px rgba(0, 117, 255, 0.5)",
        blue: "0 0 15px rgba(0, 117, 255, 0.5)",
        glow: "0 0 10px rgba(0, 117, 255, 0.5)",
      },
      // Animation definitions for subtle interactions
      transitionProperty: {
        height: "height",
        spacing: "margin, padding",
        maxHeight: "max-height",
        width: "width",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.5s ease-out",
        "slide-left": "slideLeft 0.5s ease-out",
        "slide-right": "slideRight 0.5s ease-out",
        "bounce-sm": "bounceSm 2s infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ping-slow": "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite",
        "spin-slow": "spin 3s linear infinite",
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
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideLeft: {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideRight: {
          "0%": { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
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
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
      },
      // Z-index stack management
      zIndex: {
        60: 60,
        70: 70,
        80: 80,
        90: 90,
        100: 100,
      },
    },
  },
  plugins: [],
};

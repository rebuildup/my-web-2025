import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0000ff',
        background: '#222222',
        foreground: '#ffffff',
      },
      fontFamily: {
        display: ['neue-haas-grotesk-display', 'sans-serif'],
        accent: ['zen-kaku-gothic-new', 'sans-serif'],
        sans: ['Noto Sans JP', 'sans-serif'],
        japanese: ['Shippori Antique B1', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

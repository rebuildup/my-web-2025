import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      xs: '384px',   // 384px × 1
      md: '768px',   // 384px × 2
      xl: '1152px',  // 384px × 3
      '2xl': '1536px', // 384px × 4 (max)
    },
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
      maxWidth: {
        'grid-xs': '384px',
        'grid-md': '768px',
        'grid-xl': '1152px',
        'grid-2xl': '1536px',
      },
    },
  },
  plugins: [],
};

export default config;

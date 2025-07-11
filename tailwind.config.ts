import type { Config } from 'tailwindcss';

// Tailwind CSS v4では大部分の設定がCSS内の@themeディレクティブに移行
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // v4では設定の大部分がCSS内で行われるため、ここでの設定は最小限
  plugins: [],
};

export default config;

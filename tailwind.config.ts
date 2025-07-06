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
        // Main colors based on style guide
        primary: '#0000ff', // 原色の青 (CSS var: --primary-blue)
        'base-gray': '#222222', // ダークグレー (CSS var: --base-gray)
        'bg-default': '#222222', // 背景色
        background: '#222222', // For background utility
        foreground: '#ffffff', // For text utility
        accent: '#0000ff', // For accent utility

        // Additional utility colors to match CSS classes
        gray: {
          DEFAULT: '#222222',
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontFamily: {
        // Adobe Fonts
        'neue-haas': ['neue-haas-grotesk-display', 'sans-serif'],
        'zen-kaku': ['zen-kaku-gothic-new', 'sans-serif'],
        // Google Fonts
        'noto-sans': ['Noto Sans JP', 'sans-serif'],
        shippori: ['Shippori Antique B1', 'sans-serif'],
        // Default overrides
        sans: ['Noto Sans JP', 'sans-serif'],
        display: ['neue-haas-grotesk-display', 'sans-serif'],
      },
      spacing: {
        // Golden ratio spacing system (1:1.618)
        'golden-1': '1rem',
        'golden-2': '1.618rem',
        'golden-3': '2.618rem',
        'golden-4': '4.236rem',
        'golden-5': '6.854rem',
        'golden-6': '11.09rem',
        // Additional spacing for CSS variables
        xs: '0.618rem',
        sm: '1rem',
        md: '1.618rem',
        lg: '2.618rem',
        xl: '4.236rem',
      },
      fontSize: {
        // Font sizes using golden ratio
        'golden-xs': ['0.618rem', { lineHeight: '1.618' }],
        'golden-sm': ['0.854rem', { lineHeight: '1.618' }],
        'golden-base': ['1rem', { lineHeight: '1.618' }],
        'golden-lg': ['1.618rem', { lineHeight: '1.2' }],
        'golden-xl': ['2.618rem', { lineHeight: '1.2' }],
        'golden-2xl': ['4.236rem', { lineHeight: '1.2' }],
      },
      aspectRatio: {
        golden: '1.618',
      },
      gridTemplateColumns: {
        // Grid system for layout
        'golden-2': 'repeat(2, 1fr)',
        'golden-3': 'repeat(3, 1fr)',
        'golden-4': 'repeat(4, 1fr)',
        'golden-auto': 'repeat(auto-fit, minmax(300px, 1fr))',
        // 12-column grid system
        '12': 'repeat(12, 1fr)',
        '1': 'repeat(1, 1fr)',
        '2': 'repeat(2, 1fr)',
        '3': 'repeat(3, 1fr)',
        '4': 'repeat(4, 1fr)',
        '5': 'repeat(5, 1fr)',
        '6': 'repeat(6, 1fr)',
        '7': 'repeat(7, 1fr)',
        '8': 'repeat(8, 1fr)',
        '9': 'repeat(9, 1fr)',
        '10': 'repeat(10, 1fr)',
        '11': 'repeat(11, 1fr)',
      },
      gridColumn: {
        'span-1': 'span 1 / span 1',
        'span-2': 'span 2 / span 2',
        'span-3': 'span 3 / span 3',
        'span-4': 'span 4 / span 4',
        'span-5': 'span 5 / span 5',
        'span-6': 'span 6 / span 6',
        'span-7': 'span 7 / span 7',
        'span-8': 'span 8 / span 8',
        'span-9': 'span 9 / span 9',
        'span-10': 'span 10 / span 10',
        'span-11': 'span 11 / span 11',
        'span-12': 'span 12 / span 12',
        'span-full': '1 / -1',
        'auto': 'auto',
      },
      gridColumnStart: {
        '1': '1',
        '2': '2',
        '3': '3',
        '4': '4',
        '5': '5',
        '6': '6',
        '7': '7',
        '8': '8',
        '9': '9',
        '10': '10',
        '11': '11',
        '12': '12',
        '13': '13',
        'auto': 'auto',
      },
      gridColumnEnd: {
        '1': '1',
        '2': '2',
        '3': '3',
        '4': '4',
        '5': '5',
        '6': '6',
        '7': '7',
        '8': '8',
        '9': '9',
        '10': '10',
        '11': '11',
        '12': '12',
        '13': '13',
        'auto': 'auto',
      },
      borderRadius: {
        // Minimal design - very small radius only
        sm: '2px',
        md: '4px',
        DEFAULT: '2px',
      },
    },
  },
  plugins: [],
};

export default config;

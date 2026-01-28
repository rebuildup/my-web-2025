import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./src/**/*.{js,jsx,ts,tsx,mdx}",
		"./src/app/**/*.{js,jsx,ts,tsx,mdx}",
		"./src/components/**/*.{js,jsx,ts,tsx,mdx}",
		"./src/lib/**/*.{js,jsx,ts,tsx,mdx}",
	],
	theme: {
		extend: {
			fontFamily: {
				sans: [
					"var(--font-noto-sans-jp)",
					"var(--font-shippori-antique-b1)",
					"-apple-system",
					"BlinkMacSystemFont",
					"Segoe UI",
					"sans-serif",
				],
				display: [
					"var(--font-shippori-antique-b1)",
					"var(--font-noto-sans-jp)",
					"-apple-system",
					"BlinkMacSystemFont",
					"Segoe UI",
					"sans-serif",
				],
				accent: [
					"var(--font-shippori-antique-b1)",
					"var(--font-noto-sans-jp)",
					"-apple-system",
					"BlinkMacSystemFont",
					"Segoe UI",
					"sans-serif",
				],
			},
			colors: {
				base: "#020202",
				main: "#f2f2f2",
				accent: "#261fa7",
			},
		},
		screens: {
			sm: "480px",
			md: "768px",
			lg: "1024px",
		},
	},
	plugins: [],
};

export default config;

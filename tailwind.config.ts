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
					"Noto Sans JP",
					"Shippori Antique B1",
					"-apple-system",
					"BlinkMacSystemFont",
					"Segoe UI",
					"sans-serif",
				],
				display: [
					"neue-haas-grotesk-display",
					"-apple-system",
					"BlinkMacSystemFont",
					"Segoe UI",
					"Arial",
					"sans-serif",
				],
				accent: [
					"Shippori Antique B1",
					"Noto Sans JP",
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

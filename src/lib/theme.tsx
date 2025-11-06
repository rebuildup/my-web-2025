"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useEffect, useState } from "react";

const theme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#3f51b5",
		},
		secondary: {
			main: "#f50057",
		},
		background: {
			default: "#121212",
			paper: "#1e1e1e",
		},
		text: {
			primary: "#ffffff",
			secondary: "rgba(255, 255, 255, 0.7)",
		},
	},
	typography: {
		fontFamily: [
			"Noto Sans JP",
			"-apple-system",
			"BlinkMacSystemFont",
			"Segoe UI",
			"Roboto",
			"sans-serif",
		].join(","),
	},
	// Tailwind breakpointsに合わせてMUI breakpointsをカスタマイズ
	breakpoints: {
		values: {
			xs: 0, // Tailwind: < 640px
			sm: 640, // Tailwind: >= 640px
			md: 768, // Tailwind: >= 768px
			lg: 1024, // Tailwind: >= 1024px
			xl: 1280, // Tailwind: >= 1280px
		},
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: "none",
				},
			},
		},
	},
});

export function MUIThemeProvider({ children }: { children: React.ReactNode }) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <>{children}</>;
	}

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			{children}
		</ThemeProvider>
	);
}

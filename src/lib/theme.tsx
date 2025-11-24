"use client";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useServerInsertedHTML } from "next/navigation";
import { useState } from "react";

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

function createEmotionCache() {
	const cache = createCache({ key: "mui", prepend: true });
	cache.compat = true;
	return cache;
}

export function MUIThemeProvider({ children }: { children: React.ReactNode }) {
	const [{ cache, flush }] = useState(() => {
		const cacheInstance = createEmotionCache();
		const prevInsert = cacheInstance.insert;
		let inserted: string[] = [];

		cacheInstance.insert = (...args) => {
			const [, serialized] = args;
			if (cacheInstance.inserted[serialized.name] === undefined) {
				inserted.push(serialized.name);
			}
			return prevInsert(...args);
		};

		const flush = () => {
			const prev = inserted;
			inserted = [];
			return prev;
		};

		return { cache: cacheInstance, flush };
	});

	useServerInsertedHTML(() => {
		const names = flush();
		if (names.length === 0) {
			return null;
		}
		const styles = names
			.map((name) => cache.inserted[name])
			.filter((value): value is string => typeof value === "string")
			.join("");

		return (
			<style
				key={cache.key}
				data-emotion={`${cache.key} ${names.join(" ")}`}
				dangerouslySetInnerHTML={{ __html: styles }}
			/>
		);
	});

	return (
		<CacheProvider value={cache}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				{children}
			</ThemeProvider>
		</CacheProvider>
	);
}

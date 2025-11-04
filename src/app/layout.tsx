import "./app.css";
import "./globals.css";
import type { Viewport } from "next";
import Script from "next/script";
import type { ReactNode } from "react";

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="ja">
			<head>
				{/* Google Fonts */}
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:ital,wght@0,100..900;1,100..900&family=Shippori+Antique+B1&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body className="bg-base text-main font-sans">
				{children}
				{/* Adobe Fonts (Typekit) - body内で読み込んでハイドレーションエラーを回避 */}
				<Script
					id="adobe-fonts"
					strategy="afterInteractive"
					src="/scripts/adobe-fonts.js"
				/>
			</body>
		</html>
	);
}

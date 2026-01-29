import "./app.css";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, Shippori_Antique_B1 } from "next/font/google";
import Script from "next/script";
import type { ReactNode } from "react";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import HomeBackgroundCSS from "@/components/HomeBackgroundCSS";
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";
import { ProductionInitializer } from "@/components/providers/ProductionInitializer";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { SkipLink } from "@/components/ui/SkipLink";
import { generateBaseMetadata } from "@/lib/seo/metadata";

// Optimized Google Fonts with font-display: swap for instant rendering
const notoSansJP = Noto_Sans_JP({
	subsets: ["latin"],
	variable: "--font-noto-sans-jp",
	display: "swap",
	adjustFontFallback: true,
	preload: true,
});

const shipporiAntiqueB1 = Shippori_Antique_B1({
	weight: "400",
	subsets: ["latin"],
	variable: "--font-shippori-antique-b1",
	display: "swap",
	adjustFontFallback: true,
	preload: false, // Not critical for above-fold, defer loading
});

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	themeColor: "#020202",
	colorScheme: "dark",
};

export const metadata: Metadata = {
	...generateBaseMetadata({
		path: "/",
	}),
	other: {
		"msapplication-TileColor": "#020202",
	},
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="ja" suppressHydrationWarning>
			<head>
				{/* Manifest for PWA */}
				<link rel="manifest" href="/manifest.json" />
				<link rel="icon" href="/favicons/favicon.ico" sizes="any" />
				<link rel="apple-touch-icon" href="/favicons/favicon-192x192.png" />
				{/* DNS prefetch and preconnect for performance */}
				<link
					rel="preconnect"
					href="https://use.typekit.net"
					crossOrigin="anonymous"
				/>
				<link
					rel="preconnect"
					href="https://p.typekit.net"
					crossOrigin="anonymous"
				/>
				<link rel="dns-prefetch" href="https://use.typekit.net" />
			</head>
			<body
				className={`${notoSansJP.variable} ${shipporiAntiqueB1.variable} bg-base text-main font-sans`}
			>
				<HomeBackgroundCSS />
				<SkipLink />
				<ProductionInitializer>
					<GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
					<AnalyticsProvider gaId={process.env.NEXT_PUBLIC_GA_ID}>
						{children}
						<CookieConsent />
					</AnalyticsProvider>
				</ProductionInitializer>

				{/* Adobe Fonts (Typekit) - 遅延読み込みでパフォーマンス最適化 */}
				<Script
					id="adobe-fonts"
					strategy="lazyOnload"
					src="/scripts/adobe-fonts.js"
				/>
				{/* Twitter (X) Embed Widgets */}
				<Script
					id="twitter-widgets"
					strategy="lazyOnload"
					src="https://platform.twitter.com/widgets.js"
					charSet="utf-8"
				/>
			</body>
		</html>
	);
}

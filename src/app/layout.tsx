import "./app.css";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";
import { ProductionInitializer } from "@/components/providers/ProductionInitializer";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { generateBaseMetadata } from "@/lib/seo/metadata";

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
};

export const metadata: Metadata = generateBaseMetadata({
	path: "/",
});

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="ja" suppressHydrationWarning>
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
				<ProductionInitializer>
					<GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
					<AnalyticsProvider gaId={process.env.NEXT_PUBLIC_GA_ID}>
						{children}
						<CookieConsent />
					</AnalyticsProvider>
				</ProductionInitializer>

				{/* React DevTools version fix */}
				<Script
					id="react-devtools-fix"
					strategy="beforeInteractive"
					dangerouslySetInnerHTML={{
						__html: `
							(function() {
								if (typeof window === 'undefined') return;
								try {
									const reactVersion = '18.2.0';
									if (!window.__REACT_VERSION__) {
										window.__REACT_VERSION__ = reactVersion;
									}
									if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
										if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers) {
											window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers = new Map();
										}
										const originalRegisterRenderer = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.registerRenderer;
										if (originalRegisterRenderer) {
											window.__REACT_DEVTOOLS_GLOBAL_HOOK__.registerRenderer = function(renderer) {
												if (renderer && !renderer.version) {
													renderer.version = reactVersion;
												}
												return originalRegisterRenderer.call(this, renderer);
											};
										}
									}
								} catch (e) {
									console.debug('React DevTools version fix failed:', e);
								}
							})();
						`,
					}}
				/>
				{/* Adobe Fonts (Typekit) - body内で読み込んでハイドレーションエラーを回避 */}
				<Script
					id="adobe-fonts"
					strategy="afterInteractive"
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

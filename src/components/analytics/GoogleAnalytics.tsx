"use client";

import Script from "next/script";

export default function GoogleAnalytics({ gaId }: { gaId?: string }) {
	// 環境変数が無い、または無効な場合はレンダリングしない
	if (!gaId) {
		console.warn("GoogleAnalytics: GA Measurement ID is missing.");
		return null;
	}

	return (
		<>
			<Script
				src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
				strategy="afterInteractive"
			/>
			<Script id="google-analytics" strategy="afterInteractive">
				{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());

          gtag('config', '${gaId}', {
            page_path: window.location.pathname,
            debug_mode: ${process.env.NODE_ENV === "development"},
            send_page_view: false
          });
        `}
			</Script>
		</>
	);
}

import type { Metadata } from "next";
import { Noto_Sans_JP, Shippori_Antique_B1 } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";
import { PerformanceProvider } from "@/components/providers/PerformanceProvider";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { PerformanceDevPanel } from "@/components/ui/CoreWebVitalsMonitor";
import { GADebug } from "@/components/ui/ga-debug";
import { GATestButton } from "@/components/ui/ga-test-button";
import {
  CriticalResourcePreloader,
  LayoutShiftDetector,
} from "@/components/ui/LayoutStabilizer";

// Google Analytics type definitions
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (
      command: "config" | "event" | "js" | "set",
      targetId: string | Date,
      config?: Record<string, unknown>,
    ) => void;
  }
}

// Google Fonts configuration based on documents/02_style.md
const notoSansJP = Noto_Sans_JP({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-noto-jp",
  display: "swap",
});

const shipporiAntique = Shippori_Antique_B1({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-shippori",
  display: "swap",
});

export const metadata: Metadata = {
  title: "samuidoのサイトルート",
  description:
    "フロントエンドエンジニアsamuidoの個人サイト。自己紹介/作品ギャラリー/プラグイン配布/ツール など欲しいもの全部詰め込みました",
  keywords: [
    "ポートフォリオ",
    "Webデザイン",
    "フロントエンド開発",
    "ツール",
    "プラグイン",
    "ブログ",
    "samuido",
    "木村友亮",
  ],
  authors: [{ name: "samuido", url: "https://yusuke-kim.com/about" }],
  creator: "samuido",
  publisher: "samuido",
  robots: "index, follow",
  metadataBase: new URL("https://yusuke-kim.com"),
  alternates: {
    canonical: "https://yusuke-kim.com/",
  },
  openGraph: {
    title: "samuidoのサイトルート",
    description:
      "フロントエンドエンジニアsamuidoの個人サイト。自己紹介/作品ギャラリー/プラグイン配布/ツール など欲しいもの全部詰め込みました",
    type: "website",
    url: "https://yusuke-kim.com/",
    images: [
      {
        url: "https://yusuke-kim.com/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "samuido - Creative Portfolio & Tools",
      },
    ],
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "samuidoのサイトルート",
    description:
      "フロントエンドエンジニアsamuidoの個人サイト。自己紹介/作品ギャラリー/プラグイン配布/ツール など欲しいもの全部詰め込みました",
    images: ["https://yusuke-kim.com/images/twitter-image.png"],
    creator: "@361do_sleep",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#181818",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />

        {/* Google tag (gtag.js) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-Q3YWX96WRS"
        />
        <Script
          id="google-analytics"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-Q3YWX96WRS');
            `,
          }}
        />
      </head>
      <body
        className={`${notoSansJP.variable} ${shipporiAntique.variable} antialiased bg-background text-foreground`}
      >
        <CriticalResourcePreloader
          resources={[
            { href: "/images/og-image.png", as: "image" },
            { href: "/favicons/favicon.ico", as: "image" },
            {
              href: "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&family=Shippori+Antique+B1&display=swap",
              as: "style",
            },
          ]}
        />
        <AnalyticsProvider>
          <PerformanceProvider>
            {children}
            <PerformanceDevPanel />
            <LayoutShiftDetector />
            <CookieConsent />
            <GADebug />
            <GATestButton />
          </PerformanceProvider>
        </AnalyticsProvider>

        {/* Structured Data (JSON-LD) */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Rebuild Portfolio",
              description: "Creative Portfolio and Development Works",
              url: "https://rebuild.up.up",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://rebuild.up.up/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}

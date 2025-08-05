import type { Metadata } from "next";
import { Noto_Sans_JP, Shippori_Antique_B1 } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";
import { PerformanceProvider } from "@/components/providers/PerformanceProvider";
import { ProductionInitializer } from "@/components/providers/ProductionInitializer";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { PerformanceDevPanel } from "@/components/ui/CoreWebVitalsMonitor";
import { GADebug } from "@/components/ui/ga-debug";
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
  icons: {
    icon: [
      { url: "/favicons/favicon.ico", sizes: "any" },
      { url: "/favicons/favicon.svg", type: "image/svg+xml" },
      { url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      {
        url: "/favicons/favicon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
  manifest: "/manifest.json",
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

        {/* Manifest link */}
        <link rel="manifest" href="/manifest.json" />

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
            { href: "/favicon.ico", as: "image" },
          ]}
        />
        <ProductionInitializer>
          <AnalyticsProvider>
            <PerformanceProvider>
              {children}
              <PerformanceDevPanel />
              <LayoutShiftDetector />
              <CookieConsent />
              <GADebug />
            </PerformanceProvider>
          </AnalyticsProvider>
        </ProductionInitializer>

        {/* Adobe Fonts (Typekit) - Load after hydration with error handling */}
        <Script
          id="adobe-fonts"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(d) {
                try {
                  var config = {
                    kitId: 'blm5pmr',
                    scriptTimeout: 3000,
                    async: true
                  },
                  h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\\bwf-loading\\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;h.className+=" wf-loading";tk.src='https://use.typekit.net/'+config.kitId+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){console.warn('Adobe Fonts loading failed:', e);}};tk.onerror=function(){console.warn('Adobe Fonts script failed to load');clearTimeout(t);h.className=h.className.replace(/\\bwf-loading\\b/g,"")+" wf-inactive";};s.parentNode.insertBefore(tk,s)
                } catch(e) {
                  console.warn('Adobe Fonts initialization failed:', e);
                }
              })(document);
            `,
          }}
        />

        {/* Easter Egg - Welcome Message */}
        <Script
          id="easter-egg"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              console.log(\`
welcome !

近況報告 : ウェブサイト作成中
当分終わる気がしないです

ここに来たあなたを
いど端サーバーにご招待しましょう
https://discord.gg/qmCGSBmc28
              \`);
            `,
          }}
        />

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

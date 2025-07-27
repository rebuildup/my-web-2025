import type { Metadata } from "next";
import { Noto_Sans_JP, Shippori_Antique_B1 } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { PerformanceProvider } from "@/components/providers/PerformanceProvider";
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";
import { PerformanceDevPanel } from "@/components/ui/CoreWebVitalsMonitor";
import {
  LayoutShiftDetector,
  CriticalResourcePreloader,
} from "@/components/ui/LayoutStabilizer";
import { CookieConsent } from "@/components/ui/CookieConsent";

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
        url: "https://yusuke-kim.com/og-image.jpg",
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
    images: ["https://yusuke-kim.com/twitter-image.jpg"],
    creator: "@361do_sleep",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#222222",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark wf-loading">
      <head>
        {/* Preconnect to external font services */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://use.typekit.net" />

        {/* Preload critical resources */}
        <link rel="preload" href="/images/og-image.jpg" as="image" />
        <link rel="preload" href="/favicon.ico" as="image" />

        {/* DNS prefetch for external services */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />

        {/* Service Worker registration */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#222222" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body
        className={`${notoSansJP.variable} ${shipporiAntique.variable} antialiased bg-background text-foreground`}
      >
        <CriticalResourcePreloader
          resources={[
            { href: "/images/og-image.jpg", as: "image" },
            { href: "/favicon.ico", as: "image" },
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
              name: "samuido",
              description: "フロントエンドエンジニアsamuidoの個人サイト",
              url: "https://yusuke-kim.com/",
              author: {
                "@type": "Person",
                name: "木村友亮",
                jobTitle: "Webデザイナー・開発者",
                url: "https://yusuke-kim.com/about",
              },
              publisher: {
                "@type": "Organization",
                name: "samuido",
                url: "https://yusuke-kim.com/",
              },
              potentialAction: {
                "@type": "SearchAction",
                target: "https://yusuke-kim.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />

        {/* Adobe Fonts Script - Kit ID: blm5pmr */}
        <Script
          id="adobe-fonts"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(d) {
                var config = {
                  kitId: 'blm5pmr',
                  scriptTimeout: 3000,
                  async: true
                },
                h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\\bwf-loading\\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;tk.src='https://use.typekit.net/'+config.kitId+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config);}catch(e){}};s.parentNode.insertBefore(tk,s);
                
                function hideLoading() {
                  // ローディング画面は表示しないため、何もしない
                }
              })(document);
            `,
          }}
        />
      </body>
    </html>
  );
}

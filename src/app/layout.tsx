import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script";

export const metadata: Metadata = {
  title: "samuido",
  description:
    "samuidoの個人サイト。Webデザイン・開発、ツール制作、創作活動を紹介。",
  keywords: [
    "samuido",
    "Web開発",
    "フロントエンド",
    "デザイン",
    "プログラミング",
    "ポートフォリオ",
  ],
  authors: [{ name: "samuido", url: "https://yusuke-kim.com" }],
  creator: "samuido",
  publisher: "samuido",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://yusuke-kim.com",
    title: "samuido",
    description:
      "samuidoの個人サイト。Webデザイン・開発、ツール制作、創作活動を紹介。",
    siteName: "samuido Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "samuido",
    description:
      "samuidoの個人サイト。Webデザイン・開発、ツール制作、創作活動を紹介。",
    creator: "@361do_sleep",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="scroll-smooth">
      <head>
        <Script id="adobe-fonts" strategy="beforeInteractive">
          {`
            (function(d) {
              var config = {
                kitId: 'nhz3edk',
                scriptTimeout: 3000,
                async: true
              },
              h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\\bwf-loading\\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;h.className+=" wf-loading";tk.src='https://use.typekit.net/'+config.kitId+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){}};s.parentNode.insertBefore(tk,s)
            })(document);
          `}
        </Script>
      </head>
      <body className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

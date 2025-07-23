import type { Metadata } from "next";
import { Noto_Sans_JP, Shippori_Antique_B1 } from "next/font/google";
import Script from "next/script";
import "./globals.css";

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
  title: "samuido - Creative Portfolio & Tools",
  description:
    "Creative portfolio, tools, and workshop by samuido. Featuring video production, design, programming, and interactive tools.",
  keywords: [
    "portfolio",
    "creative",
    "video",
    "design",
    "programming",
    "tools",
    "samuido",
  ],
  authors: [{ name: "samuido" }],
  creator: "samuido",
  publisher: "samuido",
  robots: "index, follow",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0000ff",
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
      </head>
      <body
        className={`${notoSansJP.variable} ${shipporiAntique.variable} antialiased bg-background text-foreground`}
      >
        {children}

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
                h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\\bwf-loading\\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;tk.src='https://use.typekit.net/'+config.kitId+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){}};s.parentNode.insertBefore(tk,s)
              })(document);
            `,
          }}
        />
      </body>
    </html>
  );
}

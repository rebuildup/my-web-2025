import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Web 2025 - Portfolio & Tools",
  description: "Professional portfolio, creative tools, and workshop content. Featuring video production, web development, and interactive tools.",
  keywords: ["portfolio", "web development", "video production", "tools", "creative"],
  authors: [{ name: "samuido" }],
  creator: "samuido",
  publisher: "samuido",
  robots: "index, follow",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "/",
    siteName: "My Web 2025",
    title: "My Web 2025 - Portfolio & Tools",
    description: "Professional portfolio, creative tools, and workshop content",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "My Web 2025",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "My Web 2025 - Portfolio & Tools",
    description: "Professional portfolio, creative tools, and workshop content",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicons/favicon.ico", sizes: "any" },
      { url: "/favicons/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicons/favicon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="scroll-smooth">
      <head>
        {/* Adobe Fonts */}
        <Script
          id="adobe-fonts"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(d) {
                var config = {
                  kitId: 'blm5pmr',
                  scriptTimeout: 3000,
                  async: true
                },
                h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\\bwf-loading\\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;h.className+=" wf-loading";tk.src='https://use.typekit.net/'+config.kitId+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){}};s.parentNode.insertBefore(tk,s)
              })(document);
            `,
          }}
        />
        
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://use.typekit.net" />
        
        {/* Viewport for responsive design */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        
        {/* Theme color */}
        <meta name="theme-color" content="#0000ff" />
        
        {/* Security headers */}
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://use.typekit.net https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://use.typekit.net https://fonts.googleapis.com; font-src 'self' https://use.typekit.net https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.resend.com;" />
      </head>
      <body className="noto-sans-jp">
        <div id="root">
          {children}
        </div>
        
        {/* Analytics placeholder */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}

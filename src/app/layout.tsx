import "./globals.css";

export const metadata = {
  title: "samuido - Web開発者・デザイナーのポートフォリオ",
  description: "Web開発者・デザイナーsamuidoのポートフォリオサイト",
  icons: {
    icon: [
      { url: "/favicons/favicon.ico", sizes: "any" },
      { url: "/favicons/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicons/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ja"
      style={{
        backgroundColor: "#222222",
        margin: 0,
        padding: 0,
        height: "100%",
      }}
    >
      <body
        style={{
          backgroundColor: "#222222",
          color: "#ffffff",
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          fontFamily: '"Noto Sans JP", "Helvetica Neue", Arial, sans-serif',
        }}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}

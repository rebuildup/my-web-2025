import type { Metadata } from 'next';
import { Noto_Sans_JP, Shippori_Antique_B1 } from 'next/font/google';
import './globals.css';
import AdobeFontsLoader from './components/AdobeFontsLoader';
import JsonLd from './components/JsonLd';

// Google Fonts定義
const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
});

const shipporiAntique = Shippori_Antique_B1({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-shippori-antique',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'samuidoのサイトルート',
  description:
    'フロントエンドエンジニアsamuidoの個人サイト。自己紹介/作品ギャラリー/プラグイン配布/ツール など欲しいもの全部詰め込みました',
  keywords: 'ポートフォリオ, Webデザイン, フロントエンド開発, ツール, プラグイン, ブログ',
  robots: 'index, follow',
  metadataBase: new URL('https://yusuke-kim.com'),
  alternates: {
    canonical: 'https://yusuke-kim.com/',
  },
  openGraph: {
    title: 'samuidoのサイトルート',
    description:
      'フロントエンドエンジニアsamuidoの個人サイト。自己紹介/作品ギャラリー/プラグイン配布/ツール など欲しいもの全部詰め込みました',
    type: 'website',
    url: 'https://yusuke-kim.com/',
    images: [
      {
        url: 'https://yusuke-kim.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'samuidoのサイトルート',
      },
    ],
    siteName: 'samuido',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'samuidoのサイトルート',
    description:
      'フロントエンドエンジニアsamuidoの個人サイト。自己紹介/作品ギャラリー/プラグイン配布/ツール など欲しいもの全部詰め込みました',
    images: ['https://yusuke-kim.com/twitter-image.jpg'],
    creator: '@361do_sleep',
  },
  other: {
    'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'samuido',
  description: 'フロントエンドエンジニアsamuidoの個人サイト',
  url: 'https://yusuke-kim.com/',
  author: {
    '@type': 'Person',
    name: '木村友亮',
    jobTitle: 'Webデザイナー・開発者',
    url: 'https://yusuke-kim.com/about',
  },
  publisher: {
    '@type': 'Organization',
    name: 'samuido',
    url: 'https://yusuke-kim.com/',
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://yusuke-kim.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`wf-loading ${notoSansJP.variable} ${shipporiAntique.variable}`}>
      <head>{/* 他のhead要素 */}</head>
      <body>
        <JsonLd json={jsonLd} />
        <AdobeFontsLoader />
        <div className="grid-system">{children}</div>
      </body>
    </html>
  );
}

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

import { siteMetadata } from './metadata';

export const metadata: Metadata = siteMetadata;

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

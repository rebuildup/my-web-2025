import type { Metadata } from 'next';

export const siteMetadata: Metadata = {
  title: 'samuidoのサイトルート',
  description:
    'フロントエンドエンジニアsamuidoの個人サイト。自己紹介/作品ギャラリー/プラグイン配布/ツール など欲しいもの全部詰め込みました',
  keywords: 'ポートフォリオ, Webデザイン, フロントエンド開発, ツール, プラグイン, ブログ',
  robots: 'index, follow',
  metadataBase: new URL('https://yusuke-kim.com'),
  alternates: {
    canonical: 'https://yusuke-kim.com/',
  },
  icons: {
    icon: '/favicons/favicon.png',
    shortcut: '/favicons/favicon.ico',
    apple: '/favicons/favicon.png',
    other: {
      rel: 'icon',
      url: '/favicons/favicon.svg',
      type: 'image/svg+xml',
    },
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

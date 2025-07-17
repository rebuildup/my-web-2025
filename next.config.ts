import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // トレイリングスラッシュを追加（Apache設定と一致）
  trailingSlash: true,

  // 画像最適化を無効化（静的出力では必要）
  images: {
    unoptimized: true,
  },

  /* 既存の config options */
  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  turbopack: {
    rules: {
      '**/*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // 404エラーを解消するためのリダイレクト設定
  async redirects() {
    return [
      {
        source: '/.well-known/appspecific/com.chrome.devtools.json',
        destination: '/api/not-found',
        permanent: false,
      },
    ];
  },

  // または、rewritesで204レスポンスを返す
  async rewrites() {
    return [
      {
        source: '/.well-known/appspecific/com.chrome.devtools.json',
        destination: '/api/devtools',
      },
    ];
  },

  // セキュリティヘッダー
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

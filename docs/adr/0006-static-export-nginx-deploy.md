# ADR-0006: 静的エクスポート + nginx リバースプロキシでデプロイ

## ステータス
Accepted

## コンテキスト
個人サイト規模でコンテナオーケストレーションは過剰. 一方でメディア配信と一部 API は動的処理が必要. セキュリティヘッダ (CSP, HSTS, X-Frame-Options) はアプリ側で持ちたくない.

## 検討した選択肢
- A: **Next.js 静的エクスポート (`out/`) + nginx (TLS / security header / `/api/` proxy)** + pm2 常駐の CMS API.
- B: Next.js standalone server を直接 pm2 で起動し nginx で wrap.
- C: Vercel / Cloudflare 等の PaaS.

## 決定
**A を採用.** 根拠:
- 静的ファイルは nginx が直接配信 → 高速かつ cache 制御が柔軟.
- `/api/` だけ 127.0.0.1:3001 (CMS API) へ proxy.
- セキュリティヘッダを nginx 設定で集中管理.
- デプロイ単位: `out/` の tar.gz + `cms-api` バイナリ.

## 影響
- プラス: 低コスト (GCP e2-micro 等), 復旧が `out/` 差し替え + `pm2 restart` で完結.
- マイナス: 動的ルートを増やせない (`getStaticPaths` + `getStaticProps` 相当). `generateStaticParams` で対応.
- トレードオフ: ビルド失敗時のロールバックが手動. リリースごとに世代を `releases/` に保持.

## 再評価条件
- 動的ルート要件が増えた場合.
- PaaS 移行で運用負荷が明確に下がる場合.
- CDN (Cloudflare) を前段に置く構成へ刷新する場合.

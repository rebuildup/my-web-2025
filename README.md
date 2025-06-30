# 個人 Web サイト (my-web-2025)

samuidoの個人サイト [yusuke-kim.com](yusuke-kim.com)

詳細な仕様・ページ内容・フォルダ構成は **`documents/readme.md`** を参照してください。
\
本リポジトリのルート README では、セットアップ手順と概要のみ提供します。

---

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev
# => http://localhost:3000

# 本番ビルド
npm run build

# 各種チェック
npm run lint      # ESLint & Prettier
npm run test      # Jest / Playwright
npm run typecheck # TypeScript
```

> Playwright の初期セットアップは `npx playwright install` を一度実行してください。

---

## サイト概要

- 技術スタック: **Next.js 15**, **TailwindCSS v4**, **TypeScript**
- ホスティング: GCP VM (本番) / Vercel (Preview)
- デプロイ: GitHub Actions → rsync

---

## ライセンス

All Rights Reserved © 2025 361do_sleep

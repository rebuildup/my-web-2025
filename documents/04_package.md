# ライブラリ & バージョン管理 (Packages, 2025-12 現行)

`package.json` を基準に主要依存とスクリプトを整理.Lint/Format は ESLint ではなく **Biome**.

## コア依存

| パッケージ | バージョン | 用途 |
| ---------- | ---------- | ---- |
| next | 16.0.1 | App Router / standalone build |
| react / react-dom | 18.2.0 | UI ランタイム |
| typescript | 5.9.3 | 型システム |
| tailwindcss | 4.1.16 | ユーティリティCSS |
| @tailwindcss/postcss | 4.1.16 | Tailwind v4 用 PostCSS |
| @chakra-ui/react | 3.28.0 | UIコンポーネント |
| @mui/material / icons | 7.3.x | 一部UI |
| framer-motion / motion | 12.23.x | アニメーション |
| lucide-react | 0.548.0 | アイコン |
| three | 0.180.0 | WebGL/3D |
| pixi.js | 8.14.0 | 2D Canvas |
| @ffmpeg/ffmpeg | 0.12.15 | メディア処理 |
| better-sqlite3 | 12.4.1 | ローカルDB (content cache) |
| sharp | 0.34.4 | 画像処理 |
| axios | 1.13.1 | HTTP |
| date-fns | 4.1.0 | 日付 |
| marked | 16.4.1 | Markdown 変換 |
| dompurify / isomorphic-dompurify | 3.3.0 / 2.30.1 | サニタイズ |
| jszip | 3.10.1 | ZIP |
| fuse.js | 7.1.0 | 検索 |
| qrcode / qrcode.react | 1.5.x / 4.2.0 | QR生成 |

## 開発ツール

| パッケージ | バージョン | 用途 |
| ---------- | ---------- | ---- |
| @biomejs/biome | 2.3.2 | Lint/Format (ESLint/Prettier置換) |
| jest / @types/jest | 30.2.0 | Unit Test |
| @testing-library/react / jest-dom | 16.3.0 / 6.9.1 | Reactテスト |
| jsdom | 27.0.1 | DOM環境 |
| tsx | 4.20.6 | TS 実行 |
| @types/node | 24.9.2 | Node 型 |

## スクリプト (package.json 抜粋)

```jsonc
"scripts": {
  "dev": "next dev --turbo -p 3010",
  "build": "node scripts/filter-warnings.js next build && node scripts/copy-content-data.js",
  "start": "next start -p 3010",
  "dev:port": "next dev -p $PORT",
  "start:port": "next start -p $PORT",
  "type-check": "tsc --noEmit",
  "test": "node scripts/filter-warnings.js jest --passWithNoTests",
  "lint": "biome check .",
  "format": "biome format --write .",
  "import-portfolio": "tsx scripts/import-portfolio.ts",
  "update-published-dates": "tsx scripts/update-published-dates.ts",
  "recreate-portfolio": "tsx scripts/recreate-portfolio.ts",
  "delete-portfolio": "tsx scripts/delete-portfolio.ts",
  "thumbnails-from-youtube": "tsx scripts/thumbnails-from-youtube.ts",
  "promote-with-thumbnails": "tsx scripts/promote-with-thumbnails.ts",
  "create-detail-markdown": "tsx scripts/create-detail-markdown.ts",
  "postinstall": "node scripts/install-hooks.js",
  "prebuild": "node scripts/install-hooks.js",
  "proto:sync": "node scripts/prototype-sync.js"
}
```

- `postinstall`/`prebuild`: `scripts/install-hooks.js` で **better-sqlite3** の自動リビルドを試行.ネットワークアクセスなし.
- `scripts/filter-warnings.js`: baseline-browser-mapping 警告のみフィルタして stderr を出力.
- `scripts/copy-content-data.js`: ビルド後に `data/` を `.next/standalone/data` へ複製.

## パッケージ管理ポリシー
- パッケージマネージャ: `pnpm@10.24.0`（lockfile 必須、`--frozen-lockfile` 運用）.
- Lint/Format: `pnpm run lint` / `pnpm run format`（Biome）.
- ビルド: `pnpm run build` → Next standalone 出力.  
- 追加インストール時は `pnpm add <pkg>` し、`biome format` で整形してからコミット.

## アップグレード指針
- **Next/React**: minor はビルドと Jest を通した上でマージ.major は canary ブランチで検証.
- **Tailwind v4**: PostCSS 連携は `@tailwindcss/postcss` で完結.`tailwind.config.ts` の互換性を確認.
- **better-sqlite3**: Node メジャーアップ時は `pnpm rebuild better-sqlite3` をCI/本番で実行し動作確認.

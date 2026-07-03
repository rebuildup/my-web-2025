# 01_global — コア概念の最短メモ

目的: プロジェクト全体で共通に参照するデータ構造・環境変数・ディレクトリだけを抜粋.

## データモデル
- **ContentItem**（`data/contents/*.db` 内の行）
  - `id`, `slug`, `type` (gallery/video/etc), `title`, `summary`, `tags[]`
  - `media`: hero 画像/動画のパス
  - `meta`: publishedAt, updatedAt, isFeatured, locale
- **SiteConfig**（`src/lib/config/production.ts`）
  - `site`: name, url, locale
  - `cdn`: baseUrl / imagesUrl (任意)
  - `analytics`: GA / Sentry の有効フラグ

## ディレクトリ
- `data/` … ポートフォリオDBとメタ.ビルド後 `.next/standalone/data` にコピーされ同梱.
- `public/` … 画像・favicons・静的HTML（例: `history-quiz.html`）・Typekit loader.
- `src/` … Next.js アプリ本体（App Router）.
- `scripts/` … ビルド補助: `copy-content-data.js`, `install-hooks.js`, `filter-warnings.js`, 各種 TS ツール.
- `documents/archive/` … 旧ドキュメント（詳細版）.

## 環境変数（最低限）
| 変数 | 必須 | 用途 |
| ---- | ---- | ---- |
| `NEXT_PUBLIC_SITE_URL` | ◎ | 生成URLのベース.未設定はエラー扱い. |
| `NODE_ENV` | ◎ | production / development |
| `NEXT_PUBLIC_GA_ID` | 任意 | GA を有効化 |
| `SENTRY_DSN` | 任意 | Sentry を有効化 |
| `NEXT_PUBLIC_CDN_URL`, `NEXT_PUBLIC_IMAGES_CDN` | 任意 | CDN を前段に置く場合 |

## ビルド/ランタイムの要点
- `pnpm run build` → Next standalone 出力.完了後 `scripts/copy-content-data.js` が `data/` をスタンドアロンに複製.
- 実行: `pm2 start .next/standalone/server.js --name yusuke-kim -p 3000`（詳細は `06_deploy.md`）.
- 外部DBやキューは未使用.ビルド成果物のみで完結.

## 安全運用のミニチェック
- CSP/セキュリティヘッダーはリバースプロキシ側で付与.
- HTML/Markdown は `dompurify` でサニタイズ済み.追加生データを扱うときも同じ方針で.
- 依存追加時は `pnpm install --frozen-lockfile` / `biome check .` を通す.

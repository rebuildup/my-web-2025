# ライブラリ & バージョン管理 (Packages, 2026-08 現行)

`package.json` を基準に主要依存とスクリプトを整理. Lint / Format は ESLint ではなく **Biome**, テストランナーは `bun test` (jest@30 は将来 fallback).

## コア依存

| パッケージ | バージョン | 用途 |
| ---------- | ---------- | ---- |
| next | ^16.3.0 | App Router / `output: "export"` (静的エクスポート) |
| react / react-dom | ^19.2.8 | UI ランタイム |
| typescript | ^7.0.2 | 型システム |
| tailwindcss | ^4.3.3 | ユーティリティCSS (PostCSS 連携) |
| @tailwindcss/postcss | ^4.3.3 | Tailwind v4 用 PostCSS |
| @chakra-ui/react | ^3.36.1 | UI コンポーネント |
| @mui/material / @mui/icons-material | ^9.3.0 | 一部 UI |
| framer-motion / motion | ^12.43.0 | アニメーション |
| lucide-react | ^1.28.0 | アイコン |
| three / @react-three/fiber | ^0.185.1 / ^9.7.0 | WebGL / 3D |
| pixi.js / pixi-filters | ^8.19.0 / ^6.1.5 | 2D Canvas |
| @ffmpeg/ffmpeg | ^0.12.15 | メディア処理 |
| sharp | ^0.34.4 (Node 側, Rust API 経由) | 画像処理 |
| axios | ^1.x | HTTP (admin API 呼出) |
| date-fns | ^4.4.0 | 日付 |
| marked | ^18.0.9 | Markdown 変換 |
| dompurify / isomorphic-dompurify | ^3.4.13 / ^3.21.0 | サニタイズ |
| jszip | ^3.10.1 | ZIP |
| fuse.js | ^7.5.0 | 検索 |
| qrcode / qrcode.react | ^1.5.4 / ^4.2.0 | QR 生成 |
| zod | ^4.4.3 | スキーマ検証 |
| gsap | ^3.15.0 | タイムライン・アニメーション |

## 開発ツール

| パッケージ | バージョン | 用途 |
| ---------- | ---------- | ---- |
| @biomejs/biome | ^2.5.7 | Lint / Format (ESLint / Prettier 置換) |
| bun | 1.3.10 (固定, CI runner は 1.3.14) | パッケージマネージャ + テストランナー |
| knip | ^6.31.0 | 未使用コード / 依存検出 |
| lighthouse | ^13.4.1 | パフォーマンス監査 |
| playwright | ^1.62.1 | UI / E2E 検証 |
| jest / @types/jest | ^30.4.2 / ^30.0.0 | 将来 fallback (現行 canonical は `bun test`) |
| @testing-library/react / jest-dom | ^16.3.2 / ^7.0.0 | React テスト |
| jest-environment-jsdom | ^30.4.1 | DOM 環境 |
| tsx | ^4.23.8 | TS スクリプト実行 (CMS マイグレーション等) |
| chrome-launcher | ^1.2.1 | Lighthouse 用 Chromium 起動 |
| @types/node | ^26.1.2 | Node 型 |

## スクリプト (package.json 抜粋)

```jsonc
"scripts": {
  "dev": "bun --bun next dev -p 3010",
  "dev:cms-api": "bun ./scripts/dev-cms-api.ts",
  "dev:full": "bun ./scripts/dev-with-cms.ts",
  "sync:cms-entries": "bun ./scripts/sync-legacy-contents-to-rust.ts",
  "sync:cms-markdown": "bun ./scripts/sync-legacy-markdown-to-rust.ts",
  "sync:cms-media": "bun ./scripts/sync-legacy-media-to-rust.ts",
  "build": "bun scripts/check-env.js && bun --bun next build && bun scripts/copy-content-data.js",
  "start": "bun --bun next start -p 3010",
  "type-check": "tsc --noEmit",
  "test": "bun test",
  "lint": "biome check .",
  "format": "biome format --write .",
  "doctor": "bunx react-doctor@latest"
}
```

- `bun scripts/check-env.js`: ビルド必須の env (NEXT_PUBLIC_GA_ID 等) を検査.
- `bun scripts/copy-content-data.js`: 静的エクスポート (`out/`) 後に `data/` を同梱.
- `bun run dev` は `bun --bun next dev` 経由. Bun 1.3.14 + Next 16.3.0 ビルドは teardown で SIGILL 132 が出る既知問題があり, デプロイ runner では exit 132 を `out/index.html` 存在条件付きで許容する (`deploy.yml` 参照).

## パッケージ管理ポリシー
- パッケージマネージャ: `bun@1.3.10` (lockfile 必須, `--frozen-lockfile` 運用).
- Lint / Format: `bun run lint` / `bun run format` (Biome).
- テスト: `bun run test` (Bun test canonical, jest@30 は将来 fallback).
- ビルド: `bun run build` → Next.js 静的エクスポート (`out/`) を生成.
- 追加インストール時は `bun add <pkg>` し, `bun run format` で整形してからコミット.

## Rust CMS API
- `apps/cms-api/Cargo.toml` に Rust 側依存を集約. ローカル検証は同ディレクトリで `cargo fmt / clippy / test`.
- 本リポジトリの検証ゲートは Bun 側に加えて Rust 側 (`cargo fmt --all -- --check`, `cargo clippy --all-targets -- -D warnings`, `cargo test --all-targets`) を CI で必須とする (`docs/adr/0005-rust-cms-api.md`).

## アップグレード指針
- **Next / React**: minor はビルド + Bun test を通した上でマージ. major は canary ブランチで検証.
- **Tailwind v4**: PostCSS 連携は `@tailwindcss/postcss` で完結. `tailwind.config.ts` の互換性を確認.
- **Bun**: `package.json#packageManager` と CI runner (`bun-version`) のズレに注意. 1.3.10 ↔ 1.3.14 の差は SIGILL 再現性に影響する.
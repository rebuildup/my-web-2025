# ライブラリ & バージョン管理 (Packages)

> `package.json` と設計書から抜粋した主要依存の概要

| パッケージ                      | バージョン例 | 用途                             |
| ------------------------------- | ------------ | -------------------------------- |
| next                            | 15.3.4       | React ベースのフレームワーク     |
| react / react-dom               | ^19.0.0      | UI ライブラリ                    |
| typescript                      | ^5           | 型システム                       |
| tailwindcss                     | ^4           | CSS Utility Framework            |
| @tailwindcss/postcss            | ^4           | Tailwind PostCSS プラグイン      |
| lucide-react                    | latest       | アイコンセット                   |
| framer-motion                   | latest       | アニメーション                   |
| three                           | latest       | WebGL ライブラリ (playground 用) |
| pixi.js                         | latest       | 2D Canvas                        |
| axios                           | latest       | HTTP クライアント                |
| date-fns                        | latest       | 日付ユーティリティ               |
| eslint                          | ^9           | Lint                             |
| prettier                        | latest       | Format                           |
| jest                            | latest       | Unit Test                        |
| @playwright/test                | latest       | E2E Test                         |
| lhci                            | latest       | Lighthouse CI                    |
| @eslint/eslintrc                | ^3           | ESLint 設定                      |
| textlint                        | ^15.1.0      | Markdown Lint                    |
| textlint-rule-preset-ai-writing | ^1.1.0       | AI Writing Lint                  |
| @types/node                     | ^20          | Node.js 型定義                   |
| @types/react                    | ^19          | React 型定義                     |
| @types/react-dom                | ^19          | ReactDOM 型定義                  |
| eslint-config-next              | 15.3.4       | Next.js ESLint 設定              |

> **注記**: Lighthouse CI は `lhci/cli` ではなく `lhci` パッケージをインストールしています。

## Scripts (抜粋)

```jsonc
"scripts": {
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "lint:md": "textlint \"documents/**/*.md\""
}
```

## バージョン管理

- Git：trunk-based + feature branch
- Commit lint：Conventional Commits (`feat:`, `fix:`, etc.)
- Release：`npm version` → Tag → GitHub Actions → Deploy

---

> アップグレード指針：Next/Tailwind のメジャーアップは `next lint` と E2E テスト通過を確認してからマージすること。

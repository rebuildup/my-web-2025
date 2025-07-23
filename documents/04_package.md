# ライブラリ & バージョン管理 (Packages)

> `package.json` と設計書から抜粋した主要依存の概要

| パッケージ                      | バージョン | 用途                             |
| ------------------------------- | ---------- | -------------------------------- |
| next                            | 15.4.3     | React ベースのフレームワーク     |
| react / react-dom               | 19.1.0     | UI ライブラリ                    |
| typescript                      | ^5         | 型システム                       |
| tailwindcss                     | ^4         | CSS Utility Framework            |
| @tailwindcss/postcss            | ^4         | Tailwind PostCSS プラグイン      |
| lucide-react                    | ^0.525.0   | アイコンセット                   |
| framer-motion                   | ^12.23.6   | アニメーション                   |
| three                           | ^0.178.0   | WebGL ライブラリ (playground 用) |
| pixi.js                         | ^8.11.0    | 2D Canvas                        |
| axios                           | ^1.11.0    | HTTP クライアント                |
| date-fns                        | ^4.1.0     | 日付ユーティリティ               |
| eslint                          | ^9         | Lint                             |
| prettier                        | ^3.6.2     | Format                           |
| jest                            | ^30.0.5    | Unit Test                        |
| @playwright/test                | ^1.54.1    | E2E Test                         |
| lhci                            | ^4.1.1     | Lighthouse CI                    |
| @eslint/eslintrc                | ^3         | ESLint 設定                      |
| textlint                        | ^15.2.0    | Markdown Lint                    |
| textlint-rule-preset-ai-writing | ^1.1.0     | AI Writing Lint                  |
| @types/node                     | ^20        | Node.js 型定義                   |
| @types/react                    | ^19        | React 型定義                     |
| @types/react-dom                | ^19        | ReactDOM 型定義                  |
| eslint-config-next              | 15.4.3     | Next.js ESLint 設定              |

> **注記**: Lighthouse CI は `lhci/cli` ではなく `lhci` パッケージをインストールしています。

## Scripts (抜粋)

```jsonc
"scripts": {
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "lint:md": "textlint \"documents/**/*.md\"",
  "type-check": "tsc --noEmit",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:e2e": "playwright test",
  "lighthouse": "lhci autorun"
}
```

## メール送信方法

- Gmail SMTPの代替として [Resend](https://resend.com/) を利用
- `RESEND_API_KEY` を環境変数で管理
- nodemailerは不要

## 追加パッケージ (開発・実装用)

| パッケージ                  | バージョン | 用途                       |
| --------------------------- | ---------- | -------------------------- |
| resend                      | ^4.7.0     | メール送信API              |
| sharp                       | ^0.34.3    | 画像処理・最適化           |
| fuse.js                     | ^7.1.0     | 全文検索エンジン           |
| @ffmpeg/ffmpeg              | ^0.12.15   | 動画・画像変換             |
| react-google-recaptcha      | ^3.1.0     | reCAPTCHA                  |
| marked                      | ^16.1.1    | Markdown → HTML変換        |
| dompurify                   | ^3.2.6     | HTML サニタイゼーション    |
| isomorphic-dompurify        | ^2.26.0    | SSR対応サニタイゼーション  |
| @testing-library/react      | ^16.3.0    | React テストユーティリティ |
| @testing-library/jest-dom   | ^6.6.3     | Jest DOM マッチャー        |
| @testing-library/user-event | ^14.6.1    | ユーザーイベントテスト     |
| jest-environment-jsdom      | ^30.0.5    | Jest JSDOM 環境            |

## バージョン管理

- Git：trunk-based + feature branch
- Commit lint：Conventional Commits (`feat:`, `fix:`, etc.)
- Release：`npm version` → Tag → GitHub Actions → Deploy

---

> アップグレード指針：Next/Tailwind のメジャーアップは `next lint` と E2E テスト通過を確認してからマージすること。

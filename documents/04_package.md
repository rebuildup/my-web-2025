# ライブラリ & バージョン管理 (Packages)

> `package.json` と設計書から抜粋した主要依存の概要

| パッケージ        | バージョン例 | 用途                                         |
| ----------------- | ------------ | -------------------------------------------- |
| next              | ^14.x        | React ベースのフレームワーク                 |
| react / react-dom | ^18.x        | UI ライブラリ                                |
| typescript        | ^5.x         | 型システム                                   |
| tailwindcss       | ^4.x         | CSS Utility Framework                        |
| @tailwindcss/\*   | latest       | forms / typography / aspect-ratio プラグイン |
| lucide-react      | ^0.28        | アイコンセット                               |
| framer-motion     | ^11          | アニメーション                               |
| three             | ^0.164       | WebGL ライブラリ (playground 用)             |
| pixi.js           | ^8           | 2D Canvas                                    |
| axios             | ^1.x         | HTTP クライアント                            |
| date-fns          | ^3           | 日付ユーティリティ                           |
| eslint / prettier | latest       | Lint & Format                                |
| jest              | ^29          | Unit Test                                    |
| @playwright/test  | ^1.42        | E2E Test                                     |
| lhci/cli          | ^0.13        | Lighthouse CI                                |

## Scripts (抜粋)

```jsonc
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint . --ext .ts,.tsx",
  "type-check": "tsc --noEmit",
  "test": "jest",
  "e2e": "playwright test",
  "optimize-images": "node scripts/optimize-images.js",
  "generate-favicons": "node scripts/generate-favicons.js"
}
```

## バージョン管理

- **Git**: trunk-based + feature branch
- **Commit lint**: Conventional Commits (`feat:`, `fix:`, etc.)
- **Release**: `npm version` → Tag → GitHub Actions → Deploy

---

> **アップグレード指針**: Next/Tailwind のメジャーアップは `next lint` と E2E テスト通過を確認してからマージすること。

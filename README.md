# samuido Website

This is a comprehensive personal portfolio website built with [Next.js](https://nextjs.org) 15.4.3, featuring a unified content management system for blog posts, plugin distribution, and download materials.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3010](http://localhost:3010) with your browser to see the result.

## Quality Assurance

This project maintains 100% test pass rates across all quality checks. Use the comprehensive test script to verify code quality:

### Run All Tests (Recommended)

```bash
# PowerShell (Windows)
npm run test:all

# Bash (Linux/macOS)
npm run test:all:bash
```

### Individual Test Commands

```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Build verification
npm run build

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Format check
npx prettier --check src/app/workshop/
```

## Project Structure

- `/src/app/workshop/` - Unified content management system
  - Blog posts (`/workshop/blog`)
  - Plugin distribution (`/workshop/plugins`)
  - Download materials (`/workshop/downloads`)
- `/scripts/` - Quality assurance scripts
- `/public/data/` - JSON-based content storage

## Portfolio Import

ポートフォリオデータをCMSにインポートするには、Playwrightを使用した自動化スクリプトを使用します：

```bash
# 開発サーバーを起動（別ターミナル）
pnpm dev

# ポートフォリオデータをインポート
pnpm import-portfolio
```

このスクリプトは `portfolio.json` のデータを読み込み、管理ページから各コンテンツを自動的に作成します。開発サーバーが `http://localhost:3010` で起動している必要があります。

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

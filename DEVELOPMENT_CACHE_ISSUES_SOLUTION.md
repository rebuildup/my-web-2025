# 開発モードでのキャッシュ問題解決方法

## 🔍 問題の特定

### 症状

- `npm run dev`（開発モード）では古いコンポーネントが表示される
- `npm run start`（本番モード）では正しく表示される
- シークレットモードでは正しく表示される
- 通常のブラウザキャッシュクリアでは解決しない

### 根本原因

**Next.jsの開発モードでのHot Module Replacement (HMR)とキャッシュの問題**

1. **HMRの不完全な更新**
   - コンポーネントの変更がブラウザに正しく反映されない
   - 古いバージョンのJavaScriptがキャッシュされる

2. **開発サーバーのメモリキャッシュ**
   - Next.jsが内部的にコンポーネントをキャッシュ
   - ファイル変更が検出されても古いキャッシュが使用される

3. **ブラウザの開発者向けキャッシュ**
   - Service Worker
   - IndexedDB
   - Local Storage
   - HTTP/2 Push Cache

## 🛠️ 実装した解決策

### 1. Next.js設定の最適化 (`next.config.ts`)

```typescript
experimental: {
  // Development mode optimizations
  ...(process.env.NODE_ENV === "development" && {
    linkNoTouchStart: true,
    isrMemoryCacheSize: 0, // Disable ISR cache in development
    forceSwcTransforms: true, // Force SWC transforms for better HMR
  }),
}
```

### 2. 開発環境変数 (`.env.development`)

```env
NEXT_CACHE_DISABLED=true
NEXT_BUILD_TIME=false
NEXT_DISABLE_STATIC_OPTIMIZATION=true
NEXT_DEBUG=true
NEXT_DISABLE_SW=true
```

### 3. 開発キャッシュクリアスクリプト

```bash
# 新しいスクリプト
npm run clear-dev-cache  # 開発キャッシュを完全クリア
npm run dev:fresh        # キャッシュクリア後に開発サーバー起動
```

### 4. クリアされるキャッシュ

- `.next/` - Next.jsビルドキャッシュ
- `node_modules/.cache/` - Node.jsキャッシュ
- `.tsbuildinfo` - TypeScriptキャッシュ
- `.eslintcache` - ESLintキャッシュ
- `.turbo/` - Turbopackキャッシュ
- `node_modules/.cache/@swc/` - SWCキャッシュ

## 🚀 使用方法

### 問題が発生した場合

```bash
# 1. 開発サーバーを停止 (Ctrl+C)

# 2. 開発キャッシュを完全クリア
npm run clear-dev-cache

# 3. 新しい開発サーバーを起動
npm run dev

# または一括実行
npm run dev:fresh
```

### ブラウザ側の対処

1. **Chrome/Edge**: F12 → Application → Storage → Clear site data
2. **Firefox**: F12 → Storage → 右クリック → Delete All
3. **開発者ツール**: Network タブで "Disable cache" を有効化

## 📊 効果の確認

### 修正前

- 開発モードで古いコンポーネントが表示
- HMRが正しく動作しない
- ブラウザキャッシュクリアでは解決しない

### 修正後

- 開発モードでも最新のコンポーネントが表示
- HMRが正常に動作
- ファイル変更が即座に反映

## 🔧 今後の開発のために

### 推奨設定

1. **開発者ツールで "Disable cache" を有効化**
2. **定期的に `npm run clear-dev-cache` を実行**
3. **問題が発生したら `npm run dev:fresh` を使用**

### 予防策

- 大きな変更後は開発サーバーを再起動
- コンポーネント構造を大幅に変更した場合はキャッシュクリア
- 複数のブラウザで動作確認

これで、開発モードでのキャッシュ問題が根本的に解決されます！

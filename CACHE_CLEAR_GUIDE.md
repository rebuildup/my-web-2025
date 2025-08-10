# 🧹 キャッシュクリア完全ガイド（強化版）

**全ブラウザ（通常・シークレットモード）対応**の完全キャッシュクリア機能です。
ブラウザごとの不具合を完全に解決します。

## 🚨 問題の症状

- ブラウザのキャッシュ削除後も不具合が残る
- ブラウザごとに異なる動作をする
- 開発中の変更が反映されない
- 本番環境で古いバージョンが表示される

## 🛠️ 解決方法

### 1. コマンドラインでの完全キャッシュクリア

#### Node.jsスクリプト版（推奨）

```bash
# 完全なキャッシュクリア
npm run clear-cache-complete

# キャッシュクリア後に開発サーバーを自動起動
npm run clear-cache-and-restart
```

#### PowerShell版（Windows）

```powershell
# 基本的なキャッシュクリア
npm run clear-cache-complete:ps

# キャッシュクリア + 開発サーバー自動起動
npm run clear-cache-and-restart:ps

# 詳細ログ付き
powershell -ExecutionPolicy Bypass -File scripts/clear-cache-complete.ps1 -Verbose

# ブラウザキャッシュをスキップ
powershell -ExecutionPolicy Bypass -File scripts/clear-cache-complete.ps1 -SkipBrowserCache
```

### 2. Webアプリケーション内でのキャッシュ管理

#### 管理パネルの使用

```typescript
import CacheClearPanel from '@/components/admin/CacheClearPanel';

// 管理画面などで使用
<CacheClearPanel />
```

#### プログラムでのキャッシュクリア

```typescript
import { clearAllCaches, diagnoseCacheIssues } from "@/lib/cache-utils";

// すべてのキャッシュをクリア
await clearAllCaches();

// キャッシュ状態を診断
await diagnoseCacheIssues();
```

### 3. ブラウザコンソールでの手動クリア

ブラウザのコンソールで以下のスクリプトを実行：

```javascript
// 自動生成されたスクリプトを使用
fetch("/clear-browser-cache.js")
  .then((response) => response.text())
  .then((script) => eval(script));

// または直接関数を呼び出し
clearAllCaches();
diagnoseCacheIssues();
```

## 📊 クリアされるキャッシュの種類

### Next.js関連

- `.next/` - ビルドキャッシュ
- `.next/cache/` - ランタイムキャッシュ
- `.next/static/` - 静的アセット
- `.next/server/` - サーバーキャッシュ
- `.swc/` - SWCコンパイラキャッシュ
- `.turbo/` - Turbopackキャッシュ

### Node.js関連

- `node_modules/.cache/` - モジュールキャッシュ
- `node_modules/.cache/jest/` - Jestキャッシュ
- `node_modules/.cache/@swc/` - SWCキャッシュ
- `node_modules/.cache/webpack/` - Webpackキャッシュ
- `node_modules/.cache/terser-webpack-plugin/` - Terserキャッシュ
- `node_modules/.cache/babel-loader/` - Babelローダーキャッシュ

### コンパイラ関連

- `tsconfig.tsbuildinfo` - TypeScriptビルド情報
- `.eslintcache` - ESLintキャッシュ
- `.prettiercache` - Prettierキャッシュ
- `type-coverage.json` - 型カバレッジキャッシュ

### テスト関連

- `coverage/` - Jestカバレッジレポート
- `test-results/` - Playwrightテスト結果
- `playwright-report/` - PlaywrightHTMLレポート
- `logs/` - アプリケーションログ

### ブラウザ関連

- Service Workers
- Local Storage
- Session Storage
- Cache API
- IndexedDB
- ブラウザのディスクキャッシュ（PowerShell版のみ）

## 🌐 ブラウザ固有の対応

### Chrome

- 問題: 積極的な静的アセットキャッシュ
- 解決策: `Ctrl+Shift+R` でハードリロード、DevToolsでキャッシュ無効化

### Firefox

- 問題: Service Workerの永続化
- 解決策: `Ctrl+Shift+R` でハードリロード、プライバシー設定でデータクリア

### Safari

- 問題: Webkitキャッシュの永続化
- 解決策: `Cmd+Shift+R` でハードリロード、開発メニューでWebサイトデータクリア

### Edge

- 問題: Chromeと同様のキャッシュ動作
- 解決策: `Ctrl+Shift+R` でハードリロード、閲覧データクリア

## 🔧 高度な使用方法

### 開発時の自動キャッシュクリア

`.kiro/steering/` にキャッシュクリア用のフックを設定：

```markdown
---
inclusion: manual
---

# 開発時自動キャッシュクリア

ファイル保存時に自動的にキャッシュをクリアする設定
```

### CI/CDでのキャッシュクリア

```yaml
# GitHub Actions例
- name: Clear all caches
  run: npm run clear-cache-complete

- name: Verify cache clear
  run: |
    if [ -d ".next" ]; then
      echo "Cache clear failed"
      exit 1
    fi
```

### カスタムキャッシュクリア

```typescript
import { BrowserCacheManager } from "@/lib/cache-utils";

const manager = BrowserCacheManager.getInstance();

// カスタム診断
const state = await manager.diagnoseCacheState();
console.log("Cache state:", state);

// ブラウザ固有の問題検出
const browserInfo = manager.detectBrowserIssues();
console.log("Browser issues:", browserInfo);
```

## 🚀 トラブルシューティング

### 問題: キャッシュクリア後も問題が続く

**解決策:**

1. ブラウザを完全に再起動
2. 異なるブラウザで確認
3. シークレット/プライベートモードで確認
4. ブラウザの設定から手動でキャッシュクリア

### 問題: PowerShellスクリプトが実行できない

**解決策:**

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 問題: 権限エラーでファイルが削除できない

**解決策:**

1. 管理者権限でコマンドプロンプト/PowerShellを実行
2. ブラウザを完全に終了してから実行
3. ウイルス対策ソフトの除外設定を確認

### 問題: 開発サーバーが起動しない

**解決策:**

1. `npm install` でパッケージを再インストール
2. `node_modules` を削除して再インストール
3. Node.jsのバージョンを確認

## 📝 ログとモニタリング

### キャッシュクリアログの確認

```bash
# 詳細ログ付きで実行
npm run clear-cache-complete 2>&1 | tee cache-clear.log
```

### 定期的なキャッシュ状態チェック

```typescript
// 定期的にキャッシュ状態をチェック
setInterval(async () => {
  const manager = BrowserCacheManager.getInstance();
  const state = await manager.diagnoseCacheState();

  if (getTotalCacheItems(state) > 100) {
    console.warn("Cache accumulation detected");
  }
}, 60000); // 1分ごと
```

## 🎯 ベストプラクティス

1. **定期的なキャッシュクリア**: 開発開始時に毎回実行
2. **ブラウザ固有の対応**: 各ブラウザの特性を理解
3. **自動化**: CI/CDパイプラインに組み込み
4. **モニタリング**: キャッシュ状態の定期的な確認
5. **ドキュメント化**: チーム内でのキャッシュクリア手順の共有

## 🔗 関連ファイル

- `scripts/clear-cache-complete.js` - Node.jsキャッシュクリアスクリプト
- `scripts/clear-cache-complete.ps1` - PowerShellキャッシュクリアスクリプト
- `src/lib/cache-utils.ts` - キャッシュ管理ユーティリティ
- `src/components/admin/CacheClearPanel.tsx` - Web管理パネル
- `public/clear-browser-cache.js` - ブラウザコンソール用スクリプト
- `cache-bust-config.json` - キャッシュバスティング設定

このガイドに従って、ブラウザキャッシュの問題を完全に解決できます。

---

## 🚀 強化版機能（NEW）

### 全ブラウザ対応の完全キャッシュクリア

#### コマンドライン（最強版）

```bash
# 全ブラウザのキャッシュを完全削除
npm run clear-cache-all-browsers

# 詳細ログ付きの核オプション
npm run clear-cache-nuclear

# 従来版
npm run clear-cache-complete
```

#### 高度な管理パネル

```typescript
import AdvancedCacheClearPanel from '@/components/admin/AdvancedCacheClearPanel';

// 全ブラウザ対応の管理パネル
<AdvancedCacheClearPanel />
```

#### プログラムでの使用

```typescript
import {
  clearAllBrowserCaches,
  diagnoseBrowserCache,
  AdvancedBrowserCacheManager,
} from "@/lib/advanced-cache-utils";

// 完全キャッシュクリア
const result = await clearAllBrowserCaches();

// 詳細診断
const diagnosis = await diagnoseBrowserCache();

// 高度な管理
const manager = AdvancedBrowserCacheManager.getInstance();
const browserInfo = await manager.detectBrowserInfo();
```

#### ブラウザコンソール（強化版）

```javascript
// 強化版スクリプトを実行
fetch("/advanced-browser-cache-clear.js")
  .then((response) => response.text())
  .then((script) => eval(script));

// または直接関数を呼び出し
clearAllBrowserCaches();
diagnoseBrowserCache();
```

### 🌐 対応ブラウザ

**完全対応:**

- Chrome（通常・シークレット）
- Edge（通常・InPrivate）
- Firefox（通常・プライベート）
- Safari（通常・プライベート）
- Brave（通常・プライベート）
- Opera（通常・プライベート）

**追加対応:**

- Internet Explorer
- Windows Store アプリ
- システムDNSキャッシュ

### 🧹 クリアされるキャッシュ（強化版）

**ブラウザキャッシュ:**

- Service Workers（完全削除）
- Local Storage（全項目）
- Session Storage（全項目）
- IndexedDB（強制削除）
- Cache API（全エントリ）
- Cookies（全ドメイン・パス）
- Performance データ
- Memory キャッシュ
- BroadcastChannel

**システムキャッシュ:**

- Chrome: Cache, Code Cache, GPU Cache, Service Worker
- Edge: Cache, Code Cache, GPU Cache, Service Worker
- Firefox: cache2, startupCache, storage, indexedDB
- Safari: WebKit cache, LocalStorage
- DNS キャッシュ
- Windows Store キャッシュ

### 🔧 高度な機能

**シークレットモード検出:**

- 各ブラウザのシークレット/プライベートモード自動検出
- モード別の最適化されたキャッシュクリア

**ブラウザ固有対応:**

- Chrome/Edge: HTTP/2 Push cache対応
- Firefox: WebSQL対応
- Safari: Webkit固有キャッシュ対応

**エラーハンドリング:**

- 詳細なエラーレポート
- 部分的失敗でも継続実行
- ブロックされたIndexedDB削除の強制実行

### 📊 診断機能

**詳細診断:**

- ブラウザ情報（バージョン、プラットフォーム）
- シークレットモード検出
- キャッシュ状態の詳細分析
- 推奨事項の自動生成

**リアルタイム監視:**

- キャッシュ蓄積の監視
- メモリ使用量の表示
- パフォーマンス影響の分析

これで、ブラウザごとの不具合を完全に解決できる包括的なキャッシュクリア機能が完成しました！

# ポートフォリオ記事自動作成スクリプト

このスクリプトは、`portfolio.json`のデータを使用して、admin/content/page-editorで全コンテンツの記事を自動作成します。

## 機能

このスクリプトは以下の処理を自動化します：

1. **既存記事の削除** - 同じコンテンツIDの既存記事を全て削除
2. **記事を作成** - 新しい記事を作成
3. **タイトル設定** - 記事のタイトルをコンテンツデータのタイトルに設定
4. **スラッグ設定** - 記事のスラッグをコンテンツデータのIDに設定
5. **タイトルHeadingブロック** - コンテンツデータのタイトルをH1として追加
6. **概要Paragraphブロック** - コンテンツデータの概要説明を追加
7. **Mediaセクション** - "Media"というHeadingブロックを追加し、以下を処理：
   - **YouTubeリンク** - Custom HTMLブロックでYouTubeのiframe埋め込みを追加
   - **画像** - Imageブロックを追加
   - **動画** - Videoブロックを追加
   - **ファイル** - Fileブロックを追加
8. **Linksセクション** - "Links"というHeadingブロックを追加
9. **Bookmarkブロック** - 各リンクをBookmarkブロックとして追加
10. **保存** - 記事を保存

## 前提条件

1. 開発サーバーが起動していること
2. `portfolio.json`が存在すること
3. admin/content/page-editorにアクセス可能であること

## 使用方法

### 1. 開発サーバーを起動

別のターミナルで開発サーバーを起動します：

```powershell
pnpm dev
```

サーバーが `http://localhost:3010` で起動するまで待ちます。

### 2. スクリプトを実行

```powershell
pnpm portfolio:create-articles
```

### 実行時の動作

- **ブラウザが表示されます** - スクリプトはヘッドレスモードではなく、実際のChromeブラウザを開いて実行されます
- **自動操作が見えます** - ブラウザ内での全ての操作（クリック、入力、スクロールなど）が目視で確認できます
- **進捗がコンソールに表示されます** - 各ステップの進捗がターミナルに表示されます

### 実行例

```
========================================
ポートフォリオ記事の自動作成を開始
========================================

読み込んだポートフォリオ件数: 55

[1/55] Processing: portfolio-1753705784056
  Title: 高専プロコン 非公式pv
  - Selecting content: portfolio-1753705784056
  - Deleting existing pages for: portfolio-1753705784056
  - Creating new page: 高専プロコン 非公式pv (portfolio-1753705784056)
  - Clearing all blocks
  - Adding heading: 高専プロコン 非公式pv
  - Adding paragraph
  - Adding heading: Media
  - Adding custom HTML block
  - Adding heading: Links
  - Adding bookmark: https://x.com/361do_sleep/status/1845653703463989526
  - Saving page
  ✓ Successfully created article for: portfolio-1753705784056

[2/55] Processing: portfolio-1234567890123
...
```

## トラブルシューティング

### サーバーが起動していない

```
Error: page.goto: net::ERR_CONNECTION_REFUSED
```

**解決方法**: 別のターミナルで `pnpm dev` を実行して開発サーバーを起動してください。

### タイムアウトエラー

```
TimeoutError: locator.click: Timeout 10000ms exceeded.
```

**解決方法**: 
- ページの読み込みが遅い可能性があります
- ブラウザを確認して、エラーダイアログなどが表示されていないか確認してください
- スクリプトを再実行してください

### 特定のコンテンツで失敗する

スクリプトはエラーが発生しても次のコンテンツを処理し続けます。失敗したコンテンツはログに記録されます。

## 設定

### タイムアウト時間の調整

`scripts/create-portfolio-articles.spec.ts` の以下の行で全体のタイムアウトを変更できます：

```typescript
test.setTimeout(1800000); // 30分 = 1800000ミリ秒
```

### 待機時間の調整

スクリプト内の `page.waitForTimeout()` の値を調整することで、各操作間の待機時間を変更できます。

### ヘッドレスモードの有効化

ブラウザを表示せずに実行したい場合は、`playwright.config.ts` で以下を変更します：

```typescript
use: { 
  headless: true,  // false から true に変更
}
```

または、コマンドラインで直接指定：

```powershell
pnpm exec playwright test scripts/create-portfolio-articles.spec.ts --reporter=line
```

## スクリプトファイル

- **スクリプト本体**: `scripts/create-portfolio-articles.spec.ts`
- **Playwright設定**: `playwright.config.ts`
- **実行コマンド**: `package.json` の `portfolio:create-articles`

## 技術詳細

### 使用技術

- **Playwright**: ブラウザ自動化フレームワーク
- **TypeScript**: 型安全なスクリプト記述

### 処理フロー

1. `portfolio.json`を読み込み
2. 各コンテンツに対して：
   - コンテンツを選択
   - 既存の記事を全て削除
   - 新しい記事を作成
   - ブロックを追加（Heading、Paragraph、Custom HTML、Image、Bookmark等）
   - 保存
3. 全コンテンツの処理が完了したら終了

### YouTube埋め込み処理

YouTubeのURLから動画IDを抽出し、iframe埋め込みコードを生成します：

```typescript
// 対応するURLパターン:
// - https://www.youtube.com/watch?v=VIDEO_ID
// - https://youtu.be/VIDEO_ID
// - https://www.youtube.com/embed/VIDEO_ID
```

## 参考

- [Playwright Documentation](https://playwright.dev/)
- [Next.js Documentation](https://nextjs.org/docs)

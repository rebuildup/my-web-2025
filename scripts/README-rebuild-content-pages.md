# コンテンツページ再構築スクリプト

`admin/content/page-editor`で全コンテンツデータの記事データを作り直すPlaywrightスクリプトです。

## 機能

このスクリプトは以下の一連の動作を自動化します：

1. **既存記事の削除** - 指定されたコンテンツIDの既存記事をすべて削除
2. **記事の作成** - 新しい記事を作成
3. **タイトルとスラッグの設定** - 記事のタイトルをコンテンツデータのタイトルに、スラッグをコンテンツデータのIDに設定
4. **コンテンツの追加**:
   - Headingブロック（H1）でタイトルを記述
   - Paragraphブロックで概要説明を記述
   - Headingブロック（H2）で「Media」セクションを追加
   - メディアの追加:
     - YouTubeリンクが存在すればCustomHTMLブロックでiframe埋め込み
     - 画像が存在すればImageブロック
     - 動画が存在すればVideoブロック
     - ファイルがあればFileブロック
   - Headingブロック（H2）で「Links」セクションを追加
   - Bookmarkブロックでリンクを記述
5. **保存** - 記事を保存

## 使用方法

### 基本的な実行

```bash
pnpm exec playwright test scripts/rebuild-content-pages.spec.ts
```

### 環境変数

- `BASE_URL`: ベースURL（デフォルト: `http://localhost:3010`）
- `CONTENT_LIMIT`: 処理するコンテンツ数の制限（デフォルト: 制限なし）
- `DEBUG`: デバッグモードを有効にする（`1` または `true`）

### 例

#### デバッグモードで実行（操作が見やすくなります）

```bash
DEBUG=1 pnpm exec playwright test scripts/rebuild-content-pages.spec.ts
```

#### 最初の5件のみ処理

```bash
CONTENT_LIMIT=5 pnpm exec playwright test scripts/rebuild-content-pages.spec.ts
```

#### カスタムURLで実行

```bash
BASE_URL=http://localhost:3000 pnpm exec playwright test scripts/rebuild-content-pages.spec.ts
```

## Playwright-MCPでの動作確認

このスクリプトは`playwright.config.ts`でヘッドレスモードがオフになっているため、ブラウザの操作が見える形で実行されます。Playwright-MCPを使って動作確認を行う場合は、以下の手順を実行してください：

1. **開発サーバーを起動**
   ```bash
   pnpm dev
   ```

2. **スクリプトを実行**
   ```bash
   DEBUG=1 pnpm exec playwright test scripts/rebuild-content-pages.spec.ts
   ```

3. **ブラウザで動作を確認**
   - ブラウザウィンドウが開き、各ステップでの操作が確認できます
   - デバッグモード（`DEBUG=1`）を有効にすると、各ステップでの待機時間が長くなり、操作が見やすくなります

## 注意事項

- **ヘッドレスモード**: このスクリプトは`playwright.config.ts`でヘッドレスモードがオフになっているため、ブラウザの操作が見える形で実行されます
- **実行時間**: コンテンツ数によっては30分以上かかる場合があります
- **エラーハンドリング**: エラーが発生した場合、スクリーンショットが`debug-page-error-{contentId}.png`として保存されます
- **サーバー起動**: 実行前に開発サーバーが起動していることを確認してください

## ログ出力

スクリプトは各ステップで詳細なログを出力します：

- `✓` - 成功した操作
- `✗` - 失敗した操作
- `⚠` - 警告

## トラブルシューティング

### サーバーに接続できない

```bash
# ポート3010が使用されているか確認
netstat -ano | findstr :3010

# 開発サーバーを起動
pnpm dev
```

### タイムアウトエラー

`playwright.config.ts`のタイムアウト設定を確認してください。デフォルトでは30分に設定されています。

### 要素が見つからない

デバッグモードを有効にして、各ステップでの待機時間を長くしてください：

```bash
DEBUG=1 pnpm exec playwright test scripts/rebuild-content-pages.spec.ts
```

## 改善点

このスクリプトには以下の改善が加えられています：

- **詳細なログ出力**: 各ステップで何が行われているかが明確に分かるログを出力
- **エラーハンドリング**: エラー発生時に適切なエラーメッセージとスクリーンショットを保存
- **デバッグモード**: `DEBUG=1`で有効にできるデバッグモードで、操作が見やすくなります
- **待機時間の調整**: デバッグモードでは各ステップでの待機時間が長くなり、操作を確認しやすくなります


# AIチャットプロフィールページ (/about/profile/AI)

## 目的

Difyを使って学習させたAIのsamuidoとチャット形式で対話できるページ。プロフィールや作品について質問できる。

## 主な要素

- チャットインターフェース
- AIアバター表示
- チャット履歴
- 入力フォーム

## 機能

### AIチャット機能

- **Dify連携**: Difyプラットフォームを使用したAI対話
- **学習データ**:
  - プロフィール情報
  - 作品の概要
  - markdownでの記事内容
  - サイトのコンテンツデータ
- **対話内容**:
  - プロフィールについての質問
  - 作品についての質問
  - 技術についての質問
  - 制作過程についての質問

### チャットインターフェース

- **リアルタイム対話**: 即座にレスポンス
- **チャット履歴**: 過去の対話を表示
- **入力フォーム**: テキスト入力による質問
- **AIアバター**: samuidoのアバター表示

### 学習コンテンツ

- **プロフィール情報**: 基本情報、スキル、経歴
- **作品データ**: ポートフォリオの作品情報
- **記事内容**: ブログやチュートリアルの内容
- **技術情報**: 使用技術や制作手法

## データ

- `ContentItem` type: `ai-chat`
- Dify API連携
- チャット履歴の保存

## Meta情報

### SEO

- **title**: "AI Chat - samuido | AIのsamuidoと対話"
- **description**: "AIのsamuidoとチャット形式で対話。プロフィール、作品、技術について質問できます。"
- **keywords**: "AIチャット, samuido, 対話, プロフィール, 作品, 技術"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/about/profile/AI"

### Open Graph

- **og:title**: "AI Chat - samuido | AIのsamuidoと対話"
- **og:description**: "AIのsamuidoとチャット形式で対話。プロフィール、作品、技術について質問できます。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/about/profile/AI"
- **og:image**: "https://yusuke-kim.com/about/profile-AI-og-image.jpg"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "AI Chat - samuido | AIのsamuidoと対話"
- **twitter:description**: "AIのsamuidoとチャット形式で対話。プロフィール、作品、技術について質問できます。"
- **twitter:image**: "https://yusuke-kim.com/about/profile-AI-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "samuido AI Chat",
  "description": "AIのsamuidoとチャット形式で対話できるアプリケーション",
  "url": "https://yusuke-kim.com/about/profile/AI",
  "applicationCategory": "CommunicationApplication",
  "operatingSystem": "Web Browser",
  "author": {
    "@type": "Person",
    "name": "木村友亮",
    "alternateName": "samuido"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  }
}
```

## 技術要件

### Dify連携

- **API接続**: DifyプラットフォームとのAPI連携
- **プロンプト管理**: prompt.mdファイルでのプロンプト管理
- **学習データ**: サイトコンテンツの自動学習

### チャット機能

- **リアルタイム通信**: WebSocketまたはServer-Sent Events
- **履歴管理**: チャット履歴の保存と表示
- **入力検証**: 適切な入力内容の検証

### プライバシー

- **データ保護**: チャット内容の適切な管理
- **個人情報**: 最小限の個人情報収集

## 詳細

### Dify API連携

#### API設定

```typescript
// 1. APIキーの安全な管理
const apiConfig = {
  // サーバーサイドでのみAPIキーを使用
  apiKey: process.env.DIFY_API_KEY, // クライアントサイドでは使用しない
  baseURL: process.env.DIFY_API_URL,

  // リクエスト制限
  rateLimit: {
    requests: 100,
    window: 60000, // 1分間
  },
};
```

#### 認証付きプロキシAPI

```typescript
// /api/dify-proxy.js (Next.js API Routes)
export default async function handler(req, res) {
  // ユーザー認証チェック
  const session = await getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Dify APIへのプロキシ
  const response = await fetch(
    `${process.env.DIFY_API_URL}${req.query.endpoint}`,
    {
      method: req.method,
      headers: {
        Authorization: `Bearer ${process.env.DIFY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
    }
  );

  const data = await response.json();
  res.status(response.status).json(data);
}
```

### チャットインターフェース

#### XのDMライクなデザイン

- **グリッドレイアウト**: CSS Gridを使用したレスポンシブレイアウト
- **チャットバブル**: ユーザーとAIのメッセージを区別
- **タイムスタンプ**: 各メッセージに時間表示
- **入力エリア**: 下部固定の入力フォーム
- **送信ボタン**: 送信とEnterキー対応

#### チャット機能

- **リアルタイム通信**: WebSocketまたはServer-Sent Events
- **履歴管理**: チャット履歴の保存と表示
- **入力検証**: 適切な入力内容の検証
- **ローディング表示**: AI応答中のローディングアニメーション

### Dify設定項目

#### 基本設定

- **API Key**: Difyプラットフォームで取得したAPIキー
- **Base URL**: Dify APIのベースURL
- **Model**: 使用するAIモデル（GPT-4、Claude等）
- **Temperature**: 応答の創造性設定（0.0-1.0）

#### プロンプト設定

- **System Prompt**: AIの基本設定（samuidoの性格設定）
- **User Prompt**: ユーザーからの質問
- **Context**: サイトコンテンツの学習データ
- **Memory**: 会話履歴の保持設定

#### 応答設定

- **Max Tokens**: 最大応答文字数
- **Stop Sequences**: 応答終了の判定文字列
- **Streaming**: リアルタイム応答の有効/無効
- **Retry Logic**: エラー時の再試行設定

### 学習データ管理

#### コンテンツデータ

- **プロフィール情報**: 基本情報、スキル、経歴
- **作品データ**: ポートフォリオの作品情報
- **記事内容**: ブログやチュートリアルの内容
- **技術情報**: 使用技術や制作手法

#### データ更新

- **自動更新**: サイトコンテンツの変更を自動反映
- **手動更新**: 管理者による手動データ更新
- **バージョン管理**: 学習データのバージョン管理

### プライバシー保護

- **データ保護**: チャット内容の適切な管理
- **個人情報**: 最小限の個人情報収集
- **セッション管理**: 適切なセッション管理
- **ログ管理**: チャットログの適切な管理

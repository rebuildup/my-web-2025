# WebGLプレイグラウンドページ (/portfolio/playground/WebGL)

## 目的

WebGLを使った3Dグラフィックスやシェーダーの実験を自由に展示し、WebGLの可能性を探るプレイグラウンドを提供する.

## 主な要素

- WebGL実験作品
- 3Dグラフィックス
- シェーダー実験
- インタラクティブ要素

## 機能

### WebGL実験作品

- **3Dグラフィックス**: Three.js、Babylon.jsなどの3Dライブラリ
- **シェーダー**: GLSLを使ったシェーダー実験
- **パーティクル**: パーティクルシステム
- **ポストプロセス**: ポストプロセシング効果

### 3Dグラフィックス

- **モデル表示**: 3Dモデルの表示
- **アニメーション**: 3Dアニメーション
- **ライティング**: 様々なライティング効果
- **マテリアル**: 様々なマテリアル効果

### シェーダー実験

- **頂点シェーダー**: 頂点シェーダーの実験
- **フラグメントシェーダー**: フラグメントシェーダーの実験
- **ノイズ**: ノイズ関数の実験
- **エフェクト**: 様々なエフェクト

### インタラクティブ要素

- **マウス操作**: マウスでの3D操作
- **タッチ操作**: タッチでの3D操作
- **キーボード操作**: キーボードでの操作
- **リアルタイム**: リアルタイムでの反応

### フィルター機能

- **カテゴリーフィルター**: 3D、シェーダー、パーティクル、エフェクト
- **技術フィルター**: Three.js、Babylon.js、GLSL、WebGL
- **年別フィルター**: 制作年による絞り込み
- **タグフィルター**: タグによる絞り込み

### ソート機能

- **新着順**: 最新の実験から表示
- **人気順**: 人気度による並び替え
- **技術順**: 使用技術による並び替え

## データ

- `ContentItem` type: `playground`
- `customFields`: `title`, `description`, `category`, `technology`, `tags`, `year`, `interactive`, `webgl-type`

## Meta情報

### SEO

- **title**: "WebGL Playground - samuido | WebGLプレイグラウンド"
- **description**: "samuidoのWebGLプレイグラウンド.WebGLを使った3Dグラフィックスやシェーダーの実験を自由に展示し、WebGLの可能性を探ります."
- **keywords**: "WebGLプレイグラウンド, 3Dグラフィックス, シェーダー, Three.js, GLSL, WebGL"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/portfolio/playground/WebGL"

### Open Graph

- **og:title**: "WebGL Playground - samuido | WebGLプレイグラウンド"
- **og:description**: "samuidoのWebGLプレイグラウンド.WebGLを使った3Dグラフィックスやシェーダーの実験を自由に展示し、WebGLの可能性を探ります."
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/portfolio/playground/WebGL"
- **og:image**: "https://yusuke-kim.com/portfolio/playground-webgl-og-image.png"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "WebGL Playground - samuido | WebGLプレイグラウンド"
- **twitter:description**: "samuidoのWebGLプレイグラウンド.WebGLを使った3Dグラフィックスやシェーダーの実験を自由に展示し、WebGLの可能性を探ります."
- **twitter:image**: "https://yusuke-kim.com/portfolio/playground-webgl-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "samuido WebGL Playground",
  "description": "WebGLプレイグラウンド",
  "url": "https://yusuke-kim.com/portfolio/playground/WebGL",
  "mainEntity": {
    "@type": "ItemList",
    "name": "WebGL実験一覧",
    "description": "WebGLを使った3Dグラフィックスやシェーダーの実験一覧"
  },
  "author": {
    "@type": "Person",
    "name": "木村友亮",
    "alternateName": "samuido"
  }
}
```

## 技術要件

### レスポンシブ対応

- **WebGL対応**: デバイスに応じたWebGL設定
- **パフォーマンス**: デバイス性能に応じた品質調整
- **レイアウト**: デバイスに応じたレイアウト調整

### パフォーマンス

- **GPU最適化**: GPU使用の最適化
- **メモリ管理**: 適切なメモリ使用
- **フレームレート**: 安定したフレームレート

### アクセシビリティ

- **キーボード操作**: キーボードでのナビゲーション
- **スクリーンリーダー**: 適切なaria属性設定
- **代替操作**: タッチデバイスでの代替操作

# コンポーネントカタログ (Components)

> UI/レイアウト/ビジネスロジック別に主要コンポーネントを一覧化

## 1. 共通 UI (`src/components/ui`)

| コンポーネント | 主な Props        | 用途                                       |
| -------------- | ----------------- | ------------------------------------------ |
| `Button`       | `variant` `size`  | 基本ボタン (`primary` `secondary` `ghost`) |
| `Card`         | `title` `image`   | 汎用カードレイアウト                       |
| `Modal`        | `open` `onClose`  | ポップアップダイアログ                     |
| `Input`        | `label` `error`   | テキスト入力                               |
| `Select`       | `options` `value` | セレクトボックス                           |
| `Toast`        | `type` `message`  | 通知トースト                               |

## 2. レイアウト (`src/components/layout`)

| 名称         | 概要                            |
| ------------ | ------------------------------- |
| `Header`     | グローバルナビゲーション + ロゴ |
| `Footer`     | サイト情報 & SNS リンク         |
| `Navigation` | サイドバー / ドロワー切替対応   |
| `Sidebar`    | Admin/Docs 用の縦型メニュー     |

## 3. 専用コンポーネント

### Portfolio

- `GalleryCard`, `GalleryGrid`, `DetailView`, `FilterBar`, `SortDropdown`

### Tools

- `ColorPalette`, `SVGConverter`, `PomodoroTimer`, `PiGame`, `AEExpressionBuilder`, `BusinessMailBuilder`

### Admin

- `ContentEditor`, `MarkdownEditor`, `FileUploader`, `ContentPreview`

### Shared

- `SEOHead`, `SocialShare`, `Timeline`, `QRCode`, `LoadingSpinner`

## 4. 動的インポートガイド

```ts
import dynamic from "next/dynamic";
const ColorPalette = dynamic(() => import("@/components/tools/ColorPalette"), {
  ssr: false,
});
```

- 重い 3D/Canvas 系 (`ThreeJSPlayground`) は必ず `ssr:false`

## 5. ストーリーブック (予定)

- `npm run storybook` でコンポーネント単体確認

---

> **開発ルール**: 新規コンポーネントは `/\*\*

- @docs description
  \*/`コメントを付与し`index.ts` に必ずエクスポートを追加してください。

# Breadcrumbs Component

シンプルで使いやすいパンくずリストコンポーネントです。情報を直接渡すだけで簡単に使用できます。

## 基本的な使用方法

```tsx
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function MyPage() {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Portfolio", href: "/portfolio" },
          { label: "Current Page", isCurrent: true },
        ]}
      />
      <h1>ページコンテンツ</h1>
    </div>
  );
}
```

## プロパティ

### BreadcrumbItem

| プロパティ  | 型        | 必須 | 説明                                    |
| ----------- | --------- | ---- | --------------------------------------- |
| `label`     | `string`  | ✅   | 表示するテキスト                        |
| `href`      | `string`  | ❌   | リンク先URL（現在のページの場合は不要） |
| `isCurrent` | `boolean` | ❌   | 現在のページかどうか                    |

### BreadcrumbsProps

| プロパティ  | 型                 | 必須 | デフォルト | 説明                     |
| ----------- | ------------------ | ---- | ---------- | ------------------------ |
| `items`     | `BreadcrumbItem[]` | ✅   | -          | パンくずリストのアイテム |
| `className` | `string`           | ❌   | `""`       | 追加のCSSクラス          |

## 使用例

### 基本的なパンくずリスト

```tsx
<Breadcrumbs
  items={[
    { label: "Home", href: "/" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Development", isCurrent: true },
  ]}
/>
```

結果: `Home / Portfolio / Development`

### PageHeaderコンポーネントとの組み合わせ

```tsx
import { PageHeader } from "@/components/layout/PageHeader";

export default function MyPage() {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Team", isCurrent: true },
  ];

  return (
    <PageHeader
      title="チーム紹介"
      description="私たちのチームメンバーを紹介します"
      breadcrumbs={breadcrumbs}
    />
  );
}
```

### カスタムスタイル

```tsx
<Breadcrumbs
  items={breadcrumbItems}
  className="my-custom-breadcrumbs bg-gray-100 p-2 rounded"
/>
```

## 特徴

### セパレーター

- デフォルトで `/` を使用
- 視覚的に分かりやすい区切り文字

### アクセシビリティ

- `aria-label="Breadcrumb"` でナビゲーションを識別
- `aria-current="page"` で現在のページを示す
- キーボードナビゲーション対応
- スクリーンリーダー対応

### レスポンシブ対応

- モバイルデバイスでも適切に表示
- 長いラベルも適切に処理

## 実装例

### ポートフォリオページ

```tsx
// src/app/portfolio/page.tsx
<Breadcrumbs
  items={[
    { label: "Home", href: "/" },
    { label: "Portfolio", isCurrent: true },
  ]}
  className="pt-4"
/>
```

### 開発ギャラリーページ

```tsx
// src/app/portfolio/gallery/develop/page.tsx
<Breadcrumbs
  items={[
    { label: "Home", href: "/" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Gallery", href: "/portfolio/gallery" },
    { label: "Development", isCurrent: true },
  ]}
  className="pt-4"
/>
```

### 動的なパンくずリスト

```tsx
function MyComponent({ category, subcategory }) {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/categories" },
  ];

  if (category) {
    breadcrumbs.push({
      label: category.name,
      href: `/categories/${category.slug}`,
    });
  }

  if (subcategory) {
    breadcrumbs.push({
      label: subcategory.name,
      isCurrent: true,
    });
  }

  return <Breadcrumbs items={breadcrumbs} />;
}
```

## スタイリング

デフォルトのスタイルは Tailwind CSS を使用しています：

```css
/* 基本スタイル */
.breadcrumb-nav {
  @apply text-sm mb-4;
}

.breadcrumb-item {
  @apply flex items-center space-x-2;
}

.breadcrumb-link {
  @apply text-muted-foreground hover:text-foreground transition-colors duration-200 hover:underline;
}

.breadcrumb-current {
  @apply font-medium text-foreground;
}

.breadcrumb-separator {
  @apply mx-2 text-muted-foreground select-none;
}
```

## 注意事項

1. **現在のページ**: 最後のアイテムまたは `isCurrent: true` のアイテムはリンクになりません
2. **href の省略**: `href` を省略したアイテムはリンクになりません
3. **空の配列**: `items` が空の場合、コンポーネントは何も表示しません

## トラブルシューティング

### パンくずリストが表示されない

- `items` 配列が空でないか確認
- `items` プロパティが正しく渡されているか確認

### リンクが機能しない

- `href` プロパティが正しく設定されているか確認
- `isCurrent: true` が設定されていないか確認

### スタイルが適用されない

- Tailwind CSS が正しく設定されているか確認
- カスタムクラスが競合していないか確認

このシンプルなBreadcrumbsコンポーネントを使用することで、簡単にパンくずリストを実装できます。

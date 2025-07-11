# GridSystem - 384px基準のレスポンシブグリッドシステム

## 概要

384pxを基準とした4段階レスポンシブグリッドシステムです。画面幅に応じて自動的に最適なグリッド数を計算し、コンテンツを中央配置します。

## グリッド計算ロジック

| 画面幅       | グリッド数 | 最大幅 | 説明               |
| ------------ | ---------- | ------ | ------------------ |
| 〜383px      | 1グリッド  | 384px  | モバイル（小）     |
| 384〜767px   | 1グリッド  | 384px  | モバイル（大）     |
| 768〜1151px  | 2グリッド  | 768px  | タブレット         |
| 1152〜1535px | 3グリッド  | 1152px | デスクトップ（小） |
| 1536px〜     | 4グリッド  | 1536px | デスクトップ（大） |

## コンポーネント

### GridLayout

ページ全体のレイアウトラッパー

```tsx
<GridLayout background={true} className="custom-class">
  {/* ページ全体のコンテンツ */}
</GridLayout>
```

**Props:**

- `background?: boolean` - 背景色を適用するか（デフォルト: true）
- `className?: string` - 追加のCSSクラス

### GridContainer

384px基準でのコンテナとセンタリング

```tsx
<GridContainer padding={true} className="custom-class">
  {/* 中央配置されるコンテンツ */}
</GridContainer>
```

**Props:**

- `padding?: boolean` - 内側のパディングを適用するか（デフォルト: true）
- `className?: string` - 追加のCSSクラス

### GridSection

セクション用のラッパー（縦スペーシング付き）

```tsx
<GridSection spacing="lg" className="custom-class">
  {/* セクションコンテンツ */}
</GridSection>
```

**Props:**

- `spacing?: 'sm' | 'md' | 'lg' | 'xl'` - 縦方向のスペーシング（デフォルト: 'md'）
- `className?: string` - 追加のCSSクラス

**スペーシング詳細:**

- `sm`: py-6 xs:py-8
- `md`: py-8 xs:py-12 md:py-16
- `lg`: py-12 xs:py-16 md:py-20 xl:py-24
- `xl`: py-16 xs:py-20 md:py-24 xl:py-32

### GridContent

レスポンシブグリッドレイアウト

```tsx
<GridContent cols={{ xs: 1, md: 2, xl: 3, '2xl': 3 }} gap="md" className="custom-class">
  {/* グリッドアイテム */}
</GridContent>
```

**Props:**

- `cols?: object` - 各ブレークポイントでの列数
  - `xs?: number` - 384px: 1グリッド内での分割数
  - `md?: number` - 768px: 2グリッド内での分割数
  - `xl?: number` - 1152px: 3グリッド内での分割数
  - `'2xl'?: number` - 1536px: 4グリッド内での分割数
- `gap?: 'sm' | 'md' | 'lg'` - グリッド間のギャップ（デフォルト: 'md'）
- `className?: string` - 追加のCSSクラス

**ギャップ詳細:**

- `sm`: gap-2 xs:gap-3 md:gap-4
- `md`: gap-4 xs:gap-6 md:gap-8
- `lg`: gap-6 xs:gap-8 md:gap-12

### GridItem

グリッド内の個別アイテム

```tsx
<GridItem span={{ xs: 1, md: 2, xl: 1, '2xl': 1 }} className="custom-class">
  {/* アイテムコンテンツ */}
</GridItem>
```

**Props:**

- `span?: object` - 各ブレークポイントでのspan数（列の占有数）
- `className?: string` - 追加のCSSクラス

## 使用例

### 基本的なページレイアウト

```tsx
export default function MyPage() {
  return (
    <GridLayout>
      {/* ヘッダーセクション */}
      <GridSection spacing="xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold">ページタイトル</h1>
          <p className="text-xl">サブタイトル</p>
        </div>
      </GridSection>

      {/* メインコンテンツ */}
      <GridSection spacing="lg">
        <GridContent cols={{ xs: 1, md: 2, xl: 3, '2xl': 3 }} gap="lg">
          <GridItem>
            <div className="rounded bg-white p-6">カード1</div>
          </GridItem>
          <GridItem>
            <div className="rounded bg-white p-6">カード2</div>
          </GridItem>
          <GridItem>
            <div className="rounded bg-white p-6">カード3</div>
          </GridItem>
        </GridContent>
      </GridSection>
    </GridLayout>
  );
}
```

### 不均等なグリッド（span使用）

```tsx
<GridContent cols={{ xs: 1, md: 4, xl: 4, '2xl': 4 }} gap="md">
  <GridItem span={{ xs: 1, md: 3, xl: 3, '2xl': 3 }}>
    <div>メインコンテンツ（3/4占有）</div>
  </GridItem>
  <GridItem span={{ xs: 1, md: 1, xl: 1, '2xl': 1 }}>
    <div>サイドバー（1/4占有）</div>
  </GridItem>
</GridContent>
```

### 入れ子構造

```tsx
<GridSection spacing="lg">
  <GridContent cols={{ xs: 1, md: 2, xl: 2, '2xl': 2 }} gap="lg">
    <GridItem>
      <h2>左側コンテンツ</h2>
      <GridContent cols={{ xs: 1, md: 1, xl: 2, '2xl': 2 }} gap="sm">
        <GridItem>サブアイテム1</GridItem>
        <GridItem>サブアイテム2</GridItem>
      </GridContent>
    </GridItem>
    <GridItem>
      <h2>右側コンテンツ</h2>
    </GridItem>
  </GridContent>
</GridSection>
```

## ベストプラクティス

1. **一貫性のあるスペーシング**: `GridSection`のspacingを適切に使い分ける
2. **レスポンシブ対応**: colsプロパティで各ブレークポイントに適した列数を指定
3. **アクセシビリティ**: 重要なコンテンツが小さい画面でも適切に表示されることを確認
4. **パフォーマンス**: 必要以上に深い入れ子構造は避ける

## ブレークポイント対応表

| ブレークポイント | グリッド幅 | 一般的な用途   | 推奨cols設定                      |
| ---------------- | ---------- | -------------- | --------------------------------- |
| xs (384px)       | 1グリッド  | モバイル       | { xs: 1 }                         |
| md (768px)       | 2グリッド  | タブレット     | { xs: 1, md: 2 }                  |
| xl (1152px)      | 3グリッド  | デスクトップ小 | { xs: 1, md: 2, xl: 3 }           |
| 2xl (1536px)     | 4グリッド  | デスクトップ大 | { xs: 1, md: 2, xl: 3, '2xl': 4 } |

これにより、どの画面サイズでも美しく、使いやすいレイアウトを実現できます。

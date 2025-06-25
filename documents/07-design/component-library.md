# コンポーネントライブラリ

## 📦 基本コンポーネント

### Button

#### 使用例

```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  クリックしてください
</Button>
```

#### Props

```typescript
interface ButtonProps {
  variant: "primary" | "secondary" | "outline" | "ghost";
  size: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
  children: ReactNode;
}
```

### Card

#### 使用例

```tsx
<Card className="p-6">
  <Card.Header>
    <Card.Title>タイトル</Card.Title>
  </Card.Header>
  <Card.Content>コンテンツ</Card.Content>
</Card>
```

### Modal

#### 使用例

```tsx
<Modal isOpen={isOpen} onClose={onClose}>
  <Modal.Header>モーダルタイトル</Modal.Header>
  <Modal.Body>モーダル内容</Modal.Body>
  <Modal.Footer>
    <Button onClick={onClose}>閉じる</Button>
  </Modal.Footer>
</Modal>
```

## 🎯 特殊コンポーネント

### PortfolioCard

```tsx
interface PortfolioCardProps {
  item: PortfolioItem;
  showCategory?: boolean;
  showTags?: boolean;
  size?: "sm" | "md" | "lg";
}
```

### FilterBar

```tsx
interface FilterBarProps {
  categories: Category[];
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
}
```

## 🎨 スタイリング原則

### CSS 変数使用

```css
.button {
  background: var(--color-primary);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
}
```

### Tailwind カスタムクラス

```css
@layer components {
  .btn-primary {
    @apply bg-primary text-white px-4 py-2 rounded-lg;
    @apply hover:bg-primary-dark transition-colors;
  }
}
```

---

**最終更新**: 2025-01-01

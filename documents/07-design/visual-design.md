# ビジュアルデザインガイドライン

## 🎨 デザイン哲学

### コアコンセプト

- **ミニマリズム**: 情報の本質を際立たせるシンプルなデザイン
- **モダンテクノロジー**: 最新の Web 技術を活用した表現
- **ユーザビリティファースト**: 美しさと使いやすさの両立

## 🌈 カラーシステム

### プライマリカラー

```css
:root {
  /* メインブランドカラー */
  --color-primary: #2563eb; /* ブルー（信頼性・技術力） */
  --color-primary-light: #3b82f6;
  --color-primary-dark: #1d4ed8;

  /* セカンダリカラー */
  --color-secondary: #7c3aed; /* パープル（創造性） */
  --color-accent: #059669; /* グリーン（成長・成功） */

  /* グレースケール */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-900: #111827;
}
```

### カラー使用ルール

- **プライマリ**: CTA ボタン、リンク、重要な要素
- **セカンダリ**: アクセント、装飾要素
- **グレー**: テキスト、背景、境界線

## 📝 タイポグラフィ

### フォントファミリー

```css
:root {
  /* 見出し用フォント */
  --font-heading: "Geist Sans", system-ui, sans-serif;

  /* 本文用フォント */
  --font-body: system-ui, -apple-system, sans-serif;

  /* コード用フォント */
  --font-mono: "Fira Code", "Consolas", monospace;
}
```

### タイポグラフィスケール

```css
.text-xs {
  font-size: 0.75rem;
} /* 12px */
.text-sm {
  font-size: 0.875rem;
} /* 14px */
.text-base {
  font-size: 1rem;
} /* 16px */
.text-lg {
  font-size: 1.125rem;
} /* 18px */
.text-xl {
  font-size: 1.25rem;
} /* 20px */
.text-2xl {
  font-size: 1.5rem;
} /* 24px */
.text-3xl {
  font-size: 1.875rem;
} /* 30px */
.text-4xl {
  font-size: 2.25rem;
} /* 36px */
```

## 🖼️ レイアウトシステム

### グリッドシステム

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.grid {
  display: grid;
  gap: 2rem;
}

.grid-cols-12 {
  grid-template-columns: repeat(12, 1fr);
}
```

### スペーシング

```css
:root {
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem; /* 8px */
  --space-4: 1rem; /* 16px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-12: 3rem; /* 48px */
  --space-16: 4rem; /* 64px */
}
```

## ✨ アニメーション

### トランジション

```css
.smooth-transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}
```

### キーフレーム

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## 🪟 グラスモーフィズム

### カード設計

```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

## 📱 レスポンシブデザイン

### ブレイクポイント

```css
/* モバイル */
@media (max-width: 640px) {
}

/* タブレット */
@media (min-width: 641px) and (max-width: 1024px) {
}

/* デスクトップ */
@media (min-width: 1025px) {
}
```

---

**最終更新**: 2025-01-01

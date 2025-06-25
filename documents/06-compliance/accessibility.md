# アクセシビリティ対応

## WCAG 2.1 AA 準拠

### 基本方針

本サイトは **WCAG 2.1 レベル AA** に準拠したアクセシビリティを実現し、すべてのユーザーにとって利用しやすい Web サイトを目指します。

### 対応レベル

- **準拠レベル**: WCAG 2.1 AA
- **対象範囲**: サイト全体
- **更新頻度**: 新機能追加時に必須確認

## 知覚可能性（Perceivable）

### 代替テキスト

```typescript
// 画像の代替テキスト指針
const altTextGuidelines = {
  images: "required", // 画像の代替テキスト必須
  decorative: "empty", // 装飾画像は空文字（alt=""）
  complex: "detailed", // 複雑な画像は詳細説明

  // 実装例
  implementations: {
    informative:
      '<img src="chart.png" alt="2024年売上推移：1月50万円から12月120万円まで右肩上がり">',
    decorative: '<img src="decoration.png" alt="" role="presentation">',
    functional: '<img src="search.png" alt="検索">',
  },
};
```

### 色とコントラスト

```css
/* コントラスト比要件 */
:root {
  /* 通常テキスト: 4.5:1 以上 */
  --text-normal: #1f2937; /* 対背景 #ffffff: 16.8:1 ✅ */
  --text-secondary: #6b7280; /* 対背景 #ffffff: 9.2:1 ✅ */

  /* 大文字テキスト（18pt以上）: 3.0:1 以上 */
  --text-large-light: #9ca3af; /* 対背景 #ffffff: 5.1:1 ✅ */

  /* 非テキストコンテンツ: 3.0:1 以上 */
  --border-default: #d1d5db; /* 対背景 #ffffff: 3.1:1 ✅ */
  --button-primary: #2563eb; /* 対背景 #ffffff: 8.6:1 ✅ */
}

/* 色以外の情報伝達 */
.form-error {
  color: #dc2626; /* 赤色 */
  border-left: 4px solid #dc2626; /* 境界線でも表現 */
}

.form-error::before {
  content: "⚠ "; /* アイコンでも表現 */
}
```

### メディア対応

```typescript
// 動画・音声の要件
const mediaRequirements = {
  captions: "provided", // 動画にキャプション提供
  audioDescription: "available", // 音声解説利用可能
  autoplay: false, // 自動再生無効

  // 実装例
  videoImplementation: `
    <video controls>
      <source src="video.mp4" type="video/mp4">
      <track kind="captions" src="captions.vtt" srclang="ja" label="日本語">
      <track kind="descriptions" src="audio-desc.vtt" srclang="ja">
      動画を再生できません。<a href="transcript.html">文字起こしはこちら</a>
    </video>
  `,
};
```

## 操作可能性（Operable）

### キーボード操作

```typescript
// キーボードアクセシビリティ要件
const keyboardAccessibility = {
  allFunctions: true, // 全機能をキーボードで操作可能
  noTrap: true, // キーボードトラップなし
  shortcut: "configurable", // ショートカット設定可能
  focusVisible: true, // フォーカス表示

  // 実装例
  focusManagement: {
    // カスタムフォーカススタイル
    css: `
      :focus-visible {
        outline: 2px solid #2563eb;
        outline-offset: 2px;
        border-radius: 4px;
      }
    `,

    // フォーカストラップ
    javascript: `
      const focusTrap = {
        firstElement: modal.querySelector('[tabindex="0"]'),
        lastElement: modal.querySelector('[tabindex="0"]:last-child'),
        
        handleTab: (e) => {
          if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };
    `,
  },
};
```

### 時間制限

```typescript
// 時間制限の調整機能
const timingControls = {
  adjustable: true, // 時間制限調整可能
  pausable: true, // 一時停止可能
  extendable: true, // 延長可能

  // 実装例
  implementation: `
    <div class="timing-controls">
      <button onclick="pauseTimer()">一時停止</button>
      <button onclick="extendTime(60)">60秒延長</button>
      <span id="remaining-time">残り時間: 5:00</span>
    </div>
  `,
};
```

### 発作防止

```css
/* 点滅制限（3回/秒以下） */
@keyframes safe-blink {
  0%,
  50% {
    opacity: 1;
  }
  25%,
  75% {
    opacity: 0.7;
  } /* 完全な点滅を避ける */
}

.notification {
  animation: safe-blink 2s infinite; /* 0.5Hz = 0.5回/秒 ✅ */
}

/* 赤色点滅の制限 */
.error-indicator {
  /* 赤色点滅は使用しない */
  background-color: #fee2e2; /* 薄い赤背景 */
  border-left: 4px solid #dc2626; /* 固定の赤色境界線 */
}
```

## 理解可能性（Understandable）

### 読みやすさ

```html
<!-- 言語指定 -->
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>samuido - Web Developer & Designer</title>
  </head>

  <!-- ルビ（読み方）の提供 -->
  <p>
    <ruby>木村<rt>きむら</rt></ruby>
    <ruby>友亮<rt>ゆうすけ</rt></ruby>
  </p>

  <!-- 複雑な表現の簡素化 -->
  <p>
    技術スタック：
    <abbr title="HyperText Markup Language">HTML</abbr>、
    <abbr title="Cascading Style Sheets">CSS</abbr>、 JavaScript
  </p>
</html>
```

### 予測可能性

```typescript
// 一貫したナビゲーション
const consistentNavigation = {
  // 全ページで同じ順序・位置
  structure: [
    { label: "About", href: "/about" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Workshop", href: "/workshop" },
    { label: "Tools", href: "/tools" },
  ],

  // フォーカス時のコンテキスト変更なし
  onFocusChange: false,
  onInputChange: false,

  // 予期しないページ遷移の防止
  confirmNavigation: true,
};
```

### 入力支援

```typescript
// フォーム入力支援
const inputAssistance = {
  errorIdentification: true, // エラー識別
  labels: true, // ラベル・説明文
  errorSuggestion: true, // エラー修正提案
  errorPrevention: true, // エラー防止

  // 実装例
  formValidation: `
    <div class="form-field">
      <label for="email" class="required">
        メールアドレス <span aria-label="必須">*</span>
      </label>
      <input 
        type="email" 
        id="email"
        aria-describedby="email-error email-help"
        aria-invalid="false"
        required
      >
      <div id="email-help" class="help-text">
        例: user@example.com
      </div>
      <div id="email-error" class="error-text" role="alert" aria-live="polite">
        <!-- エラー時に表示 -->
      </div>
    </div>
  `,
};
```

## 堅牢性（Robust）

### 互換性

```html
<!-- 有効なHTMLコード -->
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ページタイトル</title>
  </head>
  <body>
    <!-- セマンティックなHTML構造 -->
    <header>
      <nav aria-label="メインナビゲーション">
        <ul>
          <li><a href="/about" aria-current="page">About</a></li>
        </ul>
      </nav>
    </header>

    <main>
      <h1>メインタイトル</h1>
      <section aria-labelledby="section-1">
        <h2 id="section-1">セクションタイトル</h2>
      </section>
    </main>

    <!-- 名前・役割・値の提供 -->
    <button
      type="submit"
      aria-label="お問い合わせフォームを送信"
      aria-pressed="false"
    >
      送信
    </button>
  </body>
</html>
```

## 支援技術対応

### スクリーンリーダー

```typescript
// ARIA ラベルとランドマーク
const ariaSupport = {
  labels: true, // ARIA ラベル
  descriptions: true, // ARIA 説明
  landmarks: true, // ランドマーク
  headingStructure: true, // 見出し構造

  // 実装例
  implementation: `
    <!-- ランドマーク -->
    <header role="banner">
    <nav role="navigation" aria-label="メイン">
    <main role="main">
    <aside role="complementary" aria-label="関連リンク">
    <footer role="contentinfo">
    
    <!-- 見出し構造 -->
    <h1>ページタイトル</h1>
      <h2>主セクション</h2>
        <h3>サブセクション</h3>
        <h3>サブセクション</h3>
      <h2>主セクション</h2>
    
    <!-- 動的コンテンツ -->
    <div aria-live="polite" id="status-updates">
      <!-- 状態変更をスクリーンリーダーに通知 -->
    </div>
  `,
};
```

### 音声認識・拡大表示

```css
/* 最小クリック対象サイズ（44px） */
.button,
.link {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
}

/* 要素間の最小間隔（8px） */
.navigation-items {
  gap: 8px;
}

/* 200%ズーム対応 */
@media (max-width: 640px) {
  .container {
    /* 横スクロール回避 */
    overflow-x: hidden;
    word-break: break-word;
  }
}
```

## テスト手順

### 自動テスト

```bash
# アクセシビリティ自動テスト
npm run test:a11y
npm run lighthouse:a11y
npm run axe:test
```

### 手動テスト

1. **キーボードのみでの操作**

   - Tab キーでの順次移動
   - Enter/Space での操作
   - Escape での閉じる操作

2. **スクリーンリーダーでの読み上げ**

   - NVDA（Windows）
   - VoiceOver（macOS）
   - TalkBack（Android）

3. **色覚異常シミュレーション**

   - 1 型色覚（赤）
   - 2 型色覚（緑）
   - 3 型色覚（青）

4. **拡大表示での確認**
   - 200%拡大表示
   - 横スクロールの有無
   - 情報の欠落がないか

### ユーザーテスト

```typescript
const userTesting = {
  frequency: "quarterly", // 四半期ごと
  participants: [
    "視覚障害ユーザー",
    "聴覚障害ユーザー",
    "運動障害ユーザー",
    "認知障害ユーザー",
  ],
  scenarios: ["ポートフォリオ閲覧", "ツール使用", "お問い合わせ", "検索機能"],
};
```

---

**最終更新**: 2025-01-01  
**関連ドキュメント**:

- [利用規約・プライバシーポリシー](./legal.md)
- [デザインシステム](../07-design/design-system.md)

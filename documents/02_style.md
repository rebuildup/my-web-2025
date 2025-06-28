# 共通スタイル設定 (Style Guide)

> 出典: 原本設計書 Tailwind 設定・デザインテーマセクション

## 1. カラーパレット

| 役割      | HEX       | 備考                        |
| --------- | --------- | --------------------------- |
| Primary   | `#0000ff` | 原色の青・ブランド色        |
| Secondary | `#222222` | ダークグレー・背景/テキスト |
| Success   | `#10b981` | 成功状態                    |
| Warning   | `#f59e0b` | 注意状態                    |
| Error     | `#ef4444` | エラー状態                  |
| Info      | `#3b82f6` | 補足情報                    |

### Tailwind 拡張

`tailwind.config.js` に `colors.primary` / `colors.secondary` として登録済み。影やアニメーションもプリセット追加しています。

## 2. タイポグラフィ

| 用途       | フォントファミリ                        | ウエイト   |
| ---------- | --------------------------------------- | ---------- |
| 見出し     | Neue Haas Grotesk Display (Adobe Fonts) | 700 italic |
| 本文       | Noto Sans JP (Google Fonts)             | 300–500    |
| アクセント | Shippori Antique (Google Fonts)         | 400        |

フォントは `<Adobe Fonts kitId="blm5pmr">` と Google Fonts の `<link>` で読み込み。

## 3. レスポンシブブレークポイント

```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

## 4. アニメーションプリセット

- `fade-in`, `slide-up`, `scale-up` など 10+ 種類を `animation` と `keyframes` で Tailwind 拡張
- 例: `class="animate-slide-up"`

## 5. コンポーネントスタイル指針

1. **変数駆動**: 色は `theme(colors.primary.500)` を使用
2. **BEM + Utility**: ユーティリティ主体で不足分を `@apply` で補完
3. **アクセシビリティ**: 焦点リング (`ring-primary-500`) を必ず設定

---

> **備考**: 詳細は `tailwind.config.js` & `globals.css` を参照してください。

# 02_style — デザイン最小リファレンス

- **フォント**  
  - メイン: Typekit kit `blm5pmr`（Neue Haas Grotesk / Noto Sans JP / Shippori Antique B1）.`public/scripts/adobe-fonts.js` で読込.  
  - 予備: `system-ui, sans-serif`.  

- **カラー (Tailwind v4カスタムトークン例)**  
  - `--color-bg: #0d1117` (dark) / `#f7f8fa` (light)  
  - `--color-fg: #e6edf3` / `#1f2328`  
  - `--color-accent: #2c7be5`  
  - `--color-muted: #6c757d`  

- **UIキット併用方針**  
  - Chakra UI: フォーム・レイアウトで採用.  
  - MUI: 表・複合コンポーネントで限定使用.  
  - Tailwind: レイアウト/余白/色のユーティリティを優先.  
  - 同一コンポーネント内で複数キットを混在させない.  

- **アニメーション**: framer-motion / GSAP.長さ 250–450ms を目安、`prefers-reduced-motion` を尊重.  

- **画像指針**: `next/image` を優先、`SafeImage` コンポーネント経由でプレースホルダー・失敗時フォールバック.  

- **アクセシビリティ**: コントラスト WCAG AA 以上、focus-ring を削除しない.  

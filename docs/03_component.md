# 03_component — コンポーネント速記

カテゴリ別に主要コンポーネントと役割だけを記載.詳細は各 `src/` パスを参照.

## レイアウト
- `src/components/layout/Header`, `Footer`, `NavDrawer` — グローバルナビ / フッタ.
- `LayoutStabilizer`, `SafeImage` — レイアウトシフト抑制・画像安全読み込み.

## UIプリミティブ
- ボタン/入力: Chakra UI 基本コンポーネント + Tailwindユーティリティ.
- カード/モーダル: `UI/Card`, `UI/Modal`（Chakraベース）.
- アイコン: `lucide-react`, `@heroicons/react`.

## ポートフォリオ
- `GalleryGrid`, `GalleryFilters`, `GalleryItem` — `/portfolio/gallery/*`.
- `PortfolioDetail` — `/portfolio/[slug]` の本体.
- `VideoPlayer` / `ThreeScene` / `PixiCanvas` — メディア／3D表示.

## データ管理（開発環境のみ）
- `admin/data-manager` ページ配下のテーブル／フォーム.
- API: `/api/admin/*` は `NODE_ENV=development` でのみ有効.

## ユーティリティ表示
- `PerformanceDashboard`, `MonitoringDashboard` — 開発時の計測UI.
- `CoreWebVitalsMonitor` — CWV 計測表示.

## 共通ルール
- UIキットは 1 コンポーネント内で混在させない.
- 画像/メディアは `SafeImage` or `next/image` 経由で読み込む.
- 3D/動画は Fallback を用意し、`prefers-reduced-motion` を尊重.

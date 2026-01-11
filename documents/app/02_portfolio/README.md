# /portfolio ルート仕様

`/portfolio` は作品ギャラリーとプレイグラウンドで構成されます.

## ページ構成

| パス                             | 役割                       | 対応ファイル                   |
| -------------------------------- | -------------------------- | ------------------------------ |
| `/portfolio`                     | ポートフォリオトップページ | `page.md`                      |
| `/portfolio/all`                 | 全作品一覧                 | `gallery/all/page.md`          |
| `/portfolio/develop`             | 開発系作品一覧             | `gallery/develop/page.md`      |
| `/portfolio/video`               | 映像作品一覧               | `gallery/video/page.md`        |
| `/portfolio/video&design`        | 映像・デザイン作品一覧     | `gallery/video&design/page.md` |
| `/portfolio/[slug]`              | 作品詳細ページ             | `[slug]/page.md`               |
| `/portfolio/detail/develop`      | 開発系詳細ページ           | `detail/develop/page.md`       |
| `/portfolio/detail/video`        | 映像詳細ページ             | `detail/video/page.md`         |
| `/portfolio/detail/video&design` | 映像・デザイン詳細ページ   | `detail/video&design/page.md`  |
| `/portfolio/playground/design`   | デザイン実験場             | `playground/design/page.md`    |
| `/portfolio/playground/WebGL`    | WebGL実験場                | `playground/WebGL/page.md`     |

## ギャラリー仕様

### all (全作品一覧)

- **目的**: バラエティを重視した全作品の一覧
- **フィルター**: 時系列、カテゴリ、タグ
- **表示**: カードレイアウト、無限スクロールまたはページネーション

### develop (開発系作品)

- **対象**: プログラミング関連の制作（プラグイン、ゲーム、Web、プログラミングを使った映像など）
- **フィルター**: 使用技術タグを重視
- **表示**: 技術詳細を強調したカードレイアウト

### video (映像作品)

- **対象**: 映像制作のみ（依頼映像と個人制作映像）
- **プレビュー**: YouTube埋め込み、WebMファイルなど軽量プレビュー
- **フィルター**: 映像の種類（MV、リリックモーション、イラストアニメーションなど）
- **表示**: 動画プレビュー重視のレイアウト

### video&design (映像・デザイン作品)

- **対象**: 映像に加えて画像などのデザイン、Webデザインなど
- **目的**: デザインスキルを強調、クリエイティブなギャラリー
- **表示**: デザイン性を重視したレイアウト

## 詳細ページ仕様

### 共通機能

- **コンテンツ**: markdownファイルをHTMLに変換してプレビュー
- **埋め込み**: YouTube、Vimeo、Code、Xなど様々なコンテンツをiframeで表示
- **コメント**: 機能なし

### カテゴリ別詳細ページ

- **develop**: 技術詳細、実装方法、使用技術を重視
- **video**: 制作過程、使用ソフト、制作時間を重視
- **video&design**: デザインコンセプト、制作意図を重視

## プレイグラウンド仕様

### design

- **目的**: デザインの実験場
- **機能**: 実験的なライブラリやアニメーションの実装

### WebGL

- **目的**: Three.jsやWebGPUを使用したグラフィックス実験
- **機能**: スクロールトリガー、アニメーションなど様々な実験的実装

## データ管理

- **共通データ**: `ContentItem` type: `portfolio`
- **カテゴリ管理**: フォルダ構造に準じた分類
- **タグ管理**: 技術、カテゴリ、制作年など

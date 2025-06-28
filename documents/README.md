# ドキュメント索引 (README)

各種設計ドキュメントの配置ガイド。原本 (4,000 行超) は `99-original-document` に保管し、実務で扱いやすいよう小分けしています。

| ファイル / フォルダ     | 主な内容                                               |
| ----------------------- | ------------------------------------------------------ |
| `01_global.md`          | 共通データ構造 (ContentItem / SiteConfig …) & 基本概念 |
| `02_style.md`           | ブランドカラー・フォント・Tailwind 設定                |
| `03_component.md`       | 主要 React コンポーネント一覧・指針                    |
| `04_package.md`         | 主要依存パッケージ & スクリプト                        |
| `05_requirement.md`     | 性能・アクセスビリティ・セキュリティ要件               |
| `06_deploy.md`          | 開発プロセス・CI/CD・インフラ・ロールバック戦略        |
| `07_rules.md`           | 法務・コンプライアンス                                 |
| `08_progress.md`        | テスト設計 & 実装進捗                                  |
| `app/`                  | `src/app` と同じ階層でページ仕様書を格納               |
| `99-original-document/` | 完全版設計書 (参照用)                                  |

## フォルダ構造

```text
documents/
├── readme.md          # 索引 (このファイル)
├── 01_global.md       # データ構造
├── 02_style.md        # 共通スタイル
├── 03_component.md    # コンポーネント
├── 04_package.md      # 依存パッケージ
├── 05_requirement.md  # 性能・品質要件
├── 06_deploy.md       # CI/CD & インフラ
├── 07_rules.md        # 法務・コンプライアンス
├── 08_progress.md     # テスト設計 & 実装進捗
├── app/               # ページ別仕様 (src/app と対応)
│   ├── README.md
│   ├── about/
│   ├── portfolio/
│   ├── tools/
│   ├── workshop/
│   ├── contact/
│   └── admin/
└── 99-original-document/  # フル設計書
```

## 使い方

1. **ページを開発** → 対応する `documents/app/.../page.md` を更新。
2. **全体ポリシー変更** → `02_global.md`, `03_style.md` などを編集。
3. **新コンポーネント追加** → `03_component.md` に追記。
4. **依存アップグレード** → `04_package.md` を更新し PR に記載。

---

> ドキュメントを追加・変更したら Pull Request でレビュワーに知らせ、マージ後 GitHub Pages (docs) 自動生成を予定。

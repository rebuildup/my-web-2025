# ドキュメント索引 (README)

| ファイル / フォルダ | 主な内容                                               |
| ------------------- | ------------------------------------------------------ |
| `01_global.md`      | 共通データ構造 (ContentItem / SiteConfig …) & 基本概念 |
| `02_style.md`       | ブランドカラー・フォント・Tailwind 設定                |
| `03_component.md`   | 主要 React コンポーネント一覧・指針                    |
| `04_package.md`     | 主要依存パッケージ & スクリプト                        |
| `05_requirement.md` | 性能・アクセスビリティ・セキュリティ要件               |
| `06_deploy.md`      | 開発プロセス・CI/CD・インフラ・ロールバック戦略        |
| `07_rules.md`       | 法務・コンプライアンス                                 |
| `08_progress.md`    | テスト設計 & 実装進捗                                  |
| `app/`              | `src/app` と同じ階層でページ仕様書を格納               |

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
```

## 最重要要件

- ページごとに独立したサイトとして動作すること
- ページ単位でのサイトの拡張が容易な構造であること
- 開発者の創造性を尊重すること

# ドキュメント索引 (README)

| ファイル / フォルダ | 主な内容 |
| ------------------- | -------- |
| `01_global.md`      | コア概念・データ配置・環境変数の最小セット |
| `02_style.md`       | フォント/カラー/アニメーション方針の短縮版 |
| `03_component.md`   | 主要コンポーネントの役割一覧 |
| `04_package.md`     | 主要依存 & npm scripts（pnpm/Biome 運用） |
| `05_requirement.md` | 非機能要件ショートリスト |
| `06_deploy.md`      | インフラ/CI/CD/PM2 手順 (2025-12) |
| `07_rules.md`       | コンプライアンス・運用ルール要点 |
| `app/`              | ページ別仕様書 |
| `archive/`          | 旧ドキュメント・詳細版 |

## フォルダ構造

```text
documents/
├── readme.md          # 索引 (このファイル)
├── 01_global.md       # コア概念
├── 02_style.md        # スタイル指針
├── 03_component.md    # コンポーネント速記
├── 04_package.md      # 依存パッケージ
├── 05_requirement.md  # 非機能要件
├── 06_deploy.md       # CI/CD & インフラ
├── 07_rules.md        # コンプライアンス
├── app/               # ページ別仕様 (src/app と対応)
│   ├── README.md
│   ├── about/
│   ├── portfolio/
│   ├── tools/
│   ├── workshop/
│   ├── contact/
│   └── admin/
├── archive/           # 旧ドキュメントの退避先
```

## 運用メモ
- ランタイム: Node 20 / Next 16 standalone + pm2
- パッケージ: pnpm 10、Lint/Format: Biome
- 詳細版や旧手順は `archive/` を参照（必要時のみ）.

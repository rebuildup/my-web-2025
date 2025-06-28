# テスト設計 & 実装進捗 (Progress)

> `testingStrategy` と実装状況を追跡

## 1. テスト戦略概要

| 種別        | ツール                 | 目標カバレッジ          | 備考                             |
| ----------- | ---------------------- | ----------------------- | -------------------------------- |
| Unit        | Jest + RTL             | 80% 行カバレッジ        | `src/components`, `src/lib`      |
| Integration | Playwright             | 主要 API & ルーティング | `navigation`, `forms`, `api`     |
| E2E         | Playwright             | 5 ユースケース          | Portfolio 閲覧 / ツール使用 など |
| Visual      | Playwright screenshots | 差分 < 0.1              | 全ページ + 主要コンポ            |
| Security    | npm audit / CodeQL     | Critical 0 件           | PR ごと実行                      |

## 2. 実装進捗

| モジュール                | テスト実装 | カバレッジ |
| ------------------------- | ---------- | ---------- |
| UI Components             | ✅ 完了    | 78%        |
| Layout Components         | 🔄 進行中  | 45%        |
| Utils (date, string)      | ✅ 完了    | 92%        |
| API Routes                | ⏳ 未着手  | -          |
| Tools (ColorPalette etc.) | ⏳ 未着手  | -          |

## 3. 自動化設定

- GitHub Actions `test` で Jest & Playwright を CI 実行
- `onPush: main` → Unit + Integration
- `onPR` → Unit + Integration + E2E + Visual

## 4. 次ステップ (2025-07 Sprint)

1. API Routes のユニット & 統合テストを追加 (目標 70%)
2. Tools コンポーネントの E2E テスト 3 シナリオ
3. Visual Regression ベースライン更新
4. レポートを `docs/metrics/2025-07.md` に自動保存

---

> **更新ルール**: Sprint 終了ごとにこのファイルの進捗テーブルを更新し、カバレッジを記録

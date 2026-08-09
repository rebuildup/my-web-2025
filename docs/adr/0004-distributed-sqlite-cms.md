# ADR-0004: 分散 SQLite CMS (1 アイテム 1 DB) を採用

## ステータス
Accepted

## コンテキスト
個人サイト規模で RDBMS サーバを運用するのは過剰. バックアップ / レプリケーション / マイグレーションを最小コストで運用したい. 一方で全文検索 (FTS5) と structured query は欲しい.

## 検討した選択肢
- A: **1 アイテム 1 DB** (`data/contents/content-{id}.db`) + FTS5 仮想テーブル + タグ join.
- B: 単一 SQLite DB に全 items を入れる.
- C: ファイルシステム (Markdown + frontmatter) のみ.
- D: PostgreSQL / MySQL などの RDBMS サーバ.

## 決定
**A を採用.** 根拠:
- 1 アイテムが独立したファイルなのでバックアップ / 差分管理が容易.
- 破損時の blast radius が 1 アイテムに閉じる.
- FTS5 で全文検索と structured filter を両立.
- タグは `tags` / `content_tags` の正規化で多対多.

## 影響
- プラス: 個人規模に最適. admin API (`/api/admin/content`) からのみ書き込み, バイナリ DB は hook で編集拒否.
- マイナス: クロステーマ query (例: タグ集計) は N ファイルスキャンが必要 → `apps/cms-api/` の Rust 実装にオフロード.
- トレードオフ: スキーマ変更は `src/cms/lib/content-db-manager.ts` + `src/cms/lib/content-mapper.ts` + `src/cms/lib/migrations/` の三点を整合させる必要. canonical review agent (`cms-content-reviewer`) で gate.

## 再評価条件
- アイテム数が 10k+ に達し、Rust API でも集計が要件を満たせなくなった場合.
- クロステーマ query の SLA 要件が著しく厳しくなった場合.
- スキーマ進化頻度が月 1 を超え、migration overhead が負担になった場合.

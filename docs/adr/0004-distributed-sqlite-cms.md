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

## 2026-08 更新: media テーブルも per-content DB に統一

`apps/cms-api/src/routes/media.rs::create_media` / `delete_media` を per-content DB 直接書き込みに切り替え. 旧 consolidated `data/db/cms-api-dev.db` の `media (entry_id, tags_json, ...)` テーブルへの書き込みは廃止. 書き込み経路と読み込み経路 (`get_media_or_list`) が同じ `data/contents/content-{id}.db` を叩くため、admin UI からのアップロードが公開サイトに即反映される.

- 新規 per-content DB 作成時に Rust 側で `apps/cms-api/src/db/per_content_schema.sql` を `include_str!` でブートストラップする. SQL は `src/cms/lib/content-db-manager.ts::initializeContentDbSchema` と byte-for-byte 同一.
- `media` テーブルの FK (`media.content_id REFERENCES contents(id) ON DELETE CASCADE`) を満たすため stub の `contents` 行を `ensure_content_row` で挿入. Bun の `saveFullContent` が後で正式 content を上書きする.
- 旧 `scripts/sync-legacy-media-to-rust.ts` (per-content → consolidated の逆方向 sync) は削除. `package.json` の `sync:cms-media` エントリも削除.
- consolidated `media` テーブルには seed 1 行 (deprecated) が残っているが、退役は本 ADR の範囲外 (別 ADR で consolidated DB 全体の処遇と一緒に判断).

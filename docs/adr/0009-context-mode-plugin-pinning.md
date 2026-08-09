# ADR-0009: context-mode プラグインを project-local に pin しない

## ステータス
Accepted (2026-08 初期化)

## コンテキスト
`.claude/settings.json` には `enabledPlugins.context-mode@context-mode = true` が宣言されている. context-mode は Anthropic 公式 marketplace ではなく Mert Koseoglu 個人が Elastic License 2.0 で配布する third-party プラグイン (v1.0.162, 最新 v1.0.169) である. fresh clone から `bun install --frozen-lockfile && bun run build` を再現する要件 (AGENTS.md §13) に対し, plugin のピン留め先や更新チャネルが `.claude/settings.json` に明示されていない.

## 検討した選択肢
- A: **`extraKnownMarketplaces` を `.claude/settings.local.json` (gitignore) に集約し, marketplace 自体を ref 固定する.** 共有される `.claude/settings.json` には何も書かない.
- B: `.claude/settings.json` に `extraKnownMarketplaces` を直接書く (ref 固定). 全 clone で同じ plugin version に揃う.
- C: plugin を project から外し, user-scope で各自 install する方針に切り替える.

## 決定
**A を採用.** 根拠:
- context-mode は「agent の動作を強化する tool」であり, プロジェクトのビルド成果物 (`out/`, `apps/cms-api/target/release/cms-api`) には影響しない. AGENTS.md §13 の「fresh-clone 再現性」は build / test が green になることであり, plugin の有無は含まれない.
- ref 固定を `settings.json` (committed) に書くと, 「plugin marketplace の可用性に project の build 成功が依存する」状態になり, ネットワーク制限下や marketplace archive で fresh clone が壊れる.
- settings.local.json (gitignore) に集約すれば, 「plugin を有効にしたい人だけ有効化する」状態を維持できる. ユーザー側の意思を尊重.
- Elastic License 2.0 の "no hosted service" 条項は, 当プロジェクトが context-mode を再配布しない限り抵触しない. plugin は marketplace 経由で取得するため再配布にあたらない.

## 影響
- プラス: `.claude/settings.json` が project 必須設定だけになり, 共有 git diff が安定する.
- プラス: marketplace 障害時に build / test が壊れない.
- マイナス: 新しい contributor が context-mode を有効化したい場合, 各自で `settings.local.json` に `extraKnownMarketplaces` を書く必要がある. README に手順を 1 段落で明記する.
- トレードオフ: plugin の version drift は contributor 各自の責任. 公式 marketplace の auto-update がデフォルトで効いているため, 予期せぬ version up で挙動が変わるリスクがある. それが問題になるなら B 案へ移行.

## 再評価条件
- context-mode のバージョン drift がレビュー工程で 2 回以上問題になった場合.
- `.claude/settings.json` のレビューコメントが plugin 起因の noise を多く生むようになった場合.
- plugin の marketplace 配布が deprecated になり, 他の install 方法に統一する必要が出た場合.

## 後続 ADR
- 0007: AI エージェント環境を project-local で運用 (plugin 固定の方針はこの ADR で分岐).
- 0008: Bun test canonical (本 init で追加).

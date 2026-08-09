# ADR-0008: テストランナは Bun test を canonical に採用

## ステータス
Accepted (2026-08 初期化)

## コンテキスト
`package.json` の `test` script は `bun test` を直接起動している. 一方で `jest@30` / `@testing-library/react` / `jest-environment-jsdom` / `jsdom` が devDependency に残っており, `jest.config.js` も存在する. テストファイルは `*.test.ts` (Jest 想定) と `*.bun.test.ts` (Bun test 専用) が混在し, Jest config は `\\.bun\\.test\\.ts$` を ignore している. 結果として Jest 30 は devDep に居るが `bun run test` の経路では呼ばれていない.

## 検討した選択肢
- A: **Bun test を canonical に採用.** Jest 30 は将来移行オプションとして devDep に残す (削除しない).
- B: Jest 30 を canonical に統一し, `*.bun.test.ts` を `*.test.ts` へ rename して Jest 経由へ移す.
- C: 両方並走させ, CI で両方の結果を AND 結合する.

## 決定
**A を採用.** 根拠:
- 現状の実体 (`package.json` の `test` script = `bun test`) と AGENTS.md の記述を一致させる.
- Bun 1.3 の test ランナは `bun:test` を直接 import でき, ESM / TypeScript / jsdom / mock.module が標準で揃う.
- `jest-environment-jsdom` の代わりに `bun test --environment jsdom` が公式サポートされている.
- 既存 `*.test.ts` (NextRequest をモック対象にする guard 系) は `bun:test` 互換の API のみで書かれている. そのまま動く.
- Jest 30 を devDep から消すと, もし将来 Bun test の制約 (branch coverage, advanced module mocks) が要件に届かなかった場合の戻りが遅くなる. devDep に残し, `bunfig.toml` 側で明示的に ignore することで両者が共存できる.

## 影響
- プラス: 検証ゲートのコマンドと AGENTS.md の記述が一致し, 「CI で通ったのに local で動かない」事象を排除.
- プラス: 既存テストがそのまま動き, リグレッションゼロ.
- マイナス: 開発者が Jest 専用 API (`jest.mock`, `jest.fn`) を誤って使うと, Bun test では型エラーになる. README に Bun test の API のみを使う旨を明記.
- トレードオフ: ブランチ coverage は Bun 1.3 時点で計測対象外. AGENTS.md / ADR の coverage 要件 (§29 相当) は, Bun が branch coverage を出すか Jest 30 へ切替を行うまで「lines / statements / functions」の 3 軸で gate する方針を後追いで決める.

## 再評価条件
- Bun test が `*.test.ts` の `jest.mock` / `jest.fn` 利用ファイルを実行できなくなった場合.
- coverage しきい値を 4 軸 (lines / statements / functions / branches) で固定する必要が出た場合.
- 既存 test ファイルの大半が `bun:test` 固有 API へ依存し, 将来 Jest 30 へ戻すコストが見合わないことが確定した場合.

## 後続 ADR
- 0001: Bun 採用の前提に整合.
- 0009: context-mode plugin 固定方針 (本 init で追加).

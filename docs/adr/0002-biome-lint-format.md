# ADR-0002: Lint / Format に Biome を採用

## ステータス
Accepted

## コンテキスト
ESLint + Prettier の二重運用は設定と plugin 依存が多い. Next 16 / React 19 / TS 7 時代の単一ツールにまとめたい. monorepo ではない単一パッケージなので plugin 連鎖の利点も小さい.

## 検討した選択肢
- A: **Biome 2.5** (単一バイナリ, Rust).
- B: ESLint 9 + Prettier 3 (flat config).
- C: ESLint 9 のみで format も兼ねる.

## 決定
**A を採用.** 根拠:
- install が一発, 依存 0.
- formatter + linter を 1 バイナリで運用.
- `useNodejsImportProtocol` / `useTemplate` などの built-in rule で十分.
- CI でも lockfile 1 つで完結.

## 影響
- プラス: lockfile 軽量, hook で `Edit|Write` 直後に `biome format --write` を回せる.
- マイナス: 高度 plugin (a11y / jest 拡張) は ESLint ほど揃っていない. ただし react-doctor を別途 CI で走らせるため a11y は補完できる.
- トレードオフ: `biome.json` の `linter.rules.preset = "none"` で rule 厳選運用. 必要に応じ `overrides` でディレクトリ別緩和.

## 再評価条件
- Biome の更新が 6 ヶ月以上止まった場合.
- Biome がプロジェクト要件 (特定 a11y rule など) を満たせなくなった場合.
- React / Next のメジャー更新で Biome 互換性が壊れた場合.

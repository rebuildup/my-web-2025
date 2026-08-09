# ADR-0003: 依存解析に Knip を採用

## ステータス
Accepted

## コンテキスト
Next.js + React の deps は推移的に膨らみやすい. 未使用 export / 未参照 dep を CI で機械検出したい.

## 検討した選択肢
- A: **Knip 6.x**.
- B: ts-prune / depcheck のような軽量ツール.
- C: ESLint の `import/no-unresolved` 拡張.

## 決定
**A を採用.** 根拠:
- 未使用 exports / files / dependencies / unresolved references を一括検出.
- TypeScript / Next / React プロジェクトで実績.
- CI で `bun x knip` 1 行で完結.

## 影響
- プラス: `package.json` と `tsconfig.json` の整合性を機械的に担保.
- マイナス: 既存 project は除外設定 (`knip.json`) を整える必要あり. 過検知時は entry / ignore を絞る.
- トレードオフ: CI 通過のために既存 dead code を整理する手間. ただし canonical な gate として残す.

## 再評価条件
- Knip のメンテが停止し、代替 (ts-prune 等) の精度で十分になった場合.
- 既存 deps / exports の除外リストが肥大化し、Knip の価値が低下した場合.

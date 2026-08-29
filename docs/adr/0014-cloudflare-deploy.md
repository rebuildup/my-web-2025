# ADR-0014: Cloudflare (Pages + Workers + Containers + R2) へのデプロイ基盤移行

## ステータス
Accepted

## コンテキスト
個人サイト yusuke-kim.com は Next.js 16 静的エクスポート + Rust CMS API を
GCP VM + nginx + PM2 で運用してきた (ADR-0006). 運用 1 年で以下が顕在化:
- VM の OS update / nginx 再起動 / certbot 更新など手運用コスト
- ADR-0006 の再評価条件「PaaS 移行で運用負荷が明確に下がる」「CDN を前段に置く構成」を満たす選択肢が 2026-08 時点で現実的になった

## 検討した選択肢
| 案 | メリット | デメリット | 結論 |
|---|---|---|---|
| Vercel | Next.js native, 設定最小 | D1/Containers なし, Rust API を別 VM で持つ必要 | 却下 |
| Netlify | Functions あり | 同上 + D1/Containers なし | 却下 |
| Cloudflare + 別 VM で Rust | 既存コード無改変 | PaaS 移行の意義半減, 2 系統運用 | 却下 |
| Cloudflare Workers + WASM Rust | 完全 edge | FTS5 + image + reqwest の WASM 化困難, rewrite コスト大 | 却下 |
| Cloudflare + D1 集約 | R2 sync 不要 | 「1 item = 1 DB」不変条件を破壊, CMS 互換性検証コスト | 却下 |

## 決定
Cloudflare (Pages + Workers + Containers + R2) を採用. 月額試算 $5.06 (¥770) で
ユーザー設定ゲート ¥1,600 を満たす. 詳細は
`docs/superpowers/specs/2026-08-26-cloudflare-deploy-design.md` を参照.

## 影響
- プラス: 運用ほぼゼロ, edge cache 高速化, 証明書自動更新, CDN 無料
- マイナス: Container 起動 latency (5-30s), R2 SQLite 整合性リスク, β機能依存
- エントリポイント: ユーザー指定 `develop` ブランチで Phase A〜D を段階リリース

## 再評価条件
- Cloudflare Containers が GA 移行しないまま機能縮小
- ストレージが 10GB を超えて R2 課金が ¥1,600 を超えそう
- 動的ルート要件が `generateStaticParams` で表現不能に増えた

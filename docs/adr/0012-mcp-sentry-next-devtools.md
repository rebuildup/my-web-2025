# ADR-0012: agent toolchain に MCP server (Sentry / Next DevTools) を追加

## ステータス
Accepted (2026-08 init)

## コンテキスト
`.mcp.json` / `.codex/config.toml` には context7 + playwright の 2 MCP server が登録されている. 一方, プロジェクトには次の既存 capabilities があり, それぞれ MCP 経由の参照手段が agent 側で求められている:
- Sentry 統合 (`src/lib/init/production.ts`, `src/lib/monitoring/sentry`, `src/lib/config/production.ts`). 本番 crash を agent から追跡できるようにしたい.
- Next.js 16 公式 DevTools MCP (`next-devtools-mcp@0.4.0`). dev server 上の route / error / Server Action 解決を agent から問い合わせたい.

## 検討した選択肢
- A: **両方を追加する** (sentry + next-devtools-mcp).
- B: Sentry のみ追加. Next DevTools は見送り.
- C: どちらも追加しない.

## 決定
**A を採用.** 根拠:
- Sentry MCP (`@sentry/mcp-server@0.37.0`, FSL-1.1-ALv2, github.com/getsentry/sentry-mcp) は Sentry 公式. crash 監視を Web UI ではなく agent 経由で参照できれば, issue 起票から triage, 関連 source file の resolve までが一気通貫になる. 必要 env は `SENTRY_AUTH_TOKEN` (personal user token).
- Next DevTools MCP (`next-devtools-mcp@0.4.0`, MIT, github.com/vercel/next-devtools-mcp) は Next.js 16+ 公式. `/_next/mcp` endpoint を介して live runtime error / route / Server Action 解決を提供する. 本プロジェクトは `output: "export"` で静的エクスポート主体だが, dev server で build error / route 構造を取得する経路があると agent の TAT が改善する.
- 両 server とも project-local 設定のみで完結 (`.mcp.json` + `.codex/config.toml` を編集するだけ). グローバル install 不要, license も permissive.
- Sentry MCP の token は `.env` (gitignore) または GitHub Secrets に集約し, `.mcp.json` には `${SENTRY_AUTH_TOKEN}` のプレースホルダのみ書く. 値が commit される risk を構造的に排除.
- next-devtools-mcp は anonymous telemetry を送る設計だが, `NEXT_TELEMETRY_DISABLED=1` を MCP `env` に固定することで opt-out する (next-devtools-mcp README "Privacy & Telemetry" 節に基づく).

## 影響
- プラス: agent から Sentry issue / Next.js dev server state を直接参照できる.
- プラス: 既存 context7 / playwright と組み合わせ, 「context7 で最新 docs → next-devtools で現在 dev server の状態 → playwright で実描画確認 → sentry で production crash」の 4 連鎖が成立.
- マイナス: Sentry MCP を使うには Sentry 側で personal token を発行し, `.env` に配置する必要がある. token のローテーション責務が user に残る.
- マイナス: next-devtools-mcp は Node.js 20.19+ を要求し, Bun runtime での動作は未検証. Bun 1.3 系で動作実績あり (Bun は Node 20 fallback を持つため) だが, MCP 起動失敗時は context7 + playwright で代替可能.
- トレードオフ: 静的エクスポート主体のこのプロジェクトで, next-devtools の live debugging surface (nextjs_index / nextjs_call) は dev server を立ち上げた瞬間しか機能しない. CI / 本番 build では価値が薄い. それでも「dev 時の agent 補助」として残す.

## 再評価条件
- Sentry MCP の token 管理が煩雑になり, 代替手段 (Sentry Webhook + Slack MCP 等) へ移行する場合.
- next-devtools-mcp が Node.js 専用機能を増やし Bun runtime で起動できなくなった場合: context7 (`node_modules/next/dist/docs/` を直接参照する手段) に集約.
- 両 server とも telemetry がデフォルト ON で, opt-out だけでは消せない挙動を追加した場合: ADR を見直し, 接続を切る.

## 後続 ADR
- 0007: AI エージェント環境を project-local で運用 (本 ADR は MCP 拡張の最初の具体化).
- 0011: rust-analyzer LSP (本 ADR と同時期に toolchain を整えた姉妹 ADR).
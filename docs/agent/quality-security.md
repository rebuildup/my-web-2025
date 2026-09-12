# 品質・セキュリティプロファイル

## Verification taxonomy

- pure logic/component: unit
- API/service: unit + real-boundary integration
- DB/schema/migration: integration + schema/migration + smoke
- runtime/env/network/DI: smoke + relevant integration
- user journey/auth/navigation: contract/integration + critical E2E
- build/package/container: build/package + smoke
- release: applicable full integration + critical E2E/smoke + release checks

unitだけで疎通や結合の正しさを証明した扱いにしない。中断されたvalidation、skip、`.only`、suppression、stale snapshotをpassとして再利用しない。

## Repository gate

```bash
bun install --frozen-lockfile
bun run type-check
bun run lint
bun run test
bun x knip
bun run build
```

Rust変更は `apps/cms-api` でfmt/clippy/testを追加する。UI変更はPlaywright実描画、必要に応じてLighthouseを `.tmp/` に保存する。

## Security intake

Next.js、React、TypeScript、Bun、Rust、axum/sqlx、Cloudflare、直接依存のofficial advisoryをversionに紐付けて定期確認する。severityだけでなくexploitability、外部露出、権限、影響、fix availability、regression risk、release timingで優先度を決め、meaningful advisoryはIssue化してTarget Versionを付ける。critical exposed vulnerabilityは通常のsprintよりpatch releaseを優先する。

既存のGitHub Actions権限、secret、dependency alertを確認し、必要なcode/dependency/container scanningは既存workflowと重複しない最小構成で追加する。security toolの未設定をgreenと解釈しない。

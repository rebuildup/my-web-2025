# Release Sprint と GitHub運用

## Branch model

`main` はreleased state、sprintは `release-x-y-z`、top-level Issueのticket branchはIssue番号のみとする。sprint開始時に `main` からrelease branchを作る。release branchへ直接実装しない。

public repositoryでは `main` をbranch protection/rulesetで保護し、direct push / direct web edit / force push / deletionを禁止する。`main` への正規delivery pathは `release-x-y-z -> main` のrelease PRだけとする。rulesetでhead branch patternを制約できない場合は、`.github/workflows/release-source-check.yml` の required checkで `base == main` かつ `head` が canonical `release-*` pattern かつ intended target releaseであることを検証する。

## Issue / Project

独立して計画・review・統合する仕事は日本語のGitHub Issueにする。Project columnsは `Backlog -> Ready -> In Progress -> In Review -> Done`。Priority、Size、Target Version、Area、Blocked/dependencyを設定し、実capacityを超えてWIPを増やさない。

Issue dependency graphを canonical dependency SoT とする。Git branch topologyだけでdependencyを完結させない。

## Ticket lifecycle

Issueを依存グラフへ分解し、ready nodeだけを並行実行する。

### Branch start contract (active durable ticket branch)

active durable ticket branchは published remote head + Draft PR を必ず持つ。canonical start procedure:

1. durable branch を作成 (branch name = Issue 番号のみ)
2. first meaningful commit を直ちに作成
3. canonical remote へ publish
4. **remote branch head SHA が first meaningful commit SHA と一致することを確認**
5. Draft PR を直ちに作成
6. linked Issue / assignee / reviewer (または meaningful reviewer 不在の明記) / repository-established labels / target release / stack context を設定
7. 確認できる remote head + Draft PR が無い限り active implementation を継続しない

この手順は human / Coordinator / worker / subagent すべてに適用する。remote publication / PR mutation 権限を持たないworkerは first commit 後に Coordinator/Supervisor へ handoff し、publish + remote head verify + Draft PR 完了まで追加実装を進めない。

### Independent ticket PR

hard predecessor が無い ticket は target release branch を direct base にする (`123 -> release-x-y-z`)。

### Dependency-aware stacked PR (same-release 内)

同一 repository・同一 target release 内に real linear hard dependency がある場合、dependent ticket PR は immediate predecessor ticket branch を base にしてよい。

```text
main
└─ release-2-2-0
   ├─ 123            ← independent
   └─ 124            ← hard dep on 123 (immediate base)
      └─ 125         ← hard dep on 124
```

stack を使う条件:

- same repository
- same target release
- real hard dependency
- stacked segment が ordered chain として表現可能
- predecessor に reviewable immutable commit/snapshot が存在する

branching dependency DAG を無理に1本の stack へ変換しない。PR stack は canonical Issue dependency graph の linear path を execution / integration topology へ projection したものである。1 Issue を複数 durable PR へ細切れにする目的だけで stack を使わない。

### Stack-ready execution と revalidation

predecessor が release へ未 merge でも、reviewable immutable predecessor snapshot が利用できれば dependent worker を開始してよい。開始時に以下を記録する:

- predecessor Issue / PR identity
- exact predecessor commit SHA / immutable snapshot
- common target release
- immediate PR base

predecessor の review / integration で commit 内容が変わり downstream branch を rebase / update した場合、affected required validation を **新しい SHA で再実行** する。古い green result を流用しない (stale snapshot の green は full pass 扱い禁止)。

### PR metadata contract

PR 作成時 / 編集中に次を評価・設定する:

- linked Issue (closing keyword は non-default branch への merge では信用しない)
- accountable assignee
- requested reviewer / CODEOWNERS-derived reviewer
- repository-established labels
- acceptance criteria
- implementation summary
- validation results / status (pin された SHA と共に)
- known blockers / limitations
- target release
- stack trunk / immediate predecessor / successor context (該当時)
- meaningful reviewer が居ない場合はその事実と configured review automation / CI / explicit final review 等の代替 path を PR body へ明記する

存在しない label を形式的に作る、無関係な reviewer を指定する、author 自身を self-reviewer として欄だけ埋める運用はしない。

### Reviewer separation

implementer 自身の self-review だけで完了させない。PR 作成時に repository ownership から意味のある reviewer / CODEOWNERS を解決して request する。意味のある別 reviewer が存在しない場合、形式的 reviewer を設定するのではなく、その事実と configured review automation / CI / explicit final review 等の代替 path を PR body へ明記する。

Reviewer は clean integration candidate から最低限次を確認する:

- requested scope completeness
- decision precedence との整合
- correctness / architecture consistency
- regression risk
- test adequacy / required verification level
- validation evidence (SHA pinned)
- hidden coupling
- sandbox / runtime reproducibility
- target release / stack predecessor との整合
- PR metadata / Issue linkage の整合
- recovery / checkpoint consistency (関連時)

### Draft → Ready

PR を Ready にする前に:

- acceptance criteria が実装済み
- current SHA で ticket integration gate が green
- blocking review / blocking issue が解消されているか scope 外明示
- PR description / assignee / labels / reviewer metadata が現状と一致
- required reviewer request 済み、または meaningful reviewer 不在が明記済み
- target release branch または immediate predecessor との staleness / conflict 処理済み
- predecessor 変更に伴う downstream reconciliation / revalidation 済み
- latest durable checkpoint と branch state の矛盾が無い

### Ticket Done

stacked ticket の Done boundary は **target release trunk への landing** とする。intermediate predecessor branch への merge だけでは Done にしない。`release-x-y-z` まで contiguous landing した ticket だけを Done にする。

## Release lifecycle

### Draft release PR rule

release branch は `main` と zero-diff の間だけ Draft release PR 不要の invariant とする。最初の meaningful integrated difference が入ったら **直ちに Draft release PR を作成** し、sprint 中の durable release surface として維持する。Draft release PR にも assignee / reviewer / labels / release goal / included Issue / current validation state を設定する。

### Release integration

release branch 上の全 ticket を統合後、release-wide gate を実行する。release PR は `release-x-y-z -> main` とし、goal、included Issue/PR、breaking changes、migration、validation、known limitations を日本語で記載する。merge 後の `main` がその version の released state となる。tag / release / deploy は side-effect journal と remote 確認を伴う。

中断された validation、skip、`.only`、suppression、stale snapshot は full pass 扱いしない。validation result は validated SHA に pin し、stack rebase / update 後の別 SHA へ古い green を流用しない。

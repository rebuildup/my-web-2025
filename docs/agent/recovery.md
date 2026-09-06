# 復旧・Checkpoint契約

## SoTの優先順位

1. GitHub Issue / Project
2. target release branch
3. ticket branch、PR、commit graph、CI
4. committed docs/ADR/Skills
5. immutable worker result
6. structured checkpoint

conversation、native session、IDE、Supervisor local DBは高速化のための補助であり、唯一の復旧源にしない。

## Checkpoint schema

意味のあるmilestone、risky migration、child spawn/result integration、長いvalidation、外部side effect、shutdown、context限界の前後でcheckpointを作る。checkpointには次の外部化可能stateだけを保存する。

```text
schema_version
issue_id
target_release
ticket_branch
pr_number
base_sha
checkpoint_sha_or_snapshot
execution_generation
status
completed_steps
next_steps
pending_validation
active_children
integrated_child_results
external_side_effects
blockers
decision_refs
artifact_refs
updated_at
```

soft checkpointは同一host/sandbox用、hard checkpointはsandbox/provider消失後にもremoteから到達できる意味のあるGit/result境界とする。secret、絶対path、private reasoningは禁止する。

## Recovery algorithm

fresh agentはIssue/PR/releaseを特定し、remote refsをfetch、latest valid checkpointを読み、policy/decision refsとactive childrenを再発見する。workspaceをsnapshotから再生成し、completed validationをsnapshot SHAに照合、side effectのremote actual stateを確認、stale base/generationを検査してから lease/generationを更新する。

parentが停止してもchildを即時cancelしない。Supervisorがchildを running/completed/failed/orphaned に分類し、completed immutable resultを回収する。generationを進め、旧generationのpush/integration/external writeを拒否する。

## 外部side effect

deploy、migration、publish、tag、cloud mutation、notificationはintentを先にjournalへ記録し、完了後にremote identifier/resultを記録する。timeoutで「実行されなかった」と推測せず、actual remote stateとidempotency keyを確認してからretryする。不可逆操作はuser escalationとする。

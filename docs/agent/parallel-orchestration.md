# 並行実行・Supervisor契約

## 責務

Root CoordinatorはIssue分解、依存グラフ、委譲、統合順、最終gateを決める。Supervisor/control planeはsandboxの作成・停止・再生成、worker lease、generation、checkpoint、結果回収を担う。workerへhost Docker socket、root相当権限、cloud master credentialを渡さない。

## Worker mode

- Research: read-only。調査結果はpath/lineと参照URLで返す。
- Worker: 独立writable workspaceで実装し、focused validationとimmutable resultを返す。
- Reviewer: clean integration candidateから開始し、implementerのdirty workspaceを共有しない。

logical APIは `spawn_agent`, `wait_agent`, `get_agent_status`, `get_agent_result`, `send_agent_message`, `cancel_agent`, `resume_or_replace_agent`, `integrate_agent_result`, `checkpoint_agent`, `recover_task` とする。実装が無い環境では、これらをSupervisor adapterの契約として扱い、手作業でparent workspaceを共有しない。

## Snapshot / result

worker起動時に `base_sha`、snapshot identity、Issue、target release、allowed tools、timeout、maximum depth、parent generationを固定する。worker結果は次を含む。

```text
agent_id
issue_id
base_snapshot
execution_generation
result_commit_or_ref
summary
validation_results
artifacts
known_issues
```

Supervisorだけがresultをinspect、integrate、reject、revision requestする。stale snapshotやstale generationのresultは自動統合しない。

## 分離と上限

各workerはcheckout、process、port mapping、DB、cache、queue、test artifact、build outputを分離する。read-only base imageやdownload cacheだけ共有できる。並列数はCPU/memory、WIP、rate、cost、recursion depth、lease TTLの最小値で制限する。

## 未実装境界

現在のrepositoryにはSupervisor server/provider adapter自体は存在しない。したがって、この文書は高水準契約を永続化するものであり、local hidden DBやsession IDをSupervisorの代替にしない。実装時はADRを追加し、hard checkpointの保存先とprovider-loss recoveryを先に決める。

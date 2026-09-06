---
name: sandbox-runtime
description: Use when creating or evaluating an isolated worker runtime, port mapping, database/cache state, or provider recovery boundary.
---

# Sandbox Runtime

Read `docs/agent/parallel-orchestration.md` and `docs/agent/recovery.md`. Isolate checkout, processes, ports, DB, cache, queues, artifacts, and build output. Share only immutable inputs and cacheable downloads. Record the hard checkpoint boundary before relying on a provider or host.

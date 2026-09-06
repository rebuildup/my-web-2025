---
name: agent-recovery
description: Use after interruption, context loss, sandbox loss, parent/child failure, timeout, or when writing or validating durable checkpoints.
---

# Agent Recovery

Read `docs/agent/recovery.md`. Reconstruct from Issue, Project, release/ticket refs, PR/CI, and the latest valid checkpoint. Rediscover children, verify snapshot SHA and generation, reconcile external side effects, then continue with a new lease. Never infer operation failure from a missing response.

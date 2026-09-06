---
name: parallel-orchestration
description: Use when decomposing work across independent agents, spawning workers or reviewers, defining snapshots/results, or integrating parallel changes.
---

# Parallel Orchestration

Read `docs/agent/parallel-orchestration.md`. Keep workers in independent mutable runtimes. Freeze parent input as a snapshot, attach Issue and execution generation, and collect an immutable commit/ref result. Do not let a child edit the parent workspace. Reconcile leases and stale generations before integration.

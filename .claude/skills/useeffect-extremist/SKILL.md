---
name: useeffect-extremist
description: Use when reviewing React components that use useEffect, auditing side effects for cleanup discipline, or asking about effect dependencies, value-reaction effects, data fetching in effects, timer/disposer correctness, or "uhyo extremist" useEffect principles. Triggered by phrases like "useEffect", "useEffect クリーンアップ", "過激派", "uhyo", "副作用", "track", "effect cleanup", "値の変化に反応", "dependency array", "you might not need an effect".
version: "0.1.0"
---

# useEffect Extremist Review

Read-only audit of `useEffect` usages against uhyo's "extremist" principles (Zenn: 過激派が教える useEffect の正しい使い方). Produces a structured finding report. **Never edits files.**

## Overview

Two principles from uhyo's article govern all checks:

1. **React is a UI library.** `useEffect` exists for UI management (DOM, browser API subscriptions, high-frequency escapes).
2. **React is component-based.** Every line inside a component, including effect bodies, must be component-local logic. Cleanup must restore the world to the state before mount.

A `useEffect` without a cleanup function is therefore always wrong: the component leaves residual effects when unmounted.

## When to use

- Reviewing a PR / diff that touches `useEffect` in `src/`.
- Auditing an entire feature directory (e.g. `src/components/playground/webgl-experiments/`) for effect hygiene.
- Triaging a list of high-density files reported by `rg "useEffect" src/ -c | sort -t: -k2 -rn | head`.
- Answering "is this useEffect OK?" / "should I use useEffect for X?".

Do **not** use this skill to:

- Rewrite the code (skill is read-only; suggest replacements in the report).
- Replace `react-doctor` (use `react-doctor` for general React health; this is a focused effect audit).

## Core Principles (uhyo, verbatim)

| # | Principle | Source |
|---|-----------|--------|
| P1 | React is a UI library; non-UI logic does not belong in React. | 基本原則 |
| P2 | React is component-based; effect bodies are component logic. | 基本原則 |
| P3 | A useEffect **without a cleanup function is unacceptable**. | 帰結 |
| P4 | A useEffect **must not be used to react to value changes**. (track / analytics / prop-to-state mirroring) | 帰結 |
| P5 | The dependency array is an optimization mechanism, not a control-flow tool. | 帰結 |
| P6 | Data fetching inside useEffect is acceptable for now but has no future — prefer RSC / loader / `useSyncExternalStore`. | データ取得の例 |

## Verdict Scale

Use uhyo's exact face scale so the report reads like the original article.

| Verdict | Meaning | Common cases |
|---------|---------|--------------|
| 😃 | Ideal — required DOM / browser subscription with proper cleanup. | `addEventListener` on `window` / `document`, manual DOM ops, high-frequency handlers |
| 🙂 | Acceptable, watch for cleanup. | One-shot `setTimeout` / `setInterval` with `clearXxx`, `IntersectionObserver` with `disconnect`, `AbortController` on `fetch` |
| 🙃 | Conditional — OK today, prefer RSC / loader / `useSyncExternalStore` going forward. | Data fetching inside effect (initial mount only), `useSyncExternalStore` would be cleaner |
| 😡 | Disallowed. | Effect with no cleanup, effect whose body reacts to a value change (tracking, prop-to-state), effect that calls `setState` derived from props without an escape |

## Audit Procedure

For each `useEffect` in scope, evaluate in this order:

1. **Has a cleanup return?** If no → 😡 (P3).
2. **What is the body doing?**
   - Subscribes to a browser API / event with matching dispose → 😃 / 🙂 depending on frequency.
   - Starts a timer / observer / animation loop with matching `clearXxx` / `disconnect` / `cancel` → 🙂.
   - Fetches data with `AbortController` → 🙃.
   - Calls a tracking / analytics function triggered by a value in deps → 😡 (P4). Recommend moving the call into the event handler that mutates the value.
   - Computes state derived from props (no escape hatch) → 😡 (P4). Recommend computing inline or with `useSyncExternalStore`.
3. **Dependency array integrity**: every value read inside the effect must be in the array (eslint `react-hooks/exhaustive-deps`); the array must not contain "phantom" deps used only for re-triggering.
4. **Strict-mode safety**: if the effect has non-idempotent side effects (network writes, global mutations), flag as fragile.

## Output Format

One finding per `useEffect`. Markdown table when count ≤ 30, otherwise grouped by verdict:

```markdown
## 😡 Disallowed

| File | Line | Snippet | Principle | Suggested replacement |
|------|------|---------|-----------|----------------------|
| src/hooks/useX.ts | 42 | `useEffect(() => { track('x', { v }); }, [v])` | P4 | call `track()` inside the setter / event handler |

## 🙃 Conditional

| File | Line | Snippet | Principle | Suggested replacement |
|------|------|---------|-----------|----------------------|
| src/lib/fetch.ts | 17 | `useEffect(() => { fetch(...).then(setData) }, [])` | P6 | RSC / loader, or `useSyncExternalStore` |

## 🙂 Acceptable / 😃 Ideal

(briefly noted, no action required)
```

Always end the report with:

- **Counts by verdict**
- **Files with ≥ 1 😡 verdict** (the priority fix list)
- **A note** that this audit is read-only; landing fixes requires a separate skill (e.g. `safe-refactor`).

## Common Mistakes When Auditing

- **Don't recommend "wrap in cleanup" as a cure-all.** A tracking-effect with a fake cleanup is still 😡 (P4). Suggest moving the call into the originating event handler.
- **Don't flag data fetching as 😡.** It is 🙃 — uhyo explicitly allows it as a transitional pattern.
- **Don't double-count Strict-mode hazards as 😡** unless the body is observably non-idempotent.
- **Don't trust the dependency array as proof of correctness.** An effect with full deps that tracks a value is still 😡.

## References

- Zenn: 過激派が教える useEffect の正しい使い方 — https://zenn.dev/uhyo/articles/useeffect-taught-by-extremist
- React docs: [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- React docs: [`useEffect`](https://react.dev/reference/react/useEffect)
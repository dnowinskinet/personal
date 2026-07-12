---
Status: CURRENT — CANONICAL ORIENTATION
Authority: Canonical current-state orientation. A newly settled Decision Log entry must trigger an immediate Current State update; unresolved conflicts must be flagged.
Scope: Active GriftOS baseline, migration phase, and immediate approved work
Last verified against commit: 91d9643182cb69844382f08efe6e7f90c83e7b6e
Update trigger: Any accepted implementation phase, save-version change, authority change, or newly settled product decision
Supersedes: Ad hoc current-state summaries in historical task briefs and project chats
---

# GriftOS Current State

## CURRENT

- Active route: `/experimental/grift-os`.
- Active implementation: Influence / Attention empire under `src/app/pages/experimental/grift-os-game/`.
- Accepted visual baseline: `3bb5884` plus `ec59e9b`; transitional, not final art direction.
- Selected future Influence direction: Circulating Institution; prototype remains paused.
- Save formats and keys: `grift-os-meta-v1` and `grift-os-run-v1`.
- Global Net Worth is settled. The current `rugPullCount` field is compatibility state with unresolved future ownership.
- Influence mechanics/tuning and player-facing content now have separate empire-local packs. Existing `content/` exports remain compatibility assembly points for component and tooling consumers.
- Shared engine functions now receive an explicit mechanics-only catalog. Engine sources do not import Angular, browser storage/DOM, or empire content, visual, audio, renderer, or playtest layers.
- Current verification baseline: 117 tests, lint, and production build pass.

## TARGET — NOT YET IMPLEMENTED

- Shared runtime/presentation contracts with one active empire-renderer boundary; the mechanics contract is CURRENT.
- Separable visual and audio packs; mechanics and content separation is CURRENT.
- Modular Influence renderer with component-local visual ownership.

## DEFERRED

- Empire transition, coexistence, switching, unlock order, inactive offline progress, and exit-count semantics.
- Any multi-empire save envelope or v1 migration.
- Circulating Institution implementation until architecture extraction is approved and complete.

## CURRENT ARCHITECTURE PHASE

Phase C engine dependency inversion is complete at `91d9643`. Phase D presentation facade and semantic actions have not begun and require separate review and authorization.

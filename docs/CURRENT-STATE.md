---
Status: CURRENT — CANONICAL ORIENTATION
Authority: Canonical current-state orientation. A newly settled Decision Log entry must trigger an immediate Current State update; unresolved conflicts must be flagged.
Scope: Active GriftOS baseline, migration phase, and immediate approved work
Last verified against commit: 852135df836849cc6b6f99052c67583757d8d0a4
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
- A pure presentation facade now derives rule-complete display state, action availability, affordability, progress, mode reveal, and selected Context data. The current template emits a minimal typed gameplay-action vocabulary through the component dispatcher.
- Presentation sources do not import Angular, browser storage/DOM, audio, renderer, playtest, or the current component.
- Current verification baseline: 93 focused GriftOS tests and 121 full-repository tests, lint, and production build pass.

## TARGET — NOT YET IMPLEMENTED

- Shared runtime services and one active empire-renderer boundary; mechanics and presentation/action contracts are CURRENT.
- Separable visual and audio packs; mechanics and content separation is CURRENT.
- Modular Influence renderer with component-local visual ownership.

## DEFERRED

- Empire transition, coexistence, switching, unlock order, inactive offline progress, and exit-count semantics.
- Any multi-empire save envelope or v1 migration.
- Circulating Institution implementation until architecture extraction is approved and complete.

## CURRENT ARCHITECTURE PHASE

Phase D presentation facade and semantic actions are complete at `852135d`. Phase E runtime-service extraction has not begun and requires separate review and authorization.

---
Status: CURRENT — CANONICAL ORIENTATION
Authority: Canonical current-state orientation. A newly settled Decision Log entry must trigger an immediate Current State update; unresolved conflicts must be flagged.
Scope: Active GriftOS baseline, migration phase, and immediate approved work
Last verified against commit: ca7d8e36873ca1acece28cf0562697f7366c3119
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
- Plain runtime modules now own v1 save envelopes/reconciliation/throttling, foreground/offline simulation policy, and semantic event history. Storage and clocks are explicit inputs; runtime sources do not access browser globals.
- Current verification baseline: 99 focused GriftOS tests and 127 full-repository tests, lint, and production build pass.

## TARGET — NOT YET IMPLEMENTED

- One active empire-renderer boundary; mechanics, presentation/action, and runtime contracts are CURRENT.
- Separable visual and audio packs; mechanics and content separation is CURRENT.
- Modular Influence renderer with component-local visual ownership.

## DEFERRED

- Empire transition, coexistence, switching, unlock order, inactive offline progress, and exit-count semantics.
- Any multi-empire save envelope or v1 migration.
- Circulating Institution implementation until architecture extraction is approved and complete.

## CURRENT ARCHITECTURE PHASE

Phase E runtime-service extraction is complete at `ca7d8e3`. Phase F shared-host and Influence-renderer boundary work has not begun and requires separate review and authorization.

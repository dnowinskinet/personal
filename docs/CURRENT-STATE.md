---
Status: CURRENT — CANONICAL ORIENTATION
Authority: Canonical current-state orientation. A newly settled Decision Log entry must trigger an immediate Current State update; unresolved conflicts must be flagged.
Scope: Active GriftOS baseline, migration phase, and immediate approved work
Last verified against commit: af88c319beb273edbb15e801cd4d7edb48cf7dc7
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
- The shared host selects one Influence renderer through an empire registry. The renderer receives an immutable rule-complete view and emits typed semantic requests; shared audio/playtest/run utilities remain host-owned.
- Current verification baseline: 100 focused GriftOS tests and 128 full-repository tests, lint, and production build pass.

## TARGET — NOT YET IMPLEMENTED

- Separable visual and audio packs; mechanics and content separation is CURRENT.
- Modular Influence renderer internals and component-local visual ownership; the single dynamic renderer boundary is CURRENT.

## DEFERRED

- Empire transition, coexistence, switching, unlock order, inactive offline progress, and exit-count semantics.
- Any multi-empire save envelope or v1 migration.
- Circulating Institution implementation until architecture extraction is approved and complete.

## CURRENT ARCHITECTURE PHASE

Phase F shared-host and Influence-renderer boundary work is complete at `af88c31`. Phase G SCSS and component-style ownership migration has not begun and requires separate review and authorization.

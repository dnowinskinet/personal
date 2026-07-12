---
Status: CURRENT — CANONICAL ORIENTATION
Authority: Canonical current-state orientation. A newly settled Decision Log entry must trigger an immediate Current State update; unresolved conflicts must be flagged.
Scope: Active GriftOS baseline, migration phase, and immediate approved work
Last verified against commit: 127d58564047686fc9021054f6fcbd63ae31e409
Update trigger: Any accepted implementation phase, save-version change, authority change, or newly settled product decision
Supersedes: Ad hoc current-state summaries in historical task briefs and project chats
---

# GriftOS Current State

## CURRENT

- Active route: `/experimental/grift-os`.
- Active implementation: Influence / Attention empire under `src/app/pages/experimental/grift-os-game/`.
- Accepted visual baseline: `3bb5884` plus `ec59e9b`; transitional, not final art direction.
- Selected future Influence direction: Circulating Institution; prototype remains paused.
- Primary save formats and keys: `grift-os-meta-v2` and `grift-os-run-v2`. Legacy `grift-os-meta-v1` and `grift-os-run-v1` records are retained and mirrored for rollback while Influence is the only production empire.
- Global Net Worth is stored in v2 meta. The migrated v1 `rugPullCount` is Influence's per-empire lifetime exit count; no global lifetime-exit counter is persisted.
- Influence mechanics/tuning and player-facing content now have separate empire-local packs. Existing `content/` exports remain compatibility assembly points for component and tooling consumers.
- Shared engine functions now receive an explicit mechanics-only catalog. Engine sources do not import Angular, browser storage/DOM, or empire content, visual, audio, renderer, or playtest layers.
- A pure presentation facade now derives rule-complete display state, action availability, affordability, progress, mode reveal, and selected Context data. The current template emits a minimal typed gameplay-action vocabulary through the component dispatcher.
- Presentation sources do not import Angular, browser storage/DOM, audio, renderer, playtest, or the current component.
- Plain runtime modules own the single-active-run v2 envelope, v1 migration/mirroring, reconciliation/throttling, foreground/offline simulation policy, and semantic event history. Storage and clocks are explicit inputs; runtime sources do not access browser globals.
- The shared host selects one Influence renderer through an empire registry. The renderer receives an immutable rule-complete view and emits typed semantic requests; shared audio/playtest/run utilities remain host-owned.
- Renderer selection is an injectable registration. The host depends only on a renderer-neutral view envelope and semantic dispatcher; Influence content adaptation happens in the registry. A test-only replacement proves view delivery, semantic action dispatch, and host-utility separation without shipping a second empire.
- Shared shell/theme tokens and the mobile Context/site-scroll bridge remain intentionally global. Host utilities use host-local styles, while Influence composition and motion live beside the renderer under an enforced `.grift-influence-renderer` scope. The prior 3,017-line global implementation-history cascade no longer owns empire presentation.
- Current verification baseline: 103 focused GriftOS tests and 131 full-repository tests, lint, and production build pass.

## TARGET — NOT YET IMPLEMENTED

- Separable visual and audio packs; mechanics and content separation is CURRENT.
- Modular Influence renderer internals and region-level component style ownership; renderer-level visual containment and the single dynamic renderer boundary are CURRENT.
- Changing empires requires completing the active empire's prestige, then explicitly choosing an unlocked empire; the transition UI and second production empire are not yet implemented.

## DEFERRED

- Exact unlock requirements, shared transition UI/terminology, and whether later balance work should make prestige easier for empire switching.
- Circulating Institution implementation and its transition UI.

## CURRENT ARCHITECTURE PHASE

Phase J's single-active-run v2 persistence and rollback-safe v1 migration are complete at `127d585`. Prestige mechanics and visible transition behavior did not change. Phase K Circulating Institution work has not begun and requires separate authorization. Static Stage/Lane/Context component decomposition remains TARGET.

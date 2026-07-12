---
Status: CURRENT — CANONICAL ORIENTATION
Authority: Canonical current-state orientation. A newly settled Decision Log entry must trigger an immediate Current State update; unresolved conflicts must be flagged.
Scope: Active GriftOS baseline, migration phase, and immediate approved work
Last verified against commit: 4adf0575a5581ba4eaf293817513a7a4b548c013
Update trigger: Any accepted implementation phase, save-version change, authority change, or newly settled product decision
Supersedes: Ad hoc current-state summaries in historical task briefs and project chats
---

# GriftOS Current State

## CURRENT

- Active route: `/experimental/grift-os`.
- Active implementation: Influence / Attention empire under `src/app/pages/experimental/grift-os-game/`.
- Prior accepted visual/runtime baseline: `3bb5884` plus `ec59e9b`; retained as the pre-Phase-K rollback reference.
- Current Influence visual baseline: the revised K.2 Stage composition at `c88a3f0`, building on the first Circulating Institution prototype at `dbafc01` and Stage-circle removal at `05969a6`; active for review, with final background artwork still absent.
- The prototype authors the Valuation Stage, mode rail, Hustle ledger/lanes, and selected Context in light/dark desktop/mobile expressions. Leverage and Rug Pull retain their existing meaning and composition.
- Primary save formats and keys: `grift-os-meta-v2` and `grift-os-run-v2`. Legacy `grift-os-meta-v1` and `grift-os-run-v1` records are retained and mirrored for rollback while Influence is the only production empire.
- Global Net Worth is stored in v2 meta. The migrated v1 `rugPullCount` is Influence's per-empire lifetime exit count; no global lifetime-exit counter is persisted.
- Influence mechanics/tuning and player-facing content now have separate empire-local packs. Existing `content/` exports remain compatibility assembly points for component and tooling consumers.
- Shared engine functions now receive an explicit mechanics-only catalog. Engine sources do not import Angular, browser storage/DOM, or empire content, visual, audio, renderer, or playtest layers.
- A pure presentation facade now derives rule-complete display state, action availability, affordability, progress, mode reveal, and selected Context data. The current template emits a minimal typed gameplay-action vocabulary through the component dispatcher.
- Presentation sources do not import Angular, browser storage/DOM, audio, renderer, playtest, or the current component.
- Plain runtime modules own the single-active-run v2 envelope, v1 migration/mirroring, reconciliation/throttling, foreground/offline simulation policy, and semantic event history. Storage and clocks are explicit inputs; runtime sources do not access browser globals.
- The shared host selects one Influence renderer through an empire registry. The renderer receives an immutable rule-complete view and emits typed semantic requests; shared audio/playtest/run utilities remain host-owned.
- The Influence Stage is an ordinary statically composed Angular child with a presentation-only view contract, replaceable desktop/mobile and light/dark backdrop hooks, a centered Chamber/Frame, and a stable real-data Capital Panel. Fresh runs show real `$0` Net Worth. Ledger and Lane are now statically composed presentation-only children; Context, Modes, Leverage, and Rug Pull remain in the transitional root renderer template.
- Renderer selection is an injectable registration. The host depends only on a renderer-neutral view envelope and semantic dispatcher; Influence content adaptation happens in the registry. A test-only replacement proves view delivery, semantic action dispatch, and host-utility separation without shipping a second empire.
- Shared shell/theme tokens and the mobile Context/site-scroll bridge remain intentionally global. Host utilities use host-local styles, while Influence composition and motion live beside the renderer under an enforced `.grift-influence-renderer` scope. The prior 3,017-line global implementation-history cascade no longer owns empire presentation.
- Current verification baseline: 105 focused GriftOS tests and 133 full-repository tests, lint, and production build pass.

## TARGET — NOT YET IMPLEMENTED

- Separable visual and audio packs; mechanics and content separation is CURRENT.
- A shared economic-slot catalog will own equivalent cross-empire Hustle costs, payouts, cadence, growth, automation, and milestone effects; current Influence tuning remains unchanged until that extraction is approved.
- Modular Influence renderer internals beyond the Stage and region-level component style ownership for Ledger/Lane/Context/Modes/Leverage/Rug Pull; Stage ownership, renderer-level containment, and the single dynamic renderer boundary are CURRENT.
- Changing empires requires completing the active empire's prestige, then explicitly choosing an unlocked empire; the transition UI and second production empire are not yet implemented.

## DEFERRED

- Exact unlock requirements, shared transition UI/terminology, and whether later balance work should make prestige easier for empire switching.
- Final Circulating Institution art, asset, motion, and transition UI decisions.

## CURRENT ARCHITECTURE PHASE

Phase K.3.1 Ledger/Lane extraction is complete at `4adf057`. The root renderer supplies rule-complete Hustle rows and receives the same typed semantic requests; Ledger owns the list/Horizon template and Lane owns one Hustle's actions, disclosure, and progress markup. Existing compatibility styles and placeholder icon construction remain unchanged pending K.3.2. Mechanics, tuning, actions, routes, saves, visible layout, Leverage, and Rug Pull behavior did not change.

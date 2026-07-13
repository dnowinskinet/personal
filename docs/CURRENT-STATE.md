---
Status: CURRENT — CANONICAL ORIENTATION
Authority: Canonical current-state orientation. A newly settled Decision Log entry must trigger an immediate Current State update; unresolved conflicts must be flagged.
Scope: Active GriftOS baseline, migration phase, and immediate approved work
Last verified against commit: bc075cd9342deafe05cae756829438c3c47adbba
Update trigger: Any accepted implementation phase, save-version change, authority change, or newly settled product decision
Supersedes: Ad hoc current-state summaries in historical task briefs and project chats
---

# GriftOS Current State

## CURRENT

- Active route: `/experimental/grift-os`.
- Active implementation: Influence / Attention empire under `src/app/pages/experimental/grift-os-game/`.
- Prior accepted visual/runtime baseline: `3bb5884` plus `ec59e9b`; retained as the pre-Phase-K rollback reference.
- Current Influence visual baseline: the revised K.2 Stage composition at `c88a3f0`, with the temporary dark-desktop backdrop at `2c2396d`, obsolete atmosphere removal at `79aa4c0`, and Chamber-owned flyouts at `7f0fd06`; active for review, with final authored artwork still pending.
- The prototype authors the Valuation Stage, mode rail, Hustle ledger/lanes, and selected Context in light/dark desktop/mobile expressions. Leverage and Rug Pull retain their existing meaning and composition.
- Lane manual-action controls reserve a 3.42rem visual footprint while retaining their current behavior. The initials inside them remain temporary placeholder debris, not an approved icon system or final Hustle presentation.
- Primary save formats and keys: `grift-os-meta-v2` and `grift-os-run-v2`. Legacy `grift-os-meta-v1` and `grift-os-run-v1` records are retained and mirrored for rollback while Influence is the only production empire.
- Global Net Worth is stored in v2 meta. The migrated v1 `rugPullCount` is Influence's per-empire lifetime exit count; no global lifetime-exit counter is persisted.
- Shared `economic-slots/economic-slot-catalog.ts` owns the ten-position Hustle ladder's costs, payouts, cadence, growth, automation, unlocks, initial units, and milestone effects. Influence maps its stable Hustle IDs one-to-one onto those slots; runtime validation rejects incomplete, unknown, or duplicate slot mappings before play.
- Influence player-facing content remains empire-local. Existing `content/` exports remain compatibility assembly points for component and tooling consumers.
- Shared engine functions now receive an explicit mechanics-only catalog. Engine sources do not import Angular, browser storage/DOM, or empire content, visual, audio, renderer, or playtest layers.
- A pure presentation facade now derives rule-complete display state, action availability, affordability, progress, mode reveal, and selected Context data. The current template emits a minimal typed gameplay-action vocabulary through the component dispatcher.
- Presentation sources do not import Angular, browser storage/DOM, audio, renderer, playtest, or the current component.
- Plain runtime modules own the single-active-run v2 envelope, v1 migration/mirroring, reconciliation/throttling, foreground/offline simulation policy, and semantic event history. Storage and clocks are explicit inputs; runtime sources do not access browser globals.
- The shared host selects one Influence renderer through an empire registry. The renderer receives an immutable rule-complete view and emits typed semantic requests; shared audio/playtest/run utilities remain host-owned.
- The Influence renderer is one runtime-selected boundary composed from ordinary Stage, Modes, Ledger/Lane, Context, Leverage, Rug Pull, and Founder Take Angular children. Its template is renderer-local; each region consumes presentation data and emits typed semantic requests without owning mechanics or persistence.
- Renderer selection is an injectable registration. The host depends only on a renderer-neutral view envelope and semantic dispatcher; Influence content adaptation happens in the registry. A test-only replacement proves view delivery, semantic action dispatch, and host-utility separation without shipping a second empire.
- Shared shell/theme tokens and the mobile Context/site-scroll bridge remain intentionally global. Host utilities use host-local styles. Region-specific Influence styles live beside their components; the renderer sheet retains only renderer-wide surface/action compatibility rules under an enforced `.grift-influence-renderer` scope. The separate Circulating Institution prototype sheet and obsolete icon/Stage cascades are gone.
- Lane progress uses one renderer-owned CSS cycle synchronized from the engine's cadence and current phase. The former reset-ID set, 24 ms reset timer, per-render transform scale, visual lead, and chasing transition are removed; engine payout and progress state remain authoritative.
- Current verification baseline: 106 focused GriftOS tests and 134 full-repository tests, lint, and production build pass.

## TARGET — NOT YET IMPLEMENTED

- Separable visual and audio packs; mechanics and content separation is CURRENT.
- Empire-authored Hustle viewport pairs: a small Lane image and a related richer selected-Context rendition, sharing identity/state/accessibility contracts without sharing one universal visual widget. Artwork is not yet implemented.
- Changing empires requires completing the active empire's prestige, then explicitly choosing an unlocked empire; the transition UI and second production empire are not yet implemented.

## DEFERRED

- Exact unlock requirements, shared transition UI/terminology, and whether later balance work should make prestige easier for empire switching.
- Final Circulating Institution art, asset, motion, and transition UI decisions.

## CURRENT ARCHITECTURE PHASE

Phase K is complete through `84b4eb5`. The post-K economic-parity foundation is complete through `993725d`: Influence now consumes the shared ten-slot economic catalog through a validated empire-local ID mapping without changing any numeric tuning, behavior, saves, content, or presentation. Final authored Stage artwork and the first production use of that catalog by a second empire remain deferred.

---
Status: CURRENT — CANONICAL ORIENTATION
Authority: Canonical current-state orientation. A newly settled Decision Log entry must trigger an immediate Current State update; unresolved conflicts must be flagged.
Scope: Active GriftOS baseline, migration phase, and immediate approved work
Last verified against commit: e4a8fa9aa717155e2f3f83c2071fb12cb0f2e8e4
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
- Every Influence Hustle has one current prototype viewport image mapped by stable Hustle ID in `empires/influence/visuals/`. The same optimized 960×720 source is center-cropped into the 3.42rem Lane control and shown at 4:3 in selected Context; the former initials are removed. These are review prototypes, not final paired artwork or a shared cross-empire icon system.
- Primary save formats and keys are `grift-os-meta-v3` and `grift-os-run-v3`. Legacy v2/v1 records remain untouched and readable for migration. Migration preserves persistent Net Worth, unlocked empires, and Influence exit history, initializes peak Net Worth from migrated wealth, and resets the incompatible ten-ID active run instead of blindly mapping it into twelve semantic Hustles.
- Global meta stores current and peak Net Worth. Current Net Worth is visible personal wealth, spendable on temporary Influence Leverage, used by Wealth Advantage, and counted toward the `$1T` objective. Peak Net Worth never decreases and governs campaign strata, progression unlocks, and Rug Pull target selection.
- Shared `economic-slots/economic-slot-catalog.ts` owns the twelve-position Hustle ladder's costs, payouts, cadence, growth, automation, unlocks, initial scale, and milestone effects. Influence maps its twelve semantic Hustle IDs one-to-one onto those slots; runtime validation rejects incomplete, unknown, or duplicate slot mappings before play.
- Owned Hustle quantity is durable productive `scaleCount`, distinct from the recurring manual transaction. Influence content supplies scale nouns, expansion/manual actions, automations, activity copy, and optional display metadata; Online Rage Farm currently displays each underlying scale count as 1,000 Followers.
- Influence player-facing content remains empire-local. Existing `content/` exports remain compatibility assembly points for component and tooling consumers.
- Shared engine functions now receive an explicit mechanics-only catalog. Engine sources do not import Angular, browser storage/DOM, or empire content, visual, audio, renderer, or playtest layers.
- A pure presentation facade now derives rule-complete display state, action availability, affordability, progress, mode reveal, and selected Context data. The current template emits a minimal typed gameplay-action vocabulary through the component dispatcher.
- Presentation sources do not import Angular, browser storage/DOM, audio, renderer, playtest, or the current component.
- Plain runtime modules own the single-active-run v3 envelope, v2/v1 migration, reconciliation/throttling, foreground/offline simulation policy, and semantic event history. Storage and clocks are explicit inputs; runtime sources do not access browser globals.
- The shared host selects one Influence renderer through an empire registry. The renderer receives an immutable rule-complete view and emits typed semantic requests; shared audio/playtest/run utilities remain host-owned.
- GriftOS audio is route-owned: music may remain enabled as a preference, but active playback and pending starts stop when the GriftOS route is destroyed and do not follow the player onto other site pages.
- The Influence renderer is one runtime-selected boundary composed from ordinary Stage, Modes, Ledger/Lane, Context, Leverage, Rug Pull, and extraction Angular children. Influence presents the neutral extraction core as `Your Take`; each region consumes presentation data and emits typed semantic requests without owning mechanics or persistence.
- Renderer selection is an injectable registration. The host depends only on a renderer-neutral view envelope and semantic dispatcher; Influence content adaptation happens in the registry. A test-only replacement proves view delivery, semantic action dispatch, and host-utility separation without shipping a second empire.
- Shared shell/theme tokens and the mobile Context/site-scroll bridge remain intentionally global. Host utilities use host-local styles. Region-specific Influence styles live beside their components; the renderer sheet retains only renderer-wide surface/action compatibility rules under an enforced `.grift-influence-renderer` scope. The separate Circulating Institution prototype sheet and obsolete icon/Stage cascades are gone.
- Lane progress uses one renderer-owned CSS cycle synchronized from the engine's cadence and current phase. The former reset-ID set, 24 ms reset timer, per-render transform scale, visual lead, and chasing transition are removed; engine payout and progress state remain authoritative.
- Current twelve-slot balance baseline: morning/evening natural prepared play reaches the `$1T` campaign objective in about 8.62 days, after Subscriber Towns is acquired at about 5.58 days and automated at about 7.10 days. The explicit Net-Worth reinvestment strategy reaches the objective in about 6.59 days; ordinary strategies do not auto-buy Leverage.
- Current verification baseline: 109 focused GriftOS tests and 158 full-repository tests, lint, production build, architecture checks, representative balance simulations, and desktop/mobile live smoke checks pass.

## TARGET — NOT YET IMPLEMENTED

- Separable visual and audio packs; mechanics and content separation is CURRENT.
- Formal empire visual-pack contracts and final empire-authored Hustle viewport art. The current Influence prototype reuses one image per Hustle; a later art pass may provide a related richer Context rendition without changing the shared identity/state/accessibility seam.
- Changing empires requires completing the active empire's prestige, then explicitly choosing an unlocked empire; the transition UI and second production empire are not yet implemented.

## DEFERRED

- Exact unlock requirements, shared transition UI/terminology, and whether later balance work should make prestige easier for empire switching.
- Final Circulating Institution art, asset, motion, and transition UI decisions.
- Final Influence Leverage content/tuning and the giant-milestone, cross-Hustle, old-Hustle resurgence layer.

## CURRENT ARCHITECTURE PHASE

Phases A–K and the architecture-revision migration are complete through `84b4eb5`. The post-K economic-parity foundation is complete through `993725d`, and the first Influence Hustle viewport prototypes are CURRENT at `e4a8fa9`. The twelve-Hustle shared-mechanics migration is the current verified working-tree baseline and is not yet committed. Final authored Stage/viewport artwork, formal visual/audio pack extraction, transition UI, the resurgence economy layer, final Leverage content, and the first production use of the shared economic catalog by a second empire remain future work.

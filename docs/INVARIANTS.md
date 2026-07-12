---
Status: CURRENT — CANONICAL DURABLE CONSTRAINTS
Authority: Canonical behavioral and compatibility constraints tied to executable evidence
Scope: GriftOS mechanics, persistence, presentation, interaction, and architecture boundaries
Last verified against commit: 5d3b4f7db87e6158f99afa4a3f225bbf0ccf1092
Update trigger: A durable behavior is added, changed, removed, or protected by a different test
Supersedes: Invariant lists repeated across historical implementation briefs
---

# GriftOS Invariants

## CURRENT — protected behavior

| Invariant | Executable evidence |
|---|---|
| Valuation never becomes negative after purchases. Buy Max does not overspend. | `game-engine/economy.spec.ts`: geometric cost and Buy Max tests |
| Manual Hustles require activation, complete one cycle, and return to ready. | `game-engine/economy.spec.ts`: manual activation/cycle tests |
| Automated Hustles continuously run and preserve elapsed remainder. | `game-engine/economy.spec.ts`: automation cycle test |
| Payout is linear in units before modifiers; modifier buckets combine through the current additive-within/multiplicative-across rule. | `game-engine/economy.spec.ts`: centralized tuning and modifier tests |
| Cadence, cost, and automation-cost modifiers stay within engine safety floors. | Economy/modifier implementation plus current economy suite |
| Leverage purchases require real prerequisites, spend Valuation, apply supported modifiers, and reset on Rug Pull. | `game-engine/economy.spec.ts`: Leverage and Rug Pull tests |
| Founder Take preparation is timed, spends current Valuation, diverts output, and resets with the run. | `game-engine/economy.spec.ts`: Founder Take test |
| Rug Pull is a stateful extraction action that resets run state and preserves/increases global Net Worth. | `game-engine/economy.spec.ts` and `grift-os-game.spec.ts` Rug Pull tests |
| Offline credit applies only to automated production, begins after 30 seconds, and is capped at eight hours. | `runtime/run-runtime.spec.ts`; `grift-os-game.spec.ts` integration coverage |
| Existing Influence Hustle IDs remain stable and reconcile against v2 saves and migrated v1 saves. | `economy.spec.ts`: ordered ID test; persistence and component restore/reconciliation tests |
| Influence mechanics and content catalogs remain complete and assemble into the unchanged compatibility definitions. | `empires/influence/influence-packs.spec.ts`: Hustle, milestone, and Leverage pack parity tests |
| Engine production sources import no Angular, browser storage/DOM, empire content, visual, audio, renderer, or playtest code. | `npm run grift:arch`; `scripts/check-grift-boundaries.mjs` |
| Engine formulas receive mechanics-only Hustle, milestone, Leverage, campaign, prestige, and Founder Take data explicitly. | `game-engine/mechanics.ts`; engine signatures; economy and balance suites |
| The current renderer consumes rule-complete presentation models for display state and emits typed semantic gameplay actions rather than reconstructing costs, affordability, or mode reveal in the template. | `presentation/game-presentation.spec.ts`; component action-dispatch test; `npm run grift:arch` |
| Exactly one runtime-selected empire renderer is mounted, its live DOM contains the Influence style root, shared utilities remain outside it in the host, and the Influence renderer does not import economy, runtime, audio, or playtest code. | `grift-os-game.spec.ts`: renderer/style-root/utility ownership test; `npm run grift:arch` |
| The Influence Stage is statically composed inside the one empire renderer, consumes presentation-only data, owns no gameplay actions, and keeps active Circulating Institution Stage rules out of the prototype-level stylesheet. | `stage/influence-stage.component.spec.ts`; `grift-os-game.spec.ts`; `npm run grift:arch` |
| The Influence Capital Panel appears only when the facade exposes existing Net Worth; the Stage does not invent owner metrics, tiers, telemetry, or graph data to fill the composition. | `stage/influence-stage.component.spec.ts`; deterministic `portfolio-scale` and `post-rug` fixture review |
| A replacement renderer can consume the neutral host view and dispatch semantic actions without the host importing a concrete empire renderer; replacement does not move shared utilities inside the renderer. | `grift-os-game.spec.ts`: replacement-renderer proof; `npm run grift:arch` |
| Influence selectors remain under the renderer root; empire composition/keyframes do not return to the global GriftOS bridge; `::ng-deep`, append-only phase sections, and new unreviewed `!important` declarations are rejected. | `npm run grift:arch`; `scripts/check-grift-boundaries.mjs` |
| Presentation production sources import no Angular, browser storage/DOM, audio, renderer, playtest, or current component code. | `npm run grift:arch`; `scripts/check-grift-boundaries.mjs` |
| V2 persistence stores one active empire run, global Net Worth, explicit unlocked IDs, and per-empire exit counts. V1 migrates to Influence, remains undeleted, and is mirrored for rollback while Influence is the only production empire. Corrupt v2 falls back safely to valid v1. | `runtime/run-persistence.spec.ts`; component persistence tests |
| Runtime production sources import no Angular, browser globals, empire content/visual/audio, presentation, renderer, playtest, or component code. | `npm run grift:arch`; `scripts/check-grift-boundaries.mjs` |
| Semantic event history remains ordered, bounded to twelve records, and separate from audio consumption. | `runtime/game-event-log.spec.ts`; component event/audio integration |
| Progressive mode/navigation reveal is derived from real state; unavailable modes are not decorative. | `grift-os-game.spec.ts`: progressive navigation and reveal tests |
| Manual action is explicit; expansion is separate; automation changes action hierarchy. | `grift-os-game.spec.ts`: manual, automation, and disclosure tests |
| Selected Context supports intentional opening, updates selection, closes with Escape, and restores interaction safely. | `grift-os-game.spec.ts`: Context interaction tests |
| Normal Hustles play has no required horizontal scrolling and supports semantic keyboard/touch controls. | Angular template accessibility lint plus browser verification in `VERIFICATION.md` |
| Reduced motion preserves state and meaningful progress while removing nonessential motion. | SCSS media rules plus browser verification in `VERIFICATION.md` |
| Audio remains SSR-safe, gesture-unlocked, optional without assets, and driven by semantic events. | `audio-engine.spec.ts`, production build, and `audio-architecture.md` |
| Influence tuning changes require balance-simulation evidence; architecture extraction must not rebalance it. | `game:balance` workflow and `economy-tuning-brief.md` |

## TARGET — approved constraints not yet enforceable

- Visual and audio pack extraction is not yet implemented.
- Influence renderer regions beyond the CURRENT Stage are internally composed from ordinary responsibility-owned Angular components with smaller region-owned sheets.
- Catalog assembly validates IDs and cross-references before a run begins.
- Empire replacement is available only after the active empire's prestige completes, and it starts the chosen empire from that empire's initial run state rather than carrying Hustle progress across.

These become CURRENT only after their implementation phase lands with executable checks.

## DEFERRED

- Exact empire unlock thresholds and transition presentation.
- Any prestige accessibility retuning.

## HISTORICAL

Player-facing Enterprise Intensity/Stage and Founder Core placement are superseded visual hypotheses. Internal compatibility state may remain until separately removed.

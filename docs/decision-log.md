# GriftOS Decision Log

## 2026-07-03

- Chose lazy route integration under `/experimental/grift-os`.
- Kept the game under `src/app/pages/experimental/grift-os-game/` to preserve the repo's routed-page organization.
- Treated `GriftOS` as a working codename with title strings centralized.
- Deferred unrelated site architecture changes and backend systems.

## 2026-07-04 Earlier Prototype Decisions

- Built Phase 1 manual production, timed payout, expansion costs, Buy 1, Buy Max, and immediate feedback.
- Added automation as a one-time purchase that restarts production cycles.
- Removed Receipts from the active V1 roadmap.
- Expanded to a visible ten-item escalation ladder after playtest feedback.
- Replaced two-letter abbreviations with icon placeholders.
- Removed visible Run buttons and used icons as manual action targets.
- Treated horizontal scrolling in the production stack as a layout bug.
- Added a visible Reset Run control for local simulation iteration.

These decisions remain historical context. Several presentation decisions above are superseded by the Visual/UX Architecture Reset below.

## 2026-07-04 Modernization Pass

- Migrated player-facing terminology from Generators to Hustles.
- Adopted durable noun + expansion unit + manual action + automation grammar.
- Replaced `Paper Valuation` with `Valuation` in player-facing UI.
- Added persistent `Net Worth` as the current prestige hypothesis.
- Kept Aura, Hype, Narrative, Belief, Founder Myth, and similar nouns out of the resource model.
- Kept the route and internal feature folder named `grift-os` for now.
- Added data-driven Hustle milestones with local output modifiers.
- Added a central modifier model using additive buckets multiplied across scope buckets.
- Added a pure balance simulator with natural, automation-rush, expansion-first, next-Hustle-rush, milestone-rush, and rough-ROI strategies.
- Added top-level game tabs: Hustles, Leverage, Rug Pull.
- Removed the permanent bottom activity ticker.
- Replaced the three-column layout with a HUD, tab bar, main content, and contextual inspector.
- Moved Founder Core into the inspector as a smaller evolving object.
- Added semantic game event types so audio, visuals, and playtest logging can react to facts instead of component-specific calls.
- Added `Enterprise Intensity` and `Enterprise Stage` as shared presentation/audio state.
- Added SSR-safe audio scaffolding with gesture unlock, persisted settings, SFX manifest, music-layer manifest, throttling, priority suppression, and playtest debug controls.
- Added a Rug Pull state-machine foundation with preview, commit, Net Worth gain, local Net Worth persistence, and reset behavior.
- Chose not to add final music assets or production SFX. The current runtime uses generated development tones only after trusted interaction.
- Chose not to build a large Leverage tree. The Leverage tab currently summarizes milestone and meta modifiers.

These decisions remain historical context. The always-visible tab structure, icon-only manual action, inspector placement of Founder Core, and player-facing intensity/stage presentation are superseded below.

## 2026-07-04 Visual/UX Architecture Reset

The project adopted a progressive-reveal UX architecture for the Hustles experience.

### Progressive disclosure

- Progressive reveal is now a governing UX rule.
- The opening should show only the systems the player can meaningfully understand or act on.
- Early play should show owned Hustles plus one meaningful next-Hustle horizon rather than the full ten-item ladder as normal zero-output rows.
- Complexity should reveal through semantic game events and actionable state, not arbitrary elapsed time or a visible intensity percentage.
- The working reveal spine is:

```text
Action
-> Expansion
-> Automation
-> Portfolio
-> Milestones
-> Leverage
-> Extraction
-> Inheritance
```

### Hustle interaction

- Explicit manual-action controls return.
- The manual action must be a discoverable semantic control.
- The Hustle icon may remain an additional manual-action target, but it is not the only target.
- The Hustle row/body selects the Hustle and opens or shows contextual detail.
- Expansion remains a distinct action using concrete unit grammar such as `Add Forum`.
- Unavailable actions should not use the red prohibited cursor.
- Hover and pointer treatment must match actual interactivity.

This supersedes the earlier decision to rely on icons as the sole manual-action target.

### Responsive selected-Hustle context

- Rich selected-Hustle context remains valuable because flavor, comedy, milestone explanation, and automation detail overload the row when forced inline.
- On genuinely wide desktop, use a Hustle ledger plus pinned selected-Hustle context when that context is useful.
- On medium widths, use a full-width ledger plus contextual overlay drawer.
- On narrow/mobile widths, use a full-width ledger plus bottom sheet.
- Selected-Hustle context must not fall beneath the complete Hustle list in normal document flow.
- The same conceptual selected-Hustle content model should drive all responsive presentations.

This supersedes the old mobile behavior that stacked the inspector beneath the entire Hustle list.

### Mode navigation

- `Hustles`, `Leverage`, and `Rug Pull` should not all be visible from a fresh save merely because the systems exist in code.
- Do not show a single decorative `Hustles` tab before multiple meaningful modes exist.
- Leverage navigation should appear when a real Leverage interaction or structural modifier is available.
- Rug Pull navigation should appear when extraction becomes meaningfully forecastable or otherwise semantically relevant.
- Exact Leverage and Rug Pull reveal conditions remain provisional and must not be invented silently.

This supersedes the always-visible three-tab navigation decision.

### Action hierarchy and automation

- Before automation, the manual verb is the primary Hustle action and expansion is secondary.
- After automation, expansion becomes primary and the manual verb remains available but secondary.
- Automated Hustles should visibly self-run through persistent local behavior, not only an `AUTO` badge.
- Automation opportunities should reveal contextually rather than occupying empty chrome on every Hustle from the beginning.

### Visual progression

- The primary visual-progression model is now semantic rather than player-facing percentage/stage display.
- Prototype visual conditions are:

```text
Manual
Automated
Structural
```

- These are internal design conditions, not player-facing stage labels.
- Do not add a replacement stage meter or percentage.
- Density, motion, and structural cues should appear because actual mechanics have become relevant.

### Enterprise Intensity and Enterprise Stage

- The visible intensity percentage is retired from normal player-facing UI.
- The player-facing `Enterprise Stage` block and explanatory stage prose are retired.
- `Enterprise Intensity` is no longer the primary conceptual backbone for visual progression.
- Existing internal `enterpriseIntensity`, `enterpriseStage`, or `EnterprisePresentation` compatibility may remain temporarily where audio, debug, or existing code still consumes them.
- This UX reset does not require deleting shared presentation/audio state.
- Any later removal of those internal dependencies should be a separate reviewed refactor.

### Selected-Hustle analytics

The following player-facing diagnostics are retired:

- Valuation pressure;
- Automation spread;
- Milestone density;
- Pressure Model;
- Active Surface;
- similar invented percentage diagnostics that do not drive player decisions.

Do not rename or replace them merely to fill space.

### Global evolution artifact

- The current Founder Core placement inside selected-Hustle context is superseded.
- The project preserves the hypothesis that a memorable global evolving object could embody run progression.
- Any such object should be global rather than owned by the selected Hustle.
- It should not require a visible percentage, level, or fake analytics.
- It may reveal only after a meaningful event such as first automation.
- Final visual form, meaning, name, and whether it becomes clickable remain unresolved.

### Scope boundary

- This reset is a UX and visual-architecture decision, not an economy rebalance.
- Do not change costs, payouts, milestones, Rug Pull thresholds, or prestige formulas merely to satisfy the new layout.
- Do not invent a Leverage mechanic merely to justify revealing Leverage.
- Do not redesign Rug Pull as part of the Hustles architecture reset.

## 2026-07-11 Economy Scale And Extraction Revision

- Replaced the retired prototype prestige assumptions with a six-stratum Rug Pull campaign: `$100M`, `$3B`, `$100B`, `$3T`, `$100T`, then `$1Q` post-victory target peaks.
- Kept Valuation as the only spendable run value and Net Worth as persistent, non-spendable prestige value.
- Rethemed the ten provisional Hustles around an attention-to-power arc while retaining the original internal IDs for local save compatibility.
- Added run-scoped Founder Take preparation with two timed, output-diverting stages. It raises the extraction rate from `10%` to `15%` to `20%` and intentionally competes with growth.
- Made Leverage a real run-scoped purchase layer with explicit costs, prerequisites, and output/cadence/cost effects. Leverage resets on Rug Pull.
- Expanded the balance simulator to compare immediate, prepared, and deep Rug strategies across intermittent return profiles and post-victory scaling.
- Treat all current numeric inputs as provisional until playtest data supports a further balance decision.

## 2026-07-12 Multi-Empire Transition Model

- Keep exactly one active empire run. Empires are sequential identities, not parallel planet-style simulations.
- Require a successful prestige in the active empire before the player may change empires. A renderer or content swap must never carry the old empire's Hustles, units, automation, Leverage, milestones, or current Valuation into the new empire.
- Prestige grants an explicit transition opportunity; it does not force an automatic empire change. The player may begin another run in the current empire or choose an unlocked empire.
- Rebranding into another empire replaces the completed active run. Old empire runs are not suspended, resumed, or simulated offline.
- Preserve global personal Net Worth across every empire and fresh run.
- Give offline credit only to the single active saved run, retaining the current eight-hour cap unless a later mechanics decision changes it.
- Let the player choose among unlocked empires. Initial unlock progression may be authored sequentially, but persistence should store explicit unlocked empire IDs rather than infer them permanently from array position.
- Treat lifetime exits as per-empire state. Migrate the current v1 `rugPullCount` to Influence's lifetime exit count; do not persist an additional global lifetime-exit counter unless a later product need justifies it.
- Keep visible prestige and transition terminology empire-specific. `Rug Pull` may remain the Influence term; the eventual shared transition presentation and the word `Rebrand` remain provisional.
- Do not implement `runsByEmpire`, inactive-run progress, or a parallel multi-run save envelope.
- Do not change current Rug Pull thresholds, reward formulas, Founder Take, or the magnitude-based progression rule in this decision phase. Whether prestige requirements should later be loosened to make empire switching more accessible is deferred to playtesting and a separate economy decision.

## 2026-07-12 Multi-Empire Stage And Economic Parity

- Make the Stage each empire's primary visual identity: replaceable background artwork, a strongly defined central Chamber/Frame, and a stable Capital Panel on desktop.
- Keep Valuation important but contained within and complementary to the Chamber rather than letting the number become the entire Stage composition.
- Let each empire own materially different Stage markup, silhouette, ornament, assets, motion, and responsive expression. Share the presentation data contract, not one universal reskinnable Chamber DOM.
- Author mobile as a separate composition. The current convention stacks the Capital Panel beneath the Chamber; it is not a squeezed desktop scene.
- Keep the Capital Panel present from a fresh run and show real `$0` Net Worth before the first exit. Do not fill it with fake tiers, telemetry, graphs, or invented status.
- Keep background art replaceable and non-semantic. It must not contain dynamic values, controls, required text, or fake mechanics.
- Treat equivalent Hustle positions across empires as expressions of one shared economic ladder. Base cost, payout, cadence, growth, automation, and milestone effects remain equal for the equivalent slot while names, nouns, verbs, descriptions, icons, audio, motion, and visual treatment may differ.
- This decision does not rebalance the current Influence empire. Extracting the shared economic-slot ownership is deferred to a separately approved implementation phase.

## Temporary Decisions

- Internal compatibility aliases such as `GeneratorDefinition` may remain temporarily during migration, but player-facing UI should use Hustle vocabulary.
- The current six-stratum Rug Pull targets and reward formula are simulation-backed hypotheses, not final canon.
- The ten-Hustle constants are hand-tuned and data-driven. They are not generated from a single tier formula.
- Milestone thresholds and rewards are Hustle-specific and may mix output, cadence, expansion cost, and automation cost.
- Net Worth power uses a power-law wealth advantage with frontier and prior-stratum attenuation.
- Audio assets are absent by design. The runtime must function without them.
- Internal Enterprise Intensity / Enterprise Stage compatibility may remain while audio and debug code still consume it, but it is not required as visible player UI.
- Exact responsive breakpoint values for pinned context, overlay drawer, and bottom sheet remain provisional.

## Open Questions

- Final game title.
- Final Hustle names and title casing.
- Final light and dark palette.
- Exact responsive breakpoints.
- Exact next-Hustle horizon affordability treatment.
- Exact Leverage reveal prerequisite.
- Exact Rug Pull navigation reveal condition.
- Final first-purchase timing.
- Final automation pricing.
- Final milestone thresholds and reward strengths.
- Whether the current six-stratum Rug Pull targets should stay after human playtesting.
- Whether late-Hustle constants should be adjusted to keep the curated pre-victory envelope below `$1Q`.
- Final prestige formula and Founder Take values after playtesting.
- Whether Net Worth becomes spendable.
- Final global evolution artifact form, meaning, name, and behavior.
- Whether any future global evolution artifact becomes clickable.
- Whether internal Enterprise Intensity / Enterprise Stage compatibility remains useful after the UX reset.
- Final music layers and audio assets.
- Final Leverage interaction model.

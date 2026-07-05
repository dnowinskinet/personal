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

## Temporary Decisions

- Internal compatibility aliases such as `GeneratorDefinition` may remain temporarily during migration, but player-facing UI should use Hustle vocabulary.
- The $50M Rug Pull threshold remains the configured prototype threshold even though the current 30-minute simulation does not reach it.
- The ten-Hustle constants are hand-tuned and data-driven. They are not generated from a single tier formula.
- Milestone thresholds are currently `10` and `25` units for each Hustle.
- Milestone rewards are currently local output bonuses: `+50%` and `+100%`.
- Net Worth power is currently a direct global output bonus using the documented logarithmic formula.
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
- Exact Rug Pull / Net Worth reveal condition.
- Final first-purchase timing.
- Final automation pricing.
- Final milestone thresholds and reward strengths.
- Whether the $50M Rug Pull threshold should stay.
- Whether late-Hustle constants should be inflated to make first-run Rug Pull viable.
- Final prestige formula.
- Whether Net Worth becomes spendable.
- Final global evolution artifact form, meaning, name, and behavior.
- Whether any future global evolution artifact becomes clickable.
- Whether internal Enterprise Intensity / Enterprise Stage compatibility remains useful after the UX reset.
- Final music layers and audio assets.
- Final Leverage interaction model.

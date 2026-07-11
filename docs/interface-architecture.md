# GriftOS Interface Architecture

## Purpose

This document records the current target interface architecture for the GriftOS route.

The route remains:

```text
/experimental/grift-os
```

The main Nowinski site navbar remains.

The game owns the experience below the navbar.

The governing UX rule is:

> **Reveal systems when the player has developed a reason to understand or act on them.**

The interface should begin as a legible tycoon/clicker surface and gain structure as the player's machine gains structure.

---

## Source-of-truth note

This architecture supersedes the earlier presentation model that assumed:

- always-visible `Hustles / Leverage / Rug Pull` tabs;
- icon-only manual action;
- a permanent two-column stack + inspector at all desktop widths;
- mobile inspector content stacked below the full Hustle list;
- player-facing Enterprise Stage and intensity presentation;
- Founder Core inside selected-Hustle context.

Existing code may temporarily retain compatibility state while migration is in progress.

---

## Progressive reveal model

The working reveal spine is:

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

Use semantic game state rather than arbitrary timers.

### Fresh save

Visible:

- compact working identity;
- Valuation;
- current Average Rate;
- first Hustle;
- explicit manual action;
- expansion action.

Normally hidden:

- Net Worth when still meaningless;
- Leverage navigation;
- Rug Pull navigation;
- Enterprise Stage;
- visible intensity percentage;
- global evolution artifact;
- persistent selected-Hustle context when only one simple Hustle exists;
- automation UI before automation is actionable;
- milestone UI before milestone thresholds matter;
- bulk-buy controls before bulk ownership matters;
- the full future Hustle ladder.

### Initial expansion

After the player begins expanding the first Hustle:

- maintain clear unit, rate, cost, and cycle feedback;
- reveal one meaningful next-Hustle horizon.

Early game should generally show:

- owned Hustles;
- one next enterprise.

### Automation opportunity

When an automator becomes actionable or credibly near-term:

- reveal the relevant automation affordance for that Hustle;
- do not allocate empty automation chrome to every Hustle.

### Automation purchased

When a Hustle becomes automated:

- it visibly self-runs;
- its cycle restarts continuously;
- its action hierarchy changes;
- a global evolution artifact may first appear in a primitive replaceable state.

### Portfolio and milestones

As multiple Hustles and ownership thresholds become relevant:

- selected context earns a persistent or on-demand home;
- milestone grammar appears;
- bulk-buy controls may appear when useful.

### Leverage

Leverage navigation appears only when there is a real structural interaction or modifier state worth opening.

Do not reveal an empty conceptual mode merely because a route or tab exists in code.

### Rug Pull and Net Worth

Rug Pull and persistent Net Worth should not dominate the fresh-save header.

Prefer revealing extraction when it becomes meaningfully forecastable or otherwise semantically relevant.

Exact reveal conditions remain provisional.

---

## Masthead / HUD

The ordinary Hustles masthead prioritizes:

- compact working identity;
- current Valuation;
- current Average Rate.

Valuation is the dominant current-run economic anchor.

Negative space is allowed.

Do not fill empty header space with decorative KPIs.

### Early play

Normally omit:

- visible intensity percentage;
- Enterprise Stage;
- stage explanatory prose;
- premature Net Worth;
- non-actionable analytics.

### Later play

Additional persistent information may appear only when it has acquired meaning.

Examples:

- Net Worth after extraction becomes relevant;
- revealed mode navigation;
- a global evolution artifact after its semantic trigger.

Query-gated local playtest controls may remain compact and visually subordinate.

---

## Mode navigation

Navigation is progressive.

### Before multiple modes exist

Do not show:

```text
HUSTLES
```

as a decorative single-tab bar.

The Hustles experience simply begins.

### After Leverage becomes meaningful

Navigation may become:

```text
HUSTLES | LEVERAGE
```

### After Rug Pull becomes meaningful

Navigation may become:

```text
HUSTLES | LEVERAGE | RUG PULL
```

State should remain preserved when switching available modes.

Exact Leverage and Rug Pull reveal conditions are provisional and should be based on semantic game state.

---

## Hustles experience: Active Ledger

The main Hustles surface is an **Active Ledger**:

> a serious production ledger whose rows behave like small machines.

The ledger should support:

- fast portfolio scanning;
- obvious manual action;
- concrete unit ownership;
- expansion;
- cycle state;
- automation;
- milestones when relevant;
- one next-Hustle horizon.

It should not become:

- a generic SaaS table;
- a mini dashboard per row;
- a wall of zero-output future rows.

---

## Hustle row information hierarchy

Default priority:

1. Hustle identity;
2. concrete unit count;
3. one dominant comparable economic signal;
4. cycle/progress state;
5. automation state when relevant;
6. current primary action;
7. expansion action.

Prefer:

```text
8 Forums
3 Shows
2 Channels
```

Avoid:

```text
OWNED 8
```

Avoid redundant label/value pairs such as:

```text
PAYS EVERY
Pays every 2s
```

Prefer compact contextual wording such as:

```text
Every 2s
```

---

## Hustle interaction contract

### Row body

Click/tap:

> select Hustle and open or show contextual detail

The row body must have an affordance that matches this behavior.

### Explicit manual action

Click/tap:

> run the Hustle's manual action

Examples:

- Troll People Online;
- Record an Episode;
- Pick a Fight.

Requirements:

- semantic button;
- keyboard accessible;
- touch-safe;
- visibly understandable as an action.

### Hustle icon

The icon may also perform the manual action when available.

It is an additional tactile target, not the only discoverable target.

### Expansion action

Separate semantic action using concrete unit grammar:

- Add Forum · $X;
- Launch Show · $X;
- Add Channel · $X.

### Bulk purchase

Show only when useful.

Do not expose `Max` from a fresh save solely because the function exists.

### Unavailable actions

Do not use:

- red prohibited cursor;
- misleading pointer cursor;
- fake hover treatment.

Use:

- default cursor;
- reduced but legible treatment;
- concise reason where needed.

---

## State-dependent action hierarchy

The row should reflect the player's changing relationship to the Hustle.

### Manual Hustle

Manual verb is primary.

Expansion is secondary.

Conceptual example:

```text
[Troll People Online · +$32]    Add Forum · $140
```

### Automated Hustle

Expansion becomes primary.

Manual action remains available but secondary.

Conceptual example:

```text
[Add Forum · $140]    Troll People Online · +$32
```

This must be driven by semantic automation state rather than Hustle-specific special cases.

---

## Cycle presentation

Use existing cycle mechanics.

Default visual grammar should remain compatible with dense rows and mobile.

Preferred direction:

- compact linear trace;
- smooth interpolation between simulation updates where practical;
- clear completion;
- clean restart;
- continuous restart when automated.

Manual and automated states should differ through behavior, not only a badge.

Do not introduce a new animation library for this.

Prefer:

- CSS;
- SVG;
- browser-native animation;
- semantic state classes.

Avoid per-frame Angular state churn for decoration.

---

## Automation opportunity presentation

Do not reserve empty automation UI for every Hustle.

When automation becomes actionable, the relevant row may temporarily expand to show:

- automation name;
- short flavor copy;
- cost;
- explicit purchase action.

After purchase, collapse back toward normal density with a concise persistent state such as:

```text
Bots online
```

Density should respond to importance.

---

## Next-Hustle horizon

Do not render the next unowned Hustle as a normal `$0/sec` row.

Use distinct horizon grammar.

Conceptual example:

```text
NEXT ENTERPRISE

Culture-War Media
Turn ambient grievance into recurring revenue.

Establish at $900
```

Early game should expose one next horizon.

Its contrast may increase as affordability approaches.

Exact threshold treatment remains provisional.

---

## Selected-Hustle context

The context surface exists because comedy and explanation overload the ledger when repeated inline.

Useful content:

- Hustle name;
- richer flavor description;
- current concrete economics;
- next meaningful milestone;
- automation name and state;
- automation flavor copy;
- real modifier explanation where relevant.

Do not include:

- Valuation pressure;
- Automation spread;
- Milestone density;
- Pressure Model;
- Active Surface;
- invented percentage diagnostics;
- the global evolution artifact.

Operating principle:

> **The ledger is where the player operates.**  
> **The context surface is where the player understands and enjoys the flavor.**

Avoid duplicating every ledger action inside context unless an action genuinely needs expanded treatment.

---

## Responsive selected-Hustle context

The responsive architecture is:

> **pinned context on genuinely wide desktop; contextual overlay everywhere else**

### Genuinely wide desktop

Use:

> Hustle ledger + pinned selected-Hustle context

Requirements:

- only when multiple Hustles make context useful;
- no forced empty inspector on the earliest one-Hustle state;
- production ledger remains dominant;
- context width is disciplined.

### Medium desktop / tablet

Use:

> full-width Hustle ledger + overlay side drawer

Requirements:

- context does not permanently squeeze the ledger;
- selected state remains clear;
- predictable open/close behavior.

### Mobile / narrow widths

Use:

> full-width Hustle ledger + bottom sheet

Requirements:

- selected context never falls after the complete Hustle list;
- touch-safe;
- no horizontal scrolling for normal Hustle play;
- long-form flavor can scroll within an appropriate contextual surface.

### Shared content model

Use one conceptual selected-Hustle content model across responsive containers.

Avoid unrelated duplicate implementations or multiple interactive DOM trees that can diverge in:

- state;
- focus;
- accessibility;
- event handling.

Exact breakpoints remain provisional.

---

## Leverage mode

Current implementation may still contain a summary surface.

Product direction:

- Leverage represents structural power, modifiers, synergies, and rule distortion;
- it should not appear merely as an empty future promise;
- it should reveal when there is a real interaction or structural state worth opening.

Do not invent:

- a large tree;
- topology;
- node map;
- purchase system;

as part of the Hustles UX reset.

The final Leverage interaction model remains unresolved.

---

## Rug Pull mode

Current engine/UI foundations may continue to support:

- current Valuation;
- peak Valuation;
- projected Net Worth gain;
- resulting Net Worth;
- reset losses;
- persistent gains;
- Rug Pull action when available.

Product direction:

- Rug Pull should reveal progressively;
- it should not occupy fresh-save navigation merely because the feature exists;
- exact reveal timing must be reconciled with current prestige pacing.

This was a UX-only constraint when the interface architecture was written. The 2026-07-11 Economy Scale And Extraction Revision supersedes the old `$50M` prototype target with the current six-stratum campaign documented in `docs/prestige.md`.

---

## Semantic visual progression

The primary visual-progression model is semantic.

Prototype conditions:

```text
Manual
Automated
Structural
```

These are design/runtime conditions, not player-facing stage labels.

### Manual

Typical characteristics:

- one Hustle;
- no automation;
- sparse;
- comparatively still;
- manual action dominant;
- no global evolution artifact;
- no mode navigation;
- no persistent inspector for symmetry.

### Automated

Typical characteristics:

- first automation active;
- multiple Hustles beginning to exist;
- automated row visibly self-running;
- manual row comparatively still;
- expansion becomes primary on automated Hustles;
- selected context becomes useful;
- primitive global artifact may appear.

### Structural

Typical characteristics:

- multiple Hustles;
- multiple automations;
- first meaningful structural/global/cross-Hustle modifier active;
- Leverage navigation may appear;
- UI density may increase because mechanics now justify it;
- global artifact may advance to a second replaceable state;
- structural relationship cues appear only where real mechanics support them.

Do not add:

- visible stage meter;
- player-facing stage label;
- replacement percentage;
- generic glow ramp as the primary progression model.

---

## Global evolution artifact

The current Founder Core placement inside selected-Hustle context is retired.

The underlying hypothesis remains provisional:

> a memorable global evolving object may give progression a body.

For now:

- keep it global;
- do not pre-reserve a giant empty shrine;
- allow it to reveal after a meaningful event such as first automation;
- keep final art, name, meaning, and interaction unresolved;
- use replaceable placeholder states if needed.

Suggested prototype states:

```text
Manual      -> absent
Automated   -> primitive
Structural  -> evolved / integrated
```

Do not attach:

- percentage;
- level number;
- fake diagnostics;
- stage explanation.

---

## Enterprise Intensity / Enterprise Stage compatibility

The player-facing visual model no longer requires visible Enterprise Intensity or Enterprise Stage.

Retire from normal player UI:

- intensity percentage;
- stage block;
- stage explanatory prose.

However:

- existing `enterpriseIntensity`;
- existing `enterpriseStage`;
- existing `EnterprisePresentation`;

may remain internally where audio, debug, or compatibility code still consumes them.

This architecture does not require deleting those dependencies.

Any later cleanup should be a separate reviewed refactor.

---

## Theme and visual tokens

The game supports native light and dark expressions.

Current CSS custom properties may include:

```text
--game-bg
--game-surface
--game-surface-raised
--game-border
--game-text
--game-text-muted
--game-value
--game-info
--game-automation
--game-warning
--game-selection
--game-stage-accent
--game-glow-strength
--game-motion-intensity
```

Not all existing tokens are permanent.

Tokens tied to old stage/intensity behavior may remain temporarily for compatibility but are not architectural requirements.

Do not interpret light mode as an inverted dark app.

Do not interpret dark mode as navy SaaS.

Final palette and material system remain unresolved.

---

## Accessibility and motion

Requirements:

- keyboard-accessible semantic controls;
- meaningful focus behavior;
- touch-safe targets;
- no false pointer affordances;
- reduced-motion support;
- no horizontal scroll for normal Hustle play.

Reduced motion should preserve:

- state change;
- clear completion;
- meaningful progress;
- semantic differences between manual and automated states.

It may reduce or remove:

- large panning;
- dramatic scaling;
- background drift;
- nonessential macro-motion.

---

## Implementation boundary

This architecture does not authorize:

- economy rebalance;
- new currencies;
- Receipts;
- risk meter;
- event system;
- new Leverage mechanic;
- new Rug Pull formula;
- final artifact art;
- game engine;
- WebGL;
- Canvas-first rebuild;
- motion framework;
- Angular upgrade;
- Tailwind upgrade;
- state-management rewrite.

Preserve the existing Nowinski navbar and route.

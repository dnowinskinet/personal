---
title: "GriftOS Hustles UX Architecture Reset"
status: "TASK SPEC — IMPLEMENTATION CONTRACT"
date: "2026-07-05"
scope: "Hustles UX, progressive disclosure, responsive selected-Hustle context, interaction semantics, semantic visual progression hooks"
authority: "Task-specific implementation brief; subordinate to CURRENT STATE, DECISION LOG, and newer canonical project sources"
source_precedence: "CURRENT STATE > DECISION LOG > latest canonical domain docs > experiment/playtest docs > research reports > project chats > this task spec where conflicts exist"
---

# GriftOS Hustles UX Architecture Reset

## 1. Purpose

Rework the existing `/experimental/grift-os` Hustles experience so the interface behaves like an **unfolding incremental/tycoon game** rather than a fully exposed dashboard.

This is primarily an:

- information-architecture pass;
- interaction-semantics pass;
- responsive-layout pass;
- progressive-disclosure pass;
- semantic visual-state foundation pass.

This is **not** a final art-direction pass.

The implementation should make the tycoon loop more legible, more tactile, more responsive, and more progressively revealing without inventing new mechanics, metrics, currencies, or decorative systems.

The core fantasy this pass should support is:

> **manually perform behavior → expand the Hustle → automate it → manage a growing portfolio → gain structural power**

The interface should reveal complexity when the player has developed a reason to understand it.

---

## 2. Product truth for this task

Assume only the following high-level product truths:

1. This is a browser-native incremental / idle / tycoon game.
2. The player builds and expands increasingly dubious Hustles.
3. Manual behavior can be industrialized through automation.
4. The satire targets weird techno-elite, founder, VC, guru, AI-messianist, and quasi-sovereign power culture.
5. The player should enjoy becoming the asshole.
6. Proven incremental mechanics take priority over visual cleverness.
7. Mobile-safe architecture matters even though current implementation is desktop-first.
8. The existing Nowinski site navbar remains.

Do not infer additional canon from old visual experiments.

---

## 3. Current implementation problems

The existing implementation has several structural problems that this task should address.

### 3.1 Premature exposure of the full game

Current behavior exposes too much too early:

- all ten Hustles;
- Leverage navigation;
- Rug Pull navigation;
- Net Worth;
- Enterprise Stage;
- visible intensity percentage;
- automation columns/states before they matter;
- milestone information before the player has learned milestones.

This weakens discovery and makes the opening feel like a finished dashboard with inactive rows.

### 3.2 Header hierarchy is overloaded

The current header gives substantial visual space to multiple concepts:

- large `GriftOS` title;
- Valuation;
- rate;
- Net Worth;
- persistent bonus;
- Enterprise Stage;
- stage explanation;
- intensity;
- reset affordance.

This creates too many competing centers of gravity before the player reaches the actual game.

### 3.3 Manual action is not discoverable

Current behavior relies heavily on the Hustle icon as the actual manual-action target.

Problems include:

- the icon is the only reliable action locus;
- nearby text appears interactive even when it is not;
- cursor behavior does not consistently match click behavior;
- unavailable states use a red prohibited cursor.

This is not acceptable for the core game verb.

### 3.4 Selected-Hustle context is responsive in the wrong way

On narrow/mobile layouts, the selected-Hustle card currently drops beneath the entire Hustle list.

This preserves document flow while destroying interaction:

- the player selects a Hustle;
- the selected details appear far below the selection;
- the player may need to scroll past every Hustle to reach them.

This must be replaced by a responsive contextual-surface pattern.

### 3.5 Selected context contains invented analytical UI

The current selected-Hustle context includes or has included items such as:

- Valuation pressure;
- Automation spread;
- Milestone density;
- Pressure Model;
- Active Surface.

These metrics are not meaningful player decisions and should not be preserved merely because they fill space.

### 3.6 The current Founder Core placement is semantically wrong

The current global/founder/evolution visual sits inside selected-Hustle context and therefore reads as though it belongs to the selected Hustle.

The concept of a future evolving global artifact is still potentially valuable.

Its current placement and implied ownership are not.

### 3.7 Future Hustles are rendered as dead rows

Showing all future Hustles as normal `$0/sec` rows:

- kills discovery;
- makes early play look empty;
- forces low-information density;
- spoils the escalation ladder;
- makes the game feel like a catalog.

Early play should reveal owned Hustles plus one meaningful next horizon.

---

## 4. Core design rule: reveal systems when the player needs them

Use semantic game-state conditions rather than arbitrary time thresholds or a visible intensity score.

The progression spine for this task is:

> **Action → Expansion → Automation → Portfolio → Milestones → Leverage → Extraction → Inheritance**

This task only implements the parts necessary to reset the Hustles experience and establish architecture for later reveals.

---

## 5. Recommended reveal sequence

### 5.1 Fresh save — manual operation

Visible:

- compact temporary game identity;
- Valuation;
- current rate;
- first Hustle;
- obvious manual action;
- expansion action.

Hidden:

- Net Worth if still meaningless / zero;
- Leverage navigation;
- Rug Pull navigation;
- Enterprise Stage;
- visible intensity percentage;
- global evolution artifact;
- persistent selected-Hustle inspector;
- automation UI before automation is actionable;
- milestone UI before milestone thresholds matter;
- bulk-buy controls before bulk ownership matters;
- full future Hustle ladder.

The first question must be:

> **What do I do?**

### 5.2 Initial expansion

When the player buys the first additional unit:

- unit count visibly changes;
- rate updates;
- next expansion cost updates;
- local payout/cycle feedback remains clear.

Reveal the **single next Hustle horizon**.

Early game should generally show:

- all owned Hustles;
- one meaningful next enterprise.

Do not show the full future ladder.

### 5.3 First actionable automation opportunity

When the first automator becomes a credible purchase:

- reveal automation affordance for that Hustle;
- do not allocate empty automation UI across every Hustle.

Example:

> **Bots**  
> Scale authentic disagreement without the authenticity bottleneck.  
> `Automate · $110`

### 5.4 First automation purchased

When automation is purchased:

- the Hustle visibly becomes self-running;
- the cycle restarts continuously;
- the row’s action hierarchy changes;
- persistent local motion appears;
- manual action remains available but becomes secondary.

At this point a global evolution-artifact placeholder may first appear.

Do not pre-reserve a giant empty shrine for it.

### 5.5 Multiple Hustles

Once multiple Hustles make selection context useful:

- enable the selected-Hustle contextual surface;
- wide desktop may use pinned context;
- medium uses an overlay drawer;
- mobile uses a bottom sheet.

### 5.6 First meaningful milestone

When the player approaches or reaches the first meaningful ownership threshold:

- reveal milestone grammar;
- show next meaningful threshold where useful;
- allow bulk-buy controls only when they become useful.

Do not expose generic milestone-density analytics.

### 5.7 First real Leverage opportunity

Reveal Leverage only when the player can make a genuine structural decision.

Prefer a semantic condition such as:

- at least two Hustles owned;
- at least one automation active;
- an actual global / cross-Hustle / structural modifier becomes actionable.

Exact prerequisite logic is not settled by this task spec.

The key rule is:

> **Leverage appears when there is one real thing to do there.**

Do not show an empty or locked Leverage screen from second zero.

### 5.8 First meaningful extraction forecast

Rug Pull and persistent Net Worth should not dominate the opening.

Prefer revealing them when persistent extraction first becomes meaningful, for example when projected persistent gain becomes nonzero.

If current game state cannot support this cleanly, add a clearly named semantic adapter/computed condition rather than inventing a fake progression percentage.

Do not redesign Rug Pull in this task.

---

## 6. Responsive composition — settled direction

The responsive layout is a hybrid:

> **A on genuinely wide desktop; C everywhere else**

Where:

- A = Hustle ledger + pinned selected-Hustle context;
- C = full-width Active Ledger + contextual drawer/sheet.

### 6.1 Genuinely wide desktop

Use:

> **Hustle ledger + pinned selected-Hustle context**

Requirements:

- persistent selected context only when multiple Hustles make it useful;
- no forced empty inspector on the earliest one-Hustle state;
- production field remains dominant;
- context width should be disciplined and justified by actual information.

The pinned context exists to hold:

- richer flavor copy;
- concrete selected-Hustle economics;
- next meaningful milestone;
- automation name/state/copy;
- selected-Hustle explanation.

It should not invent analytics to justify its width.

### 6.2 Medium desktop / tablet

Use:

> **full-width Hustle ledger + contextual overlay drawer**

Requirements:

- opening context must not permanently squeeze the ledger;
- drawer overlays rather than dropping into document flow;
- selected state remains clear;
- open/close behavior is predictable;
- underlying ledger remains structurally intact.

### 6.3 Mobile / narrow widths

Use:

> **full-width Hustle ledger + selected-Hustle bottom sheet**

Requirements:

- selected context must never be placed after the full Hustle list;
- tap selected row/body to open sheet;
- sheet should be thumb-safe;
- sheet should support long-form comedy/detail without inflating every row;
- no horizontal scrolling for normal Hustle play.

### 6.4 Shared content model

Use one conceptual selected-Hustle content model across breakpoints.

Avoid three unrelated implementations.

Also avoid duplicate interactive DOM trees that can diverge in:

- focus;
- state;
- accessibility;
- event handling.

---

## 7. Hustle interaction contract — settled direction

### 7.1 Row body

Click/tap:

> **select Hustle and open/show contextual detail**

Use a normal interactive affordance.

### 7.2 Explicit manual-action control

Click/tap:

> **run the Hustle’s manual action**

Examples:

- Troll People Online
- Record an Episode
- Pick a Fight

Requirements:

- semantic `<button>`;
- visibly understandable as an action;
- keyboard accessible;
- touch-safe.

### 7.3 Hustle icon

For this pass:

> preserve as an additional manual-action target when the manual action is available

The icon must no longer be the only discoverable way to perform the action.

### 7.4 Expansion action

Use a separate semantic action:

- Add Forum · $X
- Launch Show · $X
- Add Channel · $X

Use the Hustle’s actual expansion-unit grammar.

### 7.5 Bulk purchase

Show only when useful.

Do not expose `Max` from fresh save merely because the function exists.

### 7.6 Unavailable actions

Remove:

- red prohibited cursor;
- misleading pointer cursor;
- fake hover treatment.

Use:

- default cursor;
- reduced but legible treatment;
- concise availability reason where necessary.

---

## 8. State-dependent action hierarchy — settled direction

The row should reflect the player’s changing relationship to the Hustle.

### 8.1 Manual Hustle

Manual verb is primary.

Expansion is secondary.

Conceptual example:

```text
[Troll People Online · +$32]    Add Forum · $140
```

### 8.2 Automated Hustle

Expansion becomes primary.

Manual action remains available but visually secondary.

Conceptual example:

```text
[Add Forum · $140]    Troll People Online · +$32
```

This should be driven by semantic automation state.

Do not special-case Troll Network.

This behavior expresses:

> **manually operate → industrialize → expand**

---

## 9. Hustle row information hierarchy

The default row should prioritize:

1. Hustle identity;
2. concrete owned-unit language;
3. one dominant comparable economic signal;
4. cycle/progress state;
5. automation state when relevant;
6. current primary action;
7. expansion action.

Prefer:

- `8 Forums`
- `3 Shows`
- `2 Channels`

Avoid:

- `OWNED 8`

Avoid redundant label/value constructions such as:

```text
PAYS EVERY
Pays every 2s
```

Prefer:

```text
Every 2s
```

Do not add new analytical metrics.

---

## 10. Selected-Hustle context

The context surface exists because richer information and comedy do not belong inside every row.

### Useful content

- Hustle name;
- richer flavor description;
- current concrete economics;
- next meaningful milestone;
- automation name;
- automation state;
- automation flavor copy;
- selected-Hustle explanation;
- relevant modifier explanation where real.

### Remove

- Valuation pressure;
- Automation spread;
- Milestone density;
- Pressure Model;
- Active Surface;
- invented diagnostic percentages;
- current large Founder Core placement.

Do not invent replacements for removed metrics.

### Operating principle

> **The ledger is where the player operates.**  
> **The context surface is where the player understands and enjoys the flavor.**

Avoid duplicating every ledger action inside the context surface unless a specific action genuinely benefits from expanded treatment.

---

## 11. Cycle presentation

Use existing cycle mechanics.

Present repeated production with a compact linear trace/progress treatment suitable for:

- dense desktop rows;
- tablet;
- mobile.

Requirements:

- smooth visual progression between simulation updates where practical;
- clear completion;
- no visibly broken snapback;
- automated cycles restart continuously;
- manual and automated states should be distinguishable through behavior, not only a badge.

Do not:

- add a new animation library;
- move continuous animation into per-frame Angular state.

Prefer:

- CSS;
- SVG;
- browser-native animation;
- semantic state classes.

---

## 12. Automation opportunity behavior

Automation should not be permanently allocated as empty row chrome.

When automation becomes actionable, the relevant row may temporarily expand.

Conceptual example:

```text
Troll Network        8 Forums        $16/sec        Every 2s

[Troll People Online · +$32]                     [Add Forum · $140]

BOTS AVAILABLE
Scale authentic disagreement without the authenticity bottleneck.

                                           [Automate · $110]
```

After purchase, the row should collapse back into normal density with a concise state such as:

```text
Bots online
```

Density should respond to importance.

---

## 13. Next Hustle horizon

Do not render the next unowned Hustle as a normal `$0/sec` row.

Use distinct horizon grammar.

Conceptual example:

```text
NEXT ENTERPRISE

◇ Culture-War Media
  Turn ambient grievance into recurring revenue.

  Establish at $900
```

Early game should expose one next horizon.

As the player approaches affordability, it may gain contrast.

Exact affordance thresholds are tuning decisions and are not fixed by this document.

---

## 14. Header / masthead simplification

For ordinary Hustles play, prioritize:

- compact temporary game identity;
- Valuation;
- current rate.

Treat `GriftOS` as a working title, not a giant permanent hero wordmark.

Remove or hide from ordinary early play:

- visible intensity percentage;
- Enterprise Stage;
- stage explanation;
- premature Net Worth;
- other non-actionable analytics.

Valuation should remain the dominant current-run anchor.

Do not replace removed content with new decorative KPIs.

Negative space is allowed.

---

## 15. Mode navigation

Do not show this from fresh save:

```text
HUSTLES | LEVERAGE | RUG PULL
```

Also do not show one giant active `HUSTLES` tab before any other mode exists.

Navigation should appear when navigation becomes necessary.

Support semantic evolution:

```text
HUSTLES | LEVERAGE
```

and later:

```text
HUSTLES | LEVERAGE | RUG PULL
```

based on real unlock state.

Preserve existing routes/state where practical.

Player-facing visibility should follow reveal state.

---

## 16. Three semantic visual states

Do not implement a visible stage meter.

Do not show player-facing stage labels such as:

- Scrappy;
- Legitimate;
- Institutional.

Do not create another percentage.

Support three prototype conditions based on real mechanics.

### 16.1 Manual

Typical condition:

- one Hustle;
- no automation.

Characteristics:

- sparse;
- minimal ambient motion;
- manual action dominant;
- no global artifact;
- no mode navigation;
- no persistent inspector merely for symmetry.

### 16.2 Automated

Typical condition:

- first automation active;
- multiple Hustles beginning to exist.

Characteristics:

- automated row visibly self-running;
- manual row comparatively still;
- action hierarchy changes on automated Hustle;
- selected context becomes useful;
- global artifact may first appear in primitive placeholder state;
- no Leverage navigation until Leverage is genuinely available.

### 16.3 Structural

Typical condition:

- multiple Hustles;
- multiple automations;
- first meaningful structural/global/cross-Hustle modifier active.

Characteristics:

- Leverage navigation may exist;
- affected Hustles may expose restrained relationship/state hooks;
- UI density may increase because milestones/automation/bulk actions are now relevant;
- global artifact may advance to a second placeholder/evolved state.

Do not invent decorative relationships where no real modifier exists.

---

## 17. Global evolution artifact

The current Founder Core implementation should not be preserved in its current form.

### Preserve the possibility

The project still wants to test whether a memorable global evolving object can embody progression in the way central evolving objects do in successful incremental games.

### For this task

- remove it from selected-Hustle context;
- do not pre-reserve a giant empty shrine;
- allow it to appear only after a meaningful semantic event such as first automation;
- keep it global;
- keep final art unresolved;
- use replaceable placeholder states only if needed.

Suggested prototype progression:

```text
Manual      → absent
Automated   → primitive
Structural  → evolved/integrated
```

Do not add:

- percentage;
- level number;
- fake diagnostics;
- player-facing stage explanation.

Its final meaning is unresolved.

---

## 18. Remove or retire in this pass

Unless required behind a dev-only debug mechanism, remove from normal player-facing UI:

- visible intensity percentage;
- Enterprise Stage presentation;
- stage explanatory paragraph;
- Valuation pressure percentage;
- Automation spread percentage;
- Milestone density percentage;
- Pressure Model panel;
- Active Surface panel;
- red prohibited cursor behavior;
- misleading pointer cursor on non-actions;
- all-ten-Hustles-as-zero-output-rows early presentation;
- current mobile behavior that places selected-Hustle context after the entire list;
- selected-Hustle ownership of the current Founder Core visual.

Do not replace these with newly invented metrics.

---

## 19. Explicit non-goals

Do **not**:

- rename the game;
- rebalance the economy;
- redesign Leverage mechanics;
- design a Leverage topology/map/tree;
- redesign Rug Pull;
- finalize Net Worth behavior;
- finalize the global evolution artifact;
- add a new currency;
- add a risk meter;
- add Receipts;
- add events;
- add new progression stages;
- add a game engine;
- add WebGL;
- add Canvas infrastructure;
- add a large motion library;
- upgrade Angular;
- upgrade Tailwind;
- rewrite state management;
- remove the Nowinski site navbar;
- invent new game systems to fill empty space;
- make final art-direction claims.

This pass should leave room for later visual design rather than pretending to finish it.

---

## 20. Technical constraints

Current repository context is approximately:

- Angular 21;
- TypeScript 5.9;
- SSR/prerender;
- Tailwind 3;
- Karma/Jasmine;
- Angular ESLint;
- GitHub Pages;
- existing Nowinski site shell/navbar;
- route `/experimental/grift-os`.

Requirements:

- preserve SSR/prerender safety;
- no browser-only access during server render without appropriate guards;
- keep semantic progression state in Angular;
- use CSS/SVG/browser-native animation for continuous presentation where practical;
- avoid per-frame Angular state churn for decoration;
- no new dependency unless absolutely necessary;
- support keyboard interaction for actual buttons and selectable surfaces;
- preserve meaningful focus behavior;
- touch targets must remain usable on mobile;
- respect reduced-motion preferences;
- avoid duplicate interactive DOM implementations that can create focus/state divergence across breakpoints.

A substantial GriftOS-scoped stylesheet section is acceptable if cleaner than forcing the system into an arbitrary component-style budget.

---

## 21. Repository diagnosis required before implementation

Before editing code, inspect the current implementation and identify:

1. Hustle list component(s);
2. Hustle row component(s);
3. selected-Hustle context component(s);
4. responsive layout implementation;
5. manual action handlers;
6. row selection handlers;
7. automation state sources;
8. milestone state sources;
9. Leverage visibility/unlock state;
10. Rug Pull visibility/unlock state;
11. Net Worth visibility/state;
12. current Founder Core dependencies;
13. intensity dependencies;
14. Enterprise Stage dependencies;
15. future-Hustle rendering logic;
16. cursor/hover behavior causing false affordances;
17. relevant tests;
18. relevant styles.

Trace which requested behaviors can use existing semantic state.

Clearly identify any behavior that requires:

- a new computed state;
- a new adapter;
- a new unlock condition;
- an architecture change.

Do not silently invent product logic.

---

## 22. Recommended implementation milestones

### Milestone 1 — interaction semantics + progressive disclosure

Scope:

- fix row/manual-action/expansion semantics;
- add explicit manual-action controls;
- preserve icon as secondary manual-action target;
- make row body select/open context;
- remove misleading cursor behavior;
- remove visible intensity / Enterprise Stage / fake selected-Hustle analytics;
- implement owned Hustles + one next horizon;
- hide premature Leverage / Rug Pull navigation;
- hide premature Net Worth where appropriate;
- reveal automation contextually;
- do not implement responsive drawer/sheet architecture yet;
- do not implement final visual-state progression yet.

### Milestone 2 — responsive selected-Hustle context

Scope:

- wide desktop: pinned context when useful;
- medium: full ledger + overlay drawer;
- narrow/mobile: full ledger + bottom sheet;
- selected context never falls below full list;
- one conceptual selected-Hustle content model;
- preserve keyboard/focus behavior;
- avoid duplicated interactive DOM.

### Milestone 3 — semantic visual progression hooks

Scope:

- Manual Hustle: manual action primary;
- Automated Hustle: expansion primary, manual secondary;
- automated cycle visibly self-restarts;
- Manual state remains comparatively still;
- primitive global artifact placeholder may appear after first automation;
- evolved artifact placeholder may appear only when Structural condition is satisfied;
- Leverage navigation appears only when actual Leverage availability supports it;
- no decorative relationships without real modifier relationships;
- no final artifact art.

---

## 23. Verification requirements

### Fresh / early state

Verify:

- player reaches an obvious playable manual Hustle quickly;
- manual action is discoverable without knowing the icon secret;
- only relevant Hustles plus one next horizon are presented;
- Leverage and Rug Pull do not appear prematurely;
- intensity and Enterprise Stage do not dominate or appear in normal early play;
- future systems do not occupy dead screen space.

### Hustle interaction

Verify:

- row selection is distinct from manual action;
- manual action is a semantic explicit control;
- icon may also perform manual action;
- expansion is distinct;
- unavailable controls do not show red prohibited cursor;
- hover/pointer behavior matches click behavior.

### Automation

Verify:

- automation opportunity reveals contextually;
- automated Hustle visibly self-runs;
- automated state changes action hierarchy;
- automation is not represented only by a badge.

### Responsive behavior

Verify at minimum:

- wide desktop;
- medium width;
- 390px mobile.

Confirm:

- wide desktop can use pinned selected context once useful;
- medium uses overlay drawer;
- mobile uses bottom sheet;
- selected context is never buried after the full Hustle list;
- no horizontal scrolling is required for normal Hustle play.

### Context / comedy

Verify:

- richer flavor copy remains available;
- flavor does not overload every row;
- fake analytics are removed rather than renamed.

### Architecture

Verify:

- Leverage/Rug Pull navigation can reveal semantically;
- Manual / Automated / Structural hooks exist;
- visible intensity percentage is not required;
- final evolution-artifact art remains replaceable.

---

## 24. Self-review requirements

Before reporting completion of each milestone:

1. inspect the full diff;
2. look specifically for:
   - accidental economy changes;
   - invented player-facing terminology;
   - duplicated responsive content;
   - inaccessible nested interactive elements;
   - stale CSS/state related to removed intensity/stage UI;
   - premature Leverage/Rug Pull visibility;
   - mobile overflow;
   - horizontal scroll;
   - hidden focus traps;
   - false hover/cursor affordances;
3. run the relevant checks;
4. report anything not verified.

---

## 25. Required completion report

After each milestone, report:

1. concise summary of changed files/components;
2. semantic reveal conditions introduced;
3. existing state reused;
4. new computed/adaptor state introduced;
5. assumptions made;
6. unresolved decisions;
7. tests/checks run;
8. commands and results;
9. screenshots or captured states where available;
10. anything not verified.

Do not silently invent missing game-design decisions.

---

## 26. Visual reference handling

When screenshots or mockups are provided, interpret them as follows.

### Current implementation screenshots

Use as:

- evidence of current behavior;
- evidence of hierarchy problems;
- evidence of mobile failure;
- evidence of interaction/cursor issues.

Do not treat as target art direction.

### Earlier ornate black/gold mockup

Use only for:

- material coherence;
- financial scale;
- typographic confidence;
- feeling that enterprises are valuable objects.

Do not copy:

- antique/private-bank styling;
- laurel/column motifs;
- secret-society tone;
- RPG-like bronze controls.

### Earlier “Sovereign Research Terminal” mockup

Use only for:

- compositional hierarchy;
- compact identity;
- dominant Valuation;
- stable production field;
- disciplined context area.

Do not copy:

- command-terminal styling;
- tactical/defense-tech cues;
- occult geometry;
- sovereign mystique cosplay.

### Earlier purple/blue tycoon mockup

Use only for:

- game-action legibility;
- clear automation state;
- obvious purchase actions;
- milestone visibility;
- strong selected state.

Do not copy:

- purple/cyan/lime palette;
- sci-fi borders;
- crypto-game styling;
- glowing status lights;
- cyber-luxury treatment.

---

## 27. Decision summary

For this task, treat the following as settled:

- progressive reveal is a core UX rule;
- only relevant Hustles plus one next horizon appear early;
- explicit manual-action controls are required;
- icon may remain a secondary manual-action target;
- row body selects/opens context;
- expansion is a separate action;
- unavailable actions do not use the red prohibited cursor;
- wide desktop uses pinned selected context when useful;
- medium uses overlay drawer;
- mobile uses bottom sheet;
- selected context never stacks after the full Hustle list;
- manual action is primary before automation;
- expansion becomes primary after automation;
- visible intensity percentage is removed;
- Enterprise Stage presentation is removed from normal early play;
- fake selected-Hustle analytics are removed;
- current Founder Core placement is removed;
- final global evolution artifact remains unresolved;
- Leverage and Rug Pull navigation reveal only when semantically meaningful;
- no final art-direction pass is included here.

Treat the following as provisional:

- exact breakpoint values;
- exact next-horizon affordability treatment;
- exact Leverage reveal prerequisites;
- exact Rug Pull/Net Worth reveal condition;
- exact global artifact visual;
- exact cycle trace styling;
- exact row dimensions;
- exact pinned-context width;
- exact animation timings.

Flag conflicts rather than silently resolving them.

---

## 28. Final implementation principle

The target is not a prettier dashboard.

The target is:

> **a tycoon interface that begins simple, becomes operational, and gains structure only when the player has earned the need for it.**

At every moment, the player should see slightly less than the full game—but exactly enough to understand the next interesting thing.

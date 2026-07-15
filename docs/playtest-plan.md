# GriftOS Playtest Plan

## Objective

Evaluate whether the modernized GriftOS loop is legible, satisfying, and progressively revealed at the right moments.

Working progression:

```text
manual action
-> scale expansion
-> automation
-> multi-Hustle portfolio
-> milestones
-> Leverage when structurally meaningful
-> Rug Pull / Net Worth when extraction becomes meaningful
```

The playtest should evaluate not only whether mechanics work, but whether the player sees each concept **when they have developed a reason to understand it**.

Use `/experimental/grift-os` for ordinary play and `/experimental/grift-os?playtest=1` for local-only logging and debug controls.

## Setup

1. Open `/experimental/grift-os?playtest=1`.
2. Use `Start Fresh Session`.
3. Verify audio is muted or configured as desired.
4. Run the selected strategy.
5. Export JSON and copy summary.
6. Add subjective notes separately.
7. When testing responsive behavior, repeat key interactions at:
   - genuinely wide desktop;
   - medium width;
   - approximately 390px mobile.

The logger remains local-only. It does not send analytics, create accounts, or collect personal data.

## Primary Questions

1. Does the player understand the first manual action without prior explanation?
2. Is the manual action visibly discoverable without knowing that the Hustle icon is clickable?
3. Does `Online Rage Farm / Followers / Add Followers / Post a Product Link / Auto-Poster` clearly separate durable scale from the transaction?
4. Does the first expansion at about 30 seconds feel earned or slow?
5. Does the next-Hustle horizon create anticipation, confusion, or indifference?
6. Does Hustle 2 arrive at a satisfying time?
7. Does automation reveal at the right moment?
8. Does automation feel like relief?
9. After automation, does the Hustle visibly feel self-running even without relying on a badge?
10. Does the shift from manual-action-primary to expansion-primary feel natural?
11. Do milestone hints appear at a moment when the player understands why they matter?
12. Do milestone hints make scale expansion more meaningful?
13. When selected-Hustle context first becomes useful, does it feel informative rather than intrusive?
14. Does the context surface preserve enough comedy and flavor without overloading the Hustle rows?
15. On wide desktop, is pinned selected context useful enough to justify its space?
16. At medium width, does the overlay drawer preserve the ledger better than a permanent side column?
17. At mobile width, can the player inspect a Hustle without losing their place in the ledger?
18. Does selected context ever become buried, disconnected from the selected row, or awkward to dismiss?
19. Does Leverage appear at a moment when the player understands why another mode exists?
20. If Leverage appears, is there a real structural reason to open it?
21. Does Rug Pull enter awareness early enough to motivate continued play but late enough to feel discovered?
22. Does Net Worth become understandable when it appears?
23. Which reveal feels premature?
24. Which reveal feels late?
25. Does the global evolution artifact, if shown, feel meaningful, decorative, or confusing?
26. Does the interface feel native in both site light and dark mode?
27. Are the generated audio debug tones helpful, annoying, or irrelevant?
28. Does the compact playtest menu stay out of the way?
29. Does the absence of the permanent ticker improve focus?
30. Where does the run become boring or confusing?
31. What did the player expect to happen next?

## Reveal-Specific Observations

For each major reveal, record:

- trigger that caused it;
- whether the player noticed it;
- whether the player understood why it appeared;
- whether it created a new goal;
- whether it felt premature;
- whether it felt late;
- whether it added clutter.

Evaluate at minimum:

### First manual action

Did the player immediately know what to do?

### Next-Hustle horizon

Did the next enterprise feel like an approaching opportunity rather than a dead locked row?

### First automation opportunity

Did the automator become visible while it was a credible goal?

### First automation purchase

Did the screen communicate:

```text
labor became infrastructure
```

without explanation?

### Multiple Hustles / selected context

Did persistent or on-demand context appear only after it became useful?

### First milestone

Did the threshold concept reveal when the player could understand it?

### Leverage

Did navigation appear because a real structural interaction existed?

### Rug Pull / Net Worth

Did extraction enter awareness at a meaningful point?

## Strategy Runs

### Natural

Play intuitively. Buy whatever seems attractive.

### Automation Rush

Prioritize automation as soon as it becomes affordable.

### Expansion First

Buy scale before automation when possible.

### Next Hustle Rush

Save for new Hustles before optimizing old ones.

### Milestone Rush

Try to reach visible scale thresholds.

### Rug Pull Greedy

Push the run until Rug Pull feels desirable or clearly unreachable.

## Metrics To Compare

The playtest summary derives:

- time to first payout;
- time to first expansion;
- manual actions before first expansion;
- time to Hustle 2;
- time to first automation;
- manual actions before first automation;
- time to first milestone;
- time to Hustle 3;
- time to Hustle 4;
- time Rug Pull becomes available;
- time Rug Pull is used;
- Net Worth gain;
- Buy Max uses;
- final scale counts;
- automation states;
- longest interval without player input.

Where implementation supports it, also record:

- time next-Hustle horizon first appears;
- time automation affordance first appears;
- time selected context first becomes available/useful;
- time Leverage navigation appears;
- time Rug Pull navigation appears;
- time Net Worth first appears;
- time global evolution artifact first appears;
- semantic reason for each reveal.

Do not add analytics solely to satisfy this plan if the implementation does not already support them cleanly.

## Manual Notes

Record:

- first confusing moment;
- first satisfying moment;
- first boring moment;
- first moment the player felt the machine was running itself;
- whether Hustle grammar works;
- whether the ledger is scan-friendly;
- whether explicit manual actions are obvious;
- whether the next-Hustle horizon creates anticipation;
- whether selected context carries the right detail;
- whether selected context contains enough comedy;
- whether context is too large on wide desktop;
- whether the medium drawer feels natural;
- whether the mobile bottom sheet feels natural;
- whether any control looks clickable when it is not;
- whether any unavailable action feels visually broken or punitive;
- whether Leverage appears too early or too late;
- whether Rug Pull appears too early or too late;
- whether Net Worth feels clear when first revealed;
- whether the global evolution artifact earns its presence;
- whether audio should stay debug-only for now;
- whether light mode feels like a real design, not an inverted dark app;
- what the player wanted next.

## Responsive Validation

### Genuinely wide desktop

Check:

- Hustle ledger remains dominant;
- pinned selected context is useful;
- context does not invent filler;
- row scanning remains fast;
- no unnecessary empty inspector appears in the earliest one-Hustle state.

### Medium width

Check:

- ledger remains full-width at rest;
- selected context opens as an overlay drawer;
- drawer does not permanently crush the ledger;
- open/close behavior is clear;
- selection remains visible.

### Approximately 390px mobile

Check:

- first playable Hustle appears quickly;
- selected context opens as a bottom sheet;
- selected context never falls beneath the full Hustle list;
- no horizontal scrolling is required for normal play;
- manual action and expansion targets are touch-safe;
- opening and closing context does not lose the player's place.

## Current Balance Note

The revised campaign is designed for roughly a week to ten days of morning/evening intermittent play rather than a single continuous sitting. The current natural prepared simulator reaches the target in about 8.62 days for morning/evening returns; Subscriber Towns is acquired around 5.58 days and automated around 7.10 days before the winning Rug. Four-hour and eight-hour heuristic profiles currently finish around 11.37 and 5.78 days. The one-hour natural heuristic remains slower than the intended envelope and needs strategy-model investigation before another tuning pass.

Do not treat the simulator as final balance doctrine. If human play confirms Rug Pull feels too distant or too frequent, choose one explicit tuning path:

- lower the prototype threshold;
- increase mid/late Hustle output;
- reduce mid/late acquisition costs;
- make milestone rewards stronger;
- test the explicit Net-Worth-reinvestment Leverage strategy.

Do not silently change all of them at once.

The UX reset should first make the reveal architecture capable of accepting a future semantic Rug Pull condition without inventing a fake percentage or silently rebalancing the economy.

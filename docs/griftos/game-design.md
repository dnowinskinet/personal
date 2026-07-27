# GriftOS Game Design

GriftOS is a browser-native incremental game about a fictional composite operator building increasingly dubious Hustles into a large Valuation, then eventually using Rug Pull to convert paper success into personal Net Worth. The current Influence empire does not establish a literal Founder character.

The current public title is unresolved. `GriftOS` remains the working codename and route name.

## Product Thesis

The core loop is:

```text
perform a questionable Hustle manually
expand its durable productive scale
automate it
use Leverage and milestones to distort output
grow Valuation
Rug Pull
increase persistent Net Worth
begin again with more structural advantage
```

The player should increasingly feel that a small obnoxious action became an institutionally plausible machine.

The interface should support that progression by revealing complexity as the player earns the need for it.

## Tone

The tone should be funny, seductive, cynical, slightly sinister, self-important, and institutionally plausible.

Avoid:

- one-to-one parody of real tech leaders;
- real-person wrongdoing claims;
- generic startup joke soup;
- military cosplay;
- cyberpunk hacker fantasy;
- extra thematic currencies.

The player should not be framed as heroic.

The satire is strongest when scale, automation, legitimacy, and power feel genuinely desirable.

## Player-Facing Grammar

Player-facing systems are **Hustles**, not Generators.

Each Hustle separates:

- durable enterprise: `Online Rage Farm`;
- player-facing scale noun: `Followers`;
- expansion action: `Add Followers`;
- manual action: `Post a Product Link`;
- automation: `Auto-Poster`.

Invalid grammar:

```text
Owned: 17 Troll People Online
```

Valid grammar:

```text
Online Rage Farm
17,000 Followers
Add Followers
Post a Product Link
Auto-Poster online
```

## Current Twelve-Hustle Ladder

| # | Hustle | Scale noun | Manual action | Automation |
| ---: | --- | --- | --- | --- |
| 1 | Online Rage Farm | Followers | Post a Product Link | Auto-Poster |
| 2 | Paid Friend Club | Members | Charge a Fee | Auto-Renewal |
| 3 | Autograph Factory | Editions | Sign Memorabilia | Autopen |
| 4 | Paid Shoutout Studio | Booking Slots | Record a Shoutout | AI Double |
| 5 | Outrage Podcast | Episodes | Sell a Sponsor Spot | Ad Sales Team |
| 6 | Get-Rich Books | Titles | Publish the Method | Ghostwriter |
| 7 | Paid Endorsement Racket | Brand Deals | Endorse a Product | AI Spokesperson |
| 8 | VIP Experience Tour | Venues | Sell VIP Tickets | Hologram Headliner |
| 9 | Success University | Campuses | Enroll a Student | Admissions Office |
| 10 | MLM Ambassador Program | Branches | Charge a Sign-Up Fee | Recruiting Team |
| 11 | Debt Club | Loan Books | Collect Fees | Collections Team |
| 12 | Subscriber Towns | Towns | Charge HOA Dues | HOA Office |

This is the current working Hustle ladder. The game is under active development, and names, copy, and tuning remain subject to revision.

The full ladder should not necessarily be visible from a fresh save.

Current UX direction is to show:

- owned Hustles;
- one meaningful next-Hustle horizon early.

The escalation ladder should be discovered rather than presented immediately as twelve dead rows.

## Core UX Progression

The current reveal spine is:

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

This is a UX/product sequence, not a fixed timer schedule.

### Action

The first manual verb should be obvious and satisfying.

The Hustle icon may be an additional tactile target, but the manual action must also be explicit and discoverable.

### Expansion

The player grows durable productive scale through concrete in-world nouns.

Examples:

- Forums;
- Shows;
- Channels.

Expansion should visibly change output and cost.

### Automation

Automation changes the player's relationship to the Hustle:

```text
manual operation -> industrialized self-running system
```

Before automation:

- manual action is primary;
- expansion is secondary.

After automation:

- expansion becomes primary;
- manual action remains available but secondary.

### Portfolio

As multiple Hustles become active, the interface should support comparison and selection without forcing all comedy and detail into every row.

### Milestones

Milestone grammar should reveal when ownership thresholds become relevant.

Do not expose abstract milestone analytics before the player has learned the underlying threshold concept.

### Leverage

Leverage should represent genuine structural power, modifiers, synergies, or rule distortion.

It should appear when there is a real structural interaction or state worth opening.

Do not invent a Leverage tree or purchase system merely to fill a screen.

### Extraction

Rug Pull and Net Worth should become visible when persistent extraction becomes meaningfully understandable or forecastable.

Exact reveal timing remains unresolved and must be reconciled with current prestige pacing.

### Inheritance

After prestige, previously discovered systems should not necessarily hide again as though the player had forgotten them.

The interface may participate in meta-progression by remembering what the player has learned.

This is a product direction, not yet a fully specified implementation rule.

## Current Systems

Implemented:

- Valuation as the single in-run value;
- timed manual production;
- Hustle scale expansion;
- exponential expansion costs;
- Buy 1 and Buy Max;
- automation as automatic cycle restart;
- data-driven milestones;
- modifier engine;
- Leverage summary surface;
- purchasable run-scoped Leverage deals;
- Rug Pull forecast and commit;
- persistent Net Worth;
- timed, output-diverting neutral extraction preparation presented by Influence as `Your Take`;
- internal Enterprise Intensity and Enterprise Stage presentation derivation;
- visual progression hooks;
- semantic game events;
- SSR-safe audio runtime scaffolding;
- query-gated local playtest tools.

Important compatibility note:

- internal `Enterprise Intensity`, `Enterprise Stage`, or `EnterprisePresentation` state may remain because audio/debug code consumes it;
- visible intensity/stage UI is no longer the current player-facing progression model;
- removing internal compatibility state is a separate refactor decision.

Not implemented:

- Receipts;
- random events;
- bosses or combat;
- offline progress;
- external APIs, backend systems, or analytics;
- final soundtrack or production SFX;
- large Leverage tree;
- active skills;
- final global evolution artifact.

## Architecture

The game stays isolated under:

```text
src/app/pages/experimental/grift-os-game/
```

Important boundaries:

- `content/`: Hustle data and copy;
- `game-engine/`: pure economy, modifiers, Rug Pull, presentation derivation, balance sim, semantic event types;
- `audio/`: manifest, pure audio policy, Angular audio director service;
- `playtest/`: local-only session logging and export;
- `grift-os-game.*`: Angular shell and presentation.

## Visual Progression

The interface should accumulate power through semantic game changes rather than a player-facing intensity meter.

### Manual condition

Typical qualities:

- sparse;
- comparatively still;
- manual action dominant;
- no global evolution artifact;
- no unnecessary mode navigation.

### Automated condition

Typical qualities:

- automated Hustles visibly self-run;
- cycle motion persists locally;
- manual Hustles remain comparatively still;
- expansion becomes primary on automated Hustles;
- a primitive global evolution artifact may first appear.

### Structural condition

Typical qualities:

- multiple Hustles;
- multiple automations;
- real structural/global/cross-Hustle effects;
- greater but earned information density;
- relationship cues only where actual mechanics support them;
- global evolution artifact may visibly evolve.

These are internal design conditions, not player-facing stage labels.

Do not add:

- visible intensity percentage;
- player-facing stage meter;
- generic glow escalation as the primary progression model;
- fake analytics to explain the transformation.

### Global evolution artifact

The project preserves the hypothesis that a memorable global evolving object could give progression a body, similar to central evolving objects in successful incremental games.

Current direction:

- global, not owned by the selected Hustle;
- absent early if it has no semantic job yet;
- may reveal after first automation;
- may evolve through discrete semantic states;
- final name, form, meaning, and interaction remain unresolved.

The existing Founder Core placement inside selected-Hustle context is superseded.

## Progressive Disclosure

The opening should not expose the full application architecture.

Early play should generally show:

- compact identity;
- Valuation;
- Average Rate;
- first Hustle;
- explicit manual action;
- expansion;
- one next-Hustle horizon when relevant.

Systems such as:

- automation detail;
- milestones;
- Leverage;
- Rug Pull;
- Net Worth;
- global evolution artifact;

should reveal when semantically meaningful.

Do not use arbitrary elapsed-time gates when real game-state conditions exist.

## Decision Gates

Next human playtests should help decide:

- whether the first manual action is immediately legible;
- whether the next-Hustle horizon creates useful anticipation;
- whether automation reveals at the right moment;
- whether automated Hustles visibly feel self-running;
- whether the post-automation action hierarchy feels natural;
- whether selected-Hustle context carries enough comedy without overwhelming the ledger;
- whether responsive pinned/drawer/sheet context works across widths;
- exact Leverage reveal prerequisite;
- exact Rug Pull / Net Worth reveal condition;
- economy balance;
- stronger milestone rewards;
- a small Leverage purchase proof;
- active input;
- Rug Pull tuning;
- final global evolution artifact direction;
- visual/audio polish.

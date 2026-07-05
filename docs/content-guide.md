# GriftOS Content Guide

## Tone

Write GriftOS as:

- sharp;
- cynical;
- specific;
- seductive;
- grandiose;
- slightly sinister;
- absurdly self-important.

Avoid:

- generic corporate jokes;
- real-person parody tells;
- political lecturing;
- long lore dumps;
- fantasy, combat, loot, or boss language.

## Fictional Composite Guardrail

The Founder is fictional and composite.

Do not:

- name real tech leaders as characters;
- mimic a real person's face, voice, or distinctive biography;
- reproduce distinctive real quotes;
- imply factual wrongdoing by a real person.

## Hustle Grammar

Every Hustle must separate:

- durable enterprise;
- expansion unit;
- manual action;
- automation.

Example:

```text
Hustle: Troll Network
Expansion unit: Forums
Manual action: Troll People Online
Automation: Bots
```

Do not write:

```text
Owned 17 Troll People Online
```

Write:

```text
17 Forums
Add Forum
Troll People Online
Bots online
```

## Naming Rules

Use:

- Hustle;
- Valuation;
- Average Rate;
- Pays Every;
- Net Worth;
- Rug Pull;
- Leverage.

Avoid in player-facing UI:

- Generator;
- Paper Valuation;
- Owned;
- Next;
- Next At;
- Cycle Rate;
- Cycle Time.

## Current Content Files

Current source of truth:

```text
src/app/pages/experimental/grift-os-game/content/game-copy.ts
src/app/pages/experimental/grift-os-game/content/hustle-definitions.ts
```

`generator-definitions.ts` is only a temporary compatibility export and should not receive new content.

## Automation Copy

Automation should be the industrialized version of the manual action.

Current examples:

```text
Troll People Online -> Bots
Record an Episode -> Clip Farm
Pick a Fight -> Outrage Engine
Sell a Masterclass -> Funnel Stack
Publish a Manifesto -> Ghostwriting Collective
Host a Retreat -> Social Graph Concierge
Demo the Future -> Synthetic Demo Team
Place a Bet -> Associate Swarm
Acquire an Outlet -> Editorial Independence
Expand the Stack -> Aligned Population
```

Avoid generic labels such as Manager or Assistant unless the genericness itself carries the joke.

## Density Rule

Visual action first. Short joke second. Explanation last.

Prefer:

- 2-8 word labels;
- one-line descriptions;
- compact status copy;
- concise tooltips.

Avoid:

- tutorials embedded into the layout;
- walls of explanatory text;
- permanent payout narration.

## Audio/Event Copy

Semantic events describe facts:

```text
hustle.automationActivated
rugPull.committed
```

Do not create event names such as:

```text
playBigSound
flashPurple
shakeRow
```

Presentation systems should interpret game facts independently.

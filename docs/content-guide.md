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
Hustle: Creator Account
Expansion unit: Accounts
Manual action: Post an Affiliate Link
Automation: Link-in-Bio Router
```

Do not write:

```text
Owned 17 Troll People Online
```

Write:

```text
17 Accounts
Add Account
Post an Affiliate Link
Link-in-Bio Router online
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
Post an Affiliate Link -> Link-in-Bio Router
Sell a Subscription -> Membership Platform
Launch a Merch Drop -> Fulfillment Partner
Sell a Sponsor Read -> Ad Sales Desk
Sell VIP Access -> Booking Agency
Advance a Member -> Advancement Council
Declare an Emergency -> Crisis Calendar
Open a Presale -> Token Operations Desk
Sell a Network Campaign -> Brand Partnerships Office
Auction Ad Inventory -> Programmatic Exchange
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

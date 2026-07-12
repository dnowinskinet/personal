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

Expansion units must match the scale of their economic slot. A late-Hustle unit is an institution or territory, not a single customer or worker.

Example:

```text
Hustle: Social Media Account
Expansion unit: Followers
Manual action: Post an Affiliate Link
Automation: Auto-Poster
```

Do not write:

```text
Owned 17 Troll People Online
```

Write:

```text
17 Followers
Add Follower
Post an Affiliate Link
Auto-Poster online
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
The automated ledger status uses `Automation name · activity label`; activity labels stay in Hustle content data.

Current examples:

```text
Post an Affiliate Link -> Auto-Poster -> posting links
Charge a Fee -> Auto-Renewal -> renewing memberships
Sell Merch -> Fulfillment Partner -> processing orders
Sell a Sponsor Spot -> Ad Sales Team -> booking sponsors
Sell VIP Access -> Ticketing Site -> selling access
Enroll a Student -> Admissions Office -> enrolling students
Charge a Sign-Up Fee -> Recruiting Team -> signing up ambassadors
Charge Fees -> Collections Team -> charging fees
Sell a Coaching Session -> Booking Team -> booking sessions
Charge HOA Fees -> HOA Office -> collecting HOA fees
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

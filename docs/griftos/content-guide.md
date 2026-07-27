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

The Influence target and any implied operator are fictional composites. The game does not currently establish a literal Founder character.

Do not:

- name real tech leaders as characters;
- mimic a real person's face, voice, or distinctive biography;
- reproduce distinctive real quotes;
- imply factual wrongdoing by a real person.

## Hustle Grammar

Every Hustle must separate:

- durable enterprise;
- player-facing scale noun;
- manual action;
- automation.

Scale nouns must match the durable capacity represented by their economic slot. A late-Hustle scale count is an institution, portfolio, or territory, not the individual transaction completed by the manual action.

Example:

```text
Hustle: Online Rage Farm
Scale noun: Followers
Expansion action: Add Followers
Manual action: Post a Product Link
Automation: Auto-Poster
```

Do not write:

```text
Owned 17 Troll People Online
```

Write:

```text
17,000 Followers
Add Followers
Post a Product Link
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
src/app/pages/experimental/grift-os-game/empires/influence/content/influence-content.ts
src/app/pages/experimental/grift-os-game/content/hustle-definitions.ts
```

`generator-definitions.ts` is only a temporary compatibility export and should not receive new content.

## Automation Copy

Automation should be the industrialized version of the manual action.
The automated ledger status uses `Automation name · activity label`; activity labels stay in Hustle content data.

Current examples:

```text
Post a Product Link -> Auto-Poster -> posting links
Charge a Fee -> Auto-Renewal -> renewing memberships
Sign Memorabilia -> Autopen -> signing memorabilia
Record a Shoutout -> AI Double -> generating shoutouts
Sell a Sponsor Spot -> Ad Sales Team -> booking sponsors
Publish the Method -> Ghostwriter -> publishing under your name
Endorse a Product -> AI Spokesperson -> endorsing products
Sell VIP Tickets -> Hologram Headliner -> headlining without you
Enroll a Student -> Admissions Office -> enrolling students
Charge a Sign-Up Fee -> Recruiting Team -> recruiting ambassadors
Collect Fees -> Collections Team -> collecting fees
Charge HOA Dues -> HOA Office -> collecting HOA dues
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

# GriftOS Economy

This document records the current economy implementation and the balance decisions behind it. The constants are simulation-backed hypotheses, not final doctrine. The editable Hustle-ladder source of truth is `src/app/pages/experimental/grift-os-game/economic-slots/economic-slot-catalog.ts`; `content/economy-tuning.ts` remains the compatibility and content-enrichment adapter for current consumers.

## Value Model

`Valuation` is the spendable operating value for Hustle scale, automation, and extraction preparation. `Net Worth` is persistent personal wealth and is spendable only on temporary, empire-specific Leverage. Average Rate is a display metric, not a currency.

The state also records nondecreasing `peakNetWorth`. Current Net Worth remains visible, affects Wealth Advantage, and counts toward the `$1T` objective. Peak Net Worth selects campaign strata, progression unlocks, and Rug Pull targets so a Leverage purchase cannot move the player backward or relock progress.

The opening Online Rage Farm intentionally earns fractions of a cent. Values remain JavaScript `number`s; the formatter preserves sub-cent values until they become too small to display meaningfully.

## Hustle Ladder

The twelve semantic IDs and authored Influence catalog are the current game. Owned `scaleCount` means durable productive scale; the manual action is the recurring transaction performed across that scale. Names and copy are empire-specific while economic slots and formulas remain shared.

| # | Hustle | Unit | Manual action | Automation |
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

Every Hustle has a data-driven acquisition cost, geometric scale growth rate, per-scale payout, cadence, automation cost, unlock Net Worth, and milestone list. Online Rage Farm uses presentation metadata to display one underlying scale count as 1,000 Followers; its economy remains ordinary shared-slot behavior.

## Production Rules

Manual production starts one cycle and returns to ready after the payout. Automated production restarts continuously and carries leftover elapsed time across cycle boundaries. The engine advances from elapsed time rather than assuming a fixed render tick.

Average Rate is:

```text
averageRate = effectivePayout / effectiveCadenceSeconds
```

Base payout is:

```text
basePayout = basePayoutPerCyclePerScale * scaleCount
```

The output multiplier is a product of additive scope buckets:

```text
effectivePayout = basePayout
  * localOutputBucket
  * globalOutputBucket
  * synergyOutputBucket
  * temporaryOutputBucket
  * metaOutputBucket

bucket = 1 + sum(active bonuses in that scope)
```

Cadence modifiers divide the base cadence. Cadence is clamped to a minimum of `0.25s`, and speed buckets are floored at `0.10`. Cost and automation-cost discount buckets are floored at `0.05`.

## Expansion Costs

For acquisition cost `A`, growth rate `g`, and `s` owned scale:

```text
nextScaleCost = A * g^s / combinedCostMultiplier
```

Buying `q` scale increments uses the exact geometric sum:

```text
cost(q) = nextScaleCost * ((g^q - 1) / (g - 1))
```

When `g = 1`, the engine uses `nextScaleCost * q`. Buy Max estimates the affordable quantity with the inverse logarithm and then corrects it with exact cost checks, so it never intentionally overspends.

## Milestones

Milestones are Hustle-specific and data-driven. They can improve output, cadence, expansion cost, or automation cost. They are additive inside their scope bucket, then multiply with other buckets. For example, a Hustle with local output bonuses of `+2` and `+7` has a `10x` local output bucket, not `3x * 8x`.

The current milestone sets contain four milestones per Hustle, with thresholds ranging from 2 to 100 scale count. The later giant-multiplier, cross-Hustle, and old-Hustle resurgence layer is deferred; the current milestones keep the plumbing measurable without pretending to solve that later design.

## Automation

Automation is a one-time Valuation purchase for an owned Hustle. It changes restart behavior from manual to continuous. It is not a separate currency and does not grant an implicit output multiplier. Leverage may reduce automation costs where its definition says so.

## Leverage

Leverage is a run-scoped, Influence-owned purchase layer. A deal must meet peak-Net-Worth, ownership, and automation prerequisites, then sacrifices current Net Worth. Spent wealth is permanently gone; the deal applies its declared temporary modifier and clears on Rug Pull or empire replacement. The current catalog and magnitudes are scaffolding, not final content.

Current deals are:

| Deal | Cost | Role |
| --- | ---: | --- |
| Cross-Promotion Compact | $250K Net Worth | Doubles the early creator portfolio |
| Direct Audience Ledger | $2M Net Worth | Doubles selected direct-audience output and discounts expansion |
| Crisis Conversion Desk | $25M Net Worth | Doubles selected commercial output and halves automation costs |
| Network Ad Exchange | $250M Net Worth | Doubles selected institutional output and speeds selected Hustles |
| Controlling Interest | $2.5B Net Worth | Triples late output and discounts expansion |

The simulator buys these only under the explicit `leverage-reinvestment` strategy. Ordinary strategies never sacrifice persistent currency merely because a deal is affordable.

## Provisional Tuning Baseline

| # | Hustle | Acquisition | Growth | Payout | Cadence | Automation cost | Unlock Net Worth |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | Online Rage Farm | $0.025 | 1.18 | $0.0025 | 2s | $0.50 | $0 |
| 2 | Paid Friend Club | $0.40 | 1.19 | $0.096 | 4s | $3 | $0 |
| 3 | Autograph Factory | $6 | 1.20 | $0.936 | 6s | $36 | $0 |
| 4 | Paid Shoutout Studio | $90 | 1.21 | $10.20 | 10s | $540 | $0 |
| 5 | Outrage Podcast | $2,700 | 1.22 | $184.50 | 15s | $16,200 | $0 |
| 6 | Get-Rich Books | $40,000 | 1.23 | $1,908 | 24s | $240,000 | $1M |
| 7 | Paid Endorsement Racket | $600,000 | 1.24 | $18,576 | 36s | $3.6M | $1M |
| 8 | VIP Experience Tour | $9M | 1.25 | $167,700 | 50s | $54M | $30M |
| 9 | Success University | $270M | 1.27 | $3,018,600 | 75s | $1.35B | $30M |
| 10 | MLM Ambassador Program | $4B | 1.29 | $26.16M | 100s | $20B | $1B |
| 11 | Debt Club | $80B | 1.32 | $292.992M | 140s | $240B | $30B |
| 12 | Subscriber Towns | $2T | 1.36 | $3.76704B | 180s | $6T | $30B |

These values are deliberately provisional. The first run uses microscopic output, while later Hustles bridge recognizable transaction scales to the prestige campaign without requiring quintillion-scale pre-victory Valuation.

## Rug Pull and Extraction

Each Net Worth stratum has a target peak and reward shaping:

| Stratum | Minimum Net Worth | Rug target |
| --- | ---: | ---: |
| Creator economy | $0 | $100M |
| Direct audience economy | $1M | $3B |
| Influence economy | $30M | $100B |
| Network economy | $1B | $3T |
| Platform economy | $30B | $100T |
| Post-victory economy | $1T | $1Q |

The current projected Net Worth gain is:

```text
gain = rugTarget
  * extractionRate
  * rewardShaping
  * (peakValuation / rugTarget)^0.75
```

The gain is available only after the current stratum target is reached. Base extraction share is `10%` and is increased by completed preparation stages. Influence labels that share `Your Take`.

Extraction preparation is a timed, run-scoped commitment rather than a last-second button:

| Stage | Cost | Duration | Final take bonus | Output retained while preparing |
| --- | ---: | ---: | ---: | ---: |
| Retain the Rights | 3% of current Rug target | 2h | +5 percentage points | 75% |
| Lock the Cap Table | 7% of current Rug target | 6h | +5 percentage points | 60% |

Starting a stage spends Valuation immediately and diverts production while it runs. Completed stages reset on Rug Pull. A player can choose to make the empire larger or spend time and output preparing to capture more of it personally.

## Net Worth Acceleration

The full wealth bonus is:

```text
wealthBonus = 4 * (NetWorth / $1M)^0.3
wealthMultiplier = 1 + wealthBonus
```

The bonus is attenuated by Hustle frontier distance:

- current frontier Hustles receive `5%` of the full bonus;
- the immediately prior stratum receives `25%`;
- older Hustles receive the full bonus.

This keeps rebuilt early content fast while preserving difficulty for newly revealed content.

## Simulation Targets

The campaign simulator is `src/app/pages/experimental/grift-os-game/game-engine/balance-sim.ts`, exposed through `npm run game:balance`. It models fractional-cent opening progress, active sessions, capped idle returns, purchases, milestones, explicit-strategy Leverage, extraction preparation, multiple Rug strategies, recovery, and post-victory scaling.

Using the current natural strategy with one prepared extraction stage:

| Profile | Time to campaign target |
| --- | ---: |
| Hourly returns | More than 14 days in the current natural-purchase heuristic |
| Four-hour returns | 11.37 days |
| Eight-hour returns | 5.78 days |
| Morning/evening returns | 8.62 days |

The morning/evening path acquires Subscriber Towns at about 5.58 days and automates it at about 7.10 days before victory at 8.62 days. The explicit `leverage-reinvestment` version reaches victory in about 6.59 days. The hourly heuristic's slower result is under review as a purchase-strategy artifact rather than a target for broader multipliers. Post-victory simulation remains intentionally uncapped.

The eight-hour offline credit remains capped at eight hours. Offline progress is a local playtest feature, not a new currency or backend system.

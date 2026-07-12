# GriftOS Economy

This document records the current economy implementation and the balance decisions behind it. The constants are simulation-backed hypotheses, not final doctrine. The editable source of truth is `src/app/pages/experimental/grift-os-game/content/economy-tuning.ts`.

## Value Model

`Valuation` is the only spendable in-run value. `Net Worth` is persistent prestige value and is not spendable during the current run. Average Rate is a display metric, not a currency.

The opening Social Media Account intentionally earns fractions of a cent. Values remain JavaScript `number`s; the formatter preserves sub-cent values until they become too small to display meaningfully.

## Hustle Ladder

The internal IDs remain the original prototype IDs so existing local saves can be reconciled. This is the actual current game, not an alternate test configuration. Names, copy, and tuning remain subject to revision as development continues. Player-facing content follows the attention-to-power career arc:

| # | Hustle | Unit | Manual action | Automation |
| ---: | --- | --- | --- | --- |
| 1 | Social Media Account | Followers | Post an Affiliate Link | Auto-Poster |
| 2 | Paid Fan Club | Members | Charge a Fee | Auto-Renewal |
| 3 | Merch Store | Products | Sell Merch | Fulfillment Partner |
| 4 | Podcast | Episodes | Sell a Sponsor Spot | Ad Sales Team |
| 5 | VIP Events | Cities | Sell VIP Access | Ticketing Site |
| 6 | Success University | Campuses | Enroll a Student | Admissions Office |
| 7 | Brand Ambassador Program | Branches | Charge a Sign-Up Fee | Recruiting Team |
| 8 | Coaching Company | Regions | Sell a Coaching Session | Booking Team |
| 9 | Member Bank | Banks | Charge Fees | Collections Team |
| 10 | Private Community | Towns | Charge HOA Fees | HOA Office |

Every Hustle has a data-driven acquisition cost, geometric unit growth rate, per-unit payout, cadence, automation cost, unlock Net Worth, and milestone list.

## Production Rules

Manual production starts one cycle and returns to ready after the payout. Automated production restarts continuously and carries leftover elapsed time across cycle boundaries. The engine advances from elapsed time rather than assuming a fixed render tick.

Average Rate is:

```text
averageRate = effectivePayout / effectiveCadenceSeconds
```

Base payout is:

```text
basePayout = basePayoutPerCyclePerUnit * ownedUnits
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

For acquisition cost `A`, growth rate `g`, and `u` owned units:

```text
nextUnitCost = A * g^u / combinedCostMultiplier
```

Buying `q` units uses the exact geometric sum:

```text
cost(q) = nextUnitCost * ((g^q - 1) / (g - 1))
```

When `g = 1`, the engine uses `nextUnitCost * q`. Buy Max estimates the affordable quantity with the inverse logarithm and then corrects it with exact cost checks, so it never intentionally overspends.

## Milestones

Milestones are Hustle-specific and data-driven. They can improve output, cadence, expansion cost, or automation cost. They are additive inside their scope bucket, then multiply with other buckets. For example, a Hustle with local output bonuses of `+2` and `+7` has a `10x` local output bucket, not `3x * 8x`.

The current milestone sets contain four milestones per Hustle, with thresholds ranging from 2 to 100 units. The later milestones are intentionally lumpy: they are investment decisions, not a smooth global level curve.

## Automation

Automation is a one-time Valuation purchase for an owned Hustle. It changes restart behavior from manual to continuous. It is not a separate currency and does not grant an implicit output multiplier. Leverage may reduce automation costs where its definition says so.

## Leverage

Leverage is a run-scoped purchase layer. A deal must meet its Net Worth, ownership, automation, and Valuation requirements before it can be bought. A purchased deal applies its declared output, cadence, or cost modifier and resets on Rug Pull.

Current deals are:

| Deal | Cost | Role |
| --- | ---: | --- |
| Cross-Promotion Compact | $25M | Doubles the early creator portfolio |
| Direct Audience Ledger | $750M | Doubles direct-audience output and discounts expansion |
| Crisis Conversion Desk | $25B | Doubles belief-conversion output and halves automation costs |
| Network Ad Exchange | $750B | Doubles network inventory and speeds selected network Hustles |
| Controlling Interest | $25T | Triples owned attention-market output and discounts expansion |

These are intended to compete with unit purchases, milestones, new Hustles, automation, saving for the next stratum, and Founder Take preparation. They are not mandatory toll booths by rule; the simulator tests their opportunity cost.

## Provisional Tuning Baseline

| # | Hustle | Acquisition | Growth | Payout | Cadence | Automation cost | Unlock Net Worth |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | Social Media Account | $0.025 | 1.18 | $0.0025 | 2s | $0.50 | $0 |
| 2 | Paid Fan Club | $2 | 1.20 | $0.20 | 5s | $12 | $0 |
| 3 | Merch Store | $50 | 1.22 | $8 | 10s | $300 | $0 |
| 4 | Podcast | $1,500 | 1.24 | $250 | 20s | $9,000 | $0 |
| 5 | VIP Events | $50,000 | 1.26 | $8,000 | 30s | $300,000 | $0 |
| 6 | Success University | $2M | 1.28 | $120,000 | 45s | $12M | $1M |
| 7 | Brand Ambassador Program | $75M | 1.30 | $600,000 | 60s | $450M | $30M |
| 8 | Coaching Company | $3B | 1.32 | $30M | 90s | $18B | $1B |
| 9 | Member Bank | $100B | 1.34 | $200M | 120s | $500B | $30B |
| 10 | Private Community | $2T | 1.36 | $2B | 180s | $6T | $30B |

These values are deliberately provisional. The first run uses microscopic output, while later Hustles bridge recognizable transaction scales to the prestige campaign without requiring quintillion-scale pre-victory Valuation.

## Rug Pull and Founder Take

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
  * founderTakeRate
  * rewardShaping
  * (peakValuation / rugTarget)^0.75
```

The gain is available only after the current stratum target is reached. Base Founder Take is `10%` and is increased by completed preparation stages.

Founder Take is a timed, run-scoped commitment rather than a last-second button:

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

The campaign simulator is `src/app/pages/experimental/grift-os-game/game-engine/balance-sim.ts`, exposed through `npm run game:balance`. It models fractional-cent opening progress, active sessions, capped idle returns, purchases, milestones, Leverage, Founder Take, multiple Rug strategies, recovery, and post-victory scaling.

Using the current natural strategy with one prepared Founder Take stage:

| Profile | Time to campaign target |
| --- | ---: |
| Hourly returns | 9.1 days |
| Four-hour returns | 10.3 days |
| Eight-hour returns | 6.8 days |
| Morning/evening returns | 10.1 days |

An eight-hour profile with the immediate strategy reaches successive strata faster but extracts less per Rug. The deep strategy takes fewer, larger Rugs and delays extraction for two Founder Take stages. Post-victory simulation is intentionally uncapped; the curated pre-victory envelope is approximately below `$1Q` under the tested campaign paths.

The eight-hour offline credit remains capped at eight hours. Offline progress is a local playtest feature, not a new currency or backend system.

# GriftOS Economy Tuning Brief

This is the copy-friendly handoff for revising GriftOS economy constants. A Hustle-ladder tuning proposal should edit the inputs in `src/app/pages/experimental/grift-os-game/economic-slots/economic-slot-catalog.ts`, run the balance simulator, and return the changed block plus the intended player experience. `content/economy-tuning.ts` is a compatibility adapter, not the editable numeric authority. Do not change formulas accidentally while changing numbers.

## Rules That Should Stay Stable During A Tuning Pass

- `Valuation` funds Hustle scale, automation, and extraction preparation.
- Current `Net Worth` is persistent personal wealth and may be sacrificed only for temporary empire-specific Leverage.
- Peak Net Worth never decreases and selects strata, unlocks, and Rug Pull targets.
- The first Hustle earns fractions of a cent.
- Manual Hustles run one cycle and return to ready.
- Automated Hustles run continuously and preserve elapsed-time remainder.
- Scale payout is linear in owned scale before modifiers.
- Scale cost is geometric in owned scale.
- Milestones add within scope buckets; scope buckets multiply.
- Leverage and extraction preparation are run-scoped and reset on Rug Pull.
- Offline credit remains capped at eight hours.
- Post-victory Valuation is not hard-capped.

## Formula Sheet

```text
nextScaleCost = acquisitionCost * growthRate^scaleCount / costMultiplier

cost(quantity) = nextScaleCost * ((growthRate^quantity - 1) / (growthRate - 1))

basePayout = payoutPerCyclePerScale * scaleCount

effectivePayout = basePayout
  * localOutputBucket
  * globalOutputBucket
  * synergyOutputBucket
  * temporaryOutputBucket
  * metaOutputBucket

bucket = 1 + sum(additive bonuses in that scope)

effectiveCadence = baseCadence / localSpeedBucket / globalSpeedBucket

Rug gain = rugTarget * extractionRate * rewardShaping
  * (peakValuation / rugTarget)^0.75

wealthBonus = 4 * (NetWorth / $1M)^0.3
```

The engine clamps cadence, speed, cost, and automation-cost multipliers to stable positive floors. Buy Max uses an inverse estimate followed by exact geometric cost checks.

## Current Tunable Inputs

```yaml
campaign_strata:
  - id: attention
    label: Creator economy
    minimum_net_worth: 0
    rug_pull_target: 100000000
    reward_shaping: 0.10
  - id: doctrine
    label: Direct audience economy
    minimum_net_worth: 1000000
    rug_pull_target: 3000000000
    reward_shaping: 0.10
  - id: capital
    label: Influence economy
    minimum_net_worth: 30000000
    rug_pull_target: 100000000000
    reward_shaping: 0.10
  - id: institutional
    label: Network economy
    minimum_net_worth: 1000000000
    rug_pull_target: 3000000000000
    reward_shaping: 0.10
  - id: sovereignty
    label: Platform economy
    minimum_net_worth: 30000000000
    rug_pull_target: 100000000000000
    reward_shaping: 0.10
  - id: postgame
    label: Post-victory economy
    minimum_net_worth: 1000000000000
    rug_pull_target: 1000000000000000
    reward_shaping: 0.10

prestige:
  net_worth_gain_exponent: 0.75
  wealth_advantage_base: 1000000
  wealth_advantage_coefficient: 4.0
  wealth_advantage_exponent: 0.3
  frontier_wealth_factor: 0.05
  prior_stratum_wealth_factor: 0.25
  campaign_target_net_worth: 1000000000000
  curated_valuation_envelope: 1000000000000000

extraction:
  base_take: 0.10
  stages:
    - id: retained-rights
      cost_target_ratio: 0.03
      duration_hours: 2
      take_bonus: 0.05
      output_retention: 0.75
    - id: locked-cap-table
      cost_target_ratio: 0.07
      duration_hours: 6
      take_bonus: 0.05
      output_retention: 0.60
```

## Hustle Inputs

The twelve semantic IDs and empire-authored names below are current. Existing ten-ID v2/v1 run records are incompatible and reset only the current run during v3 migration; persistent wealth and exit history are retained.

| ID | Player-facing Hustle | Acquisition | Growth | Payout/cycle/scale | Cadence | Automation cost | Unlock Net Worth |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `online-rage-farm` | Online Rage Farm | 0.025 | 1.18 | 0.0025 | 2s | 0.50 | 0 |
| `paid-friend-club` | Paid Friend Club | 0.40 | 1.19 | 0.096 | 4s | 3 | 0 |
| `autograph-factory` | Autograph Factory | 6 | 1.20 | 0.936 | 6s | 36 | 0 |
| `paid-shoutout-studio` | Paid Shoutout Studio | 90 | 1.21 | 10.20 | 10s | 540 | 0 |
| `outrage-podcast` | Outrage Podcast | 2,700 | 1.22 | 184.50 | 15s | 16,200 | 0 |
| `get-rich-books` | Get-Rich Books | 40,000 | 1.23 | 1,908 | 24s | 240,000 | 1,000,000 |
| `paid-endorsement-racket` | Paid Endorsement Racket | 600,000 | 1.24 | 18,576 | 36s | 3,600,000 | 1,000,000 |
| `vip-experience-tour` | VIP Experience Tour | 9,000,000 | 1.25 | 167,700 | 50s | 54,000,000 | 30,000,000 |
| `success-university` | Success University | 270,000,000 | 1.27 | 3,018,600 | 75s | 1,350,000,000 | 30,000,000 |
| `mlm-ambassador-program` | MLM Ambassador Program | 4,000,000,000 | 1.29 | 26,160,000 | 100s | 20,000,000,000 | 1,000,000,000 |
| `debt-club` | Debt Club | 80,000,000,000 | 1.32 | 292,992,000 | 140s | 240,000,000,000 | 30,000,000,000 |
| `subscriber-towns` | Subscriber Towns | 2,000,000,000,000 | 1.36 | 3,767,040,000 | 180s | 6,000,000,000,000 | 30,000,000,000 |

## Milestone Inputs

Milestones are per-Hustle in `GRIFT_OS_MILESTONE_TUNING`. Each entry has `requiredScaleCount`, `kind`, and `value`; the label and description are content only. Current threshold/reward inputs are:

| Hustle | Required scale count / kind / value |
| --- | --- |
| Online Rage Farm | 10 / output / 2; 25 / cadence / 1; 50 / output / 7; 100 / cost / 1 |
| Paid Friend Club | 5 / output / 1.5; 15 / automation-cost / 1; 30 / cadence / 1; 75 / output / 8.5 |
| Autograph Factory | 5 / output / 2; 20 / cadence / 0.75; 40 / output / 8; 100 / cost / 1.5 |
| Paid Shoutout Studio | 5 / automation-cost / 1; 15 / output / 3; 35 / cadence / 1; 75 / output / 12 |
| Outrage Podcast | 5 / output / 3; 15 / cadence / 1; 30 / cost / 1; 60 / output / 15 |
| Get-Rich Books | 3 / output / 4; 10 / automation-cost / 1; 25 / cadence / 1.5; 50 / output / 10 |
| Paid Endorsement Racket | 3 / output / 5; 10 / cadence / 1; 25 / cost / 1.5; 50 / output / 15 |
| VIP Experience Tour | 2 / output / 7; 8 / automation-cost / 1.5; 20 / cadence / 1.5; 40 / output / 10 |
| Success University | 2 / output / 9; 6 / cost / 1.5; 15 / cadence / 2; 30 / output / 10 |
| MLM Ambassador Program | 2 / output / 4; 5 / automation-cost / 2; 12 / cadence / 1; 25 / output / 10 |
| Debt Club | 2 / output / 5; 6 / cost / 1.5; 15 / cadence / 1.5; 30 / output / 10 |
| Subscriber Towns | 2 / output / 4; 5 / automation-cost / 2; 12 / cadence / 1; 25 / output / 10 |

## Leverage Inputs

Leverage definitions are assembled through `content/leverage-definitions.ts` from the Influence mechanics/content packs. Costs spend current Net Worth, peak Net Worth supplies the unlock high-water mark, and all current names/magnitudes are provisional fixtures for the lifecycle.

| ID | Cost | Required Net Worth | Primary effect |
| --- | ---: | ---: | --- |
| `attention-loop` | 250K Net Worth | 1M peak | x2 early portfolio output |
| `closed-circuit-doctrine` | 2M Net Worth | 30M peak | x2 selected direct-audience output; expansion costs /1.5 |
| `capital-access` | 25M Net Worth | 30M peak | x2 selected commercial output; automation costs /2 |
| `institutional-capture` | 250M Net Worth | 1B peak | x2 selected institutional output; selected cadence x1.5 |
| `sovereign-stack` | 2.5B Net Worth | 30B peak | x3 selected late output; expansion costs /1.5 |

## Simulator Checks

Use:

```text
npm run game:balance -- --strategy=natural --rug-strategy=prepared --max-days=14
npm run game:balance -- --strategy=natural --rug-strategy=prepared --max-days=14 --sensitivity
npm run game:balance -- --profile=eight-hour --strategy=natural --rug-strategy=deep --max-days=14
```

The natural prepared morning/evening profile currently reaches the `$1T` campaign target in about 8.62 days, compared with about 7.6 days before the twelve-slot migration. It acquires Subscriber Towns around 5.58 days and automates it around 7.10 days before the winning Rug. Four-hour and eight-hour profiles currently finish around 11.37 and 5.78 days. The one-hour natural purchase heuristic does not finish within 14 days and remains a simulator-strategy follow-up rather than justification for hidden rescue multipliers. The explicit `leverage-reinvestment` morning/evening strategy finishes around 6.59 days; ordinary strategies do not buy Net-Worth-funded Leverage.

The current newest-Hustle production dominance is expected. Giant local milestones, cross-Hustle boosts, portfolio discontinuities, and old-Hustle resurgence are a separate deferred pass.

When returning a proposed tuning revision, include:

1. the changed input values;
2. target times for first payout, first expansion, automation, first milestone, first Rug, and campaign victory;
3. the simulator command and results;
4. any formula or mechanic change called for explicitly.

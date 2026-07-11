# GriftOS Economy Tuning Brief

This is the copy-friendly handoff for revising GriftOS economy constants. A tuning proposal should edit the inputs in `src/app/pages/experimental/grift-os-game/content/economy-tuning.ts`, run the balance simulator, and return the changed block plus the intended player experience. Do not change formulas accidentally while changing numbers.

## Rules That Should Stay Stable During A Tuning Pass

- `Valuation` is the only spendable in-run value.
- `Net Worth` is persistent prestige value and is not spendable.
- The first Hustle earns fractions of a cent.
- Manual Hustles run one cycle and return to ready.
- Automated Hustles run continuously and preserve elapsed-time remainder.
- Unit payout is linear in owned units before modifiers.
- Unit cost is geometric in owned units.
- Milestones add within scope buckets; scope buckets multiply.
- Leverage and Founder Take are run-scoped and reset on Rug Pull.
- Offline credit remains capped at eight hours.
- Post-victory Valuation is not hard-capped.

## Formula Sheet

```text
nextUnitCost = acquisitionCost * growthRate^ownedUnits / costMultiplier

cost(quantity) = nextUnitCost * ((growthRate^quantity - 1) / (growthRate - 1))

basePayout = payoutPerCyclePerUnit * ownedUnits

effectivePayout = basePayout
  * localOutputBucket
  * globalOutputBucket
  * synergyOutputBucket
  * temporaryOutputBucket
  * metaOutputBucket

bucket = 1 + sum(additive bonuses in that scope)

effectiveCadence = baseCadence / localSpeedBucket / globalSpeedBucket

Rug gain = rugTarget * founderTakeRate * rewardShaping
  * (peakValuation / rugTarget)^0.75

wealthBonus = 4 * (NetWorth / $1M)^0.2
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
  wealth_advantage_exponent: 0.2
  frontier_wealth_factor: 0.05
  prior_stratum_wealth_factor: 0.25
  campaign_target_net_worth: 1000000000000
  curated_valuation_envelope: 1000000000000000

founder_take:
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

The IDs are intentionally retained for existing save compatibility. Names and content are editable separately in `content/hustle-definitions.ts`.

| ID | Player-facing Hustle | Acquisition | Growth | Payout/cycle/unit | Cadence | Automation cost | Unlock Net Worth |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `troll-network` | Creator Account | 0.025 | 1.18 | 0.0025 | 2s | 0.50 | 0 |
| `podcast-network` | Subscriber Club | 2 | 1.20 | 0.20 | 5s | 12 | 0 |
| `culture-war-media` | Merch Operation | 50 | 1.22 | 8 | 10s | 300 | 0 |
| `masterclass-business` | Personality Show | 1,500 | 1.24 | 250 | 20s | 9,000 | 0 |
| `manifesto-imprint` | Appearance Circuit | 50,000 | 1.26 | 8,000 | 30s | 300,000 | 0 |
| `founder-retreat-circuit` | Inner Circle | 2,000,000 | 1.28 | 120,000 | 45s | 12,000,000 | 1,000,000 |
| `ai-venture` | Fundraising Machine | 75,000,000 | 1.30 | 600,000 | 60s | 450,000,000 | 30,000,000 |
| `venture-portfolio` | Community Coin | 3,000,000,000 | 1.32 | 30,000,000 | 90s | 18,000,000,000 | 1,000,000,000 |
| `media-holdings` | Personality Network | 100,000,000,000 | 1.34 | 200,000,000 | 120s | 500,000,000,000 | 30,000,000,000 |
| `sovereign-network` | Social Platform | 2,000,000,000,000 | 1.36 | 2,000,000,000 | 180s | 6,000,000,000,000 | 30,000,000,000 |

## Milestone Inputs

Milestones are per-Hustle in `GRIFT_OS_MILESTONE_TUNING`. Each entry has `requiredUnits`, `kind`, and `value`; the label and description are content only. Current threshold/reward inputs are:

| Hustle | Required units / kind / value |
| --- | --- |
| Creator Account | 10 / output / 2; 25 / cadence / 1; 50 / output / 7; 100 / cost / 1 |
| Subscriber Club | 5 / output / 1.5; 15 / automation-cost / 1; 30 / cadence / 1; 75 / output / 8.5 |
| Merch Operation | 5 / output / 2; 20 / cadence / 0.75; 40 / output / 8; 100 / cost / 1.5 |
| Personality Show | 5 / automation-cost / 1; 15 / output / 3; 35 / cadence / 1; 75 / output / 12 |
| Appearance Circuit | 5 / output / 3; 15 / cadence / 1; 30 / cost / 1; 60 / output / 15 |
| Inner Circle | 3 / output / 4; 10 / automation-cost / 1; 25 / cadence / 1.5; 50 / output / 10 |
| Fundraising Machine | 3 / output / 5; 10 / cadence / 1; 25 / cost / 1.5; 50 / output / 15 |
| Community Coin | 2 / output / 7; 8 / automation-cost / 1.5; 20 / cadence / 1.5; 40 / output / 10 |
| Personality Network | 2 / output / 9; 6 / cost / 1.5; 15 / cadence / 2; 30 / output / 10 |
| Social Platform | 2 / output / 4; 5 / automation-cost / 2; 12 / cadence / 1; 25 / output / 10 |

## Leverage Inputs

Leverage definitions are in `content/leverage-definitions.ts`. Costs and prerequisites are intentionally large enough to compete with expansion and Founder Take rather than becoming automatic purchases.

| ID | Cost | Required Net Worth | Primary effect |
| --- | ---: | ---: | --- |
| `attention-loop` | 25M | 0 | x2 early creator portfolio output |
| `closed-circuit-doctrine` | 750M | 1M | x2 direct-audience output; expansion costs /1.5 |
| `capital-access` | 25B | 30M | x2 belief-conversion output; automation costs /2 |
| `institutional-capture` | 750B | 1B | x2 network inventory; selected cadence x1.5 |
| `sovereign-stack` | 25T | 30B | x3 owned attention-market output; expansion costs /1.5 |

## Simulator Checks

Use:

```text
npm run game:balance -- --strategy=natural --rug-strategy=prepared --max-days=14
npm run game:balance -- --strategy=natural --rug-strategy=prepared --max-days=14 --sensitivity
npm run game:balance -- --profile=eight-hour --strategy=natural --rug-strategy=deep --max-days=14
```

The current prepared-strategy matrix reaches the `$1T` campaign target in approximately 6.8 to 10.3 days depending on return profile. Sensitivity runs keep the tested strategies in the same general range, with no single ordinary purchase dominating the campaign. The immediate strategy is faster but extracts less per Rug; the deep strategy delays extraction for two Founder Take stages.

When returning a proposed tuning revision, include:

1. the changed input values;
2. target times for first payout, first expansion, automation, first milestone, first Rug, and campaign victory;
3. the simulator command and results;
4. any formula or mechanic change called for explicitly.

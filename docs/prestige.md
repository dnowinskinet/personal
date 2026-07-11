# GriftOS Prestige: Rug Pull

Rug Pull converts a successful run into persistent Net Worth. It is a stateful extraction decision, not a reset helper with a cosmetic label.

## State Machine

The engine retains these states:

```ts
type RugPullState =
  | 'unavailable'
  | 'available'
  | 'preview'
  | 'committed'
  | 'extracting'
  | 'returning';
```

The current player flow uses `unavailable` and `available` for the forecast/action state. The remaining states are reserved for future visual and audio transitions.

## Strata and Eligibility

The active Rug target is selected from persistent Net Worth:

| Stratum | Minimum Net Worth | Required peak |
| --- | ---: | ---: |
| Creator economy | $0 | $100M |
| Direct audience economy | $1M | $3B |
| Influence economy | $30M | $100B |
| Network economy | $1B | $3T |
| Platform economy | $30B | $100T |
| Post-victory economy | $1T | $1Q |

Rug Pull becomes available when peak Valuation reaches the active target. The target is not a hard cap: after the authored campaign, post-victory progression may exceed the `$1Q` design envelope.

## Net Worth Formula

The current reward model is:

```text
gain = rugTarget
  * founderTakeRate
  * rewardShaping
  * (peakValuation / rugTarget)^0.75
```

Current reward shaping is `0.1` for every stratum. Founder Take starts at `0.10` and can reach `0.20` after two completed preparation stages. The resulting gain is floored to a whole unit of Net Worth by the engine.

The formula deliberately rewards deeper peaks smoothly without imposing a hard Valuation cap or stacking several severe diminishing-return functions.

## Founder Take

Founder Take is an optional, run-scoped extraction preparation system. It is deliberately expensive in time and production so it is not an automatic last-second optimization.

| Stage | Cost | Duration | Take bonus | Output during preparation |
| --- | ---: | ---: | ---: | ---: |
| Retain the Rights | 3% of active Rug target | 2h | +5 percentage points | 75% retained |
| Lock the Cap Table | 7% of active Rug target | 6h | +5 percentage points | 60% retained |

A stage can start only when the run has reached the current Rug target and has enough current Valuation to pay its cost. The cost is spent immediately. While active, output is multiplied by its retention value. Completion increases Founder Take for the eventual Rug. Preparation progress and completed stages reset when the Rug is committed.

## Persistent Power

Net Worth is preserved across Rug Pulls and grants an output advantage:

```text
wealthBonus = 4 * (NetWorth / $1M)^0.2
wealthMultiplier = 1 + wealthBonus
```

The bonus is attenuated per Hustle frontier. The current frontier gets `5%` of the full bonus, the immediately prior stratum gets `25%`, and older content gets the full bonus. This is intended to demolish old content without making every newly unlocked Hustle trivial.

## Reset Rule

Rug Pull resets:

- Valuation;
- peak Valuation;
- Hustle units;
- automation;
- production progress;
- reached milestones;
- run-scoped Leverage purchases;
- Founder Take preparation and completed stages.

Rug Pull preserves:

- Net Worth;
- Rug Pull count;
- audio settings;
- local playtest logs.

## Validation

Balance validation lives in `balance-sim.ts` and can be run with:

```text
npm run game:balance -- --strategy=natural --rug-strategy=prepared --max-days=14
```

The simulator also supports `immediate` and `deep` Rug strategies, hourly/four-hour/eight-hour/morning-evening profiles, sensitivity runs, and post-victory starting Net Worth. Current campaign paths reach `$1T` Net Worth in roughly one to two weeks of intermittent play. These are provisional targets, not promises of final balance.

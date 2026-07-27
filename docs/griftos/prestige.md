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

The active Rug target is selected from nondecreasing peak Net Worth. Spending current Net Worth on Leverage cannot move the player into a cheaper stratum or relock progression.

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
  * extractionRate
  * rewardShaping
  * (peakValuation / rugTarget)^0.75
```

Current reward shaping is `0.1` for every stratum. Extraction share starts at `0.10` and can reach `0.20` after two completed preparation stages. Influence presents this value as `Your Take`. The resulting gain is floored to a whole unit of Net Worth by the engine.

The formula deliberately rewards deeper peaks smoothly without imposing a hard Valuation cap or stacking several severe diminishing-return functions.

## Extraction Preparation / Your Take

Extraction preparation is a neutral, optional, run-scoped system. It is deliberately expensive in time and production so it is not an automatic last-second optimization. The Influence renderer supplies the authored `Your Take` label; the engine does not assume a Founder character.

| Stage | Cost | Duration | Take bonus | Output during preparation |
| --- | ---: | ---: | ---: | ---: |
| Retain the Rights | 3% of active Rug target | 2h | +5 percentage points | 75% retained |
| Lock the Cap Table | 7% of active Rug target | 6h | +5 percentage points | 60% retained |

A stage can start only when the run has reached the current Rug target and has enough current Valuation to pay its cost. The cost is spent immediately. While active, output is multiplied by its retention value. Completion increases extraction share for the eventual Rug. Preparation progress and completed stages reset when the Rug is committed.

## Persistent Power

Current Net Worth is preserved across Rug Pulls unless deliberately sacrificed to Leverage, and it grants an output advantage:

```text
wealthBonus = 4 * (NetWorth / $1M)^0.3
wealthMultiplier = 1 + wealthBonus
```

The bonus is attenuated per Hustle frontier. The current frontier gets `5%` of the full bonus, the immediately prior stratum gets `25%`, and older content gets the full bonus. This is intended to demolish old content without making every newly unlocked Hustle trivial.

## Reset Rule

Rug Pull resets:

- Valuation;
- peak Valuation;
- Hustle scale count;
- automation;
- production progress;
- reached milestones;
- run-scoped Leverage purchases;
- extraction preparation and completed stages.

Rug Pull preserves:

- current Net Worth after adding the Rug gain;
- peak Net Worth, raised when the resulting current value sets a new high;
- Influence's per-empire exit count;
- audio settings;
- local playtest logs.

V3 migration carries v2/v1 Net Worth and Influence's per-empire lifetime exit count forward while preserving the old records. Because the twelve semantic Hustles do not correspond safely to the ten historical IDs, the old current run resets to the initial twelve-Hustle state.

## Future Empire Transition — TARGET, Not Yet Implemented

Changing empires requires completing the active empire's prestige. After prestige, the player may begin another run in the current empire or explicitly choose an unlocked empire. The completed run is replaced; its Hustles and other run-scoped progress do not carry into the chosen empire, and inactive empires have no suspended run or offline production. Global Net Worth persists.

This transition remains unimplemented. When it is added, empire replacement must clear the current run and its empire-specific Leverage while preserving global current/peak Net Worth according to the transition decision.

## Validation

Balance validation lives in `balance-sim.ts` and can be run with:

```text
npm run game:balance -- --strategy=natural --rug-strategy=prepared --max-days=14
```

The simulator also supports `immediate` and `deep` Rug strategies, hourly/four-hour/eight-hour/morning-evening profiles, sensitivity runs, post-victory starting Net Worth, and an explicit `leverage-reinvestment` purchase strategy. The natural morning/evening prepared path currently reaches `$1T` in about 8.62 days. These are provisional targets, not promises of final balance.

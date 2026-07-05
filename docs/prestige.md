# GriftOS Prestige: Rug Pull

## Working Model

The current prestige action is:

```text
Rug Pull
```

This name is a product hypothesis. Do not sanitize it into a generic liquidity event without an explicit decision.

## State Machine

The engine models Rug Pull as:

```ts
type RugPullState =
  | 'unavailable'
  | 'available'
  | 'preview'
  | 'committed'
  | 'extracting'
  | 'returning';
```

The current UI uses `unavailable` and `available` for forecast/action display. The remaining states are reserved for future visual and audio transitions.

## Current Formula

Configured in:

```text
src/app/pages/experimental/grift-os-game/game-engine/rug-pull.ts
```

Constants:

```text
unlockValuation = 50,000,000
baseNetWorthGain = 100,000
```

Net Worth gain:

```text
gain = 100,000 * sqrt(peakRunValuation / 50,000,000)
```

Examples:

```text
$50M peak Valuation -> +$100K Net Worth
$200M              -> +$200K
$1.25B             -> +$500K
$5B                -> +$1M
```

## Persistent Power

Net Worth currently grants:

```text
wealthAdvantage =
  1 + 0.20 * log10(1 + netWorth / 100,000)
```

Displayed as:

```text
+X% all Hustle output
```

## Reset Rule

Rug Pull resets:

- Valuation;
- peak Valuation;
- Hustle units;
- automation;
- progress timers;
- reached milestones;
- run-specific state.

Rug Pull preserves:

- Net Worth;
- audio settings;
- local playtest logs.

## Known Balance Issue

The $50M threshold is not reachable in the current 30-minute balance simulations. This is intentionally documented as an unresolved balance problem. Do not hide it by changing threshold, output, costs, and milestone rewards simultaneously.

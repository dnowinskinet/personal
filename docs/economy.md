# GriftOS Economy

This document records current formulas and temporary balance decisions. Values are simulation-backed hypotheses, not final doctrine.

## Values

### Valuation

Valuation is the only in-run spendable value. It is stored as a JavaScript `number`.

### Average Rate

Average Rate is a display metric, not a currency.

Manual Hustles contribute only while a cycle is active. Automated Hustles contribute continuously because they restart themselves.

```text
averageRate = effectivePayout / effectiveCadenceSeconds
```

### Net Worth

Net Worth is persistent meta progression created by Rug Pull. It is not spendable in the current prototype.

## Expansion Cost

Each Hustle defines:

```text
acquisitionCost
growthRate
basePayout
cadenceSeconds
automationCost
milestones
```

Next unit cost:

```text
nextCost = acquisitionCost * growthRate ^ currentUnits
```

Quantity cost:

```text
cost(quantity) =
  nextCost * ((growthRate ^ quantity - 1) / (growthRate - 1))
```

Buy Max uses the inverse geometric sum and verifies the final quantity against the exact cost.

## Effective Output

Base payout:

```text
baseRunPayout = basePayout * units
```

Effective payout:

```text
effectivePayout =
  baseRunPayout
  * localOutputBucket
  * globalOutputBucket
  * synergyOutputBucket
  * temporaryOutputBucket
  * metaOutputBucket
```

Buckets are additive internally and multiplicative across buckets:

```text
bucket = 1 + sum(additive bonuses)
```

Effective cadence:

```text
effectiveCadence =
  baseCadence
  / localSpeedBucket
  / globalSpeedBucket
```

Cadence is clamped to avoid zero, negative, NaN, and Infinity behavior.

## Milestones

Current milestone thresholds are:

```text
10 units -> +50% local Hustle output
25 units -> +100% local Hustle output
```

Milestones are data-driven per Hustle and can be tuned individually.

## Automation

Automation is a one-time Valuation purchase per Hustle. It changes:

```text
manual restart -> automatic restart
```

It is treated primarily as relief and system activation, not as a separate currency or manager layer.

Eligibility:

```text
units > 0
not automated
valuation >= automationCost
```

## Rug Pull

Temporary prototype constants:

```text
unlockValuation = 50,000,000
baseNetWorthGain = 100,000
```

Projected Net Worth gain:

```text
gain = 100,000 * sqrt(peakRunValuation / 50,000,000)
```

Net Worth power:

```text
wealthAdvantage =
  1 + 0.20 * log10(1 + netWorth / 100,000)
```

Displayed as:

```text
+X% all Hustle output
```

## Current Hustle Constants

| # | Hustle | Acquisition | Growth | Payout | Cadence | Automation | Automation Cost |
| ---: | --- | ---: | ---: | ---: | ---: | --- | ---: |
| 1 | Troll Network | 50 | 1.138 | 4 | 2s | Bots | 110 |
| 2 | Podcast Network | 160 | 1.150 | 28 | 5s | Clip Farm | 750 |
| 3 | Culture-War Media | 900 | 1.160 | 150 | 9s | Outrage Engine | 5,200 |
| 4 | Masterclass Business | 6,500 | 1.150 | 950 | 15s | Funnel Stack | 44,000 |
| 5 | Manifesto Imprint | 50,000 | 1.145 | 7,200 | 24s | Ghostwriting Collective | 360,000 |
| 6 | Founder Retreat Circuit | 420,000 | 1.140 | 54,000 | 38s | Social Graph Concierge | 3,000,000 |
| 7 | AI Venture | 3,500,000 | 1.135 | 360,000 | 60s | Synthetic Demo Team | 25,000,000 |
| 8 | Venture Portfolio | 30,000,000 | 1.130 | 2,500,000 | 95s | Associate Swarm | 210,000,000 |
| 9 | Media Holdings | 260,000,000 | 1.125 | 18,000,000 | 150s | Editorial Independence | 1,800,000,000 |
| 10 | Sovereign Network | 2,200,000,000 | 1.120 | 140,000,000 | 240s | Aligned Population | 15,000,000,000 |

## Balance Targets

Initial targets from the modernization brief:

| Moment | Target |
| --- | ---: |
| First payout | immediate |
| First expansion | 20-35s |
| Hustle 2 acquisition | 90-150s |
| First automation | 2-4m |
| First visible milestone | 3-6m |
| Hustle 3 | 6-10m |
| Hustle 4 | 12-20m |
| Rug Pull preview interesting | 10-15m |
| First viable Rug Pull | 20-30m |

## Balance Simulation

Simulator location:

```text
src/app/pages/experimental/grift-os-game/game-engine/balance-sim.ts
```

Strategies:

- natural;
- automation rush;
- expansion first;
- next-Hustle rush;
- milestone rush;
- rough ROI.

30-minute simulation results from 2026-07-04:

| Strategy | Peak Valuation | First Expansion | Hustle 2 | First Automation | First Milestone | Hustle 3 | Hustle 4 | Rug Pull |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| natural | $209,627 | 0:30 | 1:58 | 1:20 | 2:13 | 3:58 | 7:34 | no |
| automation rush | $209,627 | 0:30 | 1:58 | 1:20 | 2:13 | 3:58 | 7:34 | no |
| expansion first | $184,085 | 0:30 | 2:14 | 1:36 | 2:04 | 4:18 | 8:24 | no |
| next-Hustle rush | $209,627 | 0:30 | 1:58 | 1:20 | 2:13 | 3:58 | 7:34 | no |
| milestone rush | $1,253,240 | 5:56 | 2:16 | 0:56 | 5:56 | 6:22 | 8:52 | no |
| rough ROI | $269,573 | 0:30 | 2:04 | 1:36 | 2:10 | 3:54 | 6:54 | no |

## Current Balance Conflict

The first expansion, Hustle 2, first automation, first milestone, Hustle 3, and Hustle 4 are broadly in the target neighborhood.

Rug Pull is not. With the current constants, the 30-minute peak Valuation is far below the $50M threshold. This is an explicit known limitation. Do not silently lower the Rug Pull threshold or inflate late-Hustle output without a documented balance decision.

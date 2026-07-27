/**
 * Headless balance sweep — the machine-measurable half of Gate A.
 *
 * This is the instrument that replaces a tester panel (D-003). Seven humans playing twice would
 * never find a dominant posture; running three policy bots across hundreds of seeds finds it in
 * about a second.
 *
 * The question it answers is narrow and falsifiable: **does any single posture win reach AND trust
 * AND ownership at the same time, most of the time?** If so, the tradeoffs are decorative.
 */

import { resolveQuarter, type ContentPack, type QuarterDecisions, type QuarterOutcome } from '../sim/index';
import { DOCTRINES, type DoctrineName } from '../content/doctrines';

export interface DoctrineTotals {
  readonly name: DoctrineName;
  readonly reach: number;
  readonly portfolio: number;
  readonly clarity: number;
  readonly trust: number;
  readonly ownership: number;
  /** Seeds in which this doctrine swept reach, trust and ownership simultaneously. */
  readonly sweeps: number;
  /** Seeds in which it took at least one dimension outright. */
  readonly anyWin: number;
  readonly defectRate: number;
}

export interface SweepResult {
  readonly seeds: number;
  readonly doctrines: readonly DoctrineTotals[];
  /** Highest simultaneous-sweep share across doctrines, 0..1. Gate A fails above 0.6. */
  readonly worstSweepShare: number;
  /** Lowest any-dimension-win share across doctrines, 0..1. Gate A fails below 0.2. */
  readonly weakestAnyWinShare: number;
  readonly dominant: DoctrineName | null;
}

const TRACKED = ['reach', 'trust', 'ownership'] as const;
type TrackedDimension = (typeof TRACKED)[number];

const ALL = ['reach', 'portfolio', 'clarity', 'trust', 'ownership'] as const;
type Dimension = (typeof ALL)[number];

/** Runs every doctrine against one seed. */
function runSeed(
  pack: ContentPack,
  seed: number
): Readonly<Record<DoctrineName, QuarterOutcome>> {
  const results = {} as Record<DoctrineName, QuarterOutcome>;
  for (const doctrine of DOCTRINES) {
    results[doctrine.name] = resolveQuarter(pack, doctrine.decisions, seed);
  }
  return results;
}

function winnerOn(
  outcomes: Readonly<Record<DoctrineName, QuarterOutcome>>,
  dimension: Dimension
): DoctrineName {
  let best: DoctrineName = DOCTRINES[0].name;
  for (const doctrine of DOCTRINES) {
    if (outcomes[doctrine.name][dimension] > outcomes[best][dimension]) {
      best = doctrine.name;
    }
  }
  return best;
}

export function runSweep(pack: ContentPack, seeds: number): SweepResult {
  const totals = new Map<DoctrineName, { sums: Record<Dimension, number>; sweeps: number; anyWin: number; defects: number }>();
  for (const doctrine of DOCTRINES) {
    totals.set(doctrine.name, {
      sums: { reach: 0, portfolio: 0, clarity: 0, trust: 0, ownership: 0 },
      sweeps: 0,
      anyWin: 0,
      defects: 0,
    });
  }

  for (let index = 0; index < seeds; index += 1) {
    const seed = 1000 + index * 7919;
    const outcomes = runSeed(pack, seed);

    for (const doctrine of DOCTRINES) {
      const bucket = totals.get(doctrine.name);
      if (bucket === undefined) {
        continue;
      }
      for (const dimension of ALL) {
        bucket.sums[dimension] += outcomes[doctrine.name][dimension];
      }
      if (outcomes[doctrine.name].defectOccurred) {
        bucket.defects += 1;
      }
    }

    const trackedWinners = TRACKED.map((dimension: TrackedDimension) => winnerOn(outcomes, dimension));
    const sweeper = trackedWinners.every((name) => name === trackedWinners[0]) ? trackedWinners[0] : null;
    if (sweeper !== null) {
      const bucket = totals.get(sweeper);
      if (bucket !== undefined) {
        bucket.sweeps += 1;
      }
    }

    const anyWinners = new Set(ALL.map((dimension) => winnerOn(outcomes, dimension)));
    for (const name of anyWinners) {
      const bucket = totals.get(name);
      if (bucket !== undefined) {
        bucket.anyWin += 1;
      }
    }
  }

  const doctrines: DoctrineTotals[] = DOCTRINES.map((doctrine) => {
    const bucket = totals.get(doctrine.name);
    const empty = { reach: 0, portfolio: 0, clarity: 0, trust: 0, ownership: 0 };
    const sums = bucket?.sums ?? empty;
    return {
      name: doctrine.name,
      reach: round(sums.reach / seeds),
      portfolio: round(sums.portfolio / seeds),
      clarity: round(sums.clarity / seeds),
      trust: round(sums.trust / seeds),
      ownership: round(sums.ownership / seeds),
      sweeps: bucket?.sweeps ?? 0,
      anyWin: bucket?.anyWin ?? 0,
      defectRate: round(((bucket?.defects ?? 0) / seeds) * 100),
    };
  });

  const worstSweepShare = Math.max(...doctrines.map((entry) => entry.sweeps / seeds));
  const weakestAnyWinShare = Math.min(...doctrines.map((entry) => entry.anyWin / seeds));
  const dominantEntry = doctrines.find((entry) => entry.sweeps / seeds > 0.6);

  return {
    seeds,
    doctrines,
    worstSweepShare,
    weakestAnyWinShare,
    dominant: dominantEntry?.name ?? null,
  };
}

/**
 * Sensitivity check — the second machine-measurable Gate A condition.
 *
 * Flips one decision in isolation, holding seed and everything else constant, and counts how many
 * of the five dimensions move by a visible margin. A decision that moves nothing is a fake choice.
 */
export function decisionSensitivity(
  pack: ContentPack,
  base: QuarterDecisions,
  variant: QuarterDecisions,
  seeds: number,
  margin = 3
): number {
  let movedEnough = 0;

  for (let index = 0; index < seeds; index += 1) {
    const seed = 1000 + index * 7919;
    const before = resolveQuarter(pack, base, seed);
    const after = resolveQuarter(pack, variant, seed);
    const moved = ALL.filter((dimension) => Math.abs(before[dimension] - after[dimension]) >= margin);
    if (moved.length >= 2) {
      movedEnough += 1;
    }
  }

  return movedEnough / seeds;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

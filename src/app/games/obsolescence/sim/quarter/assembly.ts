/**
 * The payoff moment: find out what you can actually build.
 *
 * The menu is derived entirely from parts on hand. Nothing is offered that cannot be built, and
 * everything that cannot be built states exactly what is missing — a lineup that looked fine on
 * paper and cannot ship is the whole point of the gate.
 */

import {
  PART_KINDS,
  TIERS,
  countOf,
  totalOf,
  type AssemblyOption,
  type PartKind,
  type PartStock,
  type QuarterConfig,
  type QuarterOutcome,
  type QuarterState,
  type Tier,
} from './types';

interface Grade {
  readonly id: string;
  readonly label: string;
  readonly minTier: Tier;
  /** Multiplier on the resulting score. Better builds are worth more, if you can make them. */
  readonly premium: number;
}

const GRADES: readonly Grade[] = [
  { id: 'salvage', label: 'Salvage build — whatever is on the shelf', minTier: 1, premium: 0.8 },
  { id: 'standard', label: 'Standard build — decent parts throughout', minTier: 2, premium: 1 },
  { id: 'flagship', label: 'Flagship build — best of everything', minTier: 3, premium: 1.05 },
];

/** Lowest tier at or above `minTier` that is actually in stock, or null. */
function lowestAvailableTier(stock: PartStock, kind: PartKind, minTier: Tier): Tier | null {
  for (const tier of TIERS) {
    if (tier >= minTier && countOf(stock, kind, tier) > 0) {
      return tier;
    }
  }
  return null;
}

/** Quality from the tiers actually consumed. */
function qualityFrom(uses: Readonly<Record<PartKind, Tier>>, premium: number): number {
  const mean = PART_KINDS.reduce((sum, kind) => sum + uses[kind], 0) / PART_KINDS.length;
  // Clamp AFTER the premium, not before — clamping first let a flagship build exceed 100.
  return Math.round(Math.min(100, (((mean - 1) / 2) * 70 + 26) * premium));
}

/** Everything the player could build right now, buildable or not. */
export function assemblyOptions(stock: PartStock): readonly AssemblyOption[] {
  return GRADES.map((grade) => {
    const uses = {} as Record<PartKind, Tier>;
    const missing: string[] = [];

    for (const kind of PART_KINDS) {
      const tier = lowestAvailableTier(stock, kind, grade.minTier);
      if (tier === null) {
        missing.push(
          totalOf(stock, kind) === 0
            ? `no ${kind} at all`
            : `no ${kind} at tier ${grade.minTier} or better`
        );
        uses[kind] = grade.minTier;
      } else {
        uses[kind] = tier;
      }
    }

    const available = missing.length === 0;
    return {
      id: grade.id,
      label: grade.label,
      uses,
      available,
      blockedBy: available ? null : missing.join(', '),
      quality: available ? qualityFrom(uses, grade.premium) : 0,
    };
  });
}

/** The best option currently buildable, or null when nothing can ship. */
export function bestAvailable(stock: PartStock): AssemblyOption | null {
  const buildable = assemblyOptions(stock).filter((option) => option.available);
  if (buildable.length === 0) {
    return null;
  }
  return buildable.reduce((best, option) => (option.quality > best.quality ? option : best));
}

/**
 * Resolves the quarter.
 *
 * Score is product quality carried by market readiness. A superb device nobody has heard of scores
 * badly; so does a well-marketed device made of scrap. Both halves are needed, which is what makes
 * the up-versus-down split a real decision rather than a preference.
 */
export function resolveQuarter(
  state: QuarterState,
  config: QuarterConfig,
  optionId: string | null
): QuarterOutcome {
  const options = assemblyOptions(state.stock);
  const chosen = options.find((option) => option.id === optionId && option.available) ?? null;
  const readiness = Math.min(1, state.marketPoints / config.marketTarget);
  const notes: string[] = [];

  if (chosen === null) {
    const blocked = options.map((option) => option.blockedBy).filter((reason): reason is string => reason !== null);
    notes.push(
      blocked.length > 0
        ? `Nothing shippable. ${blocked[0]}.`
        : 'Nothing was selected, so nothing shipped.'
    );
    notes.push('A quarter with no product is a quarter of pure cost.');
    return {
      shipped: false,
      optionId: null,
      optionLabel: 'Nothing shipped',
      quality: 0,
      marketReadiness: Math.round(readiness * 100),
      score: 0,
      goalScore: config.goalScore,
      goalMet: false,
      cash: -18000,
      standing: -14,
      notes,
    };
  }

  // Market readiness cannot rescue a bad product, but neglecting it wastes a good one.
  const score = Math.round(chosen.quality * (0.35 + readiness * 0.65));
  const goalMet = score >= config.goalScore;

  if (readiness < 0.45) {
    notes.push('Barely anyone knew it was coming. Market prep was starved.');
  }
  if (chosen.id === 'salvage') {
    notes.push('It shipped, but it is visibly made of whatever was left.');
  }
  if (chosen.id === 'flagship') {
    notes.push('Best parts throughout. The research paid for itself.');
  }

  notes.push(
    goalMet
      ? `Goal met — ${score} against a target of ${config.goalScore}.`
      : `Goal missed — ${score} against a target of ${config.goalScore}. Standing takes the hit.`
  );

  return {
    shipped: true,
    optionId: chosen.id,
    optionLabel: chosen.label,
    quality: chosen.quality,
    marketReadiness: Math.round(readiness * 100),
    score,
    goalScore: config.goalScore,
    goalMet,
    cash: Math.round(score * 520 - 22000),
    standing: goalMet ? Math.round((score - config.goalScore) / 4) + 6 : -8,
    notes,
  };
}

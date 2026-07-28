/**
 * Three needs: bladder, hunger, energy.
 *
 * R10 is emphatic about the consequence band. Too weak and players ignore support space; too strong
 * and the game becomes restroom babysitting. The target is that putting the restroom at the far end
 * of the floor costs measurable throughput — and nothing worse.
 *
 * Exactly three, per the directive. No hygiene, no social, no comfort as an immediate need.
 */

import type { NeedKind } from './rooms';
import type { NeedLevels, Staff } from './staff';

export interface NeedThresholds {
  readonly warning: number;
  readonly softPenalty: number;
  readonly mandatoryInterrupt: number;
  readonly severe: number;
}

/** R10 priors. Externalized; every scenario may override. */
export const DEFAULT_THRESHOLDS: NeedThresholds = {
  warning: 0.45,
  softPenalty: 0.3,
  mandatoryInterrupt: 0.18,
  severe: 0.1,
};

export interface NeedDecayRates {
  /** Per tick while working or travelling. */
  readonly working: Readonly<Record<NeedKind, number>>;
  /** Per tick while idle — slower, per R10. */
  readonly idle: Readonly<Record<NeedKind, number>>;
}

export const DEFAULT_DECAY: NeedDecayRates = {
  working: { bladder: 0.0016, hunger: 0.0009, energy: 0.0007 },
  idle: { bladder: 0.0008, hunger: 0.0005, energy: 0.0003 },
};

export const NEED_KINDS: readonly NeedKind[] = ['bladder', 'hunger', 'energy'];

export function fullNeeds(): NeedLevels {
  return { bladder: 1, hunger: 1, energy: 1 };
}

/**
 * Decays needs for one tick.
 *
 * Endurance resists decay but cannot stop it — R10 keeps traits and stats to narrow modifiers so
 * they never turn into a separate system.
 */
/**
 * How far a worker's decay rate may deviate from the nominal one, either way.
 *
 * Without this, two workers hired on the same tick decay in perfect lockstep and reach the
 * threshold on the same tick forever — which manufactures the synchronized-queue artifact the
 * genre is known for, and makes amenity sizing a cliff rather than a curve. The jitter is a pure
 * function of the worker and the seed, so replays are unaffected.
 */
export const DECAY_JITTER = 0.18;

export function decayNeeds(
  needs: NeedLevels,
  rates: NeedDecayRates,
  busy: boolean,
  endurance: number,
  jitter = 1
): NeedLevels {
  const table = busy ? rates.working : rates.idle;
  const resist = jitter / Math.max(0.5, endurance);
  return {
    bladder: Math.max(0, needs.bladder - table.bladder * resist),
    hunger: Math.max(0, needs.hunger - table.hunger * resist),
    energy: Math.max(0, needs.energy - table.energy * resist),
  };
}

/**
 * Per-worker decay multiplier, stable for the life of a run.
 *
 * Derived from the seed and a hash of the staff id rather than drawn per tick, so a worker's
 * metabolism does not flicker and the value survives save/load without being stored.
 */
export function decayJitter(seed: number, staffId: string, draw: (s: number, c: number) => number): number {
  let hash = 2166136261;
  for (let i = 0; i < staffId.length; i += 1) {
    hash ^= staffId.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return 1 + (draw(seed, hash >>> 0) * 2 - 1) * DECAY_JITTER;
}

export function restore(needs: NeedLevels, kind: NeedKind, amount: number): NeedLevels {
  return { ...needs, [kind]: Math.min(1, needs[kind] + amount) };
}

/**
 * Work-speed multiplier from unmet needs.
 *
 * A soft drag well before the interrupt, so a badly laid-out floor is slow before it is disruptive.
 * That gradient is what makes the cause readable — R10's "legible drag, not catastrophe".
 */
export function needEfficiency(needs: NeedLevels, thresholds: NeedThresholds): number {
  let multiplier = 1;
  for (const kind of NEED_KINDS) {
    const level = needs[kind];
    if (level <= thresholds.severe) {
      multiplier *= 0.55;
    } else if (level <= thresholds.softPenalty) {
      multiplier *= 0.78;
    } else if (level <= thresholds.warning) {
      multiplier *= 0.93;
    }
  }
  return multiplier;
}

/** Risk that this worker is about to interrupt, 0..1. Feeds the job-scoring need penalty. */
export function needRisk(needs: NeedLevels, thresholds: NeedThresholds): number {
  const lowest = Math.min(needs.bladder, needs.hunger, needs.energy);
  if (lowest >= thresholds.warning) {
    return 0;
  }
  const span = Math.max(0.001, thresholds.warning - thresholds.mandatoryInterrupt);
  return Math.min(1, (thresholds.warning - lowest) / span);
}

/** The need a worker should act on, or null. Fixed order keeps ties deterministic. */
export function pressingNeed(needs: NeedLevels, thresholds: NeedThresholds): NeedKind | null {
  for (const kind of NEED_KINDS) {
    if (needs[kind] <= thresholds.mandatoryInterrupt) {
      return kind;
    }
  }
  return null;
}

/** Amenity queues, keyed by amenity id. Order is arrival order; ties break by staff id. */
export type AmenityQueues = Readonly<Record<string, readonly string[]>>;

export function queueFor(queues: AmenityQueues, amenityId: string): readonly string[] {
  return queues[amenityId] ?? [];
}

export function enqueue(queues: AmenityQueues, amenityId: string, staffId: string): AmenityQueues {
  const current = queueFor(queues, amenityId);
  if (current.includes(staffId)) {
    return queues;
  }
  return { ...queues, [amenityId]: [...current, staffId] };
}

export function dequeue(queues: AmenityQueues, amenityId: string, staffId: string): AmenityQueues {
  const current = queueFor(queues, amenityId);
  if (!current.includes(staffId)) {
    return queues;
  }
  return { ...queues, [amenityId]: current.filter((id) => id !== staffId) };
}

/** Workers at the head of the queue, up to the amenity's slot count. */
export function servedBy(queues: AmenityQueues, amenityId: string, slots: number): readonly string[] {
  return queueFor(queues, amenityId).slice(0, slots);
}

export interface AmenityChoice {
  readonly amenityId: string;
  readonly roomId: string;
  readonly travelTicks: number;
  readonly queueLength: number;
  readonly score: number;
}

/**
 * Picks an amenity by travel, queue and quality — R10's stated weighting.
 *
 * Returns null when none is reachable, which is a real outcome the UI must explain rather than
 * leaving the worker silently stuck.
 */
export function chooseAmenity(candidates: readonly AmenityChoice[]): AmenityChoice | null {
  if (candidates.length === 0) {
    return null;
  }
  return candidates.reduce((best, candidate) => {
    if (candidate.score > best.score) {
      return candidate;
    }
    if (candidate.score < best.score) {
      return best;
    }
    return candidate.amenityId < best.amenityId ? candidate : best;
  });
}

export function scoreAmenity(
  travelTicks: number,
  queueLength: number,
  quality: number,
  severity: number
): number {
  return quality * 0.6 - travelTicks * 1.4 - queueLength * 6 + severity * 10;
}

export function needsSummary(staff: Staff, thresholds: NeedThresholds): string | null {
  const kind = pressingNeed(staff.needs, thresholds);
  if (kind === null) {
    return null;
  }
  return kind === 'bladder' ? 'needs a restroom' : kind === 'hunger' ? 'needs to eat' : 'needs a rest';
}

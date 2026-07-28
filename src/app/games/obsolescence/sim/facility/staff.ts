/**
 * Staff identity and strict qualification.
 *
 * The governing rule, stated plainly in the directive: **a scientist must not become a lawyer merely
 * because Legal has an empty desk.** Qualification is categorical. Stats and rank change how well
 * valid work goes; they never make invalid work possible.
 *
 * R10's stat philosophy is deliberately compact — four stats in a narrow 0.8–1.2 band, so rank and
 * specialization stay more legible than a hidden spreadsheet.
 */

import type { Cell } from './grid';
import type { ObjectDefinition } from './rooms';

export type Rank = 'junior' | 'regular' | 'senior' | 'principal';

export const RANKS: readonly Rank[] = ['junior', 'regular', 'senior', 'principal'];

/** Exactly four, per R10. Narrow band; rank and specialization dominate. */
export interface StatBlock {
  /** Work speed. */
  readonly proficiency: number;
  /** Quality and error rate. */
  readonly precision: number;
  /** Resistance to need decay. */
  readonly endurance: number;
  /** How eagerly they pick up newly published work. */
  readonly initiative: number;
}

export type StaffState =
  | 'idle'
  | 'seeking_job'
  | 'travel_to_job'
  | 'waiting_for_station'
  | 'working'
  | 'urgent_need_interrupt'
  | 'travel_to_amenity'
  | 'queue_for_amenity'
  | 'using_amenity'
  | 'blocked_repath';

export interface NeedLevels {
  readonly bladder: number;
  readonly hunger: number;
  readonly energy: number;
}

/** What a worker is currently holding a claim on. */
export interface Reservation {
  readonly jobId: string;
  readonly stationId: string;
  /** Tick before which this job may not be abandoned for non-urgent reasons. */
  readonly committedUntilTick: number;
}

/** Enough to resume the same job after a need interrupt, per R10. */
export interface ResumeToken {
  readonly jobId: string;
  readonly stationId: string;
  readonly progressTicks: number;
}

export interface Staff {
  readonly id: string;
  readonly name: string;
  readonly profession: string;
  readonly rank: Rank;
  readonly specializations: readonly string[];
  readonly stats: StatBlock;
  readonly traits: readonly string[];
  readonly salaryPerQuarter: number;
  readonly hireCost: number;
  /** Room the player has assigned them to, or null for "anywhere valid". */
  readonly assignedRoomId: string | null;
  readonly state: StaffState;
  readonly location: Cell;
  readonly needs: NeedLevels;
  readonly reservation: Reservation | null;
  readonly resumeToken: ResumeToken | null;
  /** Ticks of progress accumulated on the current job. */
  readonly progressTicks: number;
  /** Remaining ticks of the current travel or amenity use. */
  readonly busyTicks: number;
  /** Cells left to walk, if travelling. */
  readonly pathCells: readonly Cell[];
  /** Amenity being travelled to or used. */
  readonly amenityId: string | null;
  /** Player-facing reason this worker is not producing, or null when they are. */
  readonly blocker: string | null;
  readonly lastStateChangeTick: number;
  /** Rooms this worker recently worked, to damp repeatedly winning the same low-priority job. */
  readonly recentRoomIds: readonly string[];
}

export interface ProfessionDefinition {
  readonly id: string;
  readonly name: string;
  /** Specializations this profession can hold. */
  readonly specializations: readonly string[];
  readonly baseSalary: number;
}

/** Salary multipliers by rank — R10 priors, externalized in content. */
export const DEFAULT_RANK_MULTIPLIER: Readonly<Record<Rank, number>> = {
  junior: 1,
  regular: 1.35,
  senior: 1.8,
  principal: 2.6,
};

export type EligibilityFailure =
  | 'wrong-profession'
  | 'missing-specialization'
  | 'station-has-no-operator-role'
  | 'not-assigned-to-this-room';

export interface Eligibility {
  readonly eligible: boolean;
  readonly failure: EligibilityFailure | null;
  /** Exact, player-visible. Never a generic "cannot work here". */
  readonly reason: string | null;
}

const ELIGIBLE: Eligibility = { eligible: true, failure: null, reason: null };

/**
 * Can this worker operate this station?
 *
 * Hard gate. Checked before any scoring happens, so an ineligible worker never even appears as a
 * candidate — R10 requires preconditions to filter before scoring, not to be outweighed by it.
 */
export function checkEligibility(
  staff: Staff,
  object: ObjectDefinition,
  roomId: string,
  professionNames: ReadonlyMap<string, string> = new Map()
): Eligibility {
  const label = (id: string): string => professionNames.get(id) ?? id;
  // "a operator" reads as a bug even when the rule behind it is right.
  const article = (word: string): string => (/^[aeiou]/i.test(word) ? 'an' : 'a');

  if (object.operatorProfessions.length === 0) {
    return {
      eligible: false,
      failure: 'station-has-no-operator-role',
      reason: `${object.name} is not something anyone works at.`,
    };
  }

  if (!object.operatorProfessions.includes(staff.profession)) {
    const allowed = object.operatorProfessions.map(label).join(' or ');
    return {
      eligible: false,
      failure: 'wrong-profession',
      reason: `${staff.name} is ${article(label(staff.profession))} ${label(staff.profession)}. ${object.name} needs ${article(allowed)} ${allowed}.`,
    };
  }

  if (
    object.requiredSpecialization !== null &&
    !staff.specializations.includes(object.requiredSpecialization)
  ) {
    return {
      eligible: false,
      failure: 'missing-specialization',
      reason: `${staff.name} lacks the ${object.requiredSpecialization} certification that ${object.name} requires.`,
    };
  }

  if (staff.assignedRoomId !== null && staff.assignedRoomId !== roomId) {
    return {
      eligible: false,
      failure: 'not-assigned-to-this-room',
      reason: `${staff.name} is assigned to a different room.`,
    };
  }

  return ELIGIBLE;
}

/** Work speed multiplier. Rank and proficiency only — never a substitute for qualification. */
export function workSpeed(staff: Staff, rankMultiplier: Readonly<Record<Rank, number>>): number {
  const rankBonus = 0.85 + (rankMultiplier[staff.rank] - 1) * 0.22;
  return staff.stats.proficiency * rankBonus;
}

/** Output quality multiplier, from precision and rank. */
export function workQuality(staff: Staff, rankMultiplier: Readonly<Record<Rank, number>>): number {
  return staff.stats.precision * (0.9 + (rankMultiplier[staff.rank] - 1) * 0.14);
}

export function salaryFor(
  profession: ProfessionDefinition,
  rank: Rank,
  multipliers: Readonly<Record<Rank, number>>,
  specializationCount: number
): number {
  // Specialists cost markedly more, per R10's 2.4–3.0× prior against a junior.
  const specialistFactor = 1 + specializationCount * 0.55;
  return Math.round(profession.baseSalary * multipliers[rank] * specialistFactor);
}

/** True when any need has crossed the mandatory-interrupt threshold. */
export function urgentNeed(needs: NeedLevels, interruptThreshold: number): keyof NeedLevels | null {
  // Checked in a fixed order so two needs crossing on the same tick resolve deterministically.
  if (needs.bladder <= interruptThreshold) {
    return 'bladder';
  }
  if (needs.hunger <= interruptThreshold) {
    return 'hunger';
  }
  if (needs.energy <= interruptThreshold) {
    return 'energy';
  }
  return null;
}

/** States in which a worker is producing value. Used by the metrics layer. */
export function isProductive(state: StaffState): boolean {
  return state === 'working';
}

export function isTravelling(state: StaffState): boolean {
  return state === 'travel_to_job' || state === 'travel_to_amenity';
}

export function isOnNeeds(state: StaffState): boolean {
  return (
    state === 'urgent_need_interrupt' ||
    state === 'travel_to_amenity' ||
    state === 'queue_for_amenity' ||
    state === 'using_amenity'
  );
}

export function isWaiting(state: StaffState): boolean {
  return state === 'waiting_for_station' || state === 'queue_for_amenity';
}

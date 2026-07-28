/**
 * The job system: publication, hard preconditions, scoring, and two-phase reservation.
 *
 * R10's autopsy of autonomous-staff games is specific about what goes wrong: workers thrash between
 * tasks when replanning is too eager, and players lose trust when they cannot see why a choice was
 * made. So every job carries a commitment window, every score keeps its factor breakdown, and every
 * tie falls back to stable IDs.
 *
 * Two-phase reservation, per R10: the job claims its station, then a worker claims the job. Either
 * can be released cleanly without stranding the other.
 */

import type { Staff } from './staff';

export type JobKind = string;

export interface Job {
  readonly id: string;
  readonly kind: JobKind;
  readonly roomId: string;
  readonly stationId: string;
  /** Tick the job entered the queue. Age accrues from here and survives re-queueing. */
  readonly publishedTick: number;
  /** Higher runs first, all else equal. Authored per room type. */
  readonly priority: number;
  /** Ticks of work at speed 1.0. */
  readonly workTicks: number;
  /** Staff id holding this job, or null. */
  readonly claimedBy: string | null;
  /** True once the station is held for this job. */
  readonly stationReserved: boolean;
}

/**
 * Score weights, externalized exactly as R10 specifies.
 *
 * Terms whose subsystems do not exist yet are present with weight 0 and flagged, rather than
 * omitted — so the formula matches the research and turning them on later is a config change.
 */
export interface JobScoreWeights {
  readonly specializationMatch: number;
  readonly rankFit: number;
  /** Deferred: departments do not exist in M1. */
  readonly departmentAssignment: number;
  readonly roomAssignment: number;
  /** Deferred: no per-job player priority control in M1. */
  readonly userPriority: number;
  readonly jobPriority: number;
  readonly agePerTick: number;
  readonly urgencyBonus: number;
  readonly travelPerTick: number;
  /** Deferred: no elevator model in M1, so expected delay is always 0. */
  readonly elevatorPerTick: number;
  readonly needRisk: number;
  readonly preemption: number;
  readonly stationContention: number;
  /** Tilts selection toward long-idle workers so nobody starves. */
  readonly initiative: number;
  /** Damps repeatedly winning work in the same room. */
  readonly repeatRoomPenalty: number;
}

export const DEFERRED_WEIGHTS: readonly (keyof JobScoreWeights)[] = [
  'departmentAssignment',
  'userPriority',
  'elevatorPerTick',
];

/** Every term that contributed, kept so the UI can show why a job was or was not chosen. */
export interface ScoreFactor {
  readonly label: string;
  readonly value: number;
}

export interface ScoredJob {
  readonly job: Job;
  readonly score: number;
  readonly factors: readonly ScoreFactor[];
  readonly travelTicks: number;
}

export interface ScoreInputs {
  readonly staff: Staff;
  readonly job: Job;
  readonly weights: JobScoreWeights;
  readonly tick: number;
  readonly travelTicks: number;
  /** Specialization the station wants, if any. */
  readonly requiredSpecialization: string | null;
  /** How many other eligible workers are already heading to this station. */
  readonly contenders: number;
  /** How close this worker is to a need interrupt, 0..1 where 1 is about to break. */
  readonly needRisk: number;
  /** True when taking this job would abandon a committed one. */
  readonly wouldPreempt: boolean;
}

/**
 * Scores one job for one worker.
 *
 * Assumes eligibility has already been checked — R10 requires hard preconditions to filter the
 * candidate set *before* scoring, so no weight here can rescue an unqualified worker.
 */
export function scoreJob(inputs: ScoreInputs): ScoredJob {
  const { staff, job, weights, tick, travelTicks } = inputs;
  const factors: ScoreFactor[] = [];
  let score = 0;

  const add = (label: string, value: number): void => {
    if (value !== 0) {
      factors.push({ label, value: Math.round(value * 100) / 100 });
      score += value;
    }
  };

  if (inputs.requiredSpecialization !== null && staff.specializations.includes(inputs.requiredSpecialization)) {
    add('specialization match', weights.specializationMatch);
  }

  // Rank fit: seniors are drawn to higher-priority work, juniors to routine work.
  const rankIndex = ['junior', 'regular', 'senior', 'principal'].indexOf(staff.rank);
  add('rank fit', ((rankIndex - 1) * job.priority) / 4 * weights.rankFit);

  if (staff.assignedRoomId === job.roomId) {
    add('assigned to this room', weights.roomAssignment);
  }

  add('job priority', job.priority * weights.jobPriority);
  add('waiting time', (tick - job.publishedTick) * weights.agePerTick);
  add('initiative', (staff.stats.initiative - 1) * weights.initiative);
  add('travel', -travelTicks * weights.travelPerTick);
  add('need risk', -inputs.needRisk * weights.needRisk);

  if (inputs.wouldPreempt) {
    add('would abandon current job', -weights.preemption);
  }
  if (inputs.contenders > 0) {
    add('others already heading there', -inputs.contenders * weights.stationContention);
  }
  if (staff.recentRoomIds.includes(job.roomId)) {
    add('worked here recently', -weights.repeatRoomPenalty);
  }

  return { job, score, factors, travelTicks };
}

/**
 * Picks the best job, breaking ties by stable ID.
 *
 * Determinism depends entirely on this: two jobs with identical scores must always resolve the same
 * way, on every machine, on every replay (I-004).
 */
export function bestJob(candidates: readonly ScoredJob[]): ScoredJob | null {
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
    return candidate.job.id < best.job.id ? candidate : best;
  });
}

/** Phase one: the job takes its station. Fails if another job already holds it. */
export function reserveStation(jobs: readonly Job[], jobId: string): readonly Job[] {
  const target = jobs.find((job) => job.id === jobId);
  if (target === undefined || target.stationReserved) {
    return jobs;
  }
  const stationTaken = jobs.some(
    (job) => job.id !== jobId && job.stationId === target.stationId && job.stationReserved
  );
  if (stationTaken) {
    return jobs;
  }
  return jobs.map((job) => (job.id === jobId ? { ...job, stationReserved: true } : job));
}

/** Phase two: a worker takes the job. Fails if someone else already holds it. */
export function claimJob(jobs: readonly Job[], jobId: string, staffId: string): readonly Job[] {
  const target = jobs.find((job) => job.id === jobId);
  if (target === undefined || target.claimedBy !== null) {
    return jobs;
  }
  return jobs.map((job) => (job.id === jobId ? { ...job, claimedBy: staffId } : job));
}

/**
 * Releases a job back to the queue.
 *
 * Age is preserved — R10 requires that an interrupted job does not go to the back of the line, or
 * unlucky work starves forever.
 */
export function releaseJob(jobs: readonly Job[], jobId: string): readonly Job[] {
  return jobs.map((job) =>
    job.id === jobId ? { ...job, claimedBy: null, stationReserved: false } : job
  );
}

export function removeJob(jobs: readonly Job[], jobId: string): readonly Job[] {
  return jobs.filter((job) => job.id !== jobId);
}

/** Jobs nobody holds. */
export function openJobs(jobs: readonly Job[]): readonly Job[] {
  return jobs.filter((job) => job.claimedBy === null);
}

export function jobOf(jobs: readonly Job[], staffId: string): Job | undefined {
  return jobs.find((job) => job.claimedBy === staffId);
}

/** True when a station is held by any job. */
export function stationBusy(jobs: readonly Job[], stationId: string): boolean {
  return jobs.some((job) => job.stationId === stationId && job.stationReserved);
}

/** How many workers are en route to a station, for the contention penalty. */
export function contendersFor(staff: readonly Staff[], stationId: string): number {
  return staff.filter((worker) => worker.reservation?.stationId === stationId).length;
}

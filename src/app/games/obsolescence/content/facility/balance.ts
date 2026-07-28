/**
 * Externalized balance — R10's provisional priors.
 *
 * Every value here is a default, not a decision. R10 is explicit that these are synthesis rather
 * than measured history, and the directive requires them externalized immediately for sweeps and
 * replays. Scenarios override any subset.
 *
 * Where a value is deliberately NOT adopted, it is still recorded with the reason, so the next
 * milestone does not have to rediscover why.
 */

import { DEFAULT_DECAY, DEFAULT_THRESHOLDS, DEFAULT_RANK_MULTIPLIER } from '../../sim/index';
import type { FacilityConfig, JobScoreWeights } from '../../sim/index';

/**
 * Job-score weights, exactly as R10 specifies them.
 *
 * Three terms are zero because their subsystems do not exist in M1. They are kept in the table
 * rather than deleted so enabling them later is a config change, not a code change — and so the
 * formula visibly matches the research.
 */
export const JOB_WEIGHTS: JobScoreWeights = {
  specializationMatch: 40,
  rankFit: 12,
  departmentAssignment: 0, // DEFERRED — no departments in M1.
  roomAssignment: 8,
  userPriority: 0, // DEFERRED — no per-job player priority in M1.
  jobPriority: 30,
  agePerTick: 0.4,
  urgencyBonus: 0,
  travelPerTick: 0.15,
  elevatorPerTick: 0, // DEFERRED — no elevator model in M1, so expected delay is always 0.
  needRisk: 18,
  preemption: 60,
  stationContention: 25,
  initiative: 6,
  repeatRoomPenalty: 4,
};

export const FACILITY_CONFIG: FacilityConfig = {
  thresholds: DEFAULT_THRESHOLDS,
  decay: DEFAULT_DECAY,
  weights: JOB_WEIGHTS,
  rankMultiplier: DEFAULT_RANK_MULTIPLIER,
  // R10: "once staff commit to a nontrivial job, do not permit preemption unless a higher-priority
  // emergency clears a meaningful score delta." 40 ticks is 4 seconds of simulated time.
  commitmentTicks: 40,
  recentRoomMemory: 2,
  researchJobTicks: 90,
  productionJobTicks: 55,
};

/**
 * Healthy bands from R10's BALANCE-PRIORS, used by the scenario runner to flag drift.
 *
 * These are reporting bands, not assertions — the directive says not to tune until every scenario
 * passes structurally, so scenarios report against these rather than failing on them.
 */
export const HEALTHY_BANDS = {
  productiveTimeShare: { target: 0.58, range: [0.5, 0.65] },
  walkingTimeShare: { target: 0.16, range: [0.1, 0.22] },
  needsTimeShare: { target: 0.12, range: [0.08, 0.18] },
  idleTimeShare: { target: 0.08, range: [0.03, 0.15] },
  waitingTimeShare: { target: 0.06, range: [0.03, 0.12] },
  supportSpaceShare: { target: 0.23, range: [0.18, 0.28] },
} as const;

/** R10's no-thrash gate: fewer than 5% of jobs abandoned before reaching the first station. */
export const NO_THRASH_THRESHOLD = 0.05;

/**
 * R10 priors recorded but NOT adopted in M1, with the reason.
 *
 * Kept in code rather than prose so the next milestone finds them where it needs them.
 */
export const DEFERRED_PRIORS = {
  quarterDurationMinutesAt1x: {
    r10Value: 24,
    adopted: false,
    reason:
      'The existing five-stage ladder runs 60-180s and was tuned against a 200-seed sweep and ' +
      'validated by playtest. Adopting 24 minutes would invalidate that and make every scenario ' +
      'fixture take 24 minutes to run. Revisit with the economy milestone.',
  },
  personnelCarCapacity: {
    r10Value: 8,
    adopted: false,
    reason: 'No elevator model in M1. The personnel core is a fixed traversal cost per floor.',
  },
  activeMachinesPerMaintenanceWorker: {
    r10Value: 12,
    adopted: false,
    reason: 'Machines, wear and maintenance are deferred by the directive.',
  },
  specialistSalaryVsJunior: {
    r10Value: 2.6,
    adopted: true,
    reason: 'Adopted via rank multipliers plus a per-specialization factor in salaryFor().',
  },
} as const;

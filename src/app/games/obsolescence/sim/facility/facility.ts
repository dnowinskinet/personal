/**
 * The facility: rooms, staff, jobs and needs advanced one deterministic tick at a time.
 *
 * Everything here is pure. Staff are iterated in stable-ID order, every tie breaks on ID, and no
 * wall clock or ambient randomness is consulted (I-004, I-006). The same seed and the same command
 * sequence produce byte-identical state.
 *
 * The tick order matters and is fixed: decay needs, resolve urgent needs, advance travel, advance
 * amenity use, advance work, then let idle staff seek jobs. Doing job-seeking last means a worker
 * who finished this tick is available on the next one, never twice in the same tick.
 */

import { randomAt } from '../rng';
import { blocker, type Blocker } from './explain';
import { horizontalDistance, type Cell } from './grid';
import {
  bestJob,
  claimJob,
  contendersFor,
  jobOf,
  openJobs,
  releaseJob,
  removeJob,
  reserveStation,
  scoreJob,
  stationBusy,
  type Job,
  type JobScoreWeights,
  type ScoredJob,
} from './jobs';
import {
  chooseAmenity,
  decayNeeds,
  dequeue,
  enqueue,
  needEfficiency,
  needRisk,
  pressingNeed,
  queueFor,
  restore,
  scoreAmenity,
  servedBy,
  type AmenityQueues,
  type NeedDecayRates,
  type NeedThresholds,
  decayJitter,} from './needs';
import {
  doorCell,
  objectDefinition,
  roomAmenities,
  roomQuality,
  roomQualityFactor,
  roomStations,
  stationAccessCell,
  validateRoom,
  type FacilityContent,
  type Room,
} from './rooms';
import {
  checkEligibility,
  isOnNeeds,
  isProductive,
  isTravelling,
  isWaiting,
  workQuality,
  workSpeed,
  type Rank,
  type Staff,
} from './staff';
import { estimateTravel, findPath, invalidate, type Topology } from './topology';

/** Everything tunable, externalized per R10. Scenarios override any of it. */
export interface FacilityConfig {
  readonly thresholds: NeedThresholds;
  readonly decay: NeedDecayRates;
  readonly weights: JobScoreWeights;
  readonly rankMultiplier: Readonly<Record<Rank, number>>;
  /** Minimum ticks a claimed job may not be abandoned for non-urgent reasons. */
  readonly commitmentTicks: number;
  /** How many recent rooms are remembered for the repeat-room damper. */
  readonly recentRoomMemory: number;
  /** Ticks of work one research job represents. */
  readonly researchJobTicks: number;
  readonly productionJobTicks: number;
}

/** What the facility has produced, consumed by the existing product payoff. */
export interface FacilityOutput {
  readonly researchPoints: number;
  /** Completed parts, tagged by the job kind that made them and the quality achieved. */
  readonly parts: readonly { kind: string; tag: string | null; quality: number; tick: number }[];
}

/** Time accounting, per R10's required metrics. */
export interface TimeShares {
  readonly productive: number;
  readonly walking: number;
  readonly needs: number;
  readonly waiting: number;
  readonly idle: number;
}

export interface FacilityState {
  readonly tick: number;
  readonly seed: number;
  readonly rooms: readonly Room[];
  readonly staff: readonly Staff[];
  readonly jobs: readonly Job[];
  readonly queues: AmenityQueues;
  readonly topology: Topology;
  readonly output: FacilityOutput;
  /** Accumulated staff-ticks per category, for time shares. */
  readonly accounting: TimeShares;
  /** Blocker per staff id — cleared and recomputed each tick. */
  readonly blockers: Readonly<Record<string, Blocker | null>>;
  /** Last scored candidate set per staff id, for the dev overlay. */
  readonly lastScores: Readonly<Record<string, readonly ScoredJob[]>>;
  readonly log: readonly string[];
}

const EMPTY_SHARES: TimeShares = { productive: 0, walking: 0, needs: 0, waiting: 0, idle: 0 };

export function createFacility(
  rooms: readonly Room[],
  staff: readonly Staff[],
  topology: Topology,
  seed: number
): FacilityState {
  return {
    tick: 0,
    seed,
    rooms: [...rooms].sort((left, right) => (left.id < right.id ? -1 : 1)),
    staff: [...staff].sort((left, right) => (left.id < right.id ? -1 : 1)),
    jobs: [],
    queues: {},
    topology,
    output: { researchPoints: 0, parts: [] },
    accounting: EMPTY_SHARES,
    blockers: {},
    lastScores: {},
    log: [],
  };
}

/** Valid rooms only — an invalid room publishes no work at all. */
function validRooms(state: FacilityState, content: FacilityContent): readonly Room[] {
  return state.rooms.filter(
    (room) => validateRoom(room, content, state.rooms, state.topology.levels).valid
  );
}

/**
 * Publishes one job per free station in every valid room.
 *
 * Jobs are only created when the station is actually free, so the queue never fills with work that
 * cannot start — which is what makes "no open station" a room-level statement rather than a lie.
 */
function publishJobs(state: FacilityState, content: FacilityContent, config: FacilityConfig): readonly Job[] {
  let jobs = state.jobs;
  for (const room of validRooms(state, content)) {
    for (const { stationId, object } of roomStations(room, content)) {
      if (object.jobKind === null) {
        continue;
      }
      const existing = jobs.some((job) => job.stationId === stationId);
      if (existing) {
        continue;
      }
      jobs = [
        ...jobs,
        {
          id: `job:${stationId}:${state.tick}`,
          kind: object.jobKind,
          roomId: room.id,
          stationId,
          publishedTick: state.tick,
          priority: object.jobKind === 'research' ? 2 : 1,
          workTicks: object.jobKind === 'research' ? config.researchJobTicks : config.productionJobTicks,
          claimedBy: null,
          stationReserved: false,
        },
      ];
    }
  }
  return jobs;
}

function roomOf(state: FacilityState, roomId: string): Room | undefined {
  return state.rooms.find((room) => room.id === roomId);
}

function stationObject(state: FacilityState, content: FacilityContent, stationId: string) {
  const [roomId] = stationId.split('#');
  const room = roomOf(state, roomId);
  if (room === undefined) {
    return null;
  }
  const station = roomStations(room, content).find((entry) => entry.stationId === stationId);
  return station === undefined ? null : { room, object: station.object };
}

/** Advances one worker. Returns the updated worker plus any state the tick must fold back in. */
interface StepResult {
  readonly staff: Staff;
  readonly jobs: readonly Job[];
  readonly queues: AmenityQueues;
  readonly output: FacilityOutput;
  readonly blocker: Blocker | null;
  readonly scores: readonly ScoredJob[];
  readonly category: keyof TimeShares;
}

function stepStaff(
  worker: Staff,
  state: FacilityState,
  content: FacilityContent,
  config: FacilityConfig,
  jobs: readonly Job[],
  queues: AmenityQueues,
  output: FacilityOutput
): StepResult {
  const tick = state.tick;
  const busy = worker.state !== 'idle';
  let needs = decayNeeds(
    worker.needs,
    config.decay,
    busy,
    worker.stats.endurance,
    decayJitter(state.seed, worker.id, randomAt)
  );
  let current: Staff = { ...worker, needs };
  let nextJobs = jobs;
  let nextQueues = queues;
  let nextOutput = output;
  const blockerValue: Blocker | null = null;
  let scores: readonly ScoredJob[] = [];

  // --- 1. urgent needs pre-empt everything except an already-running recovery ---------------
  const pressing = pressingNeed(needs, config.thresholds);
  if (pressing !== null && !isOnNeeds(current.state)) {
    // Store a resume token so the same job can be picked back up (R10).
    const held = jobOf(nextJobs, current.id);
    const resume =
      held === undefined
        ? null
        : { jobId: held.id, stationId: held.stationId, progressTicks: current.progressTicks };
    if (held !== undefined) {
      nextJobs = releaseJob(nextJobs, held.id);
    }

    const candidates = state.rooms.flatMap((room) =>
      roomAmenities(room, content)
        .filter((entry) => entry.object.restoresNeed === pressing)
        .map((entry) => {
          const travel = estimateTravel(state.topology, current.location, doorCell(room));
          return {
            amenityId: entry.amenityId,
            roomId: room.id,
            travelTicks: travel,
            queueLength: queueFor(nextQueues, entry.amenityId).length,
            score: scoreAmenity(
              travel,
              queueFor(nextQueues, entry.amenityId).length,
              roomQuality(room, content),
              1 - needs[pressing]
            ),
          };
        })
        .filter((entry) => Number.isFinite(entry.travelTicks))
    );

    const chosen = chooseAmenity(candidates);
    if (chosen === null) {
      return {
        staff: {
          ...current,
          state: 'urgent_need_interrupt',
          reservation: null,
          resumeToken: resume,
          progressTicks: 0,
          blocker: 'No reachable facility for this need',
          lastStateChangeTick: tick,
        },
        jobs: nextJobs,
        queues: nextQueues,
        output: nextOutput,
        blocker: blocker('no-amenity-reachable', `needs ${pressing}`),
        scores,
        category: 'needs',
      };
    }

    const room = roomOf(state, chosen.roomId);
    const path = room === undefined ? null : findPath(state.topology, current.location, doorCell(room));
    return {
      staff: {
        ...current,
        state: 'travel_to_amenity',
        reservation: null,
        resumeToken: resume,
        progressTicks: 0,
        amenityId: chosen.amenityId,
        pathCells: path?.cells ?? [],
        busyTicks: path?.cost ?? 0,
        blocker: null,
        lastStateChangeTick: tick,
      },
      jobs: nextJobs,
      queues: nextQueues,
      output: nextOutput,
      blocker: blocker('urgent-need', `${pressing} is critical`),
      scores,
      category: 'needs',
    };
  }

  // --- 2. travel ---------------------------------------------------------------------------
  if (isTravelling(current.state)) {
    const remaining = current.busyTicks - 1;
    if (remaining > 0) {
      return {
        staff: { ...current, busyTicks: remaining },
        jobs: nextJobs,
        queues: nextQueues,
        output: nextOutput,
        blocker: null,
        scores,
        category: current.state === 'travel_to_amenity' ? 'needs' : 'walking',
      };
    }

    const destination = current.pathCells[current.pathCells.length - 1] ?? current.location;
    if (current.state === 'travel_to_amenity') {
      nextQueues = enqueue(nextQueues, current.amenityId ?? '', current.id);
      return {
        staff: {
          ...current,
          state: 'queue_for_amenity',
          location: destination,
          pathCells: [],
          busyTicks: 0,
          lastStateChangeTick: tick,
        },
        jobs: nextJobs,
        queues: nextQueues,
        output: nextOutput,
        blocker: blocker('amenity-queue'),
        scores,
        category: 'needs',
      };
    }

    return {
      staff: {
        ...current,
        state: 'working',
        location: destination,
        pathCells: [],
        busyTicks: 0,
        lastStateChangeTick: tick,
      },
      jobs: nextJobs,
      queues: nextQueues,
      output: nextOutput,
      blocker: null,
      scores,
      category: 'walking',
    };
  }

  // --- 3. amenity queue and use --------------------------------------------------------------
  if (current.state === 'queue_for_amenity') {
    const amenityId = current.amenityId ?? '';
    const [roomId] = amenityId.split('#');
    const room = roomOf(state, roomId);
    const amenity = room === undefined
      ? undefined
      : roomAmenities(room, content).find((entry) => entry.amenityId === amenityId);
    const slots = amenity?.object.slots ?? 1;
    const served = servedBy(nextQueues, amenityId, slots);

    if (served.includes(current.id) && amenity !== undefined) {
      return {
        staff: {
          ...current,
          state: 'using_amenity',
          busyTicks: amenity.object.useTicks,
          lastStateChangeTick: tick,
        },
        jobs: nextJobs,
        queues: nextQueues,
        output: nextOutput,
        blocker: null,
        scores,
        category: 'needs',
      };
    }

    return {
      staff: current,
      jobs: nextJobs,
      queues: nextQueues,
      output: nextOutput,
      blocker: blocker('amenity-queue', `${queueFor(nextQueues, amenityId).indexOf(current.id) + 1} in line`),
      scores,
      category: 'waiting',
    };
  }

  if (current.state === 'using_amenity') {
    const amenityId = current.amenityId ?? '';
    const [roomId] = amenityId.split('#');
    const room = roomOf(state, roomId);
    const amenity = room === undefined
      ? undefined
      : roomAmenities(room, content).find((entry) => entry.amenityId === amenityId);

    if (amenity?.object.restoresNeed != null) {
      needs = restore(needs, amenity.object.restoresNeed, amenity.object.restorePerTick);
      current = { ...current, needs };
    }

    const remaining = current.busyTicks - 1;
    if (remaining > 0) {
      return {
        staff: { ...current, busyTicks: remaining },
        jobs: nextJobs,
        queues: nextQueues,
        output: nextOutput,
        blocker: null,
        scores,
        category: 'needs',
      };
    }

    nextQueues = dequeue(nextQueues, amenityId, current.id);
    // Try to resume the interrupted job if it is still there and unclaimed (R10 resume token).
    const token = current.resumeToken;
    const stillOpen =
      token !== null && nextJobs.find((job) => job.id === token.jobId && job.claimedBy === null);
    if (token !== null && stillOpen !== undefined && stillOpen !== null) {
      nextJobs = claimJob(reserveStation(nextJobs, token.jobId), token.jobId, current.id);
      const target = stationObject(state, content, token.stationId);
      const path = target === null
        ? null
        : findPath(state.topology, current.location, stationAccessCell(target.room));
      return {
        staff: {
          ...current,
          state: 'travel_to_job',
          amenityId: null,
          resumeToken: null,
          progressTicks: token.progressTicks,
          pathCells: path?.cells ?? [],
          busyTicks: Math.max(1, path?.cost ?? 1),
          reservation: {
            jobId: token.jobId,
            stationId: token.stationId,
            committedUntilTick: tick + config.commitmentTicks,
          },
          lastStateChangeTick: tick,
        },
        jobs: nextJobs,
        queues: nextQueues,
        output: nextOutput,
        blocker: null,
        scores,
        category: 'needs',
      };
    }

    return {
      staff: {
        ...current,
        state: 'idle',
        amenityId: null,
        resumeToken: null,
        progressTicks: 0,
        lastStateChangeTick: tick,
      },
      jobs: nextJobs,
      queues: nextQueues,
      output: nextOutput,
      blocker: null,
      scores,
      category: 'needs',
    };
  }

  // --- 4. working ----------------------------------------------------------------------------
  if (current.state === 'working') {
    const held = jobOf(nextJobs, current.id);
    if (held === undefined) {
      return {
        staff: { ...current, state: 'idle', reservation: null, progressTicks: 0, lastStateChangeTick: tick },
        jobs: nextJobs,
        queues: nextQueues,
        output: nextOutput,
        blocker: blocker('nothing-to-do'),
        scores,
        category: 'idle',
      };
    }

    const speed =
      workSpeed(current, config.rankMultiplier) * needEfficiency(needs, config.thresholds);
    const progress = current.progressTicks + speed;

    if (progress >= held.workTicks) {
      const station = stationObject(state, content, held.stationId);
      const producedTag = station?.object.outputTag ?? null;
      // Room fit-out modulates the result, so layout is a productivity decision and not just decor.
      const quality =
        workQuality(current, config.rankMultiplier) *
        (station === null ? 1 : roomQualityFactor(station.room, content));
      nextOutput =
        held.kind === 'research'
          ? { ...nextOutput, researchPoints: nextOutput.researchPoints + quality }
          : {
              ...nextOutput,
              parts: [...nextOutput.parts, { kind: held.kind, tag: producedTag, quality, tick }],
            };
      nextJobs = removeJob(nextJobs, held.id);
      const recent = [held.roomId, ...current.recentRoomIds].slice(0, config.recentRoomMemory);
      return {
        staff: {
          ...current,
          state: 'idle',
          reservation: null,
          progressTicks: 0,
          recentRoomIds: recent,
          lastStateChangeTick: tick,
        },
        jobs: nextJobs,
        queues: nextQueues,
        output: nextOutput,
        blocker: null,
        scores,
        category: 'productive',
      };
    }

    return {
      staff: { ...current, progressTicks: progress },
      jobs: nextJobs,
      queues: nextQueues,
      output: nextOutput,
      blocker: null,
      scores,
      category: 'productive',
    };
  }

  // --- 5. idle: look for work ----------------------------------------------------------------
  const candidates: ScoredJob[] = [];
  let sawIneligible: Blocker | null = null;

  for (const job of openJobs(nextJobs)) {
    const target = stationObject(state, content, job.stationId);
    if (target === null) {
      continue;
    }
    const eligibility = checkEligibility(current, target.object, target.room.id, content.professionNames);
    if (!eligibility.eligible) {
      if (sawIneligible === null) {
        sawIneligible = blocker(
          eligibility.failure === 'not-assigned-to-this-room' ? 'not-assigned' : 'no-qualified-staff',
          eligibility.reason
        );
      }
      continue;
    }
    if (stationBusy(nextJobs, job.stationId) && job.claimedBy !== current.id) {
      continue;
    }

    const travel = estimateTravel(state.topology, current.location, stationAccessCell(target.room));
    if (!Number.isFinite(travel)) {
      continue;
    }

    candidates.push(
      scoreJob({
        staff: current,
        job,
        weights: config.weights,
        tick,
        travelTicks: travel,
        requiredSpecialization: target.object.requiredSpecialization,
        contenders: contendersFor(state.staff, job.stationId),
        needRisk: needRisk(needs, config.thresholds),
        wouldPreempt: false,
      })
    );
  }

  scores = [...candidates].sort((left, right) => right.score - left.score).slice(0, 5);
  const choice = bestJob(candidates);

  if (choice === null) {
    return {
      staff: { ...current, state: 'idle', blocker: null },
      jobs: nextJobs,
      queues: nextQueues,
      output: nextOutput,
      blocker: sawIneligible ?? blocker('nothing-to-do'),
      scores,
      category: 'idle',
    };
  }

  nextJobs = claimJob(reserveStation(nextJobs, choice.job.id), choice.job.id, current.id);
  const target = stationObject(state, content, choice.job.stationId);
  const path =
    target === null ? null : findPath(state.topology, current.location, stationAccessCell(target.room));

  return {
    staff: {
      ...current,
      state: 'travel_to_job',
      reservation: {
        jobId: choice.job.id,
        stationId: choice.job.stationId,
        committedUntilTick: tick + config.commitmentTicks,
      },
      pathCells: path?.cells ?? [],
      busyTicks: Math.max(1, path?.cost ?? 1),
      progressTicks: 0,
      blocker: null,
      lastStateChangeTick: tick,
    },
    jobs: nextJobs,
    queues: nextQueues,
    output: nextOutput,
    blocker: null,
    scores,
    category: 'walking',
  };
}

/** Advances the whole facility by one tick. */
export function tickFacility(
  state: FacilityState,
  content: FacilityContent,
  config: FacilityConfig
): FacilityState {
  let jobs = publishJobs(state, content, config);
  let queues = state.queues;
  let output = state.output;
  const staff: Staff[] = [];
  const blockers: Record<string, Blocker | null> = {};
  const lastScores: Record<string, readonly ScoredJob[]> = {};
  const accounting = { ...state.accounting };

  // Stable-ID order. Deterministic replay depends on this and nothing else.
  for (const worker of state.staff) {
    const result = stepStaff(worker, state, content, config, jobs, queues, output);
    staff.push(result.staff);
    jobs = result.jobs;
    queues = result.queues;
    output = result.output;
    blockers[worker.id] = result.blocker;
    lastScores[worker.id] = result.scores;
    accounting[result.category] += 1;
  }

  return {
    ...state,
    tick: state.tick + 1,
    staff,
    jobs,
    queues,
    output,
    accounting,
    blockers,
    lastScores,
  };
}

/**
 * Applies a construction change and rebuilds topology.
 *
 * Every plan computed against the old generation is cancelled here rather than being allowed to
 * complete against stale geometry — R10 requires topology edits to invalidate affected plans, and
 * silently letting them finish is the classic source of staff walking through demolished walls.
 */
export function applyConstruction(state: FacilityState, rooms: readonly Room[]): FacilityState {
  const topology = invalidate(state.topology, state.topology.levels);
  const staff = state.staff.map((worker) =>
    worker.state === 'travel_to_job' || worker.state === 'travel_to_amenity'
      ? {
          ...worker,
          state: 'blocked_repath' as const,
          pathCells: [],
          busyTicks: 0,
          reservation: null,
          amenityId: null,
        }
      : worker
  );
  const jobs = state.jobs
    .filter((job) => rooms.some((room) => room.id === job.roomId))
    .map((job) =>
      staff.some((worker) => worker.id === job.claimedBy && worker.state === 'blocked_repath')
        ? { ...job, claimedBy: null, stationReserved: false }
        : job
    );

  return {
    ...state,
    rooms: [...rooms].sort((left, right) => (left.id < right.id ? -1 : 1)),
    topology,
    staff,
    jobs,
    log: [...state.log, `Construction changed at tick ${state.tick}; ${staff.length} plans revalidated.`],
  };
}

/** Time shares as fractions, for metrics and the overlay. */
export function timeShares(state: FacilityState): TimeShares {
  const total =
    state.accounting.productive +
    state.accounting.walking +
    state.accounting.needs +
    state.accounting.waiting +
    state.accounting.idle;
  if (total === 0) {
    return EMPTY_SHARES;
  }
  return {
    productive: state.accounting.productive / total,
    walking: state.accounting.walking / total,
    needs: state.accounting.needs / total,
    waiting: state.accounting.waiting / total,
    idle: state.accounting.idle / total,
  };
}

export { horizontalDistance, objectDefinition, randomAt };
export type { Cell };

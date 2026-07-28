/**
 * Headless scenario runner and metrics reporter.
 *
 * R10 puts this before broad content expansion for a reason: the genre's failures are invisible
 * blockers and dead air, and neither shows up unless you measure. The runner reports; it does not
 * assert bands, because the directive says not to tune until every scenario passes structurally.
 */

import {
  applyConstruction,
  buildTopology,
  createFacility,
  roomStations,
  roomType,
  spanWidth,
  tickFacility,
  timeShares,
  validateRoom,
  DEFAULT_TRAVEL_COSTS,
  type FacilityConfig,
  type FacilityContent,
  type FacilityState,
  type TimeShares,
} from '../sim/index';
import { FACILITY_CONFIG, HEALTHY_BANDS } from '../content/facility/balance';
import { FACILITY_CONTENT } from '../content/facility/catalogue';
import { SCENARIOS, type Scenario } from '../content/facility/scenarios';

export interface ScenarioMetrics {
  readonly id: string;
  readonly name: string;
  readonly ticks: number;
  readonly shares: TimeShares;
  readonly researchPoints: number;
  readonly partsProduced: number;
  readonly outputPerStaffHour: number;
  /** Ticks staff spent queueing for an amenity, as a share of all needs time. */
  readonly amenityQueueShare: number;
  readonly averageAmenityQueueLength: number;
  /** Share of claimed jobs abandoned before reaching the first station. R10's no-thrash gate. */
  readonly abandonBeforeStation: number;
  readonly roomUtilization: number;
  readonly specialistUtilization: number;
  readonly supportSpaceShare: number;
  /** Distinct blocker codes seen, with counts. Every one must be explainable. */
  readonly blockerCounts: Readonly<Record<string, number>>;
  readonly invalidRooms: readonly string[];
  readonly staffEverProductive: number;
  readonly staffCount: number;
}

export interface RunOptions {
  readonly content?: FacilityContent;
  readonly config?: FacilityConfig;
}

/** Runs one scenario to completion and reports metrics. Pure and deterministic. */
export function runScenario(scenario: Scenario, options: RunOptions = {}): ScenarioMetrics {
  const content = options.content ?? FACILITY_CONTENT;
  const config = options.config ?? FACILITY_CONFIG;
  const topology = buildTopology(scenario.levels, DEFAULT_TRAVEL_COSTS);

  let state = createFacility(scenario.rooms, scenario.staff, topology, scenario.seed);

  const blockerCounts: Record<string, number> = {};
  const productiveStaff = new Set<string>();
  let queueTicks = 0;
  let queueLengthSum = 0;
  let queueSamples = 0;
  let claims = 0;
  let abandons = 0;
  const claimedButNotArrived = new Map<string, string>();

  for (let step = 0; step < scenario.ticks; step += 1) {
    if (scenario.editAtTick === step && scenario.roomsAfterEdit !== undefined) {
      state = applyConstruction(state, scenario.roomsAfterEdit);
    }

    const before = new Map(state.staff.map((worker) => [worker.id, worker]));
    state = tickFacility(state, content, config);

    for (const worker of state.staff) {
      const blocker = state.blockers[worker.id];
      if (blocker != null) {
        blockerCounts[blocker.code] = (blockerCounts[blocker.code] ?? 0) + 1;
      }
      if (worker.state === 'working') {
        productiveStaff.add(worker.id);
      }
      if (worker.state === 'queue_for_amenity') {
        queueTicks += 1;
      }

      // A claim that never reached its station counts as a thrash, unless a need or a topology
      // change caused it — which is exactly R10's carve-out.
      const previous = before.get(worker.id);
      if (previous !== undefined) {
        if (previous.reservation === null && worker.reservation !== null) {
          claims += 1;
          claimedButNotArrived.set(worker.id, worker.reservation.jobId);
        }
        const pending = claimedButNotArrived.get(worker.id);
        if (pending !== undefined) {
          if (worker.state === 'working') {
            claimedButNotArrived.delete(worker.id);
          } else if (
            worker.reservation === null &&
            worker.state !== 'urgent_need_interrupt' &&
            worker.state !== 'travel_to_amenity' &&
            worker.state !== 'blocked_repath'
          ) {
            abandons += 1;
            claimedButNotArrived.delete(worker.id);
          } else if (worker.reservation === null) {
            claimedButNotArrived.delete(worker.id);
          }
        }
      }
    }

    for (const queue of Object.values(state.queues)) {
      queueLengthSum += queue.length;
      queueSamples += 1;
    }
  }

  const shares = timeShares(state);
  const staffCount = Math.max(1, state.staff.length);
  const staffHours = (scenario.ticks * staffCount) / 3600;
  const parts = state.output.parts.length;

  // Room utilization: share of station-ticks that had someone working them.
  const stationCount = state.rooms.reduce(
    (total, room) => total + roomStations(room, content).length,
    0
  );
  const roomUtilization =
    stationCount === 0 ? 0 : Math.min(1, (state.accounting.productive / scenario.ticks) / stationCount);

  const specialists = state.staff.filter((worker) => worker.specializations.length > 0);
  const specialistUtilization =
    specialists.length === 0
      ? 0
      : specialists.filter((worker) => productiveStaff.has(worker.id)).length / specialists.length;

  const builtCells = state.rooms.reduce((total, room) => total + spanWidth(room.span), 0);
  const supportCells = state.rooms.reduce((total, room) => {
    const definition = roomType(content, room.typeId);
    return total + (definition?.isSupport === true ? spanWidth(room.span) : 0);
  }, 0);

  const invalidRooms = state.rooms
    .filter((room) => !validateRoom(room, content, state.rooms, state.topology.levels).valid)
    .map((room) => room.id);

  return {
    id: scenario.id,
    name: scenario.name,
    ticks: scenario.ticks,
    shares,
    researchPoints: Math.round(state.output.researchPoints * 10) / 10,
    partsProduced: parts,
    outputPerStaffHour: Math.round(((parts + state.output.researchPoints / 20) / staffHours) * 100) / 100,
    amenityQueueShare:
      state.accounting.needs === 0 ? 0 : Math.round((queueTicks / state.accounting.needs) * 1000) / 1000,
    averageAmenityQueueLength:
      queueSamples === 0 ? 0 : Math.round((queueLengthSum / queueSamples) * 100) / 100,
    abandonBeforeStation: claims === 0 ? 0 : Math.round((abandons / claims) * 1000) / 1000,
    roomUtilization: Math.round(roomUtilization * 1000) / 1000,
    specialistUtilization: Math.round(specialistUtilization * 1000) / 1000,
    supportSpaceShare: builtCells === 0 ? 0 : Math.round((supportCells / builtCells) * 1000) / 1000,
    blockerCounts,
    invalidRooms,
    staffEverProductive: productiveStaff.size,
    staffCount: state.staff.length,
  };
}

export function runAllScenarios(options: RunOptions = {}): readonly ScenarioMetrics[] {
  return SCENARIOS.map((scenario) => runScenario(scenario, options));
}

/** Whether a share sits inside R10's healthy band. Reporting only — never an assertion. */
export function withinBand(value: number, band: { readonly range: readonly number[] }): boolean {
  return value >= band.range[0] && value <= band.range[1];
}

/** One line per scenario, for the CLI. */
export function formatMetrics(metrics: ScenarioMetrics): string {
  const pct = (value: number): string => `${(value * 100).toFixed(0)}%`;
  const flag = (value: number, band: { readonly range: readonly number[] }): string =>
    withinBand(value, band) ? ' ' : '*';

  return [
    metrics.id.padEnd(24),
    `prod ${pct(metrics.shares.productive).padStart(4)}${flag(metrics.shares.productive, HEALTHY_BANDS.productiveTimeShare)}`,
    `walk ${pct(metrics.shares.walking).padStart(4)}${flag(metrics.shares.walking, HEALTHY_BANDS.walkingTimeShare)}`,
    `needs ${pct(metrics.shares.needs).padStart(4)}${flag(metrics.shares.needs, HEALTHY_BANDS.needsTimeShare)}`,
    `wait ${pct(metrics.shares.waiting).padStart(4)}`,
    `idle ${pct(metrics.shares.idle).padStart(4)}`,
    `parts ${String(metrics.partsProduced).padStart(3)}`,
    `rp ${String(Math.round(metrics.researchPoints)).padStart(4)}`,
    `thrash ${pct(metrics.abandonBeforeStation).padStart(4)}`,
    `spec ${pct(metrics.specialistUtilization).padStart(4)}`,
  ].join('  ');
}

/** Machine-readable export for sweeps and regression comparison. */
export function metricsAsJson(all: readonly ScenarioMetrics[]): string {
  return JSON.stringify(all, null, 2);
}

export { SCENARIOS };
export type { FacilityState };

/**
 * Deterministic scenario fixtures.
 *
 * These are the ten the directive requires, mapped onto R10's S01–S09 numbering where they
 * correspond. Every one is seeded, fixed-layout, and replayable; the runner reports metrics rather
 * than asserting bands, because the directive says not to tune until everything passes structurally.
 */

import {
  buildTopology,
  fullNeeds,
  DEFAULT_TRAVEL_COSTS,
  type Rank,
  type Room,
  type Staff,
} from '../../sim/index';
import { PROFESSIONS } from './catalogue';

export interface Scenario {
  readonly id: string;
  readonly name: string;
  /** What this fixture is supposed to demonstrate. */
  readonly asks: string;
  readonly seed: number;
  readonly ticks: number;
  readonly levels: readonly number[];
  readonly rooms: readonly Room[];
  readonly staff: readonly Staff[];
  /** Applied partway through, for the topology-edit fixture. */
  readonly editAtTick?: number;
  readonly roomsAfterEdit?: readonly Room[];
}

let counter = 0;

/** Deterministic staff factory. IDs are sequential and stable within a scenario definition. */
function person(
  profession: string,
  rank: Rank,
  options: {
    readonly id?: string;
    readonly specializations?: readonly string[];
    readonly level?: number;
    readonly x?: number;
    readonly assignedRoomId?: string | null;
  } = {}
): Staff {
  counter += 1;
  const definition = PROFESSIONS.find((entry) => entry.id === profession);
  const id = options.id ?? `s${String(counter).padStart(3, '0')}`;
  return {
    id,
    name: `${definition?.name ?? profession} ${id}`,
    profession,
    rank,
    specializations: options.specializations ?? [],
    stats: { proficiency: 1, precision: 1, endurance: 1, initiative: 1 },
    traits: [],
    salaryPerQuarter: definition?.baseSalary ?? 3000,
    hireCost: 0,
    assignedRoomId: options.assignedRoomId ?? null,
    state: 'idle',
    location: { level: options.level ?? 1, x: options.x ?? 3 },
    needs: fullNeeds(),
    reservation: null,
    resumeToken: null,
    progressTicks: 0,
    busyTicks: 0,
    pathCells: [],
    amenityId: null,
    blocker: null,
    lastStateChangeTick: 0,
    recentRoomIds: [],
  };
}

function room(id: string, typeId: string, level: number, from: number, to: number, objects: readonly string[]): Room {
  return { id, typeId, level, span: { from, to }, objects };
}

const LAB = (id: string, from: number, to: number, objects = ['lab-bench']): Room =>
  room(id, 'research-lab', 1, from, to, objects);
const SHOP = (id: string, from: number, to: number, objects = ['assembly-bench']): Room =>
  room(id, 'production-workshop', -1, from, to, objects);
const WC = (id: string, level: number, from: number, to: number, stalls = 1): Room =>
  room(id, 'restroom', level, from, to, Array.from({ length: stalls }, () => 'stall'));
const BREAK = (id: string, level: number, from: number, to: number): Room =>
  room(id, 'break-room', level, from, to, ['canteen-counter', 'rest-couch']);

const LEVELS = [1, 0, -1];

export const SCENARIOS: readonly Scenario[] = [
  {
    id: 'F01-baseline',
    name: 'Compact healthy baseline',
    asks: 'Does a sensible small facility run calmly and produce output?',
    seed: 4242,
    ticks: 1800,
    levels: LEVELS,
    rooms: [
      LAB('lab-a', 3, 8, ['lab-bench', 'lab-bench']),
      WC('wc-a', 1, 10, 11),
      BREAK('br-a', 1, 13, 17),
      SHOP('shop-a', 3, 8),
      WC('wc-b', -1, 10, 11),
      BREAK('br-b', -1, 13, 17),
    ],
    staff: [
      person('scientist', 'regular', { id: 's001', level: 1, x: 4 }),
      person('scientist', 'junior', { id: 's002', level: 1, x: 5 }),
      person('operator', 'regular', { id: 's003', level: -1, x: 4 }),
    ],
  },
  {
    id: 'F02-support-adjacent',
    name: 'Restroom and break room adjacent to work',
    asks: 'Is short support travel visibly rewarded?',
    seed: 4242,
    ticks: 1800,
    levels: LEVELS,
    rooms: [LAB('lab-a', 3, 8, ['lab-bench', 'lab-bench']), WC('wc-a', 1, 9, 10), BREAK('br-a', 1, 11, 15)],
    staff: [
      person('scientist', 'regular', { id: 's001', level: 1, x: 4 }),
      person('scientist', 'regular', { id: 's002', level: 1, x: 5 }),
    ],
  },
  {
    id: 'F03-support-remote',
    name: 'Restroom at the opposite end of the floor',
    asks: 'Does distance cost measurable throughput without collapsing the floor?',
    seed: 4242,
    ticks: 1800,
    levels: LEVELS,
    rooms: [LAB('lab-a', 3, 8, ['lab-bench', 'lab-bench']), WC('wc-a', 1, 19, 20), BREAK('br-a', 1, 14, 18)],
    staff: [
      person('scientist', 'regular', { id: 's001', level: 1, x: 4 }),
      person('scientist', 'regular', { id: 's002', level: 1, x: 5 }),
    ],
  },
  {
    id: 'F04-restroom-starved',
    name: 'Too little restroom capacity',
    asks: 'Do queues spike without deadlocking?',
    seed: 4242,
    ticks: 1800,
    levels: LEVELS,
    rooms: [
      LAB('lab-a', 3, 10, ['lab-bench', 'lab-bench', 'lab-bench']),
      WC('wc-a', 1, 12, 13, 1),
      BREAK('br-a', 1, 15, 19),
    ],
    staff: [
      person('scientist', 'regular', { id: 's001', level: 1, x: 4 }),
      person('scientist', 'regular', { id: 's002', level: 1, x: 5 }),
      person('scientist', 'regular', { id: 's003', level: 1, x: 6 }),
    ],
  },
  {
    id: 'F05-no-break-room',
    name: 'No break room at all',
    asks: 'Is the absence legible rather than mysterious?',
    seed: 4242,
    ticks: 1800,
    levels: LEVELS,
    rooms: [LAB('lab-a', 3, 8, ['lab-bench', 'lab-bench']), WC('wc-a', 1, 10, 11)],
    staff: [
      person('scientist', 'regular', { id: 's001', level: 1, x: 4 }),
      person('scientist', 'regular', { id: 's002', level: 1, x: 5 }),
    ],
  },
  {
    id: 'F06-excess-support',
    name: 'Excessive support space',
    asks: 'Is overbuilding safe but visibly wasteful?',
    seed: 4242,
    ticks: 1800,
    levels: LEVELS,
    rooms: [
      LAB('lab-a', 3, 6, ['lab-bench', 'lab-bench']),
      WC('wc-a', 1, 7, 10, 3),
      BREAK('br-a', 1, 11, 20),
      WC('wc-b', 0, 3, 6, 2),
      BREAK('br-b', 0, 8, 16),
    ],
    staff: [
      person('scientist', 'regular', { id: 's001', level: 1, x: 4 }),
      person('scientist', 'regular', { id: 's002', level: 1, x: 5 }),
    ],
  },
  {
    id: 'F07-qualification-failure',
    name: 'Strict qualification failure',
    asks: 'Does an unqualified worker refuse the job, with a stated reason?',
    seed: 4242,
    ticks: 600,
    levels: LEVELS,
    // A workshop with only an assembly bench, staffed exclusively by scientists.
    rooms: [SHOP('shop-a', 3, 8), WC('wc-a', -1, 10, 11), BREAK('br-a', -1, 13, 17)],
    staff: [
      person('scientist', 'senior', { id: 's001', level: -1, x: 4 }),
      person('scientist', 'principal', { id: 's002', level: -1, x: 5 }),
    ],
  },
  {
    id: 'F08-specialist-contended',
    name: 'Two rooms competing for one specialist',
    asks: 'Does the single scarce specialist create a visible, recoverable bottleneck?',
    seed: 4242,
    ticks: 1800,
    levels: LEVELS,
    rooms: [
      LAB('lab-a', 3, 7, ['optics-rig']),
      LAB('lab-b', 9, 13, ['optics-rig']),
      WC('wc-a', 1, 15, 16),
      BREAK('br-a', 1, 17, 21),
    ],
    staff: [
      person('scientist', 'senior', { id: 's001', specializations: ['optics'], level: 1, x: 4 }),
      person('scientist', 'regular', { id: 's002', level: 1, x: 10 }),
    ],
  },
  {
    id: 'F09-topology-edit',
    name: 'Topology edited while jobs are active',
    asks: 'Do active plans cancel cleanly rather than completing against stale geometry?',
    seed: 4242,
    ticks: 900,
    levels: LEVELS,
    rooms: [LAB('lab-a', 3, 8, ['lab-bench', 'lab-bench']), WC('wc-a', 1, 10, 11), BREAK('br-a', 1, 13, 17)],
    staff: [
      person('scientist', 'regular', { id: 's001', level: 1, x: 4 }),
      person('scientist', 'regular', { id: 's002', level: 1, x: 18 }),
    ],
    editAtTick: 200,
    roomsAfterEdit: [LAB('lab-a', 14, 19, ['lab-bench', 'lab-bench']), WC('wc-a', 1, 10, 11), BREAK('br-a', 1, 3, 7)],
  },
  {
    id: 'F10-mixed-priority',
    name: 'Mixed-priority no-thrash fixture',
    asks: 'Do workers stay committed instead of oscillating between competing jobs?',
    seed: 4242,
    ticks: 1800,
    levels: LEVELS,
    rooms: [
      LAB('lab-a', 3, 8, ['lab-bench', 'lab-bench']),
      SHOP('shop-a', 3, 12, ['assembly-bench', 'board-line', 'cell-line', 'qa-station']),
      WC('wc-a', 1, 10, 11),
      BREAK('br-a', 1, 13, 17),
      WC('wc-b', -1, 14, 15),
      BREAK('br-b', -1, 17, 21),
    ],
    staff: [
      person('scientist', 'regular', { id: 's001', level: 1, x: 4 }),
      person('operator', 'regular', { id: 's002', level: -1, x: 4 }),
      person('operator', 'senior', { id: 's003', specializations: ['precision-assembly'], level: -1, x: 5 }),
      person('qa_technician', 'regular', { id: 's004', level: -1, x: 6 }),
      person('operator', 'junior', { id: 's005', level: -1, x: 7 }),
    ],
  },
];

export const DEFAULT_TOPOLOGY = buildTopology(LEVELS, DEFAULT_TRAVEL_COSTS);

export function scenarioById(id: string): Scenario | undefined {
  return SCENARIOS.find((entry) => entry.id === id);
}

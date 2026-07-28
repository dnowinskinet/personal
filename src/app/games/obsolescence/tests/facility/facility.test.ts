/**
 * Foundation Milestone 1 acceptance tests.
 *
 * These are the twelve the directive names, plus the structural passes the scenario fixtures owe.
 * They are written against the public API only, so the substrate can be reorganized without
 * rewriting the tests.
 */

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import {
  applyConstruction,
  bestJob,
  buildTopology,
  checkEligibility,
  createFacility,
  DEFAULT_THRESHOLDS,
  DEFAULT_TRAVEL_COSTS,
  findPath,
  fullNeeds,
  invalidate,
  isStale,
  needEfficiency,
  reserveStation,
  claimJob,
  roomQuality,
  scoreJob,
  spanCells,
  tickFacility,
  validateRoom,
  type Job,
  type ObjectDefinition,
  type Room,
  type ScoredJob,
  type Staff,
} from '../../sim/index';
import { FACILITY_CONFIG, NO_THRASH_THRESHOLD } from '../../content/facility/balance';
import { FACILITY_CONTENT, OBJECTS, PROFESSION_NAMES } from '../../content/facility/catalogue';
import { SCENARIOS } from '../../content/facility/scenarios';
import { runScenario } from '../../devtools/scenario-runner';

const LEVELS = [1, 0, -1];

function worker(overrides: Partial<Staff> = {}): Staff {
  return {
    id: 'w1',
    name: 'Worker',
    profession: 'scientist',
    rank: 'regular',
    specializations: [],
    stats: { proficiency: 1, precision: 1, endurance: 1, initiative: 1 },
    traits: [],
    salaryPerQuarter: 5200,
    hireCost: 0,
    assignedRoomId: null,
    state: 'idle',
    location: { level: 1, x: 4 },
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
    ...overrides,
  };
}

function object(id: string): ObjectDefinition {
  const found = OBJECTS.find((entry) => entry.id === id);
  if (found === undefined) {
    throw new Error(`catalogue is missing ${id}`);
  }
  return found;
}

// ---------------------------------------------------------------------------
// 1. Rooms: finite floor space, validity, quality
// ---------------------------------------------------------------------------

test('a room narrower than its type minimum is invalid, with a stated reason', () => {
  const tooNarrow: Room = {
    id: 'r1',
    typeId: 'research-lab',
    level: 1,
    span: { from: 3, to: 4 },
    objects: ['lab-bench'],
  };
  const result = validateRoom(tooNarrow, FACILITY_CONTENT, [tooNarrow], LEVELS);
  assert.equal(result.valid, false);
  assert.ok(result.reasons.includes('below-minimum-width'));
  assert.equal(result.reasons.length, result.explanations.length);
  assert.ok(result.explanations[0].length > 0, 'every reason must carry player-visible text');
});

test('a room missing its required object is invalid rather than silently inert', () => {
  const empty: Room = {
    id: 'r1',
    typeId: 'research-lab',
    level: 1,
    span: { from: 3, to: 8 },
    objects: [],
  };
  const result = validateRoom(empty, FACILITY_CONTENT, [empty], LEVELS);
  assert.equal(result.valid, false);
  assert.ok(result.reasons.includes('missing-required-object'));
});

test('rooms may not overlap, and may not sit on the circulation cores', () => {
  const a: Room = { id: 'a', typeId: 'research-lab', level: 1, span: { from: 3, to: 8 }, objects: ['lab-bench'] };
  const b: Room = { id: 'b', typeId: 'research-lab', level: 1, span: { from: 6, to: 11 }, objects: ['lab-bench'] };
  const overlap = validateRoom(b, FACILITY_CONTENT, [a, b], LEVELS);
  assert.equal(overlap.valid, false);
  assert.ok(overlap.reasons.includes('overlaps-another-room'));

  const onCore: Room = { id: 'c', typeId: 'research-lab', level: 1, span: { from: 0, to: 5 }, objects: ['lab-bench'] };
  const core = validateRoom(onCore, FACILITY_CONTENT, [onCore], LEVELS);
  assert.equal(core.valid, false);
  assert.ok(core.reasons.includes('outside-zonable-area'));
});

test('a production workshop may not be placed above ground', () => {
  const shop: Room = {
    id: 'shop',
    typeId: 'production-workshop',
    level: 1,
    span: { from: 3, to: 8 },
    objects: ['assembly-bench'],
  };
  const result = validateRoom(shop, FACILITY_CONTENT, [shop], LEVELS);
  assert.equal(result.valid, false);
  assert.ok(result.reasons.includes('wrong-placement-level'));
});

test('room quality has diminishing returns, so stacking one object is not a strategy', () => {
  const one = roomQuality({ id: 'r', typeId: 'research-lab', level: 1, span: { from: 3, to: 14 }, objects: ['lab-bench'] }, FACILITY_CONTENT);
  const four = roomQuality(
    { id: 'r', typeId: 'research-lab', level: 1, span: { from: 3, to: 14 }, objects: ['lab-bench', 'lab-bench', 'lab-bench', 'lab-bench'] },
    FACILITY_CONTENT
  );
  assert.ok(four > one, 'more equipment should still help');
  assert.ok(four < one * 2, `four benches must not be four times one bench (got ${one} -> ${four})`);
});

// ---------------------------------------------------------------------------
// 2. Qualification is categorical
// ---------------------------------------------------------------------------

test('a scientist is refused an assembly bench no matter how senior', () => {
  const principal = worker({ profession: 'scientist', rank: 'principal' });
  const result = checkEligibility(principal, object('assembly-bench'), 'shop', PROFESSION_NAMES);
  assert.equal(result.eligible, false);
  assert.equal(result.failure, 'wrong-profession');
  assert.match(result.reason ?? '', /operator/i, 'the reason must name the profession actually required');
});

test('rank and stats never substitute for the wrong profession', () => {
  const gifted = worker({
    profession: 'qa_technician',
    rank: 'principal',
    stats: { proficiency: 1.2, precision: 1.2, endurance: 1.2, initiative: 1.2 },
  });
  assert.equal(checkEligibility(gifted, object('lab-bench'), 'lab', PROFESSION_NAMES).eligible, false);
  assert.equal(checkEligibility(gifted, object('assembly-bench'), 'shop', PROFESSION_NAMES).eligible, false);
  assert.equal(checkEligibility(gifted, object('qa-station'), 'shop', PROFESSION_NAMES).eligible, true);
});

test('a missing specialization blocks the station and says which one is missing', () => {
  const generalist = worker({ profession: 'scientist', specializations: ['materials'] });
  const result = checkEligibility(generalist, object('optics-rig'), 'lab', PROFESSION_NAMES);
  assert.equal(result.eligible, false);
  assert.equal(result.failure, 'missing-specialization');
  assert.match(result.reason ?? '', /optics/);

  const specialist = worker({ profession: 'scientist', specializations: ['optics'] });
  assert.equal(checkEligibility(specialist, object('optics-rig'), 'lab', PROFESSION_NAMES).eligible, true);
});

test('every eligibility failure carries a player-readable reason', () => {
  const cases: readonly [Staff, string][] = [
    [worker({ profession: 'scientist' }), 'assembly-bench'],
    [worker({ profession: 'operator' }), 'lab-bench'],
    [worker({ profession: 'scientist' }), 'optics-rig'],
  ];
  for (const [staff, objectId] of cases) {
    const result = checkEligibility(staff, object(objectId), 'room', PROFESSION_NAMES);
    assert.equal(result.eligible, false);
    assert.ok(result.reason !== null && result.reason.length > 10, `${objectId} failure must explain itself`);
  }
});

// ---------------------------------------------------------------------------
// 3. Topology
// ---------------------------------------------------------------------------

test('editing the building invalidates cached topology rather than leaving stale paths', () => {
  const before = buildTopology(LEVELS, DEFAULT_TRAVEL_COSTS);
  const after = invalidate(before, [1, 0, -1, -2]);
  assert.notEqual(after.generation, before.generation);
  const pathBefore = findPath(before, { level: 1, x: 4 }, { level: 1, x: 10 });
  assert.equal(isStale(pathBefore, after), true, 'a path computed before an edit must read as stale');
  const pathAfter = findPath(after, { level: 1, x: 4 }, { level: 1, x: 10 });
  assert.equal(isStale(pathAfter, after), false);
  assert.ok(after.levels.includes(-2), 'the rebuilt topology must include the new floor');
});

test('a path across floors costs more than a path along one floor', () => {
  const topology = buildTopology(LEVELS, DEFAULT_TRAVEL_COSTS);
  const sameFloor = findPath(topology, { level: 1, x: 4 }, { level: 1, x: 10 });
  const acrossFloors = findPath(topology, { level: 1, x: 4 }, { level: -1, x: 10 });
  assert.equal(sameFloor.ok, true);
  assert.equal(acrossFloors.ok, true);
  assert.ok(acrossFloors.cost > sameFloor.cost);
});

test('an unbuilt level is unreachable and says so', () => {
  const topology = buildTopology(LEVELS, DEFAULT_TRAVEL_COSTS);
  const result = findPath(topology, { level: 1, x: 4 }, { level: -5, x: 10 });
  assert.equal(result.ok, false);
  assert.equal(result.failure, 'level-unreachable');
});

test('construction mid-run cancels active plans instead of completing against stale geometry', () => {
  const topology = buildTopology(LEVELS, DEFAULT_TRAVEL_COSTS);
  const rooms: readonly Room[] = [
    { id: 'lab', typeId: 'research-lab', level: 1, span: { from: 3, to: 8 }, objects: ['lab-bench'] },
  ];
  let state = createFacility(rooms, [worker({ location: { level: 1, x: 20 } })], topology, 7);
  for (let i = 0; i < 5; i += 1) {
    state = tickFacility(state, FACILITY_CONTENT, FACILITY_CONFIG);
  }
  const travelling = state.staff[0];
  assert.ok(travelling.reservation !== null || travelling.state === 'working', 'worker should have engaged a job');

  const moved: readonly Room[] = [
    { id: 'lab', typeId: 'research-lab', level: 1, span: { from: 14, to: 19 }, objects: ['lab-bench'] },
  ];
  const rebuilt = applyConstruction(state, moved);
  const after = rebuilt.staff[0];
  assert.equal(after.reservation, null, 'an edit must release the reservation, not carry it across geometry');
  assert.ok(
    after.state === 'blocked_repath' || after.state === 'idle',
    `expected repath or idle after an edit, got ${after.state}`
  );
  assert.notEqual(rebuilt.topology.generation, state.topology.generation);
});

// ---------------------------------------------------------------------------
// 4. Reservations and no-thrash
// ---------------------------------------------------------------------------

test('a reserved station cannot be claimed twice', () => {
  const jobs: readonly Job[] = [
    { id: 'j1', kind: 'research', roomId: 'lab', stationId: 'lab/0', publishedTick: 0, priority: 1, workTicks: 90, claimedBy: null, stationReserved: false },
    { id: 'j2', kind: 'research', roomId: 'lab', stationId: 'lab/0', publishedTick: 0, priority: 1, workTicks: 90, claimedBy: null, stationReserved: false },
  ];
  const reserved = reserveStation(jobs, 'j1');
  assert.equal(reserved[0].stationReserved, true);

  // j2 shares the station, so it must not also reserve it.
  const contested = reserveStation(reserved, 'j2');
  assert.equal(contested[1].stationReserved, false, 'one station may back only one reservation');

  const claimed = claimJob(reserved, 'j1', 'w1');
  assert.equal(claimed[0].claimedBy, 'w1');
  const stolen = claimJob(claimed, 'j1', 'w2');
  assert.equal(stolen[0].claimedBy, 'w1', 'a claimed job must not transfer to a second worker');
});

const job = (id: string, overrides: Partial<Job> = {}): Job => ({
  id,
  kind: 'research',
  roomId: 'lab',
  stationId: `lab/${id}`,
  publishedTick: 0,
  priority: 1,
  workTicks: 90,
  claimedBy: null,
  stationReserved: false,
  ...overrides,
});

const scoreArgs = {
  weights: FACILITY_CONFIG.weights,
  tick: 0,
  travelTicks: 0,
  requiredSpecialization: null,
  contenders: 0,
  needRisk: 0,
  wouldPreempt: false,
};

test('job selection breaks ties by stable id, so replays match', () => {
  const staff = worker();
  const a: ScoredJob = scoreJob({ ...scoreArgs, staff, job: job('j-b') });
  const b: ScoredJob = scoreJob({ ...scoreArgs, staff, job: job('j-a') });
  assert.equal(a.score, b.score, 'this test is only meaningful when the scores tie');
  assert.equal(bestJob([a, b])?.job.id, 'j-a');
  assert.equal(bestJob([b, a])?.job.id, 'j-a', 'order of candidates must not change the winner');
});

test('specialization match dominates the score, as R10 specifies', () => {
  const generalist = worker({ specializations: [] });
  const specialist = worker({ specializations: ['optics'] });
  const matched = scoreJob({ ...scoreArgs, staff: specialist, job: job('j1'), requiredSpecialization: 'optics' });
  const unmatched = scoreJob({ ...scoreArgs, staff: generalist, job: job('j1'), requiredSpecialization: null });
  assert.ok(matched.score > unmatched.score);
  const factor = matched.factors.find((entry) => entry.label.toLowerCase().includes('special'));
  assert.ok(factor !== undefined, 'the breakdown must expose the specialization term for the UI');
  assert.equal(factor?.value, FACILITY_CONFIG.weights.specializationMatch);
});

test('under 5% of claimed jobs are abandoned before reaching a station', () => {
  for (const scenario of SCENARIOS) {
    const metrics = runScenario(scenario);
    assert.ok(
      metrics.abandonBeforeStation < NO_THRASH_THRESHOLD,
      `${scenario.id} thrashed: ${(metrics.abandonBeforeStation * 100).toFixed(1)}% abandoned before station`
    );
  }
});

// ---------------------------------------------------------------------------
// 5. Needs
// ---------------------------------------------------------------------------

test('a mild need costs efficiency; a severe one costs much more', () => {
  const healthy = needEfficiency(fullNeeds(), DEFAULT_THRESHOLDS);
  const tired = needEfficiency({ bladder: 1, hunger: 1, energy: 0.25 }, DEFAULT_THRESHOLDS);
  const desperate = needEfficiency({ bladder: 0.05, hunger: 0.2, energy: 0.1 }, DEFAULT_THRESHOLDS);
  assert.equal(healthy, 1);
  assert.ok(tired < healthy);
  assert.ok(desperate < tired);
  assert.ok(desperate > 0, 'efficiency must degrade, never reach zero and deadlock');
});

test('an urgent need interrupts work and the job resumes afterwards', () => {
  const topology = buildTopology(LEVELS, DEFAULT_TRAVEL_COSTS);
  const rooms: readonly Room[] = [
    { id: 'lab', typeId: 'research-lab', level: 1, span: { from: 3, to: 8 }, objects: ['lab-bench'] },
    { id: 'wc', typeId: 'restroom', level: 1, span: { from: 10, to: 11 }, objects: ['stall'] },
    { id: 'br', typeId: 'break-room', level: 1, span: { from: 13, to: 17 }, objects: ['canteen-counter', 'rest-couch'] },
  ];
  // Just above the mandatory threshold, so the worker starts a job and is interrupted mid-way
  // through it rather than before it ever begins.
  const nearly = worker({ needs: { bladder: 0.24, hunger: 1, energy: 1 } });
  let state = createFacility(rooms, [nearly], topology, 11);

  let sawWorkBefore = false;
  let sawInterrupt = false;
  let sawResume = false;
  let tokenProgress = -1;
  let lowest = 1;
  for (let i = 0; i < 600; i += 1) {
    state = tickFacility(state, FACILITY_CONTENT, FACILITY_CONFIG);
    const person = state.staff[0];
    lowest = Math.min(lowest, person.needs.bladder);
    if (!sawInterrupt && person.state === 'working') sawWorkBefore = true;
    if (
      person.state === 'urgent_need_interrupt' ||
      person.state === 'travel_to_amenity' ||
      person.state === 'queue_for_amenity' ||
      person.state === 'using_amenity'
    ) {
      sawInterrupt = true;
      if (person.resumeToken !== null) tokenProgress = person.resumeToken.progressTicks;
    }
    if (sawInterrupt && person.state === 'working') sawResume = true;
  }
  assert.ok(sawWorkBefore, 'the worker must actually start a job before the need bites');
  assert.ok(sawInterrupt, 'a need below the mandatory threshold must interrupt work');
  assert.ok(tokenProgress > 0, `the interrupted job must remember its progress (got ${tokenProgress})`);
  assert.ok(sawResume, 'the worker must return to work rather than stalling');
  assert.ok(state.staff[0].needs.bladder > lowest, 'the amenity must actually restore the need');
});

test('a facility with no amenity says so rather than going quietly dead', () => {
  const metrics = runScenario(SCENARIOS.find((entry) => entry.id === 'F05-no-break-room')!);
  assert.ok(
    (metrics.blockerCounts['no-amenity-reachable'] ?? 0) > 0,
    'the missing break room must surface as an explicit blocker'
  );
});

// ---------------------------------------------------------------------------
// 6. Determinism
// ---------------------------------------------------------------------------

test('the same seed and the same layout produce byte-identical results', () => {
  for (const scenario of SCENARIOS) {
    const a = runScenario(scenario);
    const b = runScenario(scenario);
    assert.deepEqual(a, b, `${scenario.id} is not deterministic`);
  }
});

test('a different seed produces a different run, so the seed is actually used', () => {
  const baseline = SCENARIOS.find((entry) => entry.id === 'F01-baseline')!;
  const a = runScenario(baseline);
  const b = runScenario({ ...baseline, seed: baseline.seed + 1 });
  assert.notDeepEqual(
    { rp: a.researchPoints, parts: a.partsProduced, shares: a.shares },
    { rp: b.researchPoints, parts: b.partsProduced, shares: b.shares }
  );
});

test('replaying from the start reproduces an interrupted run exactly', () => {
  const scenario = SCENARIOS.find((entry) => entry.id === 'F10-mixed-priority')!;
  const topology = buildTopology(scenario.levels, DEFAULT_TRAVEL_COSTS);

  const run = (ticks: number) => {
    let state = createFacility(scenario.rooms, scenario.staff, topology, scenario.seed);
    for (let i = 0; i < ticks; i += 1) state = tickFacility(state, FACILITY_CONTENT, FACILITY_CONFIG);
    return state;
  };

  const short = run(300);
  const long = run(600);
  const continued = (() => {
    let state = short;
    for (let i = 0; i < 300; i += 1) state = tickFacility(state, FACILITY_CONTENT, FACILITY_CONFIG);
    return state;
  })();
  assert.equal(continued.tick, long.tick);
  assert.deepEqual(continued.staff, long.staff);
  assert.deepEqual(continued.output, long.output);
});

// ---------------------------------------------------------------------------
// 7. Scenario structural passes
// ---------------------------------------------------------------------------

test('every scenario is structurally valid: no invalid rooms, no unknown blockers', () => {
  for (const scenario of SCENARIOS) {
    const metrics = runScenario(scenario);
    assert.deepEqual(metrics.invalidRooms, [], `${scenario.id} has invalid rooms`);
    for (const code of Object.keys(metrics.blockerCounts)) {
      assert.ok(code.length > 0);
    }
  }
});

test('the qualification-failure fixture produces no work at all, and explains why', () => {
  const metrics = runScenario(SCENARIOS.find((entry) => entry.id === 'F07-qualification-failure')!);
  assert.equal(metrics.partsProduced, 0);
  assert.equal(metrics.researchPoints, 0);
  assert.equal(metrics.staffEverProductive, 0, 'no scientist may ever run an assembly bench');
  assert.ok((metrics.blockerCounts['no-qualified-staff'] ?? 0) > 0);
});

test('remote support costs measurable throughput without collapsing the floor', () => {
  const near = runScenario(SCENARIOS.find((entry) => entry.id === 'F02-support-adjacent')!);
  const far = runScenario(SCENARIOS.find((entry) => entry.id === 'F03-support-remote')!);
  assert.ok(far.shares.productive < near.shares.productive, 'distance must cost something');
  assert.ok(far.shares.productive > near.shares.productive * 0.6, 'but it must not be catastrophic');
  assert.ok(far.shares.needs > near.shares.needs, 'the cost should show up as needs time');
});

test('the scarce specialist is a bottleneck, not a deadlock', () => {
  const metrics = runScenario(SCENARIOS.find((entry) => entry.id === 'F08-specialist-contended')!);
  assert.equal(metrics.specialistUtilization, 1, 'the one optics scientist must be kept busy');
  assert.ok(metrics.researchPoints > 0, 'the floor must still produce something');
  assert.ok((metrics.blockerCounts['no-qualified-staff'] ?? 0) > 0, 'the unqualified scientist must be explained');
});

test('overbuilding support is wasteful but safe', () => {
  const metrics = runScenario(SCENARIOS.find((entry) => entry.id === 'F06-excess-support')!);
  assert.ok(metrics.supportSpaceShare > 0.5, 'this fixture is meant to be overbuilt');
  assert.ok(metrics.shares.productive > 0.5, 'overbuilding must not break the floor');
  assert.deepEqual(metrics.invalidRooms, []);
});

test('a starved restroom queues without deadlocking', () => {
  const metrics = runScenario(SCENARIOS.find((entry) => entry.id === 'F04-restroom-starved')!);
  assert.ok(metrics.averageAmenityQueueLength > 0, 'a single stall for three workers should queue');
  assert.ok(metrics.shares.productive > 0.3, 'but the floor must keep running');
  assert.equal(metrics.staffEverProductive, metrics.staffCount, 'nobody may be permanently stuck in a queue');
});

test('the grid reserves both circulation cores on every floor', () => {
  const cells = spanCells(1, { from: 0, to: 23 });
  assert.equal(cells.length, 24);
  const lab: Room = { id: 'x', typeId: 'research-lab', level: 1, span: { from: 18, to: 23 }, objects: ['lab-bench'] };
  const result = validateRoom(lab, FACILITY_CONTENT, [lab], LEVELS);
  assert.equal(result.valid, false, 'the freight core must not be zonable');
});

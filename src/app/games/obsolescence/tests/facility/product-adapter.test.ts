/**
 * The facility-to-product bridge.
 *
 * The existing payoff — assemble whatever you actually managed to make — is the part of the
 * prototype worth preserving, so these tests are mostly about the adapter *not* changing it.
 */

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import {
  buildTopology,
  createFacility,
  DEFAULT_TIER_THRESHOLDS,
  DEFAULT_TRAVEL_COSTS,
  assemblyOptions,
  explainStock,
  researchLevelFrom,
  roomQualityFactor,
  tickFacility,
  tierForQuality,
  toPartStock,
  type FacilityOutput,
  type Room,
} from '../../sim/index';
import { FACILITY_CONFIG } from '../../content/facility/balance';
import { FACILITY_CONTENT } from '../../content/facility/catalogue';
import { SCENARIOS } from '../../content/facility/scenarios';

function output(parts: readonly { tag: string | null; quality: number }[], researchPoints = 0): FacilityOutput {
  return {
    researchPoints,
    parts: parts.map((part, index) => ({ kind: 'assemble', tag: part.tag, quality: part.quality, tick: index })),
  };
}

test('completed work lands in the part stock under the right kind', () => {
  const converted = toPartStock(
    output([
      { tag: 'chassis', quality: 1 },
      { tag: 'chassis', quality: 1 },
      { tag: 'board', quality: 1 },
    ])
  );
  assert.equal(converted.stock.chassis[1], 2);
  assert.equal(converted.stock.board[1], 1);
  assert.equal(converted.stock.cell[1], 0);
});

test('quality decides the tier, and the boundaries are the ones the sim can actually reach', () => {
  assert.equal(tierForQuality(0.8), 1);
  assert.equal(tierForQuality(DEFAULT_TIER_THRESHOLDS.tier2), 2);
  assert.equal(tierForQuality(DEFAULT_TIER_THRESHOLDS.tier3), 3);
  assert.equal(tierForQuality(DEFAULT_TIER_THRESHOLDS.tier2 - 0.001), 1);
  assert.equal(tierForQuality(DEFAULT_TIER_THRESHOLDS.tier3 - 0.001), 2);
});

test('output the product loop cannot use is counted, never silently dropped', () => {
  const converted = toPartStock(output([{ tag: null, quality: 1 }, { tag: 'sprocket', quality: 1 }]));
  assert.equal(converted.unused['assemble'], 1, 'untagged work is reported under its job kind');
  assert.equal(converted.unused['sprocket'], 1, 'a tag with no product use is reported by name');
  assert.equal(converted.stock.chassis[1] + converted.stock.board[1] + converted.stock.cell[1], 0);
});

test('a missing part names the room decision that caused it', () => {
  const lines = explainStock(toPartStock(output([{ tag: 'chassis', quality: 1 }])).stock);
  const board = lines.find((line) => line.kind === 'board');
  assert.equal(board?.held, 0);
  assert.match(board?.text ?? '', /workshop needs a station/i);
  assert.match(board?.text ?? '', /qualified operator/i);
});

test('research points convert to a level on the quarter scale, and never divide by zero', () => {
  assert.equal(researchLevelFrom(25, 12), 2);
  assert.equal(researchLevelFrom(11, 12), 0);
  assert.equal(researchLevelFrom(25, 0), 0);
});

test('a bare room caps output tier; a well-equipped one lifts it', () => {
  const bare: Room = { id: 'a', typeId: 'production-workshop', level: -1, span: { from: 3, to: 6 }, objects: ['assembly-bench'] };
  const equipped: Room = { id: 'a', typeId: 'production-workshop', level: -1, span: { from: 3, to: 10 }, objects: ['assembly-bench', 'board-line', 'plant'] };
  assert.ok(roomQualityFactor(bare, FACILITY_CONTENT) < 1, 'a minimal room should be a penalty');
  assert.ok(roomQualityFactor(equipped, FACILITY_CONTENT) > 1, 'a fitted-out room should be a bonus');
});

test('fitting out beyond the cap buys nothing, so item spam is not a strategy', () => {
  const equipped: Room = { id: 'a', typeId: 'production-workshop', level: -1, span: { from: 3, to: 10 }, objects: ['assembly-bench', 'board-line', 'plant'] };
  const stacked: Room = { ...equipped, span: { from: 3, to: 16 }, objects: ['cell-line', 'qa-station', 'board-line', 'assembly-bench', 'plant', 'plant'] };
  assert.equal(
    roomQualityFactor(stacked, FACILITY_CONTENT),
    roomQualityFactor(equipped, FACILITY_CONTENT),
    'past the cap, more equipment must not raise output quality'
  );
});

test('a run of the mixed-priority fixture produces an assemblable product', () => {
  const scenario = SCENARIOS.find((entry) => entry.id === 'F10-mixed-priority')!;
  let state = createFacility(
    scenario.rooms,
    scenario.staff,
    buildTopology(scenario.levels, DEFAULT_TRAVEL_COSTS),
    scenario.seed
  );
  for (let i = 0; i < scenario.ticks; i += 1) {
    state = tickFacility(state, FACILITY_CONTENT, FACILITY_CONFIG);
  }

  const converted = toPartStock(state.output);
  const options = assemblyOptions(converted.stock, ['chassis', 'board', 'cell'], 3);
  assert.ok(options.some((option) => option.available), 'the facility must be able to feed the payoff');
  assert.ok(converted.researchPoints > 0, 'research work must reach the product loop too');
});

test('a facility with no production floor yields an empty menu rather than an error', () => {
  const scenario = SCENARIOS.find((entry) => entry.id === 'F02-support-adjacent')!;
  let state = createFacility(
    scenario.rooms,
    scenario.staff,
    buildTopology(scenario.levels, DEFAULT_TRAVEL_COSTS),
    scenario.seed
  );
  for (let i = 0; i < 300; i += 1) {
    state = tickFacility(state, FACILITY_CONTENT, FACILITY_CONFIG);
  }
  const converted = toPartStock(state.output);
  const options = assemblyOptions(converted.stock, ['chassis', 'board', 'cell'], 3);
  assert.equal(options.some((option) => option.available), false);
  assert.equal(explainStock(converted.stock).every((line) => line.held === 0), true);
});

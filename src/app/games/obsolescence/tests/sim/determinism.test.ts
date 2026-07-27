/**
 * Executable enforcement of I-004, I-005 and I-006.
 *
 * Runs under `node --test` with no browser and no Angular, which is itself part of the proof:
 * if the kernel ever acquires a DOM or framework dependency, this suite stops running.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { TICK_HZ, TICK_MS, simulatedMsAt, ticksForMs } from '../../sim/clock';
import { randomAt, randomIntAt, pickAt } from '../../sim/rng';
import { run, serialize, verifyReplay } from '../../sim/kernel';
import type { ScheduledCommand } from '../../sim/commands';

const LOG: readonly ScheduledCommand[] = [
  { tick: 0, command: { type: 'entity/create', kind: 'bay' } },
  { tick: 1, command: { type: 'sim/draw' } },
  { tick: 2, command: { type: 'entity/create', kind: 'bay' } },
  { tick: 2, command: { type: 'entity/create', kind: 'lot' } },
  { tick: 4, command: { type: 'entity/remove', id: 'bay-1' } },
  { tick: 5, command: { type: 'sim/draw' } },
];

describe('I-005 — the authoritative tick is 10 Hz', () => {
  it('runs at ten ticks per second', () => {
    assert.equal(TICK_HZ, 10);
    assert.equal(TICK_MS, 100);
  });

  it('derives simulated time from the tick count alone', () => {
    assert.equal(simulatedMsAt(0), 0);
    assert.equal(simulatedMsAt(10), 1000);
    assert.equal(ticksForMs(1000), 10);
    assert.equal(ticksForMs(50), 1, 'partial ticks round up so durations are never skipped');
  });

  it('advances exactly the requested number of ticks', () => {
    assert.equal(run({ seed: 1, ticks: 0 }).tick, 0);
    assert.equal(run({ seed: 1, ticks: 37 }).tick, 37);
  });

  it('ignores commands scheduled beyond the run length', () => {
    const withinRun = run({ seed: 1, ticks: 3, log: LOG });
    const beyondRun = run({
      seed: 1,
      ticks: 3,
      log: [...LOG, { tick: 900, command: { type: 'entity/create', kind: 'ghost' } }],
    });
    assert.equal(serialize(withinRun), serialize(beyondRun));
  });
});

describe('I-004 — same seed plus same command log reproduces the run', () => {
  it('produces byte-identical state across repeated runs', () => {
    const first = run({ seed: 4242, ticks: 20, log: LOG });
    const second = run({ seed: 4242, ticks: 20, log: LOG });
    assert.equal(serialize(first), serialize(second));
  });

  it('preserves authoring order within a tick group', () => {
    const shuffled = [...LOG].reverse();
    const ordered = run({ seed: 7, ticks: 20, log: LOG });
    const reversed = run({ seed: 7, ticks: 20, log: shuffled });
    assert.notEqual(
      serialize(ordered),
      serialize(reversed),
      'reversing genuinely changes intent within a tick, so outcomes must differ'
    );
  });

  it('confirms a replay of the same inputs', () => {
    const expected = run({ seed: 99, ticks: 12, log: LOG });
    const { matches } = verifyReplay({ seed: 99, ticks: 12, log: LOG }, expected);
    assert.equal(matches, true);
  });

  it('rejects a replay of different inputs', () => {
    // Negative control. Without this, verifyReplay could return true unconditionally and the
    // positive test above would still pass.
    const expected = run({ seed: 99, ticks: 12, log: LOG });
    assert.equal(verifyReplay({ seed: 100, ticks: 12, log: LOG }, expected).matches, false);
    assert.equal(verifyReplay({ seed: 99, ticks: 13, log: LOG }, expected).matches, false);
    assert.equal(verifyReplay({ seed: 99, ticks: 12, log: [] }, expected).matches, false);
  });

  it('serializes canonically regardless of property insertion order', () => {
    const state = run({ seed: 5, ticks: 3, log: LOG });
    const reordered = JSON.parse(
      JSON.stringify({
        order: state.order,
        tick: state.tick,
        seed: state.seed,
        entities: state.entities,
        rngCursor: state.rngCursor,
        schemaVersion: state.schemaVersion,
        nextEntitySequence: state.nextEntitySequence,
      })
    );
    assert.equal(serialize(state), serialize(reordered));
  });
});

describe('I-006 — randomness is seeded and reproducible', () => {
  it('returns the same value for the same seed and cursor', () => {
    assert.equal(randomAt(123, 7), randomAt(123, 7));
    assert.equal(randomAt(0, 0), randomAt(0, 0));
  });

  it('produces different sequences for different seeds', () => {
    const left = Array.from({ length: 32 }, (_, index) => randomAt(1, index));
    const right = Array.from({ length: 32 }, (_, index) => randomAt(2, index));
    assert.notDeepEqual(left, right);
  });

  it('produces varying values across the sequence', () => {
    // Guards against a degenerate generator that returns a constant, which would satisfy every
    // reproducibility assertion above while being useless.
    const drawn = new Set(Array.from({ length: 64 }, (_, index) => randomAt(31337, index)));
    assert.ok(drawn.size > 50, `expected a spread of values, saw ${drawn.size} distinct`);
  });

  it('stays within the unit interval', () => {
    for (let cursor = 0; cursor < 500; cursor += 1) {
      const value = randomAt(8675309, cursor);
      assert.ok(value >= 0 && value < 1, `value ${value} out of range at cursor ${cursor}`);
    }
  });

  it('bounds integers to the requested half-open range', () => {
    for (let cursor = 0; cursor < 300; cursor += 1) {
      const value = randomIntAt(11, cursor, 5, 9);
      assert.ok(value >= 5 && value < 9, `value ${value} outside [5, 9)`);
      assert.equal(Number.isInteger(value), true);
    }
  });

  it('collapses an empty or inverted range to the lower bound', () => {
    assert.equal(randomIntAt(1, 1, 3, 3), 3);
    assert.equal(randomIntAt(1, 1, 5, 2), 5);
  });

  it('returns undefined when picking from an empty list', () => {
    assert.equal(pickAt(1, 1, []), undefined);
    assert.equal(pickAt(1, 1, ['only']), 'only');
  });

  it('advances the cursor when a draw command is applied', () => {
    const before = run({ seed: 3, ticks: 10 });
    const after = run({
      seed: 3,
      ticks: 10,
      log: [{ tick: 0, command: { type: 'sim/draw' } }],
    });
    assert.equal(before.rngCursor, 0);
    assert.equal(after.rngCursor, 1);
  });
});

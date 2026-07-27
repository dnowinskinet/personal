/**
 * Executable enforcement of I-008 — every save carries a schema version and survives a round trip.
 *
 * The migration fixtures themselves arrive with the persistence layer in Gate B. What is proved
 * here is the precondition: state is losslessly serializable and self-describing.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { deserialize, run, serialize } from '../../sim/kernel';
import { SCHEMA_VERSION, createInitialState } from '../../sim/state';
import type { ScheduledCommand } from '../../sim/commands';

const LOG: readonly ScheduledCommand[] = [
  { tick: 0, command: { type: 'entity/create', kind: 'bay' } },
  { tick: 1, command: { type: 'entity/create', kind: 'lot' } },
  { tick: 2, command: { type: 'sim/draw' } },
  { tick: 3, command: { type: 'entity/remove', id: 'bay-1' } },
];

describe('I-008 — state is versioned and round-trips losslessly', () => {
  it('stamps a schema version on fresh state', () => {
    assert.equal(createInitialState(1).schemaVersion, SCHEMA_VERSION);
    assert.equal(typeof SCHEMA_VERSION, 'number');
  });

  it('carries the schema version through a run', () => {
    assert.equal(run({ seed: 1, ticks: 25, log: LOG }).schemaVersion, SCHEMA_VERSION);
  });

  it('round-trips without losing information', () => {
    const original = run({ seed: 2024, ticks: 25, log: LOG });
    const restored = deserialize(serialize(original));

    assert.deepEqual(restored, original);
    assert.equal(serialize(restored), serialize(original));
  });

  it('resumes correctly from a restored state', () => {
    const midpoint = run({ seed: 77, ticks: 3, log: LOG });
    const restored = deserialize(serialize(midpoint));

    assert.equal(restored.tick, midpoint.tick);
    assert.equal(restored.seed, midpoint.seed);
    assert.equal(restored.rngCursor, midpoint.rngCursor);
    assert.equal(restored.nextEntitySequence, midpoint.nextEntitySequence);
    assert.deepEqual(restored.order, midpoint.order);
  });

  it('produces stable output for structurally identical states', () => {
    const left = run({ seed: 5, ticks: 8, log: LOG });
    const right = run({ seed: 5, ticks: 8, log: LOG });
    assert.equal(serialize(left), serialize(right));
  });

  it('produces different output for different states', () => {
    // Negative control against a serializer that discards fields.
    const shorter = run({ seed: 5, ticks: 8, log: LOG });
    const longer = run({ seed: 5, ticks: 9, log: LOG });
    assert.notEqual(serialize(shorter), serialize(longer));
  });

  it('emits parseable JSON', () => {
    const payload = serialize(run({ seed: 1, ticks: 5, log: LOG }));
    assert.doesNotThrow(() => JSON.parse(payload));
  });

  it('keeps a save comfortably small for a short run', () => {
    // I-009 budgets saves at under 5 MB. This is nowhere near it yet, but the assertion exists so
    // that a future state shape which explodes in size fails loudly rather than quietly.
    const payload = serialize(run({ seed: 1, ticks: 1000, log: LOG }));
    assert.ok(payload.length < 100_000, `save grew to ${payload.length} bytes`);
  });
});

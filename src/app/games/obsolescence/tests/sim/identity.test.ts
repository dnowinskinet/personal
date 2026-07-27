/**
 * Executable enforcement of I-007 — saves reference stable entity IDs, never positional indices.
 *
 * The failure this prevents is subtle and expensive: a save that survives today but silently
 * resolves to the wrong entity after a floor is inserted next quarter.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { applyCommand } from '../../sim/reduce';
import { createInitialState, findEntity, orderedEntities } from '../../sim/state';
import { run } from '../../sim/kernel';
import type { SimState } from '../../sim/state';

function createMany(state: SimState, kinds: readonly string[]): SimState {
  return kinds.reduce(
    (current, kind) => applyCommand(current, { type: 'entity/create', kind }),
    state
  );
}

describe('I-007 — entity identity is stable', () => {
  it('assigns IDs from a monotonic sequence, not from collection size', () => {
    const state = createMany(createInitialState(1), ['bay', 'bay', 'lot']);
    assert.deepEqual(state.order, ['bay-1', 'bay-2', 'lot-3']);
    assert.equal(state.nextEntitySequence, 4);
  });

  it('never reuses an ID after removal', () => {
    const populated = createMany(createInitialState(1), ['bay', 'bay']);
    const removed = applyCommand(populated, { type: 'entity/remove', id: 'bay-1' });
    const readded = applyCommand(removed, { type: 'entity/create', kind: 'bay' });

    assert.equal(findEntity(readded, 'bay-1'), undefined, 'removed ID must not come back');
    assert.equal(readded.order.includes('bay-3'), true, 'new entity takes the next sequence value');
    assert.equal(readded.nextEntitySequence, 4);
  });

  it('keeps surviving entity IDs unchanged when a neighbour is removed', () => {
    const populated = createMany(createInitialState(1), ['bay', 'lot', 'cart']);
    const before = populated.order.filter((id) => id !== 'bay-1');
    const removed = applyCommand(populated, { type: 'entity/remove', id: 'bay-1' });

    assert.deepEqual(removed.order, before);
    assert.equal(findEntity(removed, 'lot-2')?.kind, 'lot');
    assert.equal(findEntity(removed, 'cart-3')?.kind, 'cart');
  });

  it('keeps IDs resolving to the same entity when one is inserted ahead of them', () => {
    // This is the scenario the invariant exists for. Under positional addressing every reference
    // after the insertion point would shift by one.
    const original = createMany(createInitialState(1), ['bay', 'lot']);
    const resolvedBefore = findEntity(original, 'lot-2');

    const withInsertion = applyCommand(original, { type: 'entity/create', kind: 'dock' });
    const resolvedAfter = findEntity(withInsertion, 'lot-2');

    assert.deepEqual(resolvedBefore, resolvedAfter);
  });

  it('records the tick an entity was created on', () => {
    const state = run({
      seed: 1,
      ticks: 10,
      log: [
        { tick: 0, command: { type: 'entity/create', kind: 'bay' } },
        { tick: 6, command: { type: 'entity/create', kind: 'lot' } },
      ],
    });
    assert.equal(findEntity(state, 'bay-1')?.createdAtTick, 0);
    assert.equal(findEntity(state, 'lot-2')?.createdAtTick, 6);
  });

  it('ignores removal of an unknown ID rather than corrupting state', () => {
    const populated = createMany(createInitialState(1), ['bay']);
    const unchanged = applyCommand(populated, { type: 'entity/remove', id: 'does-not-exist' });
    assert.equal(unchanged, populated, 'no-op must return the identical reference');
  });

  it('skips dangling IDs when reading ordered entities', () => {
    const populated = createMany(createInitialState(1), ['bay', 'lot']);
    const withDangling: SimState = { ...populated, order: [...populated.order, 'never-created'] };
    assert.deepEqual(
      orderedEntities(withDangling).map((entity) => entity.id),
      ['bay-1', 'lot-2']
    );
  });

  it('does not treat inherited object properties as entities', () => {
    // `findEntity` uses hasOwnProperty rather than a truthiness check, so prototype keys such as
    // "constructor" or "toString" cannot masquerade as entities.
    const state = createInitialState(1);
    assert.equal(findEntity(state, 'constructor'), undefined);
    assert.equal(findEntity(state, 'toString'), undefined);
    assert.equal(findEntity(state, '__proto__'), undefined);
  });
});

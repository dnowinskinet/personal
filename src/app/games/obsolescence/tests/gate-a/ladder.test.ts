/**
 * The teaching ladder.
 *
 * Playtest verdict on the full game cold was that it "hits the learning curve like a brick wall".
 * These tests hold the ramp honest: each stage must turn on exactly one new system, the first must
 * be genuinely unfailable, and each later stage must actually reward the lesson it teaches.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  LADDER,
  Q1_ONE_THING,
  Q2_TWO_SHELVES,
  Q3_BETTER_PARTS,
  Q4_HEARD_OF_IT,
  Q5_THE_REAL_THING,
} from '../../content/quarters';
import { runBot } from '../../devtools/bots';
import { assemblyOptions, runToDeadline, startQuarter } from '../../sim/index';

const SEEDS = 80;

function share(config: (typeof LADDER)[number], bot: 'balanced' | 'adaptive'): number {
  let met = 0;
  for (let index = 0; index < SEEDS; index += 1) {
    if (runBot(bot, config, 1000 + index * 7919).outcome.goalMet) {
      met += 1;
    }
  }
  return met / SEEDS;
}

describe('the ladder introduces one system at a time', () => {
  it('has five stages in order', () => {
    assert.deepEqual(
      LADDER.map((stage) => stage.id),
      ['q1-one-thing', 'q2-two-shelves', 'q3-better-parts', 'q4-heard-of-it', 'q5-the-real-thing']
    );
  });

  it('never switches a system back off', () => {
    const keys = ['allocation', 'research', 'market', 'focus'] as const;
    for (let index = 1; index < LADDER.length; index += 1) {
      for (const key of keys) {
        const before = LADDER[index - 1].enabled[key];
        const after = LADDER[index].enabled[key];
        assert.ok(
          !before || after,
          `${LADDER[index].id} turned ${key} back off — the ramp must only ever add`
        );
      }
    }
  });

  it('never removes a part kind', () => {
    for (let index = 1; index < LADDER.length; index += 1) {
      for (const kind of LADDER[index - 1].partKinds) {
        assert.ok(
          LADDER[index].partKinds.includes(kind),
          `${LADDER[index].id} dropped ${kind}`
        );
      }
    }
  });

  it('gives every stage a title and a stated lesson', () => {
    for (const stage of LADDER) {
      assert.ok(stage.title.length > 4, `${stage.id} needs a title`);
      assert.ok(stage.teaches.length > 15, `${stage.id} needs to say what it teaches`);
    }
  });
});

describe('Q1 cannot be failed', () => {
  it('offers no choices at all', () => {
    assert.equal(Q1_ONE_THING.enabled.allocation, false);
    assert.equal(Q1_ONE_THING.enabled.research, false);
    assert.equal(Q1_ONE_THING.enabled.market, false);
    assert.equal(Q1_ONE_THING.enabled.focus, false);
    assert.equal(Q1_ONE_THING.partKinds.length, 1);
  });

  it('puts every member of staff on production, since there is nowhere else', () => {
    const state = startQuarter(Q1_ONE_THING, 1);
    assert.equal(state.allocation.production, Q1_ONE_THING.staff);
    assert.equal(state.allocation.research, 0);
    assert.equal(state.allocation.market, 0);
  });

  it('offers exactly one grade, so there is no menu to misread', () => {
    let state = startQuarter(Q1_ONE_THING, 1);
    state = runToDeadline(state, Q1_ONE_THING);
    const options = assemblyOptions(state.stock, Q1_ONE_THING.partKinds, 1);
    assert.equal(options.length, 1);
    assert.equal(options[0].available, true, 'and it must always be buildable');
  });

  it('is met on every seed', () => {
    assert.equal(share(Q1_ONE_THING, 'balanced'), 1);
  });
});

describe('each later stage rewards its own lesson', () => {
  it('Q2 introduces a second part and the focus control', () => {
    assert.equal(Q2_TWO_SHELVES.partKinds.length, 2);
    assert.equal(Q2_TWO_SHELVES.enabled.focus, true);
    assert.equal(Q2_TWO_SHELVES.enabled.research, false);
    assert.ok(share(Q2_TWO_SHELVES, 'balanced') >= 0.9, 'balanced play should still clear it');
  });

  it('Q3 makes research matter', () => {
    assert.equal(Q3_BETTER_PARTS.enabled.research, true);
    assert.equal(Q3_BETTER_PARTS.enabled.market, false);
    const passive = share(Q3_BETTER_PARTS, 'balanced');
    const attentive = share(Q3_BETTER_PARTS, 'adaptive');
    assert.ok(attentive > passive + 0.2, `research must pay: passive ${passive}, attentive ${attentive}`);
  });

  it('Q4 makes market prep matter', () => {
    assert.equal(Q4_HEARD_OF_IT.enabled.market, true);
    const passive = share(Q4_HEARD_OF_IT, 'balanced');
    const attentive = share(Q4_HEARD_OF_IT, 'adaptive');
    assert.ok(attentive > passive, `market prep must pay: passive ${passive}, attentive ${attentive}`);
  });

  it('Q5 turns everything on', () => {
    assert.equal(Q5_THE_REAL_THING.partKinds.length, 3);
    for (const value of Object.values(Q5_THE_REAL_THING.enabled)) {
      assert.equal(value, true);
    }
  });

  it('keeps every stage winnable by attentive play', () => {
    for (const stage of LADDER) {
      const attentive = share(stage, 'adaptive');
      assert.ok(attentive >= 0.5, `${stage.id} is a wall — attentive play meets it only ${attentive * 100}%`);
    }
  });

  it('keeps every stage shippable, so no stage is a dead end', () => {
    for (const stage of LADDER) {
      for (let index = 0; index < 20; index += 1) {
        const { outcome } = runBot('balanced', stage, 1000 + index * 7919);
        assert.equal(outcome.shipped, true, `${stage.id} failed to ship anything at seed index ${index}`);
      }
    }
  });
});

describe('a disabled system cannot be interacted with', () => {
  it('ignores staff assigned to a department that does not exist', () => {
    // The bug this catches made the teaching quarters unwinnable: a third of the staff sat on
    // market prep during a quarter with no marketing, doing nothing.
    let state = startQuarter(Q3_BETTER_PARTS, 1);
    const before = state.allocation.production;
    state = runToDeadline(state, Q3_BETTER_PARTS);
    assert.equal(state.allocation.market, 0, 'nobody may be assigned to market prep in Q3');
    assert.ok(before > 0);
  });

  it('treats the launch as fully prepared when market prep is off', () => {
    const { outcome } = runBot('balanced', Q3_BETTER_PARTS, 77);
    assert.equal(outcome.marketReadiness, 100);
  });

  it('holds every part at tier 1 when research is off', () => {
    let state = startQuarter(Q2_TWO_SHELVES, 5);
    state = runToDeadline(state, Q2_TWO_SHELVES);
    for (const kind of Q2_TWO_SHELVES.partKinds) {
      assert.equal(state.stock[kind][2], 0);
      assert.equal(state.stock[kind][3], 0);
    }
  });
});

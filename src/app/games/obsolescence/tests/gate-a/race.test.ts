/**
 * Gate A — the machine-measurable conditions.
 *
 * See docs/obsolescence/gates/A-quarter-race.brief.md. These replace a tester panel: they answer
 * whether any single sink is a right answer, whether being present while the clock runs beats
 * setting it once, and whether the assembly menu ever actually bites.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Q1 } from '../../content/quarters';
import { ALL_BOTS, runBot, runSweep, focusMatters } from '../../devtools/bots';
import {
  assemblyOptions,
  bestAvailable,
  emptyStock,
  evenAllocation,
  reallocate,
  resolveQuarter,
  runToDeadline,
  startQuarter,
} from '../../sim/index';

const SEEDS = 200;
const sweep = runSweep(Q1, SEEDS);

describe('Gate A condition 1 — all three sinks are live', () => {
  it('lets no single-sink strategy win more than 55% of seeds', () => {
    const detail = ALL_BOTS.map((name) => `${name} ${sweep.wins[name]}`).join(', ');
    assert.ok(
      sweep.singleSinkWinShare <= 0.55,
      `a single sink is a right answer in ${(sweep.singleSinkWinShare * 100).toFixed(0)}% of seeds. ${detail}`
    );
  });

  it('punishes starving any one sink', () => {
    // Each lopsided bot must do materially worse than a sensible split, or that sink is optional.
    for (const name of ['research-heavy', 'production-heavy', 'market-heavy'] as const) {
      assert.ok(
        sweep.meanScore[name] < sweep.meanScore.balanced - 8,
        `${name} scores ${sweep.meanScore[name]} against balanced ${sweep.meanScore.balanced} — starving the other sinks costs too little`
      );
    }
  });

  it('makes what production concentrates on matter', () => {
    const share = focusMatters(Q1, 120);
    assert.ok(share >= 0.5, `production focus changed the outcome in only ${(share * 100).toFixed(0)}% of seeds`);
  });
});

describe('Gate A condition 2 — the deadline binds', () => {
  it('rewards reallocating mid-quarter over setting it once', () => {
    assert.ok(
      sweep.adaptiveEdge >= 0.6,
      `reallocating beat the best static allocation in only ${(sweep.adaptiveEdge * 100).toFixed(0)}% of seeds — there is no reason to be present while the clock runs`
    );
  });

  it('separates attentive play from set-and-forget on the goal', () => {
    assert.ok(
      sweep.goalMetShare.adaptive - sweep.goalMetShare.balanced > 25,
      `attentive play meets the goal ${sweep.goalMetShare.adaptive}% against ${sweep.goalMetShare.balanced}% — too close to matter`
    );
  });
});

describe('Gate A condition 3 — assembly is genuinely constrained', () => {
  it('leaves a reasonable non-reactive run unable to build something', () => {
    assert.ok(
      sweep.blockedShare >= 0.3,
      `only ${(sweep.blockedShare * 100).toFixed(0)}% of reasonable runs hit a constraint — the payoff moment has no teeth`
    );
  });

  it('states exactly what is missing when an option is blocked', () => {
    const options = assemblyOptions(emptyStock());
    for (const option of options) {
      assert.equal(option.available, false);
      assert.ok(option.blockedBy, `${option.id} must say why it cannot be built`);
      assert.match(option.blockedBy, /no (chassis|board|cell)/);
    }
  });

  it('cannot ship anything with an empty shelf', () => {
    assert.equal(bestAvailable(emptyStock()), null);
    let state = startQuarter(Q1, 1);
    state = { ...state, phase: 'assembly' };
    const outcome = resolveQuarter(state, Q1, null);
    assert.equal(outcome.shipped, false);
    assert.ok(outcome.cash < 0, 'a quarter with no product must cost money');
    assert.ok(outcome.standing < 0, 'and standing');
  });
});

describe('the model behaves sanely', () => {
  it('is deterministic for a given seed', () => {
    const first = runBot('adaptive', Q1, 4242);
    const second = runBot('adaptive', Q1, 4242);
    assert.deepEqual(first.state, second.state);
    assert.deepEqual(first.outcome, second.outcome);
  });

  it('produces different runs for different seeds', () => {
    const shapes = new Set(
      Array.from({ length: 40 }, (_, index) => JSON.stringify(runBot('balanced', Q1, index * 977 + 1).state.stock))
    );
    assert.ok(shapes.size > 1, 'seed has no effect');
  });

  it('stops exactly at the deadline', () => {
    let state = startQuarter(Q1, 7);
    state = runToDeadline(state, Q1);
    assert.equal(state.tick, Q1.lengthTicks);
    assert.equal(state.phase, 'assembly');
  });

  it('never lets allocation exceed the staff pool', () => {
    let state = startQuarter(Q1, 7);
    state = reallocate(state, Q1, { research: 99, production: 99, market: 99 });
    const total = state.allocation.research + state.allocation.production + state.allocation.market;
    assert.ok(total <= Q1.staff, `allocated ${total} of ${Q1.staff}`);
  });

  it('counts reallocations so attentiveness is measurable', () => {
    let state = startQuarter(Q1, 7);
    assert.equal(state.reallocations, 0);
    state = reallocate(state, Q1, { research: 8, production: 3, market: 1 });
    assert.equal(state.reallocations, 1);
    // A no-op reassignment must not count as attention.
    state = reallocate(state, Q1, { research: 8, production: 3, market: 1 });
    assert.equal(state.reallocations, 1);
  });

  it('keeps quality and score inside sane bounds', () => {
    for (const name of ALL_BOTS) {
      for (let index = 0; index < 40; index += 1) {
        const { outcome } = runBot(name, Q1, index * 31 + 5);
        assert.ok(outcome.quality >= 0 && outcome.quality <= 100, `${name} quality ${outcome.quality}`);
        assert.ok(outcome.score >= 0 && outcome.score <= 100, `${name} score ${outcome.score}`);
      }
    }
  });

  it('cannot produce a tier above the research level', () => {
    let state = startQuarter(Q1, 11);
    state = reallocate(state, Q1, { research: 0, production: 12, market: 0 });
    state = runToDeadline(state, Q1);
    assert.equal(state.researchLevel, 1, 'no research means no tier ceiling rise');
    for (const kind of ['chassis', 'board', 'cell'] as const) {
      assert.equal(state.stock[kind][2], 0, `${kind} should have no tier 2`);
      assert.equal(state.stock[kind][3], 0, `${kind} should have no tier 3`);
    }
  });

  it('gives an even split to start, using the whole pool', () => {
    const allocation = evenAllocation(Q1.staff);
    assert.equal(allocation.research + allocation.production + allocation.market, Q1.staff);
  });
});

import { DIFFICULTY_META, TUNING } from './constants';
import { createInitialGameState } from './initial-map';
import {
  buildService,
  dispatchLawyers,
  hireLawyer,
  promoteLawyer,
  scoutNextTile,
  scoutTile,
  shipResource,
  upgradeCityHall,
} from './planning';
import { deriveCityLevel, tickGame } from './simulation';
import { GameState } from './types';

function tickTimes(state: GameState, ticks: number): GameState {
  let next = state;

  for (let index = 0; index < ticks; index += 1) {
    next = tickGame(next);
  }

  return next;
}

describe('ai settlement simulation', () => {
  it('creates deterministic randomized terrain layouts', () => {
    const fixed = createInitialGameState(2, 'firstSettlement', 'fixed');
    const randomA = createInitialGameState(2, 'firstSettlement', 'randomized');
    const randomB = createInitialGameState(2, 'firstSettlement', 'randomized');

    expect(randomA.cells.map((cell) => cell.terrain)).toEqual(randomB.cells.map((cell) => cell.terrain));
    expect(randomA.cells.map((cell) => cell.terrain)).not.toEqual(fixed.cells.map((cell) => cell.terrain));
    expect(randomA.cells.filter((cell) => cell.owner === 'dataCenter').length).toBe(TUNING.DATA_CENTER_COUNT);
  });

  it('uses the next level difficulty to spawn tougher bots sooner', () => {
    let state = createInitialGameState(0, 'nextLevel');

    state = tickTimes(state, DIFFICULTY_META.nextLevel.botGraceTicks + DIFFICULTY_META.nextLevel.botSpawnTicks);

    expect(state.bots.length).toBeGreaterThan(0);
    expect(state.bots.every((bot) => bot.strength > 1)).toBeTrue();
  });

  it('keeps city hall levels tied to explicit upgrades', () => {
    expect(deriveCityLevel(8)).toBe(1);
    expect(deriveCityLevel(12)).toBe(2);
    expect(deriveCityLevel(22)).toBe(3);
    expect(deriveCityLevel(34)).toBe(4);
    expect(deriveCityLevel(48)).toBe(5);

    const state = createInitialGameState();
    state.population = 48;
    state.happiness = 100;
    state.services.housing = 3;

    const next = tickTimes(state, TUNING.POPULATION_GROWTH_TICKS);

    expect(next.cityLevel).toBe(1);
  });

  it('upgrades city hall through a paid planning action', () => {
    const state = createInitialGameState();
    state.population = 12;
    state.resources.materials = 100;
    state.resources.budget = 100;

    const next = upgradeCityHall(state);

    expect(next.cityLevel).toBe(2);
    expect(next.resources.budget).toBeLessThan(100);
  });

  it('runs resources on slow whole-number economy cycles', () => {
    const state = createInitialGameState();
    const beforeCycle = tickGame(state);

    expect(beforeCycle.resources).toEqual(state.resources);

    const afterCycle = tickTimes(state, TUNING.ECONOMY_TICK_SECONDS);

    expect(Number.isInteger(afterCycle.resources.food)).toBeTrue();
    expect(afterCycle.resources.food).not.toBe(state.resources.food);
  });

  it('drains votes when demand failures drive happiness low', () => {
    const state = createInitialGameState();
    state.resources = {
      food: 0,
      water: 0,
      power: 0,
      materials: 0,
      budget: 0,
    };
    state.happiness = 20;

    const next = tickTimes(state, TUNING.ECONOMY_TICK_SECONDS);

    expect(next.votes).toBeLessThan(state.votes);
  });

  it('builds demanded city services when resources are available', () => {
    const state = createInitialGameState();
    state.resources.materials = 80;
    state.resources.budget = 80;

    const next = buildService(state, 'housing');

    expect(next.services.housing).toBe(1);
  });

  it('keeps bots dormant until the opening grace period passes', () => {
    let state = createInitialGameState();

    for (let index = 0; index < DIFFICULTY_META.firstSettlement.botGraceTicks - 1; index += 1) {
      state = tickGame(state);
    }

    expect(state.bots.length).toBe(0);

    for (let index = 0; index < DIFFICULTY_META.firstSettlement.botSpawnTicks; index += 1) {
      state = tickGame(state);
    }

    expect(state.bots.length).toBeGreaterThan(0);
    expect(state.bots.every((bot) => bot.mode === 'dormant')).toBeTrue();
  });

  it('scouts the selected frontier tile directly', () => {
    const state = createInitialGameState();
    const next = scoutTile(state, 'cell-0-1');

    expect(next.cells.find((cell) => cell.id === 'cell-0-1')?.visibility).toBe('scouted');
  });

  it('can ship materials with budget instead of spending materials', () => {
    const state = createInitialGameState();
    state.resources.materials = 0;
    state.resources.budget = 50;

    const next = shipResource(state, 'materials');

    expect(next.resources.materials).toBeGreaterThan(0);
    expect(next.resources.budget).toBeLessThan(50);
  });

  it('separates lawyer hiring from promotion', () => {
    const state = createInitialGameState();
    state.resources.materials = 100;
    state.resources.budget = 100;
    state.cells
      .filter((cell) => cell.terrain === 'homes')
      .slice(0, 2)
      .forEach((cell) => {
        cell.visibility = 'scouted';
        cell.owner = 'city';
        cell.building = 'housing';
      });

    const hired = hireLawyer(state);
    expect(hired.lawyers.length).toBe(2);

    const promoted = promoteLawyer(hired);
    expect(promoted.lawyers.some((lawyer) => lawyer.rank === 'seniorAssociate')).toBeTrue();
    expect(promoted.lawyers.length).toBe(2);
  });

  it('recovers lawyer burnout over time', () => {
    const state = createInitialGameState();
    state.lawyers[0].burnout = 60;

    const next = tickGame(state);

    expect(next.lawyers[0].burnout).toBeLessThan(60);
  });

  it('can dispatch lawyers toward an eligible discovered data center', () => {
    let state = createInitialGameState();
    state.resources.materials = 100;
    state.resources.budget = 100;
    state.resources.power = 100;

    for (let index = 0; index < 6; index += 1) {
      state = scoutNextTile(state);
    }

    state.cells
      .filter((cell) => cell.owner === 'dataCenter')
      .forEach((cell) => {
        cell.visibility = 'scouted';
      });

    state.cells
      .filter((cell) => cell.id === 'cell-4-1' || cell.id === 'cell-3-0' || cell.id === 'cell-3-1')
      .forEach((cell) => {
        cell.visibility = 'scouted';
        cell.owner = 'city';
        cell.building = 'workshop';
      });

    state = promoteLawyer(state);
    state = promoteLawyer(state);
    state = promoteLawyer(state);
    state = promoteLawyer(state);
    const next = dispatchLawyers(state, 'raidNearestDataCenter');

    expect(next.lawyers.some((lawyer) => lawyer.assignment === 'raid')).toBeTrue();
  });

  it('explains raid blockers when strength is enough but adjacency is not', () => {
    let state = createInitialGameState();
    state.lawyers[0].rank = 'lawFirmPartner';
    state.cells
      .filter((cell) => cell.owner === 'dataCenter')
      .forEach((cell) => {
        cell.visibility = 'scouted';
      });

    state = dispatchLawyers(state, 'raidNearestDataCenter');

    expect(state.log[0].message).toContain('adjacent city tiles');
  });

  it('calculates a final score when all data centers are destroyed', () => {
    const state = createInitialGameState();
    state.cells
      .filter((cell) => cell.owner === 'dataCenter')
      .forEach((cell) => {
        cell.owner = 'neutral';
        cell.building = 'ruins';
        cell.dataCenterId = null;
      });

    const next = tickGame(state);

    expect(next.status).toBe('won');
    expect(next.score?.total).toBeGreaterThan(0);
    expect(next.score?.breakdown.some((line) => line.label === 'Data centers')).toBeTrue();
  });
});

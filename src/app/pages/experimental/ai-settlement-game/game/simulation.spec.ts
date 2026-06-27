import { DIFFICULTY_META, TUNING } from './constants';
import { createInitialGameState } from './initial-map';
import {
  buildService,
  claimTile,
  dispatchLawyers,
  hireLawyer,
  inviteResidents,
  promoteLawyer,
  scoutNextTile,
  scoutTile,
  shipResource,
  upgradeCityHall,
  upgradeProduction,
} from './planning';
import { deriveCityLevel, getCellProduction, getDemandProfile, tickGame } from './simulation';
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
    expect(next.population).toBe(48);
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

    const next = tickTimes(state, TUNING.ECONOMY_TICK_SECONDS * (TUNING.VOTE_GRACE_ECONOMY_CYCLES + 1));

    expect(next.votes).toBeLessThan(state.votes);
    expect(next.shortageStress).toBeGreaterThan(0);
  });

  it('builds demanded city services when resources are available', () => {
    const state = createInitialGameState();
    state.resources.materials = 80;
    state.resources.budget = 80;

    const next = buildService(state, 'housing');

    expect(next.services.housing).toBe(1);
  });

  it('grows population only through the resident invitation action', () => {
    const state = createInitialGameState();
    state.resources.food = 80;
    state.resources.water = 80;
    state.resources.budget = 80;
    state.services.housing = 1;
    state.happiness = 80;

    const passive = tickTimes(state, TUNING.POPULATION_GROWTH_TICKS);
    const invited = inviteResidents(state);

    expect(passive.population).toBe(state.population);
    expect(invited.population).toBe(state.population + TUNING.INVITE_RESIDENTS_AMOUNT);
    expect(invited.resources.budget).toBeLessThan(state.resources.budget);
  });

  it('keeps bots from spawning until the opening grace period passes, then builds them', () => {
    let state = createInitialGameState();

    for (let index = 0; index < DIFFICULTY_META.firstSettlement.botGraceTicks - 1; index += 1) {
      state = tickGame(state);
    }

    expect(state.bots.length).toBe(0);

    for (let index = 0; index < DIFFICULTY_META.firstSettlement.botSpawnTicks; index += 1) {
      state = tickGame(state);
    }

    expect(state.bots.length).toBeGreaterThan(0);
    expect(state.bots.every((bot) => bot.mode === 'building')).toBeTrue();
    expect(state.bots.every((bot) => bot.buildTicksRemaining > 0)).toBeTrue();
  });

  it('points assembled bots at built city assets before empty claimed sites', () => {
    const state = createInitialGameState();
    const dataCenter = state.cells.find((cell) => cell.owner === 'dataCenter')!;
    const emptySite = state.cells.find((cell) => cell.id === 'cell-3-0')!;
    const builtSite = state.cells.find((cell) => cell.id === 'cell-1-1')!;

    emptySite.visibility = 'scouted';
    emptySite.owner = 'city';
    emptySite.building = null;
    builtSite.visibility = 'scouted';
    builtSite.owner = 'city';
    builtSite.terrain = 'farms';
    builtSite.building = 'farm';
    state.bots = [
      {
        id: 'bot-test',
        spawnedBy: dataCenter.dataCenterId!,
        x: dataCenter.x,
        y: dataCenter.y,
        strength: 1,
        mode: 'building',
        buildTicksRemaining: 1,
        demolitionTicksRemaining: 0,
        targetTileId: null,
      },
    ];

    const next = tickGame(state);

    expect(next.bots[0].targetTileId).toBe(builtSite.id);
  });

  it('takes time to scout the selected frontier tile', () => {
    const state = createInitialGameState();
    let next = scoutTile(state, 'cell-0-1');

    expect(next.cells.find((cell) => cell.id === 'cell-0-1')?.visibility).toBe('hidden');
    expect(next.cells.find((cell) => cell.id === 'cell-0-1')?.scoutingTicksRemaining).toBe(TUNING.SCOUT_TICKS);

    next = tickTimes(next, TUNING.SCOUT_TICKS);

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

  it('claims tiles as empty sites before they produce resources', () => {
    const state = createInitialGameState();
    const next = claimTile(state, 'cell-0-2');
    const claimed = next.cells.find((cell) => cell.id === 'cell-0-2');

    expect(claimed?.owner).toBe('city');
    expect(claimed?.building).toBeNull();
    expect(getCellProduction(next, claimed!).power ?? 0).toBe(0);
  });

  it('builds improvements on empty owned sites before upgrading collection rates', () => {
    let state = createInitialGameState();
    state.resources.materials = 100;
    state.resources.budget = 100;

    state = claimTile(state, 'cell-0-2');
    const built = upgradeProduction(state, 'power');
    const improved = built.cells.find((cell) => cell.id === 'cell-0-2');

    expect(improved?.building).toBe('substation');
    expect(built.upgrades.power).toBe(1);
    expect(getCellProduction(built, improved!).power ?? 0).toBeGreaterThan(0);
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

  it('can dispatch lawyers toward an eligible discovered data center without owning adjacent tiles', () => {
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

    state = promoteLawyer(state);
    state = promoteLawyer(state);
    state = promoteLawyer(state);
    state = promoteLawyer(state);
    const next = dispatchLawyers(state, 'raidNearestDataCenter');

    expect(next.lawyers.some((lawyer) => lawyer.assignment === 'raid')).toBeTrue();
  });

  it('explains raid blockers when legal strength is too low', () => {
    let state = createInitialGameState();
    state.cells
      .filter((cell) => cell.owner === 'dataCenter')
      .forEach((cell) => {
        cell.visibility = 'scouted';
      });

    state = dispatchLawyers(state, 'raidNearestDataCenter');

    expect(state.log[0].message).toContain('needs legal strength');
  });

  it('increases resource demand as population grows', () => {
    const state = createInitialGameState();
    const lowPopulationDemand = getDemandProfile(state).resources.food ?? 0;

    state.population = 24;

    expect(getDemandProfile(state).resources.food ?? 0).toBeGreaterThan(lowPopulationDemand);
  });

  it('gates collection-rate upgrades behind city hall level and keeps material cost flat', () => {
    let state = createInitialGameState();
    state.resources.materials = 100;
    state.resources.budget = 100;

    const blocked = upgradeProduction(state, 'food');
    expect(blocked.upgrades.food).toBe(1);
    expect(blocked.log[0].message).toContain('City Hall level 2');

    state.population = 12;
    state = upgradeCityHall(state);
    state.cells
      .filter((cell) => cell.id === 'cell-1-1')
      .forEach((cell) => {
        cell.visibility = 'scouted';
        cell.owner = 'city';
        cell.terrain = 'farms';
        cell.building = 'farm';
      });
    const upgraded = upgradeProduction(state, 'food');

    expect(upgraded.upgrades.food).toBe(2);
    expect(state.resources.materials - upgraded.resources.materials).toBe(4);
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

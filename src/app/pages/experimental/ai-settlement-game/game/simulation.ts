import {
  BASE_PRODUCTION_BY_TERRAIN,
  DEMAND_BY_LEVEL,
  DIFFICULTY_META,
  LAWYER_RANK_ORDER,
  LAWYER_RANKS,
  POPULATION_DEMAND_BY_LEVEL,
  RESOURCE_KEYS,
  SERVICE_KEYS,
  SERVICE_META,
  TUNING,
} from './constants';
import {
  BotUnit,
  DemandProfile,
  GameState,
  LawyerRank,
  LawyerSquad,
  LogTone,
  MapCell,
  RaidReadiness,
  ResourceKey,
  ResourceStock,
  TerrainType,
} from './types';

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function roundResource(value: number): number {
  return Math.round(value);
}

export function distance(a: Pick<MapCell, 'x' | 'y'>, b: Pick<MapCell, 'x' | 'y'>): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function cloneGameState(state: GameState): GameState {
  return {
    ...state,
    resources: { ...state.resources },
    services: { ...state.services },
    upgrades: { ...state.upgrades },
    storage: { ...state.storage },
    shipping: { ...state.shipping },
    planning: { ...state.planning },
    score: state.score
      ? {
          ...state.score,
          breakdown: state.score.breakdown.map((line) => ({ ...line })),
        }
      : null,
    log: [...state.log],
    cells: state.cells.map((cell) => ({ ...cell })),
    lawyers: state.lawyers.map((lawyer) => ({ ...lawyer })),
    bots: state.bots.map((bot) => ({ ...bot })),
  };
}

export function addLog(state: GameState, message: string, tone: LogTone = 'info'): void {
  state.logCursor += 1;
  state.log = [
    {
      id: state.logCursor,
      time: state.time,
      message,
      tone,
    },
    ...state.log,
  ].slice(0, 14);
}

export function getCell(state: GameState, id: string | null): MapCell | undefined {
  return id ? state.cells.find((cell) => cell.id === id) : undefined;
}

export function getCellAt(state: GameState, x: number, y: number): MapCell | undefined {
  return state.cells.find((cell) => cell.x === x && cell.y === y);
}

export function getTownHallCell(state: GameState): MapCell | undefined {
  return state.cells.find((cell) => cell.building === 'townHall');
}

export function getAdjacentCells(state: GameState, cell: MapCell): MapCell[] {
  return state.cells.filter((candidate) => distance(candidate, cell) === 1);
}

export function canAfford(resources: ResourceStock, cost: Partial<ResourceStock>): boolean {
  return RESOURCE_KEYS.every((key) => resources[key] >= (cost[key] ?? 0));
}

export function resourceCapacity(state: GameState, resource: ResourceKey): number {
  return TUNING.BASE_RESOURCE_CAPACITY + state.storage[resource] * TUNING.STORAGE_PER_LEVEL;
}

export function adjustResources(state: GameState, delta: Partial<ResourceStock>): void {
  RESOURCE_KEYS.forEach((key) => {
    state.resources[key] = roundResource(clamp(state.resources[key] + (delta[key] ?? 0), 0, resourceCapacity(state, key)));
  });
}

export function spendResources(state: GameState, cost: Partial<ResourceStock>): void {
  const delta: Partial<ResourceStock> = {};

  RESOURCE_KEYS.forEach((key) => {
    delta[key] = -(cost[key] ?? 0);
  });

  adjustResources(state, delta);
}

export function deriveCityLevel(population: number): number {
  return TUNING.POPULATION_LEVELS.reduce((level, threshold, index) => {
    return population >= threshold ? index + 1 : level;
  }, 1);
}

export function getDemandProfile(state: GameState): DemandProfile {
  const baseDemand = DEMAND_BY_LEVEL[state.cityLevel] ?? DEMAND_BY_LEVEL[5];
  const populationDemand = POPULATION_DEMAND_BY_LEVEL[state.cityLevel] ?? POPULATION_DEMAND_BY_LEVEL[5];
  const populationMultiplier = Math.max(1, Math.floor(state.population / TUNING.POPULATION_DEMAND_INTERVAL));
  const resources: Partial<ResourceStock> = { ...baseDemand.resources };

  RESOURCE_KEYS.forEach((key) => {
    resources[key] = (resources[key] ?? 0) + (populationDemand[key] ?? 0) * populationMultiplier;
  });

  return {
    resources,
    services: { ...baseDemand.services },
  };
}

export function controlledTerrainCount(state: GameState, terrain: TerrainType): number {
  return state.cells.filter(
    (cell) => cell.owner === 'city' && cell.terrain === terrain && cell.building !== 'townHall' && cell.building !== 'ruins'
  ).length;
}

export function builtTerrainCount(state: GameState, terrain: TerrainType): number {
  return state.cells.filter(
    (cell) => cell.owner === 'city' && cell.terrain === terrain && cell.building !== null && cell.building !== 'townHall' && cell.building !== 'ruins'
  ).length;
}

export function getUpgradeCap(state: GameState, resource: ResourceKey): number {
  const terrain: Record<ResourceKey, TerrainType> = {
    food: 'farms',
    water: 'water',
    power: 'power',
    materials: 'industry',
    budget: 'homes',
  };

  return Math.min(state.cityLevel, 1 + controlledTerrainCount(state, terrain[resource]));
}

export function getCellProduction(state: GameState, cell: MapCell): Partial<ResourceStock> {
  if (cell.owner !== 'city' || cell.building === 'ruins' || cell.building === null) {
    return {};
  }

  if (cell.building === 'townHall') {
    return {
      budget: roundResource(1 + Math.floor(state.population / TUNING.POPULATION_BUDGET_INTERVAL)),
    };
  }

  const base = BASE_PRODUCTION_BY_TERRAIN[cell.terrain];
  const production: Partial<ResourceStock> = {};

  RESOURCE_KEYS.forEach((key) => {
    const amount = base[key] ?? 0;

    if (amount > 0) {
      production[key] = roundResource(amount + (state.upgrades[key] - 1) * 2);
    }
  });

  return production;
}

export function getTotalProduction(state: GameState): ResourceStock {
  const total: ResourceStock = {
    food: 0,
    water: 0,
    power: 0,
    materials: 0,
    budget: 0,
  };

  state.cells.forEach((cell) => {
    const production = getCellProduction(state, cell);
    RESOURCE_KEYS.forEach((key) => {
      total[key] = roundResource(total[key] + (production[key] ?? 0));
    });
  });

  return total;
}

export function getRequiredServiceLevel(state: GameState, service: keyof GameState['services']): number {
  return getDemandProfile(state).services[service] ?? 0;
}

export function getServiceUpkeep(state: GameState): Partial<ResourceStock> {
  const upkeep: Partial<ResourceStock> = {};

  SERVICE_KEYS.forEach((service) => {
    const level = state.services[service];

    RESOURCE_KEYS.forEach((key) => {
      upkeep[key] = (upkeep[key] ?? 0) + (SERVICE_META[service].upkeep[key] ?? 0) * level;
    });
  });

  return upkeep;
}

export function getTotalDemand(state: GameState): ResourceStock {
  const demand = getDemandProfile(state);
  const upkeep = getServiceUpkeep(state);
  const total: ResourceStock = {
    food: 0,
    water: 0,
    power: 0,
    materials: 0,
    budget: 0,
  };

  RESOURCE_KEYS.forEach((key) => {
    total[key] = roundResource((demand.resources[key] ?? 0) + (upkeep[key] ?? 0));
  });

  return total;
}

export function getNetResourcePerCycle(state: GameState, resource: ResourceKey): number {
  return roundResource(getTotalProduction(state)[resource] - getTotalDemand(state)[resource]);
}

export function getCyclesUntilEmpty(state: GameState, resource: ResourceKey): number | null {
  const net = getNetResourcePerCycle(state, resource);

  if (net >= 0) {
    return null;
  }

  return Math.max(0, Math.ceil(state.resources[resource] / Math.abs(net)));
}

export function getLawyerStrength(lawyer: LawyerSquad): number {
  return LAWYER_RANKS[lawyer.rank].strength;
}

export function isLawyerAvailable(lawyer: LawyerSquad): boolean {
  return lawyer.assignment !== 'recovering' && lawyer.burnout < TUNING.BURNOUT_RECOVERY_THRESHOLD;
}

export function availableLawyerStrength(state: GameState): number {
  return state.lawyers
    .filter(isLawyerAvailable)
    .reduce((total, lawyer) => total + getLawyerStrength(lawyer), 0);
}

export function getRaidReadiness(state: GameState, cell: MapCell): RaidReadiness {
  const adjacent = getAdjacentCells(state, cell);
  const adjacentNeeded = 0;
  const adjacentControlled = adjacent.filter((candidate) => candidate.owner === 'city').length;
  const strength = availableLawyerStrength(state);
  const totalStrength = state.lawyers.reduce((total, lawyer) => total + getLawyerStrength(lawyer), 0);
  const blockers: string[] = [];

  if (cell.owner !== 'dataCenter' || cell.building !== 'dataCenter' || cell.visibility !== 'scouted') {
    blockers.push('data center must be discovered');
  }

  if (strength < TUNING.RAID_REQUIRED_STRENGTH) {
    if (totalStrength >= TUNING.RAID_REQUIRED_STRENGTH) {
      blockers.push(`needs available legal strength ${TUNING.RAID_REQUIRED_STRENGTH}; has ${strength} ready while other squads recover`);
    } else {
      blockers.push(`needs legal strength ${TUNING.RAID_REQUIRED_STRENGTH}; has ${strength} ready`);
    }
  }

  return {
    eligible: blockers.length === 0,
    adjacentControlled,
    adjacentNeeded,
    availableStrength: strength,
    requiredStrength: TUNING.RAID_REQUIRED_STRENGTH,
    blockers,
  };
}

export function isDataCenterRaidEligible(state: GameState, cell: MapCell): boolean {
  return getRaidReadiness(state, cell).eligible;
}

export function getRaidEligibleDataCenters(state: GameState): MapCell[] {
  return state.cells.filter((cell) => isDataCenterRaidEligible(state, cell));
}

export function calculateEndScore(state: GameState, outcome: 'won' | 'lost') {
  const difficulty = DIFFICULTY_META[state.difficulty];
  const remainingDataCenters = state.cells.filter((cell) => cell.owner === 'dataCenter' && cell.building === 'dataCenter').length;
  const destroyedDataCenters = Math.max(0, TUNING.DATA_CENTER_COUNT - remainingDataCenters);
  const ruinedTiles = state.cells.filter((cell) => cell.building === 'ruins').length;
  const base = outcome === 'won' ? 1000 : 150;
  const dataCenterBonus = destroyedDataCenters * 500;
  const votesBonus = Math.round(state.votes * 10);
  const happinessBonus = Math.round(state.happiness * 6);
  const populationBonus = state.population * 25;
  const cityHallBonus = state.cityLevel * 100;
  const timeBonus = outcome === 'won' ? Math.max(0, 900 - state.time * 2) : 0;
  const damagePenalty = -(ruinedTiles * 80 + state.bots.length * 30 + (outcome === 'lost' ? 400 : 0));
  const subtotal = Math.max(
    0,
    base + dataCenterBonus + votesBonus + happinessBonus + populationBonus + cityHallBonus + timeBonus + damagePenalty
  );
  const difficultyBonus = Math.round(subtotal * (difficulty.scoreMultiplier - 1));
  const total = Math.max(0, subtotal + difficultyBonus);

  return {
    total,
    outcome,
    rating: total >= 5000 ? 'A' : total >= 3800 ? 'B' : total >= 2600 ? 'C' : total >= 1400 ? 'D' : 'F',
    breakdown: [
      { label: 'Mandate', value: base },
      { label: 'Data centers', value: dataCenterBonus },
      { label: 'Votes', value: votesBonus },
      { label: 'Happiness', value: happinessBonus },
      { label: 'Population', value: populationBonus },
      { label: 'City Hall', value: cityHallBonus },
      { label: 'Speed', value: timeBonus },
      { label: 'Damage', value: damagePenalty },
      { label: difficulty.shortLabel, value: difficultyBonus },
    ].filter((line) => line.value !== 0),
  };
}

function consumeResource(state: GameState, key: ResourceKey, amount: number): number {
  if (amount <= 0) {
    return 0;
  }

  if (state.resources[key] >= amount) {
    state.resources[key] = roundResource(state.resources[key] - amount);
    return 0;
  }

  const shortfall = amount - state.resources[key];
  state.resources[key] = 0;

  return shortfall;
}

function applyEconomy(state: GameState): void {
  if (state.tickCount % TUNING.ECONOMY_TICK_SECONDS !== 0) {
    return;
  }

  adjustResources(state, getTotalProduction(state));

  const totalDemand = getTotalDemand(state);
  let shortagePressure = 0;
  let severeShortages = 0;

  RESOURCE_KEYS.forEach((key) => {
    const required = totalDemand[key];
    const shortfall = consumeResource(state, key, required);

    if (required > 0 && shortfall > 0) {
      shortagePressure += (shortfall / required) * TUNING.SHORTAGE_STRESS_GAIN;
      severeShortages += state.resources[key] < 1 ? 1 : 0;
    }
  });

  state.shortageStress = shortagePressure > 0
    ? roundResource(clamp(state.shortageStress + shortagePressure, 0, 100))
    : roundResource(clamp(state.shortageStress - TUNING.SHORTAGE_STRESS_RECOVERY, 0, 100));

  let servicePressure = 0;
  const demand = getDemandProfile(state);

  SERVICE_KEYS.forEach((service) => {
    const required = demand.services[service] ?? 0;
    const missing = Math.max(0, required - state.services[service]);
    servicePressure += missing * TUNING.SERVICE_STRESS_GAIN;
  });

  state.serviceStress = servicePressure > 0
    ? roundResource(clamp(state.serviceStress + servicePressure, 0, 100))
    : roundResource(clamp(state.serviceStress - TUNING.SERVICE_STRESS_RECOVERY, 0, 100));

  const targetHappiness = clamp(82 - state.shortageStress * 0.45 - state.serviceStress * 0.5 - severeShortages * 2, 0, 100);
  state.happiness = roundResource(clamp(state.happiness + (targetHappiness - state.happiness) * TUNING.HAPPINESS_RESPONSE, 0, 100));

  if (state.happiness < TUNING.VOTE_DRAIN_THRESHOLD) {
    state.lowHappinessCycles += 1;
  } else {
    state.lowHappinessCycles = Math.max(0, state.lowHappinessCycles - 1);
  }

  if (state.lowHappinessCycles >= TUNING.VOTE_GRACE_ECONOMY_CYCLES) {
    const drain = Math.max(
      1,
      Math.ceil(((TUNING.VOTE_DRAIN_THRESHOLD - state.happiness) / TUNING.VOTE_DRAIN_THRESHOLD) * TUNING.VOTE_DRAIN_PER_TICK)
    );
    state.votes = roundResource(clamp(state.votes - drain, 0, TUNING.MAX_VOTES));
  }

  if (
    severeShortages > 0
    && state.lowHappinessCycles >= TUNING.VOTE_GRACE_ECONOMY_CYCLES
    && state.tickCount % (TUNING.ECONOMY_TICK_SECONDS * 3) === 0
  ) {
    state.votes = roundResource(clamp(state.votes - severeShortages * TUNING.SEVERE_SHORTAGE_VOTE_LOSS, 0, TUNING.MAX_VOTES));
    addLog(state, 'Shortages are turning voters into cable news guests.', 'danger');
  }
}

function updateScouting(state: GameState): void {
  state.cells
    .filter((cell) => cell.visibility === 'hidden' && cell.scoutingTicksRemaining > 0)
    .forEach((cell) => {
      cell.scoutingTicksRemaining = Math.max(0, cell.scoutingTicksRemaining - 1);

      if (cell.scoutingTicksRemaining > 0) {
        return;
      }

      cell.visibility = 'scouted';

      if (cell.owner === 'dataCenter') {
        addLog(state, `Scouts found a data center at ${cell.x + 1},${cell.y + 1}.`, 'danger');
      } else {
        addLog(state, `Scouted ${cell.x + 1},${cell.y + 1}.`, 'info');
      }
    });
}

function botTargetValue(state: GameState, cell: MapCell): number {
  if (cell.building === null) {
    return 1;
  }

  const production = getCellProduction(state, cell);
  const productionValue = RESOURCE_KEYS.reduce((total, key) => total + (production[key] ?? 0), 0);
  const terrainValue: Record<TerrainType, number> = {
    homes: 8,
    farms: 7,
    water: 7,
    power: 8,
    industry: 7,
  };

  return 8 + terrainValue[cell.terrain] + productionValue;
}

function chooseBotTarget(state: GameState, origin: MapCell): MapCell | undefined {
  const townHall = getTownHallCell(state);
  const candidates = state.cells
    .filter((cell) => cell.owner === 'city' && cell.building !== 'townHall' && cell.building !== 'ruins')
    .sort((a, b) => {
      const value = botTargetValue(state, b) - botTargetValue(state, a);

      if (value !== 0) {
        return value;
      }

      const distanceToOrigin = distance(origin, a) - distance(origin, b);

      if (distanceToOrigin !== 0) {
        return distanceToOrigin;
      }

      const distanceToCore = townHall ? distance(townHall, a) - distance(townHall, b) : 0;
      return distanceToCore || a.id.localeCompare(b.id);
    });

  return candidates[0] ?? townHall;
}

function spawnBots(state: GameState): void {
  const difficulty = DIFFICULTY_META[state.difficulty];

  if (state.tickCount < difficulty.botGraceTicks) {
    return;
  }

  if (state.tickCount % difficulty.botSpawnTicks !== 0) {
    return;
  }

  state.cells
    .filter((cell) => cell.owner === 'dataCenter' && cell.building === 'dataCenter')
    .forEach((dataCenter) => {
      if (!dataCenter.dataCenterId) {
        return;
      }

      if (state.bots.some((bot) => bot.spawnedBy === dataCenter.dataCenterId)) {
        return;
      }

      const bot: BotUnit = {
        id: `bot-${state.nextBotId}`,
        spawnedBy: dataCenter.dataCenterId,
        x: dataCenter.x,
        y: dataCenter.y,
        strength: Math.min(
          difficulty.maxBotStrength,
          1 + difficulty.botStrengthBonus + Math.floor(state.cityLevel / 3) + Math.floor(state.time / 150)
        ),
        mode: 'building',
        buildTicksRemaining: difficulty.botBuildTicks + (state.nextBotId % 3) * 4,
        demolitionTicksRemaining: 0,
        targetTileId: null,
      };

      state.nextBotId += 1;
      state.bots = [...state.bots, bot];

      if (dataCenter.visibility === 'scouted') {
        addLog(state, `A bot frame started assembling at ${dataCenter.x + 1},${dataCenter.y + 1}.`, 'warning');
      }
    });
}

function buildBots(state: GameState): void {
  state.bots
    .filter((bot) => bot.mode === 'building')
    .forEach((bot) => {
      bot.buildTicksRemaining = Math.max(0, bot.buildTicksRemaining - 1);

      if (bot.buildTicksRemaining > 0) {
        return;
      }

      const origin = getCellAt(state, bot.x, bot.y);
      const target = origin ? chooseBotTarget(state, origin) : getTownHallCell(state);

      if (!target) {
        return;
      }

      bot.mode = 'marching';
      bot.targetTileId = target.id;

      if (origin?.visibility === 'scouted' || target.visibility === 'scouted') {
        addLog(state, `Bot ${bot.id} finished assembly and started marching toward ${target.x + 1},${target.y + 1}.`, 'danger');
      }
    });
}

function stepToward(unit: Pick<BotUnit, 'x' | 'y'>, target: Pick<MapCell, 'x' | 'y'>): { x: number; y: number } {
  const dx = target.x - unit.x;
  const dy = target.y - unit.y;

  if (dx !== 0) {
    return { x: unit.x + Math.sign(dx), y: unit.y };
  }

  if (dy !== 0) {
    return { x: unit.x, y: unit.y + Math.sign(dy) };
  }

  return { x: unit.x, y: unit.y };
}

function moveBots(state: GameState): void {
  if (state.tickCount % TUNING.BOT_MOVE_TICKS !== 0) {
    return;
  }

  state.bots.forEach((bot) => {
    if (bot.mode !== 'marching') {
      return;
    }

    let target = getCell(state, bot.targetTileId);

    if (!target || target.owner !== 'city') {
      const origin = getCellAt(state, bot.x, bot.y);
      target = origin ? chooseBotTarget(state, origin) : getTownHallCell(state);
      bot.targetTileId = target?.id ?? null;
    }

    if (!target) {
      return;
    }

    const occupiedCell = getCellAt(state, bot.x, bot.y);
    if (occupiedCell?.owner === 'city') {
      return;
    }

    const next = stepToward(bot, target);
    bot.x = next.x;
    bot.y = next.y;

    const currentCell = getCellAt(state, bot.x, bot.y);
    if (currentCell?.visibility === 'scouted') {
      addLog(state, `Bot spotted at ${bot.x + 1},${bot.y + 1}.`, 'warning');
    }
  });
}

function recoverLawyers(state: GameState): void {
  state.lawyers.forEach((lawyer) => {
    if (lawyer.burnout > 0) {
      lawyer.burnout = roundResource(Math.max(0, lawyer.burnout - TUNING.BURNOUT_RECOVERY_PER_TICK));
    }

    if (lawyer.assignment === 'recovering' && lawyer.burnout <= TUNING.BURNOUT_RECOVERY_THRESHOLD) {
      lawyer.assignment = 'idle';
      lawyer.assignedTargetTileId = null;
      lawyer.assignedBotId = null;
      addLog(state, `${lawyer.name} is answering email again.`, 'success');
    }
  });
}

function moveLawyers(state: GameState): void {
  if (state.tickCount % TUNING.LAWYER_MOVE_TICKS !== 0) {
    return;
  }

  const townHall = getTownHallCell(state);

  state.lawyers.forEach((lawyer) => {
    let target: MapCell | undefined;

    if (lawyer.assignment === 'recovering') {
      target = townHall;
    } else if (lawyer.assignment === 'intercept') {
      const bot = state.bots.find((candidate) => candidate.id === lawyer.assignedBotId);

      if (!bot) {
        lawyer.assignment = 'idle';
        lawyer.assignedBotId = null;
        lawyer.assignedTargetTileId = null;
        return;
      }

      target = getCellAt(state, bot.x, bot.y);
      lawyer.assignedTargetTileId = target?.id ?? null;
    } else if (lawyer.assignedTargetTileId) {
      target = getCell(state, lawyer.assignedTargetTileId);
    }

    if (!target) {
      return;
    }

    const next = stepToward(lawyer, target);
    lawyer.x = next.x;
    lawyer.y = next.y;
  });
}

function promoteIfReady(state: GameState, lawyer: LawyerSquad): void {
  const meta = LAWYER_RANKS[lawyer.rank];

  if (meta.xpToPromote === null || lawyer.xp < meta.xpToPromote) {
    return;
  }

  const currentIndex = LAWYER_RANK_ORDER.indexOf(lawyer.rank);
  const nextRank = LAWYER_RANK_ORDER[Math.min(LAWYER_RANK_ORDER.length - 1, currentIndex + 1)] as LawyerRank;

  if (nextRank !== lawyer.rank) {
    lawyer.rank = nextRank;
    addLog(state, `${lawyer.name} was promoted to ${LAWYER_RANKS[nextRank].label}.`, 'success');
  }
}

function burnOutLawyer(state: GameState, lawyer: LawyerSquad, amount: number): void {
  lawyer.burnout = roundResource(clamp(lawyer.burnout + amount, 0, TUNING.BURNOUT_MAX));

  if (lawyer.burnout >= TUNING.BURNOUT_MAX) {
    lawyer.assignment = 'recovering';
    lawyer.assignedBotId = null;
    lawyer.assignedTargetTileId = getTownHallCell(state)?.id ?? null;
    addLog(state, `${lawyer.name} rage-quit the assignment and retreated to Town Hall.`, 'danger');
  }
}

function resolveCombat(state: GameState): void {
  const survivingBots: BotUnit[] = [];

  state.bots.forEach((bot) => {
    const lawyer = state.lawyers
      .filter((candidate) => candidate.assignment !== 'recovering' && candidate.x === bot.x && candidate.y === bot.y)
      .sort((a, b) => a.burnout - b.burnout)[0];

    if (!lawyer) {
      survivingBots.push(bot);
      return;
    }

    const lawyerStrength = getLawyerStrength(lawyer);

    if (lawyerStrength >= bot.strength) {
      lawyer.xp += bot.strength * 2;
      lawyer.assignment = lawyer.assignment === 'intercept' ? 'idle' : lawyer.assignment;
      lawyer.assignedBotId = null;
      burnOutLawyer(state, lawyer, TUNING.COMBAT_WIN_BURNOUT + bot.strength * 2);
      promoteIfReady(state, lawyer);
      addLog(state, `${lawyer.name} unplugged bot ${bot.id}.`, 'success');
      return;
    }

    bot.strength = Math.max(1, bot.strength - Math.max(1, Math.floor(lawyerStrength / 2)));
    lawyer.assignment = 'recovering';
    lawyer.assignedBotId = null;
    lawyer.assignedTargetTileId = getTownHallCell(state)?.id ?? null;
    burnOutLawyer(state, lawyer, TUNING.COMBAT_LOSS_BURNOUT + bot.strength * 3);
    addLog(state, `${lawyer.name} could not pierce bot ${bot.id}'s terms of service.`, 'danger');
    survivingBots.push(bot);
  });

  state.bots = survivingBots;
}

function resolveBotDemolitions(state: GameState): void {
  const survivingBots: BotUnit[] = [];

  state.bots.forEach((bot) => {
    const currentCell = getCellAt(state, bot.x, bot.y);

    if (bot.mode === 'marching' && currentCell?.owner === 'city') {
      bot.mode = 'demolishing';
      bot.targetTileId = currentCell.id;
      bot.demolitionTicksRemaining = TUNING.BOT_DEMOLITION_TICKS;
      addLog(state, `Bot ${bot.id} started cutting power at ${currentCell.x + 1},${currentCell.y + 1}.`, 'danger');
      survivingBots.push(bot);
      return;
    }

    if (bot.mode !== 'demolishing') {
      survivingBots.push(bot);
      return;
    }

    const target = getCell(state, bot.targetTileId);

    if (!target || bot.x !== target.x || bot.y !== target.y || target.owner !== 'city') {
      bot.mode = 'marching';
      bot.demolitionTicksRemaining = 0;
      bot.targetTileId = getTownHallCell(state)?.id ?? null;
      survivingBots.push(bot);
      return;
    }

    bot.demolitionTicksRemaining = Math.max(0, bot.demolitionTicksRemaining - 1);

    if (bot.demolitionTicksRemaining > 0) {
      survivingBots.push(bot);
      return;
    }

    if (target.building === 'townHall') {
      state.status = 'lost';
      state.statusReason = 'Bots destroyed Town Hall.';
      state.score = calculateEndScore(state, 'lost');
      addLog(state, 'Town Hall went dark. The city is gone.', 'danger');
      return;
    }

    target.owner = 'neutral';
    target.building = 'ruins';
    target.defense = 0;
    state.votes = roundResource(clamp(state.votes - TUNING.BOT_DAMAGE_VOTE_LOSS, 0, TUNING.MAX_VOTES));
    bot.mode = 'marching';
    bot.targetTileId = getTownHallCell(state)?.id ?? null;
    bot.demolitionTicksRemaining = 0;
    survivingBots.push(bot);
    addLog(state, `Bot ${bot.id} wrecked ${target.x + 1},${target.y + 1} and kept marching toward Town Hall.`, 'danger');
  });

  state.bots = survivingBots;
}

function resolveRaids(state: GameState): void {
  state.cells
    .filter((cell) => cell.owner === 'dataCenter' && cell.building === 'dataCenter' && cell.visibility === 'scouted')
    .forEach((dataCenter) => {
      const raiders = state.lawyers.filter(
        (lawyer) => lawyer.assignment === 'raid' && lawyer.x === dataCenter.x && lawyer.y === dataCenter.y
      );

      if (raiders.length === 0) {
        return;
      }

      const strength = raiders.reduce((total, lawyer) => total + getLawyerStrength(lawyer), 0);

      if (strength >= TUNING.RAID_REQUIRED_STRENGTH) {
        const destroyedDataCenterId = dataCenter.dataCenterId;
        dataCenter.owner = 'neutral';
        dataCenter.building = 'ruins';
        dataCenter.terrain = 'industry';
        dataCenter.dataCenterId = null;
        state.bots = state.bots.filter((bot) => bot.spawnedBy !== destroyedDataCenterId);
        raiders.forEach((lawyer) => {
          lawyer.assignment = 'idle';
          lawyer.assignedTargetTileId = null;
          burnOutLawyer(state, lawyer, TUNING.RAID_BURNOUT);
        });
        addLog(state, `Raid complete at ${dataCenter.x + 1},${dataCenter.y + 1}. The server farm is now a smoking permitting problem.`, 'success');
        return;
      }

      raiders.forEach((lawyer) => {
        lawyer.assignment = 'recovering';
        lawyer.assignedTargetTileId = getTownHallCell(state)?.id ?? null;
        burnOutLawyer(state, lawyer, TUNING.COMBAT_LOSS_BURNOUT);
      });
      addLog(state, `Raid failed at ${dataCenter.x + 1},${dataCenter.y + 1}. The filings were not strong enough.`, 'danger');
    });
}

function updateStatus(state: GameState): void {
  const townHall = getTownHallCell(state);

  if (state.status !== 'playing') {
    return;
  }

  if (!townHall || townHall.owner !== 'city') {
    state.status = 'lost';
    state.statusReason = 'Town Hall was destroyed.';
    state.score = calculateEndScore(state, 'lost');
    return;
  }

  if (state.votes <= 0) {
    state.status = 'lost';
    state.statusReason = 'Votes hit zero.';
    state.score = calculateEndScore(state, 'lost');
    addLog(state, 'The electorate found literally anyone else.', 'danger');
    return;
  }

  const dataCentersRemaining = state.cells.some((cell) => cell.owner === 'dataCenter' && cell.building === 'dataCenter');
  if (!dataCentersRemaining) {
    state.status = 'won';
    state.statusReason = 'All data centers destroyed.';
    state.score = calculateEndScore(state, 'won');
    addLog(state, 'All data centers are offline. Nobody is calm, but you won.', 'success');
  }
}

export function tickGame(state: GameState): GameState {
  const next = cloneGameState(state);

  if (next.status !== 'playing' || next.paused) {
    return next;
  }

  next.tickCount += 1;
  next.time += 1;

  updateScouting(next);
  applyEconomy(next);
  recoverLawyers(next);
  spawnBots(next);
  buildBots(next);
  moveBots(next);
  moveLawyers(next);
  resolveCombat(next);
  resolveRaids(next);
  resolveBotDemolitions(next);
  updateStatus(next);

  return next;
}

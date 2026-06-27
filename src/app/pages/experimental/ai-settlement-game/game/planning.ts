import {
  LAWYER_RANK_ORDER,
  LAWYER_RANKS,
  RESOURCE_KEYS,
  RESOURCE_LABELS,
  RESOURCE_TERRAIN_REQUIREMENT,
  SERVICE_META,
  TERRAIN_META,
  TUNING,
} from './constants';
import { defaultBuildingForTerrain } from './initial-map';
import {
  addLog,
  builtTerrainCount,
  canAfford,
  cloneGameState,
  controlledTerrainCount,
  distance,
  getAdjacentCells,
  getCell,
  getCellAt,
  getRaidEligibleDataCenters,
  getRaidReadiness,
  getRequiredServiceLevel,
  getTownHallCell,
  getUpgradeCap,
  isLawyerAvailable,
  resourceCapacity,
  spendResources,
} from './simulation';
import {
  DispatchIntent,
  GameState,
  LawyerRank,
  LawyerSquad,
  MapCell,
  ResourceKey,
  ResourceStock,
  ScoutPriority,
  ServiceKey,
  TerrainType,
} from './types';

function scaleCost(cost: Partial<ResourceStock>, multiplier: number): Partial<ResourceStock> {
  const scaled: Partial<ResourceStock> = {};

  RESOURCE_KEYS.forEach((key) => {
    if ((cost[key] ?? 0) > 0) {
      scaled[key] = Math.ceil((cost[key] ?? 0) * multiplier);
    }
  });

  return scaled;
}

export function describeCost(cost: Partial<ResourceStock>): string {
  return RESOURCE_KEYS
    .filter((key) => (cost[key] ?? 0) > 0)
    .map((key) => `${RESOURCE_LABELS[key]} ${cost[key]}`)
    .join(', ');
}

function fail(state: GameState, message: string): GameState {
  addLog(state, message, 'warning');
  return state;
}

function townHallDistance(state: GameState, cell: MapCell): number {
  const townHall = getTownHallCell(state);
  return townHall ? distance(townHall, cell) : 0;
}

function frontierHiddenCells(state: GameState): MapCell[] {
  return state.cells
    .filter((cell) => cell.visibility === 'hidden' && cell.scoutingTicksRemaining === 0)
    .filter((cell) => getAdjacentCells(state, cell).some((adjacent) => adjacent.visibility === 'scouted'));
}

function visibleClaimCells(state: GameState): MapCell[] {
  return state.cells
    .filter((cell) => cell.visibility === 'scouted' && cell.owner === 'neutral' && cell.building !== 'ruins')
    .filter((cell) => getAdjacentCells(state, cell).some((adjacent) => adjacent.owner === 'city'));
}

function visibleRepairCells(state: GameState): MapCell[] {
  return state.cells
    .filter((cell) => cell.visibility === 'scouted' && cell.owner === 'neutral' && cell.building === 'ruins')
    .filter((cell) => getAdjacentCells(state, cell).some((adjacent) => adjacent.owner === 'city'));
}

const RESOURCE_TERRAIN: Record<ResourceKey, TerrainType> = {
  food: 'farms',
  water: 'water',
  power: 'power',
  materials: 'industry',
  budget: 'homes',
};

export function canScoutTile(state: GameState, cell: MapCell): boolean {
  return cell.visibility === 'hidden'
    && cell.scoutingTicksRemaining === 0
    && getAdjacentCells(state, cell).some((adjacent) => adjacent.visibility === 'scouted');
}

export function canClaimTile(state: GameState, cell: MapCell): boolean {
  return cell.visibility === 'scouted'
    && cell.owner === 'neutral'
    && cell.building !== 'ruins'
    && getAdjacentCells(state, cell).some((adjacent) => adjacent.owner === 'city');
}

export function canRepairTile(state: GameState, cell: MapCell): boolean {
  return cell.visibility === 'scouted'
    && cell.owner === 'neutral'
    && cell.building === 'ruins'
    && getAdjacentCells(state, cell).some((adjacent) => adjacent.owner === 'city');
}

export function canBuildImprovementTile(cell: MapCell): boolean {
  return cell.visibility === 'scouted' && cell.owner === 'city' && cell.building === null;
}

function prioritizeCells(state: GameState, cells: MapCell[], priority: ScoutPriority): MapCell[] {
  if (priority === 'nearestThreat') {
    const dataCenters = state.cells.filter((cell) => cell.owner === 'dataCenter');

    return [...cells].sort((a, b) => {
      const threatDistanceA = Math.min(...dataCenters.map((cell) => distance(a, cell)));
      const threatDistanceB = Math.min(...dataCenters.map((cell) => distance(b, cell)));
      return threatDistanceA - threatDistanceB || townHallDistance(state, a) - townHallDistance(state, b);
    });
  }

  return [...cells].sort((a, b) => {
    const terrainA = a.terrain === priority ? 0 : 1;
    const terrainB = b.terrain === priority ? 0 : 1;
    return terrainA - terrainB || townHallDistance(state, a) - townHallDistance(state, b);
  });
}

export function setScoutPriority(state: GameState, priority: ScoutPriority): GameState {
  return {
    ...state,
    planning: {
      ...state.planning,
      scoutPriority: priority,
    },
  };
}

export function scoutNextTile(state: GameState): GameState {
  const next = cloneGameState(state);

  if (!canAfford(next.resources, TUNING.SCOUT_COST)) {
    return fail(next, `Scouting needs ${describeCost(TUNING.SCOUT_COST)}.`);
  }

  const candidate = prioritizeCells(next, frontierHiddenCells(next), next.planning.scoutPriority)[0];

  if (!candidate) {
    return fail(next, 'No scoutable frontier remains.');
  }

  spendResources(next, TUNING.SCOUT_COST);
  candidate.scoutingTicksRemaining = TUNING.SCOUT_TICKS;
  addLog(next, `Scouts started clearing smog at ${candidate.x + 1},${candidate.y + 1}.`, 'info');

  return next;
}

export function scoutTile(state: GameState, cellIdToScout: string): GameState {
  const next = cloneGameState(state);
  const candidate = getCell(next, cellIdToScout);

  if (!candidate || !canScoutTile(next, candidate)) {
    return fail(next, 'That tile is not on the scoutable frontier.');
  }

  if (!canAfford(next.resources, TUNING.SCOUT_COST)) {
    return fail(next, `Scouting needs ${describeCost(TUNING.SCOUT_COST)}.`);
  }

  spendResources(next, TUNING.SCOUT_COST);
  candidate.scoutingTicksRemaining = TUNING.SCOUT_TICKS;
  next.selectedCellId = candidate.id;
  addLog(next, `Scouts started clearing smog at ${candidate.x + 1},${candidate.y + 1}.`, 'info');

  return next;
}

export function claimNextTile(state: GameState): GameState {
  const next = cloneGameState(state);

  if (!canAfford(next.resources, TUNING.CLAIM_COST)) {
    return fail(next, `Claiming needs ${describeCost(TUNING.CLAIM_COST)}.`);
  }

  const candidate = prioritizeCells(next, visibleClaimCells(next), next.planning.scoutPriority)[0];

  if (!candidate) {
    return fail(next, 'No adjacent revealed neutral tile can be claimed.');
  }

  spendResources(next, TUNING.CLAIM_COST);
  candidate.owner = 'city';
  candidate.building = null;
  candidate.defense = 1;
  addLog(next, `Claimed ${candidate.x + 1},${candidate.y + 1}. It is ready for an improvement.`, 'success');

  return next;
}

export function claimTile(state: GameState, cellIdToClaim: string): GameState {
  const next = cloneGameState(state);
  const candidate = getCell(next, cellIdToClaim);

  if (!candidate || !canClaimTile(next, candidate)) {
    return fail(next, 'That tile is not claimable from the current city edge.');
  }

  if (!canAfford(next.resources, TUNING.CLAIM_COST)) {
    return fail(next, `Claiming needs ${describeCost(TUNING.CLAIM_COST)}.`);
  }

  spendResources(next, TUNING.CLAIM_COST);
  candidate.owner = 'city';
  candidate.building = null;
  candidate.defense = 1;
  next.selectedCellId = candidate.id;
  addLog(next, `Claimed ${candidate.x + 1},${candidate.y + 1}. It is ready for an improvement.`, 'success');

  return next;
}

export function repairNextTile(state: GameState): GameState {
  const next = cloneGameState(state);

  if (!canAfford(next.resources, TUNING.REPAIR_COST)) {
    return fail(next, `Repairs need ${describeCost(TUNING.REPAIR_COST)}.`);
  }

  const candidate = prioritizeCells(next, visibleRepairCells(next), next.planning.scoutPriority)[0];

  if (!candidate) {
    return fail(next, 'No ruined adjacent tile is ready for repair.');
  }

  spendResources(next, TUNING.REPAIR_COST);
  candidate.owner = 'city';
  candidate.building = null;
  candidate.defense = 1;
  addLog(next, `Cleared ${candidate.x + 1},${candidate.y + 1}. It is ready for an improvement.`, 'success');

  return next;
}

export function repairTile(state: GameState, cellIdToRepair: string): GameState {
  const next = cloneGameState(state);
  const candidate = getCell(next, cellIdToRepair);

  if (!candidate || !canRepairTile(next, candidate)) {
    return fail(next, 'That tile is not ready for repair.');
  }

  if (!canAfford(next.resources, TUNING.REPAIR_COST)) {
    return fail(next, `Repairs need ${describeCost(TUNING.REPAIR_COST)}.`);
  }

  spendResources(next, TUNING.REPAIR_COST);
  candidate.owner = 'city';
  candidate.building = null;
  candidate.defense = 1;
  next.selectedCellId = candidate.id;
  addLog(next, `Cleared ${candidate.x + 1},${candidate.y + 1}. It is ready for an improvement.`, 'success');

  return next;
}

function buildImprovementOnCell(next: GameState, candidate: MapCell): GameState {
  const resource = RESOURCE_KEYS.find((key) => RESOURCE_TERRAIN[key] === candidate.terrain);

  if (!resource) {
    return fail(next, 'That tile has no matching improvement.');
  }

  const cost = TUNING.BUILD_IMPROVEMENT_COSTS[resource];

  if (!canAfford(next.resources, cost)) {
    return fail(next, `${RESOURCE_LABELS[resource]} improvement needs ${describeCost(cost)}.`);
  }

  spendResources(next, cost);
  candidate.building = defaultBuildingForTerrain(candidate.terrain);
  candidate.defense = 1;
  addLog(next, `Built ${RESOURCE_LABELS[resource]} improvement at ${candidate.x + 1},${candidate.y + 1}.`, 'success');

  return next;
}

export function buildTileImprovement(state: GameState, cellIdToBuild: string): GameState {
  const next = cloneGameState(state);
  const candidate = getCell(next, cellIdToBuild);

  if (!candidate || !canBuildImprovementTile(candidate)) {
    return fail(next, 'That tile is not an empty city site.');
  }

  next.selectedCellId = candidate.id;
  return buildImprovementOnCell(next, candidate);
}

export function upgradeProduction(state: GameState, resource: ResourceKey): GameState {
  const next = cloneGameState(state);
  const terrain = RESOURCE_TERRAIN[resource];
  const emptySite = next.cells
    .filter((cell) => canBuildImprovementTile(cell) && cell.terrain === terrain)
    .sort((a, b) => townHallDistance(next, a) - townHallDistance(next, b))[0];

  if (emptySite) {
    return buildImprovementOnCell(next, emptySite);
  }

  const current = next.upgrades[resource];
  const cap = getUpgradeCap(next, resource);

  if (current >= cap) {
    if (current >= next.cityLevel) {
      return fail(next, `${RESOURCE_LABELS[resource]} production needs City Hall level ${current + 1}.`);
    }

    return fail(next, `${RESOURCE_LABELS[resource]} production needs more controlled ${TERRAIN_META[RESOURCE_TERRAIN_REQUIREMENT[resource]].label} tiles.`);
  }

  const cost: Partial<ResourceStock> = resource === 'materials'
    ? { budget: 8 + current }
    : {
        budget: 6 + current,
        materials: 4,
      };

  if (!canAfford(next.resources, cost)) {
    return fail(next, `${RESOURCE_LABELS[resource]} upgrade needs ${describeCost(cost)}.`);
  }

  spendResources(next, cost);
  next.upgrades[resource] += 1;
  addLog(next, `${RESOURCE_LABELS[resource]} collection upgraded to level ${next.upgrades[resource]}.`, 'success');

  return next;
}

export function upgradeStorage(state: GameState, resource: ResourceKey): GameState {
  const next = cloneGameState(state);
  const current = next.storage[resource];
  const cost = scaleCost(TUNING.STORAGE_COST, current);

  if (!canAfford(next.resources, cost)) {
    return fail(next, `${RESOURCE_LABELS[resource]} storage needs ${describeCost(cost)}.`);
  }

  spendResources(next, cost);
  next.storage[resource] += 1;
  addLog(next, `${RESOURCE_LABELS[resource]} storage raised to ${resourceCapacity(next, resource)}.`, 'success');

  return next;
}

export function shipResource(state: GameState, resource: ResourceKey): GameState {
  const next = cloneGameState(state);

  if (resource === 'budget') {
    return fail(next, 'Budget cannot be shipped to itself. Build more homes instead.');
  }

  const shippingLevel = next.shipping[resource];
  const cost: Partial<ResourceStock> = {
    budget: TUNING.SHIP_BASE_COST + shippingLevel * 2,
  };

  if (!canAfford(next.resources, cost)) {
    return fail(next, `${RESOURCE_LABELS[resource]} shipment needs ${describeCost(cost)}.`);
  }

  spendResources(next, cost);
  next.resources[resource] = Math.min(
    resourceCapacity(next, resource),
    next.resources[resource] + TUNING.SHIP_AMOUNT_PER_LEVEL + shippingLevel * 2
  );
  next.shipping[resource] += 1;
  addLog(next, `${RESOURCE_LABELS[resource]} shipment reached Town Hall.`, 'success');

  return next;
}

export function buildService(state: GameState, service: ServiceKey): GameState {
  const next = cloneGameState(state);
  const meta = SERVICE_META[service];
  const nextLevel = next.services[service] + 1;
  const cost = scaleCost(meta.buildCost, nextLevel);

  if (next.cityLevel < meta.minCityLevel) {
    return fail(next, `${meta.label} unlocks at city level ${meta.minCityLevel}.`);
  }

  if (meta.requiredTerrain && controlledTerrainCount(next, meta.requiredTerrain) === 0) {
    return fail(next, `${meta.label} needs a controlled ${TERRAIN_META[meta.requiredTerrain].label} tile.`);
  }

  if (!canAfford(next.resources, cost)) {
    return fail(next, `${meta.label} level ${nextLevel} needs ${describeCost(cost)}.`);
  }

  spendResources(next, cost);
  next.services[service] = nextLevel;
  addLog(next, `${meta.label} service raised to level ${nextLevel}.`, 'success');

  return next;
}

export function getNextCityHallLevel(state: GameState): number | null {
  const nextLevel = state.cityLevel + 1;
  return TUNING.CITY_HALL_UPGRADE_COSTS[nextLevel] ? nextLevel : null;
}

export function getCityHallUpgradeCost(state: GameState): Partial<ResourceStock> | null {
  const nextLevel = getNextCityHallLevel(state);
  return nextLevel ? TUNING.CITY_HALL_UPGRADE_COSTS[nextLevel] : null;
}

export function getCityHallPopulationRequirement(state: GameState): number | null {
  const nextLevel = getNextCityHallLevel(state);
  return nextLevel ? TUNING.POPULATION_LEVELS[nextLevel - 1] : null;
}

export function upgradeCityHall(state: GameState): GameState {
  const next = cloneGameState(state);
  const nextLevel = getNextCityHallLevel(next);

  if (!nextLevel) {
    return fail(next, 'City Hall is already at its maximum level.');
  }

  const populationRequired = getCityHallPopulationRequirement(next) ?? 0;
  if (next.population < populationRequired) {
    return fail(next, `City Hall level ${nextLevel} needs population ${populationRequired}.`);
  }

  const cost = getCityHallUpgradeCost(next) ?? {};
  if (!canAfford(next.resources, cost)) {
    return fail(next, `City Hall level ${nextLevel} needs ${describeCost(cost)}.`);
  }

  spendResources(next, cost);
  next.cityLevel = nextLevel;
  addLog(next, `City Hall upgraded to level ${nextLevel}. Demand profile expanded.`, 'success');

  return next;
}

export function getInviteResidentsCost(state: GameState): Partial<ResourceStock> {
  const demandStep = Math.max(1, Math.ceil(state.population / TUNING.POPULATION_DEMAND_INTERVAL));
  return scaleCost(TUNING.INVITE_RESIDENTS_COST, demandStep);
}

export function inviteResidents(state: GameState): GameState {
  const next = cloneGameState(state);
  const housingRequired = getRequiredServiceLevel(next, 'housing');

  if (next.services.housing < housingRequired) {
    return fail(next, `New residents need Housing level ${housingRequired}.`);
  }

  if (next.happiness < 55) {
    return fail(next, 'New residents are waiting for happiness to recover.');
  }

  const cost = getInviteResidentsCost(next);

  if (!canAfford(next.resources, cost)) {
    return fail(next, `Inviting residents needs ${describeCost(cost)}.`);
  }

  spendResources(next, cost);
  next.population += TUNING.INVITE_RESIDENTS_AMOUNT;
  addLog(next, `${TUNING.INVITE_RESIDENTS_AMOUNT} residents moved in. Demand rose with them.`, 'success');

  return next;
}

function nextRank(rank: LawyerRank): LawyerRank {
  const index = LAWYER_RANK_ORDER.indexOf(rank);
  return LAWYER_RANK_ORDER[Math.min(LAWYER_RANK_ORDER.length - 1, index + 1)];
}

export function maxLawyerSquads(state: GameState): number {
  return 1 + Math.floor(builtTerrainCount(state, 'homes') / 2);
}

function createLawyer(state: GameState, townHall: MapCell): LawyerSquad {
  return {
    id: `lawyer-${state.nextLawyerId}`,
    name: `Litigation Squad ${state.nextLawyerId}`,
    rank: 'associate',
    x: townHall.x,
    y: townHall.y,
    xp: 0,
    burnout: 0,
    assignment: 'idle',
    assignedTargetTileId: null,
    assignedBotId: null,
  };
}

export function hireLawyer(state: GameState): GameState {
  const next = cloneGameState(state);
  const townHall = getTownHallCell(next);

  if (!townHall) {
    return fail(next, 'Town Hall is offline.');
  }

  if (next.lawyers.length >= maxLawyerSquads(next)) {
    return fail(next, 'Hiring needs more built Lots sites.');
  }

  if (!canAfford(next.resources, TUNING.HIRE_LAWYER_COST)) {
    return fail(next, `Hiring needs ${describeCost(TUNING.HIRE_LAWYER_COST)}.`);
  }

  spendResources(next, TUNING.HIRE_LAWYER_COST);
  const lawyer = createLawyer(next, townHall);
  next.nextLawyerId += 1;
  next.lawyers = [...next.lawyers, lawyer];
  addLog(next, `${lawyer.name} joined as Associates.`, 'success');

  return next;
}

export function promoteLawyer(state: GameState): GameState {
  const next = cloneGameState(state);
  const townHall = getTownHallCell(next);

  if (!townHall) {
    return fail(next, 'Town Hall is offline.');
  }

  const candidate = [...next.lawyers]
    .filter((lawyer) => lawyer.rank !== 'lawFirmPartner')
    .sort((a, b) => LAWYER_RANKS[a.rank].strength - LAWYER_RANKS[b.rank].strength || a.burnout - b.burnout)[0];

  if (!candidate) {
    return fail(next, 'Every lawyer is already insufferably senior.');
  }

  if (!canAfford(next.resources, TUNING.PROMOTE_LAWYER_COST)) {
    return fail(next, `Promotion needs ${describeCost(TUNING.PROMOTE_LAWYER_COST)}.`);
  }

  spendResources(next, TUNING.PROMOTE_LAWYER_COST);
  candidate.rank = nextRank(candidate.rank);
  addLog(next, `${candidate.name} promoted to ${LAWYER_RANKS[candidate.rank].label}.`, 'success');

  return next;
}

function visibleBots(state: GameState) {
  return state.bots.filter((bot) => getCellAt(state, bot.x, bot.y)?.visibility === 'scouted');
}

function assignLawyer(lawyer: LawyerSquad, assignment: LawyerSquad['assignment'], target: MapCell | null, botId: string | null): void {
  lawyer.assignment = assignment;
  lawyer.assignedTargetTileId = target?.id ?? null;
  lawyer.assignedBotId = botId;
}

function nearestAvailableLawyer(state: GameState, target: Pick<MapCell, 'x' | 'y'>): LawyerSquad | undefined {
  return state.lawyers
    .filter(isLawyerAvailable)
    .sort((a, b) => distance(a, target) - distance(b, target) || a.burnout - b.burnout)[0];
}

function vulnerableTile(state: GameState): MapCell | undefined {
  const targeted = state.bots
    .map((bot) => getCell(state, bot.targetTileId))
    .find((cell): cell is MapCell => cell !== undefined && cell.owner === 'city' && cell.building !== 'townHall');

  if (targeted) {
    return targeted;
  }

  return state.cells
    .filter((cell) => cell.owner === 'city' && cell.building !== 'townHall')
    .sort((a, b) => a.defense - b.defense || townHallDistance(state, b) - townHallDistance(state, a))[0];
}

export function dispatchLawyers(state: GameState, intent: DispatchIntent): GameState {
  const next = cloneGameState(state);
  const townHall = getTownHallCell(next);

  if (!townHall) {
    return fail(next, 'Town Hall is offline.');
  }

  if (intent === 'interceptNearestBot') {
    const bot = visibleBots(next).sort((a, b) => distance(a, townHall) - distance(b, townHall))[0];

    if (!bot) {
      return fail(next, 'No visible bot to intercept.');
    }

    const targetCell = getCellAt(next, bot.x, bot.y);
    const lawyer = targetCell ? nearestAvailableLawyer(next, targetCell) : undefined;

    if (!lawyer || !targetCell) {
      return fail(next, 'No available lawyer squad can intercept.');
    }

    assignLawyer(lawyer, 'intercept', targetCell, bot.id);
    addLog(next, `${lawyer.name} is chasing bot ${bot.id}.`, 'info');
    return next;
  }

  if (intent === 'defendTownHall') {
    const assigned = next.lawyers.filter(isLawyerAvailable);
    assigned.forEach((lawyer) => assignLawyer(lawyer, 'defend', townHall, null));
    addLog(next, `${assigned.length} lawyer squad(s) assigned to Town Hall.`, assigned.length > 0 ? 'success' : 'warning');
    return next;
  }

  if (intent === 'defendVulnerableTile') {
    const target = vulnerableTile(next);

    if (!target) {
      return fail(next, 'No controlled non-Town-Hall tile needs defense.');
    }

    const assigned = next.lawyers.filter(isLawyerAvailable).slice(0, 2);
    assigned.forEach((lawyer) => assignLawyer(lawyer, 'defend', target, null));
    addLog(next, `${assigned.length} lawyer squad(s) assigned to defend ${target.x + 1},${target.y + 1}.`, assigned.length > 0 ? 'success' : 'warning');
    return next;
  }

  const target = getRaidEligibleDataCenters(next).sort((a, b) => townHallDistance(next, a) - townHallDistance(next, b))[0];

  if (!target) {
    const visibleDataCenters = next.cells.filter(
      (cell) => cell.owner === 'dataCenter' && cell.building === 'dataCenter' && cell.visibility === 'scouted'
    );

    if (visibleDataCenters.length === 0) {
      return fail(next, 'No raid is eligible. Discover a data center first.');
    }

    const summaries = visibleDataCenters
      .map((cell) => {
        const readiness = getRaidReadiness(next, cell);
        return `${cell.x + 1},${cell.y + 1}: ${readiness.blockers.join('; ')}`;
      })
      .join(' | ');

    return fail(next, `No raid is eligible. ${summaries}.`);
  }

  const assigned = next.lawyers.filter(isLawyerAvailable);
  assigned.forEach((lawyer) => assignLawyer(lawyer, 'raid', target, null));
  addLog(next, `${assigned.length} lawyer squad(s) dispatched to raid ${target.x + 1},${target.y + 1}.`, 'warning');

  return next;
}

export function debugRevealDataCenters(state: GameState): GameState {
  const next = cloneGameState(state);
  next.cells
    .filter((cell) => cell.owner === 'dataCenter')
    .forEach((cell) => {
      cell.visibility = 'scouted';
    });
  addLog(next, 'Debug: data centers revealed.', 'info');
  return next;
}

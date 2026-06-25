import {
  DEFAULT_RESOURCES,
  DEFAULT_SERVICES,
  DEFAULT_SHIPPING,
  DEFAULT_STORAGE,
  DEFAULT_UPGRADES,
  DIFFICULTY_META,
  MAP_SIZE,
} from './constants';
import { GameDifficulty, GameState, MapCell, MapMode, TerrainType } from './types';

const MAP_LAYOUT: TerrainType[][] = [
  ['water', 'farms', 'industry', 'farms', 'power'],
  ['farms', 'homes', 'water', 'industry', 'farms'],
  ['power', 'farms', 'homes', 'water', 'industry'],
  ['farms', 'industry', 'power', 'homes', 'water'],
  ['industry', 'water', 'farms', 'power', 'homes'],
];

const DATA_CENTER_COORDS = [
  { id: 'dc-east', x: 4, y: 0 },
  { id: 'dc-west', x: 0, y: 4 },
];

export const STARTING_POSITIONS = [
  { x: 1, y: 2 },
  { x: 2, y: 1 },
  { x: 3, y: 2 },
  { x: 2, y: 3 },
];

export function cellId(x: number, y: number): string {
  return `cell-${x}-${y}`;
}

export function defaultBuildingForTerrain(terrain: TerrainType): MapCell['building'] {
  switch (terrain) {
    case 'homes':
      return 'housing';
    case 'farms':
      return 'farm';
    case 'water':
      return 'waterWorks';
    case 'power':
      return 'substation';
    case 'industry':
      return 'workshop';
  }
}

function seededRandom(seed: number): () => number {
  let value = seed;

  return () => {
    value += 0x6D2B79F5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffledTerrainLayout(seed: number): TerrainType[][] {
  const random = seededRandom(seed);
  const bag = MAP_LAYOUT.flatMap((row, y) => row.filter((_, x) => !DATA_CENTER_COORDS.some((dataCenter) => dataCenter.x === x && dataCenter.y === y)));

  for (let index = bag.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [bag[index], bag[swapIndex]] = [bag[swapIndex], bag[index]];
  }

  let bagIndex = 0;

  return MAP_LAYOUT.map((row, y) => row.map((terrain, x) => {
    if (DATA_CENTER_COORDS.some((dataCenter) => dataCenter.x === x && dataCenter.y === y)) {
      return terrain;
    }

    const next = bag[bagIndex];
    bagIndex += 1;
    return next;
  }));
}

function terrainLayoutForMode(mapMode: MapMode, seed: number): TerrainType[][] {
  return mapMode === 'randomized' ? shuffledTerrainLayout(seed) : MAP_LAYOUT;
}

function createCell(terrain: TerrainType, x: number, y: number, start: { x: number; y: number }): MapCell {
  const isTownHall = x === start.x && y === start.y;
  const dataCenter = DATA_CENTER_COORDS.find((candidate) => candidate.x === x && candidate.y === y);
  const isNearTownHall = Math.abs(x - start.x) + Math.abs(y - start.y) <= 1;

  if (dataCenter) {
    return {
      id: cellId(x, y),
      x,
      y,
      terrain: 'industry',
      visibility: 'hidden',
      owner: 'dataCenter',
      building: 'dataCenter',
      defense: 0,
      dataCenterId: dataCenter.id,
    };
  }

  return {
    id: cellId(x, y),
    x,
    y,
    terrain,
    visibility: isTownHall || isNearTownHall ? 'scouted' : 'hidden',
    owner: isTownHall ? 'city' : 'neutral',
    building: isTownHall ? 'townHall' : null,
    defense: isTownHall ? 2 : 0,
    dataCenterId: null,
  };
}

export function createInitialCells(): MapCell[] {
  return createInitialCellsForStart(0);
}

export function createInitialCellsForStart(startIndex: number, mapMode: MapMode = 'fixed'): MapCell[] {
  const start = STARTING_POSITIONS[startIndex % STARTING_POSITIONS.length];
  const layout = terrainLayoutForMode(mapMode, startIndex + 101);

  return layout.flatMap((row, y) => row.map((terrain, x) => createCell(terrain, x, y, start)));
}

export function createInitialGameState(
  startIndex = 0,
  difficulty: GameDifficulty = 'firstSettlement',
  mapMode: MapMode = 'fixed'
): GameState {
  const start = STARTING_POSITIONS[startIndex % STARTING_POSITIONS.length];
  const difficultyMeta = DIFFICULTY_META[difficulty];

  return {
    cells: createInitialCellsForStart(startIndex, mapMode),
    resources: { ...DEFAULT_RESOURCES },
    services: { ...DEFAULT_SERVICES },
    upgrades: { ...DEFAULT_UPGRADES },
    storage: { ...DEFAULT_STORAGE },
    shipping: { ...DEFAULT_SHIPPING },
    lawyers: [
      {
        id: 'lawyer-1',
        name: 'Public Interest Unit',
        rank: 'associate',
        x: start.x,
        y: start.y,
        xp: 0,
        burnout: 0,
        assignment: 'idle',
        assignedTargetTileId: null,
        assignedBotId: null,
      },
    ],
    bots: [],
    difficulty,
    mapMode,
    mapSeed: startIndex + 101,
    votes: difficultyMeta.startingVotes,
    happiness: difficultyMeta.startingHappiness,
    population: 8,
    cityLevel: 1,
    time: 0,
    tickCount: 0,
    speed: 1,
    paused: false,
    status: 'playing',
    statusReason: null,
    score: null,
    selectedCellId: cellId(start.x, start.y),
    nextBotId: 1,
    nextLawyerId: 2,
    planning: {
      scoutPriority: 'farms',
    },
    logCursor: 1,
    log: [
      {
        id: 1,
        time: 0,
        message: `${MAP_SIZE}x${MAP_SIZE} grid online. Town Hall retained one exhausted but billable squad.`,
        tone: 'warning',
      },
    ],
  };
}

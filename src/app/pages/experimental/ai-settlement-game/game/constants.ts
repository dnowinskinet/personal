import {
  BuildingMeta,
  BuildingType,
  CityServices,
  CityUpgrades,
  DemandProfile,
  DifficultyMeta,
  GameDifficulty,
  LawyerRank,
  MapMode,
  MapModeMeta,
  RankMeta,
  ResourceKey,
  ResourceStock,
  ServiceKey,
  ServiceMeta,
  TerrainMeta,
  TerrainType,
  Tuning,
} from './types';

export const MAP_SIZE = 5;

export const RESOURCE_KEYS: ResourceKey[] = ['food', 'water', 'power', 'materials', 'budget'];

export const RESOURCE_LABELS: Record<ResourceKey, string> = {
  food: 'Food',
  water: 'Water',
  power: 'Power',
  materials: 'Materials',
  budget: 'Budget',
};

export const TERRAIN_TYPES: TerrainType[] = ['homes', 'farms', 'water', 'power', 'industry'];

export const GAME_DIFFICULTIES: GameDifficulty[] = ['firstSettlement', 'nextLevel'];

export const DIFFICULTY_META: Record<GameDifficulty, DifficultyMeta> = {
  firstSettlement: {
    label: 'First Settlement',
    shortLabel: 'Level 1',
    scoreMultiplier: 1,
    startingVotes: 75,
    startingHappiness: 76,
    botGraceTicks: 90,
    botSpawnTicks: 55,
    botActivationTicks: 55,
    botStrengthBonus: 0,
    maxBotStrength: 5,
  },
  nextLevel: {
    label: 'Next Level',
    shortLabel: 'Level 2',
    scoreMultiplier: 1.35,
    startingVotes: 70,
    startingHappiness: 72,
    botGraceTicks: 55,
    botSpawnTicks: 38,
    botActivationTicks: 34,
    botStrengthBonus: 1,
    maxBotStrength: 8,
  },
};

export const MAP_MODES: MapMode[] = ['fixed', 'randomized'];

export const MAP_MODE_META: Record<MapMode, MapModeMeta> = {
  fixed: {
    label: 'Fixed Map',
    shortLabel: 'Fixed',
  },
  randomized: {
    label: 'Random Map',
    shortLabel: 'Random',
  },
};

export const TERRAIN_META: Record<TerrainType, TerrainMeta> = {
  homes: {
    label: 'Homes',
    shortLabel: 'HM',
    className: 'bg-sky-100 text-sky-950 border-sky-300 dark:bg-sky-950 dark:text-sky-100',
  },
  farms: {
    label: 'Farms',
    shortLabel: 'FM',
    className: 'bg-lime-100 text-lime-950 border-lime-300 dark:bg-lime-950 dark:text-lime-100',
  },
  water: {
    label: 'Water',
    shortLabel: 'WT',
    className: 'bg-cyan-100 text-cyan-950 border-cyan-300 dark:bg-cyan-950 dark:text-cyan-100',
  },
  power: {
    label: 'Power',
    shortLabel: 'PW',
    className: 'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950 dark:text-amber-100',
  },
  industry: {
    label: 'Industry',
    shortLabel: 'IN',
    className: 'bg-stone-200 text-stone-950 border-stone-400 dark:bg-stone-800 dark:text-stone-100',
  },
};

export const BUILDING_META: Record<BuildingType, BuildingMeta> = {
  townHall: {
    label: 'Town Hall',
    shortLabel: 'TH',
  },
  housing: {
    label: 'Housing Block',
    shortLabel: 'HB',
  },
  farm: {
    label: 'Food Lease',
    shortLabel: 'FL',
  },
  waterWorks: {
    label: 'Water Works',
    shortLabel: 'WW',
  },
  substation: {
    label: 'Substation',
    shortLabel: 'SS',
  },
  workshop: {
    label: 'Workshop',
    shortLabel: 'WS',
  },
  dataCenter: {
    label: 'Data Center',
    shortLabel: 'DC',
  },
  ruins: {
    label: 'Ruined Site',
    shortLabel: 'XX',
  },
};

export const SERVICE_KEYS: ServiceKey[] = ['housing', 'clinics', 'schools', 'transit', 'recreation'];

export const SERVICE_META: Record<ServiceKey, ServiceMeta> = {
  housing: {
    label: 'Housing',
    shortLabel: 'HSG',
    buildCost: { materials: 4, budget: 5 },
    upkeep: { budget: 1 },
    minCityLevel: 1,
    requiredTerrain: null,
  },
  clinics: {
    label: 'Clinics',
    shortLabel: 'CLN',
    buildCost: { materials: 6, budget: 8, power: 2 },
    upkeep: { budget: 1, power: 1 },
    minCityLevel: 2,
    requiredTerrain: 'homes',
  },
  schools: {
    label: 'Schools',
    shortLabel: 'SCH',
    buildCost: { materials: 8, budget: 10, power: 1 },
    upkeep: { budget: 1 },
    minCityLevel: 3,
    requiredTerrain: 'homes',
  },
  transit: {
    label: 'Transit',
    shortLabel: 'TRN',
    buildCost: { materials: 10, budget: 12, power: 3 },
    upkeep: { budget: 1, power: 1 },
    minCityLevel: 4,
    requiredTerrain: 'industry',
  },
  recreation: {
    label: 'Recreation',
    shortLabel: 'REC',
    buildCost: { materials: 8, budget: 10, power: 2 },
    upkeep: { budget: 1 },
    minCityLevel: 5,
    requiredTerrain: 'homes',
  },
};

export const LAWYER_RANKS: Record<LawyerRank, RankMeta> = {
  associate: {
    label: 'Associate',
    shortLabel: 'A',
    strength: 2,
    xpToPromote: 6,
  },
  seniorAssociate: {
    label: 'Senior Associate',
    shortLabel: 'SA',
    strength: 3,
    xpToPromote: 12,
  },
  counsel: {
    label: 'Counsel',
    shortLabel: 'C',
    strength: 5,
    xpToPromote: 20,
  },
  juniorPartner: {
    label: 'Junior Partner',
    shortLabel: 'JP',
    strength: 7,
    xpToPromote: 30,
  },
  lawFirmPartner: {
    label: 'Law Firm Partner',
    shortLabel: 'P',
    strength: 10,
    xpToPromote: null,
  },
};

export const LAWYER_RANK_ORDER: LawyerRank[] = [
  'associate',
  'seniorAssociate',
  'counsel',
  'juniorPartner',
  'lawFirmPartner',
];

export const DEFAULT_RESOURCES: ResourceStock = {
  food: 38,
  water: 34,
  power: 28,
  materials: 22,
  budget: 72,
};

export const DEFAULT_SERVICES: CityServices = {
  housing: 0,
  clinics: 0,
  schools: 0,
  transit: 0,
  recreation: 0,
};

export const DEFAULT_UPGRADES: CityUpgrades = {
  food: 1,
  water: 1,
  power: 1,
  materials: 1,
  budget: 1,
};

export const DEFAULT_STORAGE: CityUpgrades = {
  food: 1,
  water: 1,
  power: 1,
  materials: 1,
  budget: 1,
};

export const DEFAULT_SHIPPING: CityUpgrades = {
  food: 1,
  water: 1,
  power: 1,
  materials: 1,
  budget: 1,
};

export const RESOURCE_TERRAIN_REQUIREMENT: Record<ResourceKey, TerrainType> = {
  food: 'farms',
  water: 'water',
  power: 'power',
  materials: 'industry',
  budget: 'homes',
};

export const BASE_PRODUCTION_BY_TERRAIN: Record<TerrainType, Partial<ResourceStock>> = {
  homes: { budget: 4 },
  farms: { food: 5 },
  water: { water: 5 },
  power: { power: 4 },
  industry: { materials: 4 },
};

export const TUNING: Tuning = {
  MAX_RESOURCE: 160,
  MAX_VOTES: 90,
  STARTING_VOTES: 75,
  STARTING_HAPPINESS: 76,
  ECONOMY_TICK_SECONDS: 8,
  DATA_CENTER_COUNT: 2,
  VOTE_DRAIN_THRESHOLD: 45,
  VOTE_DRAIN_PER_TICK: 1,
  BOT_DAMAGE_VOTE_LOSS: 2,
  SEVERE_SHORTAGE_VOTE_LOSS: 1,
  BOT_GRACE_TICKS: 90,
  BOT_SPAWN_TICKS: 55,
  BOT_ACTIVATION_TICKS: 55,
  BOT_MOVE_TICKS: 6,
  LAWYER_MOVE_TICKS: 2,
  POPULATION_GROWTH_TICKS: 45,
  BURNOUT_MAX: 100,
  BURNOUT_RECOVERY_PER_TICK: 2,
  BURNOUT_RECOVERY_THRESHOLD: 72,
  COMBAT_WIN_BURNOUT: 12,
  COMBAT_LOSS_BURNOUT: 30,
  RAID_BURNOUT: 18,
  RAID_REQUIRED_STRENGTH: 8,
  RAID_ADJACENCY_NEEDED: 2,
  POPULATION_LEVELS: [0, 12, 22, 34, 48],
  CLAIM_COST: { budget: 4 },
  SCOUT_COST: { budget: 2 },
  REPAIR_COST: { materials: 5, budget: 4 },
  HIRE_LAWYER_COST: { materials: 4, budget: 14 },
  PROMOTE_LAWYER_COST: { materials: 6, budget: 18 },
  CITY_HALL_UPGRADE_COSTS: {
    2: { materials: 10, budget: 28 },
    3: { materials: 18, power: 8, budget: 45 },
    4: { materials: 30, water: 10, power: 12, budget: 65 },
    5: { food: 12, water: 14, power: 18, materials: 45, budget: 85 },
  },
  STORAGE_COST: { budget: 8 },
  SHIP_BASE_COST: 5,
  BASE_RESOURCE_CAPACITY: 90,
  STORAGE_PER_LEVEL: 25,
  SHIP_AMOUNT_PER_LEVEL: 10,
};

export const DEMAND_BY_LEVEL: Record<number, DemandProfile> = {
  1: {
    resources: { food: 2, water: 1 },
    services: { housing: 1 },
  },
  2: {
    resources: { food: 3, water: 2, power: 1, budget: 1 },
    services: { housing: 1, clinics: 1 },
  },
  3: {
    resources: { food: 4, water: 3, power: 2, budget: 2 },
    services: { housing: 2, clinics: 1, schools: 1 },
  },
  4: {
    resources: { food: 5, water: 4, power: 3, materials: 1, budget: 3 },
    services: { housing: 2, clinics: 2, schools: 1, transit: 1 },
  },
  5: {
    resources: { food: 6, water: 5, power: 4, materials: 2, budget: 4 },
    services: { housing: 3, clinics: 2, schools: 2, transit: 1, recreation: 1 },
  },
};

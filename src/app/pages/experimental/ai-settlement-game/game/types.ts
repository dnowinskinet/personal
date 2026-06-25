export type ResourceKey = 'food' | 'water' | 'power' | 'materials' | 'budget';

export type ResourceStock = Record<ResourceKey, number>;

export type TerrainType = 'homes' | 'farms' | 'water' | 'power' | 'industry';

export type Visibility = 'hidden' | 'scouted';

export type Owner = 'city' | 'neutral' | 'dataCenter';

export type BuildingType =
  | 'townHall'
  | 'housing'
  | 'farm'
  | 'waterWorks'
  | 'substation'
  | 'workshop'
  | 'dataCenter'
  | 'ruins';

export type ServiceKey = 'housing' | 'clinics' | 'schools' | 'transit' | 'recreation';

export type CityServices = Record<ServiceKey, number>;

export type CityUpgrades = Record<ResourceKey, number>;

export type LawyerRank =
  | 'associate'
  | 'seniorAssociate'
  | 'counsel'
  | 'juniorPartner'
  | 'lawFirmPartner';

export type LawyerAssignment = 'idle' | 'intercept' | 'defend' | 'raid' | 'recovering';

export type GameStatus = 'playing' | 'won' | 'lost';

export type GameSpeed = 1 | 2;

export type GameDifficulty = 'firstSettlement' | 'nextLevel';

export type MapMode = 'fixed' | 'randomized';

export type LogTone = 'info' | 'warning' | 'danger' | 'success';

export type ScoutPriority = TerrainType | 'nearestThreat';

export type DispatchIntent = 'interceptNearestBot' | 'defendTownHall' | 'defendVulnerableTile' | 'raidNearestDataCenter';

export type BotMode = 'dormant' | 'attacking';

export interface MapCell {
  id: string;
  x: number;
  y: number;
  terrain: TerrainType;
  visibility: Visibility;
  owner: Owner;
  building: BuildingType | null;
  defense: number;
  dataCenterId: string | null;
}

export interface LawyerSquad {
  id: string;
  name: string;
  rank: LawyerRank;
  x: number;
  y: number;
  xp: number;
  burnout: number;
  assignment: LawyerAssignment;
  assignedTargetTileId: string | null;
  assignedBotId: string | null;
}

export interface BotUnit {
  id: string;
  spawnedBy: string;
  x: number;
  y: number;
  strength: number;
  mode: BotMode;
  activationTicks: number;
  targetTileId: string | null;
}

export interface PlanningState {
  scoutPriority: ScoutPriority;
}

export interface LogEntry {
  id: number;
  time: number;
  message: string;
  tone: LogTone;
}

export interface DemandProfile {
  resources: Partial<ResourceStock>;
  services: Partial<CityServices>;
}

export interface ServiceMeta {
  label: string;
  shortLabel: string;
  buildCost: Partial<ResourceStock>;
  upkeep: Partial<ResourceStock>;
  minCityLevel: number;
  requiredTerrain: TerrainType | null;
}

export interface TerrainMeta {
  label: string;
  shortLabel: string;
  className: string;
}

export interface BuildingMeta {
  label: string;
  shortLabel: string;
}

export interface RankMeta {
  label: string;
  shortLabel: string;
  strength: number;
  xpToPromote: number | null;
}

export interface DifficultyMeta {
  label: string;
  shortLabel: string;
  scoreMultiplier: number;
  startingVotes: number;
  startingHappiness: number;
  botGraceTicks: number;
  botSpawnTicks: number;
  botActivationTicks: number;
  botStrengthBonus: number;
  maxBotStrength: number;
}

export interface MapModeMeta {
  label: string;
  shortLabel: string;
}

export interface ScoreLine {
  label: string;
  value: number;
}

export interface EndScore {
  total: number;
  rating: string;
  outcome: 'won' | 'lost';
  breakdown: ScoreLine[];
}

export interface Tuning {
  MAX_RESOURCE: number;
  MAX_VOTES: number;
  STARTING_VOTES: number;
  STARTING_HAPPINESS: number;
  ECONOMY_TICK_SECONDS: number;
  DATA_CENTER_COUNT: number;
  VOTE_DRAIN_THRESHOLD: number;
  VOTE_DRAIN_PER_TICK: number;
  BOT_DAMAGE_VOTE_LOSS: number;
  SEVERE_SHORTAGE_VOTE_LOSS: number;
  BOT_GRACE_TICKS: number;
  BOT_SPAWN_TICKS: number;
  BOT_ACTIVATION_TICKS: number;
  BOT_MOVE_TICKS: number;
  LAWYER_MOVE_TICKS: number;
  POPULATION_GROWTH_TICKS: number;
  BURNOUT_MAX: number;
  BURNOUT_RECOVERY_PER_TICK: number;
  BURNOUT_RECOVERY_THRESHOLD: number;
  COMBAT_WIN_BURNOUT: number;
  COMBAT_LOSS_BURNOUT: number;
  RAID_BURNOUT: number;
  RAID_REQUIRED_STRENGTH: number;
  RAID_ADJACENCY_NEEDED: number;
  POPULATION_LEVELS: number[];
  CLAIM_COST: Partial<ResourceStock>;
  SCOUT_COST: Partial<ResourceStock>;
  REPAIR_COST: Partial<ResourceStock>;
  HIRE_LAWYER_COST: Partial<ResourceStock>;
  PROMOTE_LAWYER_COST: Partial<ResourceStock>;
  CITY_HALL_UPGRADE_COSTS: Record<number, Partial<ResourceStock>>;
  STORAGE_COST: Partial<ResourceStock>;
  SHIP_BASE_COST: number;
  BASE_RESOURCE_CAPACITY: number;
  STORAGE_PER_LEVEL: number;
  SHIP_AMOUNT_PER_LEVEL: number;
}

export interface RaidReadiness {
  eligible: boolean;
  adjacentControlled: number;
  adjacentNeeded: number;
  availableStrength: number;
  requiredStrength: number;
  blockers: string[];
}

export interface GameState {
  cells: MapCell[];
  resources: ResourceStock;
  services: CityServices;
  upgrades: CityUpgrades;
  storage: CityUpgrades;
  shipping: CityUpgrades;
  lawyers: LawyerSquad[];
  bots: BotUnit[];
  difficulty: GameDifficulty;
  mapMode: MapMode;
  mapSeed: number;
  votes: number;
  happiness: number;
  population: number;
  cityLevel: number;
  time: number;
  tickCount: number;
  speed: GameSpeed;
  paused: boolean;
  status: GameStatus;
  statusReason: string | null;
  score: EndScore | null;
  selectedCellId: string | null;
  nextBotId: number;
  nextLawyerId: number;
  planning: PlanningState;
  log: LogEntry[];
  logCursor: number;
}

import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import {
  BUILDING_META,
  DIFFICULTY_META,
  GAME_DIFFICULTIES,
  LAWYER_RANKS,
  MAP_MODES,
  MAP_MODE_META,
  RESOURCE_KEYS,
  RESOURCE_LABELS,
  SERVICE_KEYS,
  SERVICE_META,
  TUNING,
  TERRAIN_META,
  TERRAIN_TYPES,
} from './game/constants';
import { createInitialGameState, defaultBuildingForTerrain } from './game/initial-map';
import {
  buildService,
  buildTileImprovement,
  canBuildImprovementTile,
  canClaimTile,
  canRepairTile,
  canScoutTile,
  claimTile,
  claimNextTile,
  describeCost,
  dispatchLawyers,
  getCityHallPopulationRequirement,
  getCityHallUpgradeCost,
  getInviteResidentsCost,
  getNextCityHallLevel,
  hireLawyer,
  inviteResidents,
  maxLawyerSquads as getMaxLawyerSquads,
  promoteLawyer,
  repairTile,
  repairNextTile,
  scoutTile,
  scoutNextTile,
  setScoutPriority,
  shipResource,
  upgradeCityHall,
  upgradeProduction,
  upgradeStorage,
} from './game/planning';
import {
  availableLawyerStrength,
  builtTerrainCount,
  controlledTerrainCount,
  getCellProduction,
  getCyclesUntilEmpty,
  getDemandProfile,
  getNetResourcePerCycle,
  getRaidEligibleDataCenters,
  getRaidReadiness,
  getRequiredServiceLevel,
  getServiceUpkeep,
  getTotalProduction,
  getUpgradeCap,
  resourceCapacity,
  tickGame,
} from './game/simulation';
import {
  DispatchIntent,
  GameDifficulty,
  GameSpeed,
  GameState,
  LogTone,
  MapMode,
  MapCell,
  ResourceKey,
  ScoutPriority,
  ServiceKey,
  TerrainType,
} from './game/types';

type PlanningTab = 'expansion' | 'resources' | 'services' | 'lawyers';

@Component({
  selector: 'app-ai-settlement-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-settlement-game.html',
  styleUrl: './ai-settlement-game.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiSettlementGameComponent implements OnInit, OnDestroy {
  readonly resources = RESOURCE_KEYS;
  readonly resourceLabels = RESOURCE_LABELS;
  readonly services = SERVICE_KEYS;
  readonly terrainTypes = TERRAIN_TYPES;
  readonly serviceMeta = SERVICE_META;
  readonly terrainMeta = TERRAIN_META;
  readonly buildingMeta = BUILDING_META;
  readonly lawyerRanks = LAWYER_RANKS;
  readonly difficulties = GAME_DIFFICULTIES;
  readonly difficultyMeta = DIFFICULTY_META;
  readonly mapModes = MAP_MODES;
  readonly mapModeMeta = MAP_MODE_META;
  readonly maxVotes = TUNING.MAX_VOTES;
  readonly economyCycleSeconds = TUNING.ECONOMY_TICK_SECONDS;
  readonly voteGraceCycles = TUNING.VOTE_GRACE_ECONOMY_CYCLES;
  readonly terrainResourceMap: Record<TerrainType, ResourceKey> = {
    homes: 'budget',
    farms: 'food',
    water: 'water',
    power: 'power',
    industry: 'materials',
  };
  readonly scoutPriorities: { key: ScoutPriority; label: string }[] = [
    ...TERRAIN_TYPES.map((terrain) => ({ key: terrain, label: TERRAIN_META[terrain].label })),
    { key: 'nearestThreat', label: 'Threat' },
  ];

  state: GameState = createInitialGameState();
  activePlanningTab: PlanningTab = 'expansion';
  selectedTerrain: TerrainType = 'farms';
  planningPanelOpen = false;
  tilePanelOpen = false;
  logPanelOpen = false;

  private startIndex = 0;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly isBrowser: boolean;
  private resumeAfterMobilePanel = false;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.startLoop();
    }
  }

  ngOnDestroy(): void {
    this.stopLoop();
  }

  get selectedCell(): MapCell | null {
    return this.state.selectedCellId
      ? this.state.cells.find((cell) => cell.id === this.state.selectedCellId) ?? null
      : null;
  }

  get visibleDataCenterCount(): number {
    return this.state.cells.filter((cell) => cell.owner === 'dataCenter' && cell.visibility === 'scouted').length;
  }

  get dataCenterCount(): number {
    return this.state.cells.filter((cell) => cell.owner === 'dataCenter').length;
  }

  get raidEligibleCount(): number {
    return getRaidEligibleDataCenters(this.state).length;
  }

  get scoutedCount(): number {
    return this.state.cells.filter((cell) => cell.visibility === 'scouted').length;
  }

  get controlledCount(): number {
    return this.state.cells.filter((cell) => cell.owner === 'city').length;
  }

  get ruinsCount(): number {
    return this.state.cells.filter((cell) => cell.building === 'ruins').length;
  }

  startLoop(): void {
    this.stopLoop();
    this.intervalId = setInterval(() => this.pulse(), 1000);
  }

  stopLoop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  pulse(): void {
    if (this.state.paused || this.state.status !== 'playing') {
      return;
    }

    for (let step = 0; step < this.state.speed; step += 1) {
      this.state = tickGame(this.state);
    }

    this.changeDetectorRef.markForCheck();
  }

  resetGame(): void {
    this.startIndex += 1;
    this.state = createInitialGameState(this.startIndex, this.state.difficulty, this.state.mapMode);
    this.activePlanningTab = 'expansion';
    this.closePanelsWithoutResuming();
    this.changeDetectorRef.markForCheck();
  }

  setDifficulty(difficulty: GameDifficulty): void {
    this.startIndex += 1;
    this.state = createInitialGameState(this.startIndex, difficulty, this.state.mapMode);
    this.activePlanningTab = 'expansion';
    this.closePanelsWithoutResuming();
    this.changeDetectorRef.markForCheck();
  }

  setMapMode(mapMode: MapMode): void {
    this.startIndex += 1;
    this.state = createInitialGameState(this.startIndex, this.state.difficulty, mapMode);
    this.activePlanningTab = 'expansion';
    this.closePanelsWithoutResuming();
    this.changeDetectorRef.markForCheck();
  }

  setPaused(paused: boolean): void {
    if (paused) {
      this.resumeAfterMobilePanel = false;
    }

    this.state = {
      ...this.state,
      paused,
    };
    this.changeDetectorRef.markForCheck();
  }

  setSpeed(speed: GameSpeed): void {
    this.resumeAfterMobilePanel = false;
    this.state = {
      ...this.state,
      paused: false,
      speed,
    };
    this.changeDetectorRef.markForCheck();
  }

  setPlanningTab(tab: PlanningTab): void {
    this.activePlanningTab = tab;
    this.planningPanelOpen = true;
    this.tilePanelOpen = false;
    this.logPanelOpen = false;
    this.pauseForMobilePanel();
    this.changeDetectorRef.markForCheck();
  }

  selectCell(cellId: string): void {
    this.state = {
      ...this.state,
      selectedCellId: cellId,
    };
    this.tilePanelOpen = true;
    this.planningPanelOpen = false;
    this.logPanelOpen = false;
    this.pauseForMobilePanel();
    this.changeDetectorRef.markForCheck();
  }

  openLogPanel(): void {
    this.logPanelOpen = true;
    this.planningPanelOpen = false;
    this.tilePanelOpen = false;
    this.pauseForMobilePanel();
    this.changeDetectorRef.markForCheck();
  }

  closePlanningPanel(): void {
    this.planningPanelOpen = false;
    this.resumeMobileIfPanelsClosed();
    this.changeDetectorRef.markForCheck();
  }

  closeTilePanel(): void {
    this.tilePanelOpen = false;
    this.resumeMobileIfPanelsClosed();
    this.changeDetectorRef.markForCheck();
  }

  closeLogPanel(): void {
    this.logPanelOpen = false;
    this.resumeMobileIfPanelsClosed();
    this.changeDetectorRef.markForCheck();
  }

  closeMobilePanels(): void {
    this.planningPanelOpen = false;
    this.tilePanelOpen = false;
    this.logPanelOpen = false;
    this.resumeMobileIfPanelsClosed();
    this.changeDetectorRef.markForCheck();
  }

  setPriority(priority: ScoutPriority): void {
    this.state = setScoutPriority(this.state, priority);
    this.changeDetectorRef.markForCheck();
  }

  scout(): void {
    this.state = scoutNextTile(this.state);
    this.changeDetectorRef.markForCheck();
  }

  scoutSelectedCell(cell: MapCell): void {
    this.state = scoutTile(this.state, cell.id);
    this.changeDetectorRef.markForCheck();
  }

  claim(): void {
    this.state = claimNextTile(this.state);
    this.changeDetectorRef.markForCheck();
  }

  claimSelectedCell(cell: MapCell): void {
    this.state = claimTile(this.state, cell.id);
    this.changeDetectorRef.markForCheck();
  }

  repair(): void {
    this.state = repairNextTile(this.state);
    this.changeDetectorRef.markForCheck();
  }

  repairSelectedCell(cell: MapCell): void {
    this.state = repairTile(this.state, cell.id);
    this.changeDetectorRef.markForCheck();
  }

  buildImprovementSelectedCell(cell: MapCell): void {
    this.state = buildTileImprovement(this.state, cell.id);
    this.changeDetectorRef.markForCheck();
  }

  upgrade(resource: ResourceKey): void {
    this.state = upgradeProduction(this.state, resource);
    this.changeDetectorRef.markForCheck();
  }

  store(resource: ResourceKey): void {
    this.state = upgradeStorage(this.state, resource);
    this.changeDetectorRef.markForCheck();
  }

  ship(resource: ResourceKey): void {
    this.state = shipResource(this.state, resource);
    this.changeDetectorRef.markForCheck();
  }

  build(service: ServiceKey): void {
    this.state = buildService(this.state, service);
    this.changeDetectorRef.markForCheck();
  }

  upgradeHall(): void {
    this.state = upgradeCityHall(this.state);
    this.changeDetectorRef.markForCheck();
  }

  invite(): void {
    this.state = inviteResidents(this.state);
    this.changeDetectorRef.markForCheck();
  }

  hire(): void {
    this.state = hireLawyer(this.state);
    this.changeDetectorRef.markForCheck();
  }

  promote(): void {
    this.state = promoteLawyer(this.state);
    this.changeDetectorRef.markForCheck();
  }

  dispatch(intent: DispatchIntent): void {
    this.state = dispatchLawyers(this.state, intent);
    this.changeDetectorRef.markForCheck();
  }

  setSelectedTerrain(terrain: TerrainType): void {
    this.selectedTerrain = terrain;
    this.changeDetectorRef.markForCheck();
  }

  selectedTerrainResource(): ResourceKey {
    return this.terrainResourceMap[this.selectedTerrain];
  }

  selectedTerrainOwnedCount(): number {
    return controlledTerrainCount(this.state, this.selectedTerrain);
  }

  selectedTerrainBuiltCount(): number {
    return builtTerrainCount(this.state, this.selectedTerrain);
  }

  selectedTerrainEmptyCount(): number {
    return Math.max(0, this.selectedTerrainOwnedCount() - this.selectedTerrainBuiltCount());
  }

  selectedTerrainProduction(): number {
    return this.productionValue(this.selectedTerrainResource());
  }

  selectedTerrainUpgradeCap(): number {
    return getUpgradeCap(this.state, this.selectedTerrainResource());
  }

  selectedTerrainDemand(): number {
    return this.demandValue(this.selectedTerrainResource());
  }

  selectedTerrainCapacity(): number {
    return resourceCapacity(this.state, this.selectedTerrainResource());
  }

  nextCityHallLevel(): number | null {
    return getNextCityHallLevel(this.state);
  }

  cityHallUpgradeCostLabel(): string {
    const cost = getCityHallUpgradeCost(this.state);
    return cost ? describeCost(cost) : 'Max level';
  }

  cityHallPopulationRequirement(): number | null {
    return getCityHallPopulationRequirement(this.state);
  }

  inviteResidentsCostLabel(): string {
    return describeCost(getInviteResidentsCost(this.state));
  }

  populationAfterInvite(): number {
    return this.state.population + TUNING.INVITE_RESIDENTS_AMOUNT;
  }

  maxLawyerSquads(): number {
    return getMaxLawyerSquads(this.state);
  }

  availableLegalStrength(): number {
    return availableLawyerStrength(this.state);
  }

  canScout(cell: MapCell): boolean {
    return canScoutTile(this.state, cell);
  }

  canClaim(cell: MapCell): boolean {
    return canClaimTile(this.state, cell);
  }

  canRepair(cell: MapCell): boolean {
    return canRepairTile(this.state, cell);
  }

  canBuildImprovement(cell: MapCell): boolean {
    return canBuildImprovementTile(cell);
  }

  canShipSelectedTerrain(): boolean {
    return this.selectedTerrainResource() !== 'budget';
  }

  selectedTerrainBuildActionLabel(): string {
    return this.selectedTerrainEmptyCount() > 0 ? 'Build site' : 'Upgrade rate';
  }

  selectedTerrainBuildActionDetail(): string {
    return this.selectedTerrainEmptyCount() > 0
      ? `Empty sites ${this.selectedTerrainEmptyCount()}`
      : `+${this.selectedTerrainProduction()} / cycle now`;
  }

  resourceValue(resource: ResourceKey): number {
    return Math.round(this.state.resources[resource]);
  }

  mobileResourceLabel(resource: ResourceKey): string {
    switch (resource) {
      case 'materials':
        return 'Mat';
      case 'budget':
        return 'Budget';
      default:
        return RESOURCE_LABELS[resource];
    }
  }

  resourceCapacityValue(resource: ResourceKey): number {
    return resourceCapacity(this.state, resource);
  }

  resourceToneClass(resource: ResourceKey): string {
    const value = this.state.resources[resource];

    if (value < 8) {
      return 'bg-red-500';
    }

    if (value < 18) {
      return 'bg-amber-500';
    }

    return 'bg-lime-500';
  }

  productionValue(resource: ResourceKey): number {
    return getTotalProduction(this.state)[resource];
  }

  demandValue(resource: ResourceKey): number {
    return (getDemandProfile(this.state).resources[resource] ?? 0) + (getServiceUpkeep(this.state)[resource] ?? 0);
  }

  resourceNetValue(resource: ResourceKey): number {
    return getNetResourcePerCycle(this.state, resource);
  }

  resourceNetLabel(resource: ResourceKey): string {
    const net = this.resourceNetValue(resource);
    return net > 0 ? `+${net}` : `${net}`;
  }

  resourceForecastLabel(resource: ResourceKey): string {
    const cycles = getCyclesUntilEmpty(this.state, resource);

    if (cycles === null) {
      return this.resourceNetValue(resource) > 0 ? 'gaining' : 'flat';
    }

    return cycles === 0 ? 'empty' : `${cycles} cycles left`;
  }

  resourceForecastClass(resource: ResourceKey): string {
    const cycles = getCyclesUntilEmpty(this.state, resource);

    if (cycles === null) {
      return this.resourceNetValue(resource) > 0 ? 'text-lime-700 dark:text-lime-300' : 'text-zinc-500 dark:text-zinc-400';
    }

    return cycles <= 2 ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300';
  }

  resourceCardClass(resource: ResourceKey): string {
    const cycles = getCyclesUntilEmpty(this.state, resource);

    if (cycles !== null && cycles <= 2) {
      return 'ai-resource-critical border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/40';
    }

    if (cycles !== null && cycles <= 5) {
      return 'ai-resource-warning border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30';
    }

    if (this.resourceNetValue(resource) > 0) {
      return 'ai-resource-healthy';
    }

    return '';
  }

  pressureCardClass(value: number): string {
    if (value >= 85) {
      return 'ai-pressure-critical border-red-300 bg-red-50 text-red-950 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100';
    }

    if (value >= 60) {
      return 'ai-pressure-warning border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100';
    }

    if (value > 0) {
      return 'border-cyan-200 bg-cyan-50/60 dark:border-cyan-900 dark:bg-cyan-950/20';
    }

    return '';
  }

  votePressurePercent(): number {
    return this.voteGraceCycles > 0
      ? Math.min(100, (this.state.lowHappinessCycles / this.voteGraceCycles) * 100)
      : 0;
  }

  serviceRequired(service: ServiceKey): number {
    return getRequiredServiceLevel(this.state, service);
  }

  scoreValueLabel(value: number): string {
    return value > 0 ? `+${value}` : `${value}`;
  }

  cellButtonClass(cell: MapCell): string {
    const selectedClass = this.state.selectedCellId === cell.id
      ? 'outline outline-2 outline-offset-2 outline-zinc-950 dark:outline-zinc-50'
      : '';
    const actionClass = this.cellActionClass(cell);

    if (cell.visibility === 'hidden') {
      return [
        'ai-settlement-cell ai-smog-cell relative aspect-square rounded border border-zinc-700 bg-zinc-900 text-zinc-300 shadow-sm transition',
        cell.scoutingTicksRemaining > 0 ? 'ring-2 ring-cyan-500' : '',
        'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500',
        actionClass,
        selectedClass,
      ].join(' ');
    }

    const ownerClass = cell.owner === 'city'
      ? 'ring-2 ring-lime-500'
      : cell.owner === 'dataCenter'
        ? 'ring-2 ring-red-600 bg-zinc-950 text-red-100 border-red-600'
        : 'ring-1 ring-zinc-300 dark:ring-zinc-700';

    return [
      'ai-settlement-cell relative aspect-square rounded border p-1 text-left shadow-sm transition hover:scale-[1.02]',
      'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500',
      TERRAIN_META[cell.terrain].className,
      ownerClass,
      actionClass,
      selectedClass,
    ].join(' ');
  }

  private cellActionClass(cell: MapCell): string {
    if (this.canScout(cell)) {
      return 'ai-scoutable-cell';
    }

    if (this.canClaim(cell) || this.canRepair(cell) || this.canBuildImprovement(cell)) {
      return 'ai-actionable-cell';
    }

    return '';
  }

  cellPrimaryLabel(cell: MapCell): string {
    if (cell.visibility === 'hidden' && cell.scoutingTicksRemaining > 0) {
      return 'Scout';
    }

    if (cell.visibility === 'hidden') {
      return 'Smog';
    }

    if (cell.building) {
      return BUILDING_META[cell.building].shortLabel;
    }

    return TERRAIN_META[cell.terrain].shortLabel;
  }

  cellSecondaryLabel(cell: MapCell): string {
    if (cell.visibility === 'hidden' && cell.scoutingTicksRemaining > 0) {
      return `${cell.scoutingTicksRemaining}s`;
    }

    if (cell.visibility === 'hidden') {
      return 'Unknown';
    }

    if (cell.owner === 'city') {
      return cell.building ? 'City' : 'Empty';
    }

    if (cell.owner === 'dataCenter') {
      return 'Hostile';
    }

    return TERRAIN_META[cell.terrain].label;
  }

  terrainLabel(cell: MapCell): string {
    return cell.visibility === 'hidden' ? 'Smog' : TERRAIN_META[cell.terrain].label;
  }

  ownerLabel(cell: MapCell): string {
    if (cell.visibility === 'hidden') {
      return 'Unknown';
    }

    switch (cell.owner) {
      case 'city':
        return 'City';
      case 'dataCenter':
        return 'Data Center';
      case 'neutral':
        return 'Neutral';
    }
  }

  buildingLabel(cell: MapCell): string {
    if (cell.visibility === 'hidden') {
      return 'Unknown';
    }

    if (cell.owner === 'city' && cell.building === null) {
      return 'Empty site';
    }

    return cell.building ? BUILDING_META[cell.building].label : 'None';
  }

  improvementLabel(cell: MapCell): string {
    if (cell.visibility === 'hidden') {
      return 'Improvement';
    }

    const building = defaultBuildingForTerrain(cell.terrain);

    return building ? BUILDING_META[building].label : 'Improvement';
  }

  cellProduction(cell: MapCell): { key: ResourceKey; value: number }[] {
    const production = getCellProduction(this.state, cell);

    return this.resources
      .filter((resource) => (production[resource] ?? 0) > 0)
      .map((resource) => ({ key: resource, value: production[resource] ?? 0 }));
  }

  raidStatusForCell(cell: MapCell): string | null {
    if (cell.visibility !== 'scouted' || cell.owner !== 'dataCenter') {
      return null;
    }

    const readiness = getRaidReadiness(this.state, cell);

    if (readiness.eligible) {
      return `Raid ready: legal strength ${readiness.availableStrength}/${readiness.requiredStrength}`;
    }

    return `Raid blocked: ${readiness.blockers.join('; ')}`;
  }

  scoutingStatusForCell(cell: MapCell): string | null {
    if (cell.visibility !== 'hidden' || cell.scoutingTicksRemaining <= 0) {
      return null;
    }

    return `Scouting completes in ${cell.scoutingTicksRemaining}s`;
  }

  visibleBotsForCell(cell: MapCell): number {
    if (cell.visibility === 'hidden') {
      return 0;
    }

    return this.state.bots.filter((bot) => bot.x === cell.x && bot.y === cell.y).length;
  }

  demolishingBotsForCell(cell: MapCell): number {
    if (cell.visibility === 'hidden') {
      return 0;
    }

    return this.state.bots.filter((bot) => bot.mode === 'demolishing' && bot.x === cell.x && bot.y === cell.y).length;
  }

  botStatusForCell(cell: MapCell): string {
    if (cell.visibility === 'hidden') {
      return 'Hidden by smog';
    }

    const bots = this.state.bots.filter((bot) => bot.x === cell.x && bot.y === cell.y);

    if (bots.length === 0) {
      return 'None';
    }

    const building = bots.filter((bot) => bot.mode === 'building').length;
    const marching = bots.filter((bot) => bot.mode === 'marching').length;
    const demolishing = bots.filter((bot) => bot.mode === 'demolishing').length;
    const parts = [
      building > 0 ? `${building} building` : '',
      marching > 0 ? `${marching} marching` : '',
      demolishing > 0 ? `${demolishing} demolishing` : '',
    ].filter(Boolean);

    return parts.join(', ');
  }

  lawyersForCell(cell: MapCell): number {
    if (cell.visibility === 'hidden') {
      return 0;
    }

    return this.state.lawyers.filter((lawyer) => lawyer.x === cell.x && lawyer.y === cell.y).length;
  }

  logToneClass(tone: LogTone): string {
    switch (tone) {
      case 'success':
        return 'border-lime-500 text-lime-800 dark:text-lime-200';
      case 'warning':
        return 'border-amber-500 text-amber-800 dark:text-amber-200';
      case 'danger':
        return 'border-red-500 text-red-800 dark:text-red-200';
      default:
        return 'border-cyan-500 text-cyan-800 dark:text-cyan-200';
    }
  }

  latestLogMessage(): string {
    return this.state.log[0]?.message ?? 'No city updates yet.';
  }

  assignmentLabel(assignment: string): string {
    switch (assignment) {
      case 'intercept':
        return 'Intercept';
      case 'defend':
        return 'Defend';
      case 'raid':
        return 'Raid';
      case 'recovering':
        return 'Recovering';
      default:
        return 'Idle';
    }
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;

    return `${minutes}:${remainder.toString().padStart(2, '0')}`;
  }

  private isMobileViewport(): boolean {
    return this.isBrowser && window.matchMedia('(max-width: 767px)').matches;
  }

  private pauseForMobilePanel(): void {
    if (!this.isMobileViewport() || this.state.status !== 'playing') {
      return;
    }

    if (!this.state.paused) {
      this.resumeAfterMobilePanel = true;
    }

    this.state = {
      ...this.state,
      paused: true,
    };
  }

  private resumeMobileIfPanelsClosed(): void {
    if (!this.isMobileViewport() || !this.resumeAfterMobilePanel || this.planningPanelOpen || this.tilePanelOpen || this.logPanelOpen) {
      return;
    }

    this.resumeAfterMobilePanel = false;

    if (this.state.status === 'playing') {
      this.state = {
        ...this.state,
        paused: false,
      };
    }
  }

  private closePanelsWithoutResuming(): void {
    this.planningPanelOpen = false;
    this.tilePanelOpen = false;
    this.logPanelOpen = false;
    this.resumeAfterMobilePanel = false;
  }
}

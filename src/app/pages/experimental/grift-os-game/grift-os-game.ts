import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AudioDirectorService } from './audio/audio-director.service';
import { AudioSettings } from './audio/audio-engine';
import { GRIFT_OS_COPY } from './content/game-copy';
import { GRIFT_OS_FOUNDER_TAKE_TUNING } from './content/economy-tuning';
import { HUSTLE_DEFINITIONS } from './content/hustle-definitions';
import { LEVERAGE_DEFINITIONS } from './content/leverage-definitions';
import {
  activateHustle as activateHustleInState,
  advanceGame,
  automationCost,
  buyAutomation,
  buyHustle,
  canBuyAutomation,
  createInitialGameState,
  effectiveCadenceSeconds,
  hustleCostForQuantity,
  hustlePayout,
  maxAffordableQuantity,
  nextHustleCost,
  valuationPerSecond,
} from './game-engine/economy';
import { GameEvent, GameEventRecord, GameTabId, createGameEventRecord } from './game-engine/game-events';
import {
  FounderTakeStatus,
  founderTakeStatus,
  startFounderTakePreparation,
} from './game-engine/founder-take';
import { buyLeverage, canBuyLeverage, isLeverageUnlocked, leverageRequirements } from './game-engine/leverage';
import {
  combinedMultiplier,
  modifierBreakdownForHustle,
  wealthAdvantageMultiplier,
} from './game-engine/modifiers';
import { deriveEnterprisePresentation, EnterprisePresentation, EnterpriseStage } from './game-engine/presentation';
import {
  commitRugPull,
  createRugPullPreview,
  projectedNetWorthGain,
  RugPullPreview,
  RUG_PULL_CONFIG,
} from './game-engine/rug-pull';
import { elapsedForegroundSimulationMs } from './game-engine/simulation-clock';
import {
  GriftOsGameState,
  HustleDefinition,
  HustleId,
  LeverageDefinition,
  LeverageId,
  ProductionEvent,
} from './game-engine/types';
import {
  formatCount,
  formatMoney,
  formatMoneyRate,
  formatMultiplier,
  formatPercentage,
} from './formatting/number-format';
import {
  PlaytestSession,
  appendPlaytestEvent,
  clearStoredPlaytestSessions,
  createHumanReadablePlaytestSummary,
  createPlaytestExportJson,
  createPlaytestSession,
  loadStoredPlaytestSession,
  recordAutomationPurchase,
  recordCycleCompleted,
  recordDiscoveryEvents,
  recordHustlePurchase,
  recordManualActivation,
  recordMilestoneReached,
  recordRugPullCommit,
  recordSnapshotIfDue,
  savePlaytestSession,
} from './playtest/playtest-session';

interface HustleViewModel {
  definition: HustleDefinition;
  id: HustleId;
  units: number;
  unitCountLabel: string;
  isActive: boolean;
  isAutomated: boolean;
  isProgressResetting: boolean;
  progressPercent: number;
  progressScale: string;
  progressAnimationDuration: string;
  progressLabel: string;
  payoutLabel: string;
  averageRateLabel: string;
  cadenceLabel: string;
  productionLabel: string;
  nextCostLabel: string;
  automationCostLabel: string;
  automationStatusLabel: string;
  automationContextLabel: string;
  expansionButtonLabel: string;
  manualButtonLabel: string;
  manualActiveLabel: string;
  buyMaxLabel: string;
  buyMaxCount: number;
  canManualAction: boolean;
  canBuyOne: boolean;
  canBuyMax: boolean;
  canBuyAutomation: boolean;
  automationEligible: boolean;
  isPlayerDependent: boolean;
  isSettledAutomated: boolean;
  hasContextualAttention: boolean;
  showAutomationState: boolean;
  showAutomationOpportunity: boolean;
  showNextMilestone: boolean;
  showBuyMax: boolean;
  showModifierSummary: boolean;
  nextMilestoneLabel: string;
  nextMilestoneCompactLabel: string;
  nextMilestoneDescription: string;
  milestoneProgressScale: string;
  modifierSummaryLabel: string;
}

interface HustleHorizonView {
  definition: HustleDefinition;
  id: HustleId;
  costLabel: string;
  shortfallLabel: string;
  canBuy: boolean;
}

interface LeverageDealView {
  definition: LeverageDefinition;
  id: LeverageId;
  costLabel: string;
  isPurchased: boolean;
  isUnlocked: boolean;
  canBuy: boolean;
  statusLabel: string;
  effectLabels: readonly string[];
}

interface PayoutFeedback {
  id: number;
  text: string;
  hustleName: string;
  hustleId: HustleId | null;
  tone: 'payout' | 'automation' | 'milestone' | 'leverage' | 'rug-pull';
  expiresAt: number;
}

type ValuationFlyoutDirection = 'gain' | 'spend';

interface ValuationFlyout {
  id: number;
  direction: ValuationFlyoutDirection;
  label: string;
  lane: number;
}

interface RugPullResolution {
  netWorthGainLabel: string;
  resultingNetWorthLabel: string;
  wealthAdvantageLabel: string;
  peakValuationLabel: string;
}

interface GriftMetaSave {
  netWorth: number;
  rugPullCount: number;
}

interface GriftRunSave {
  version: 1;
  savedAt: number;
  state: GriftOsGameState;
  selectedHustleId: HustleId;
}

interface OfflineReturn {
  elapsedLabel: string;
  payoutLabel: string;
  pendingPayout: number;
}

type RunShortcutId =
  | 'fresh'
  | 'first-expansion'
  | 'automation-ready'
  | 'two-hustles'
  | 'milestone-near'
  | 'portfolio-mid'
  | 'portfolio-scale'
  | 'rug-pull-ready'
  | 'post-rug'
  | 'endgame';
type InitialRouteRunState = RunShortcutId;

const META_STORAGE_KEY = 'grift-os-meta-v1';
const RUN_STORAGE_KEY = 'grift-os-run-v1';
const SIMULATION_TICK_MS = 50;
const UI_RENDER_INTERVAL_MS = 100;
const PROGRESS_RESET_RESTORE_MS = 24;
const PROGRESS_VISUAL_LEAD_MS = 40;
const VALUATION_GAIN_FLYOUT_LIMIT = 3;
const VALUATION_SPEND_FLYOUT_LIMIT = 2;
const VALUATION_FLYOUT_LIFETIME_MS = 680;
const RUN_SAVE_THROTTLE_MS = 2000;
const OFFLINE_RETURN_MIN_MS = 30_000;
const OFFLINE_RETURN_CAP_MS = 8 * 60 * 60 * 1000;
const DEFAULT_MUSIC_VOLUME = 0.45;
const DEFAULT_SFX_VOLUME = 0.7;
const ENDGAME_NET_WORTH = 1_000_000_000_000;
const ENDGAME_RUG_PULL_COUNT = 8;
const ENDGAME_VALUATION = 1_000_000_000_000_000;

const STAGE_COPY: Record<EnterpriseStage, { label: string; summary: string }> = {
  scrappy: {
    label: 'Scrappy cover story',
    summary: 'One working Hustle and almost no institutional camouflage.',
  },
  traction: {
    label: 'Traction theater',
    summary: 'The stack starts to look repeatable, even if it is still mostly personal labor.',
  },
  legitimate: {
    label: 'Legibility threshold',
    summary: 'Milestones and owned surfaces start reading like a business instead of a stunt.',
  },
  institutional: {
    label: 'Institutional polish',
    summary: 'Automation, belief products, and ownership layers begin reinforcing each other.',
  },
  power: {
    label: 'Power consolidation',
    summary: 'The network starts manufacturing inevitability across channels at once.',
  },
  'pre-rug': {
    label: 'Extraction window',
    summary: 'The machine is large enough to convert paper status into persistent personal gravity.',
  },
};

@Component({
  selector: 'app-grift-os-game',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './grift-os-game.html',
  styleUrl: './grift-os-game.scss',
})
export class GriftOsGameComponent implements OnInit, OnDestroy {
  readonly copy = GRIFT_OS_COPY;
  readonly definitions = HUSTLE_DEFINITIONS;
  readonly isPlaytestMode: boolean;
  readonly runShortcuts: readonly { id: RunShortcutId; label: string }[] = [
    { id: 'fresh', label: 'Fresh' },
    { id: 'first-expansion', label: 'Horizon' },
    { id: 'automation-ready', label: 'Automation' },
    { id: 'two-hustles', label: 'Two Hustles' },
    { id: 'milestone-near', label: 'Milestone' },
    { id: 'portfolio-mid', label: 'Buildout' },
    { id: 'portfolio-scale', label: 'Portfolio' },
    { id: 'rug-pull-ready', label: 'Late Game' },
    { id: 'post-rug', label: 'Post Rug' },
    { id: 'endgame', label: 'Endgame' },
  ];
  readonly tabs: readonly { id: GameTabId; label: string }[] = [
    { id: 'hustles', label: GRIFT_OS_COPY.tabs.hustles },
    { id: 'leverage', label: GRIFT_OS_COPY.tabs.leverage },
    { id: 'rugPull', label: GRIFT_OS_COPY.tabs.rugPull },
  ];

  @ViewChild('selectedContextPanel') private selectedContextPanel?: ElementRef<HTMLElement>;
  @ViewChild('hustlesSurface') private hustlesSurface?: ElementRef<HTMLElement>;

  state: GriftOsGameState = createInitialGameState(this.definitions);
  payoutFeedback: PayoutFeedback[] = [];
  valuationFlyouts: ValuationFlyout[] = [];
  rugPullResolution: RugPullResolution | null = null;
  playtestSession: PlaytestSession | null = null;
  playtestStatusMessage = '';
  selectedHustleId: HustleId = this.definitions[0].id;
  selectedContextOpen = false;
  selectedTab: GameTabId = 'hustles';
  gameEvents: GameEventRecord[] = [];
  offlineReturn: OfflineReturn | null = null;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly documentRef = inject(DOCUMENT);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);
  private readonly route = inject(ActivatedRoute);
  readonly audioDirector = inject(AudioDirectorService);
  private readonly isBrowser: boolean;
  private simulationTimerId: number | null = null;
  private progressTransitionRestoreTimerId: number | null = null;
  private readonly progressTransitionResetIds = new Set<HustleId>();
  private lastTickTime = 0;
  private feedbackId = 0;
  private valuationFlyoutId = 0;
  private readonly valuationFlyoutTimerIds = new Map<number, number>();
  private gameEventId = 0;
  private lastRunSaveAt = 0;
  private selectedContextReturnTarget: HTMLElement | null = null;
  private selectedContextReturnHustleId: HustleId | null = null;
  private cachedHustleRowsState: GriftOsGameState | null = null;
  private cachedHustleRows: HustleViewModel[] = [];
  private lastUiRenderTime = 0;
  private readonly initialRouteRunState: InitialRouteRunState | null;
  private readonly initialRouteSurface: GameTabId | null;
  private readonly visibilityChangeHandler = (): void => {
    if (!this.isBrowser) {
      return;
    }

    if (this.documentRef.hidden) {
      this.persistRunState(true);
    }

    this.lastTickTime = performance.now();
  };

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.isPlaytestMode = this.route.snapshot.queryParamMap.get('playtest') === '1';
    this.initialRouteRunState = this.parseInitialRouteRunState(this.route.snapshot.queryParamMap.get('run'));
    this.initialRouteSurface = this.parseInitialRouteSurface(this.route.snapshot.queryParamMap.get('surface'));
    this.applyInitialRouteState(0);
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }

    const savedMeta = this.loadSavedMeta();
    const savedRun = this.initialRouteRunState ? null : this.loadSavedRunState(savedMeta);
    this.state = savedRun?.state ?? createInitialGameState(
      this.definitions,
      savedMeta.netWorth,
      savedMeta.rugPullCount
    );
    this.selectedHustleId = savedRun?.selectedHustleId ?? this.definitions[0].id;
    this.prepareOfflineReturn(savedRun);
    this.applyInitialRouteState(this.state.netWorth);

    if (this.isPlaytestMode) {
      this.initializePlaytestSession();
    }

    this.updateAudioPresentation();
    this.startSimulationTimer();
  }

  ngOnDestroy(): void {
    if (this.simulationTimerId !== null) {
      window.clearInterval(this.simulationTimerId);
    }

    if (this.progressTransitionRestoreTimerId !== null) {
      window.clearTimeout(this.progressTransitionRestoreTimerId);
    }

    for (const timerId of this.valuationFlyoutTimerIds.values()) {
      window.clearTimeout(timerId);
    }

    this.valuationFlyoutTimerIds.clear();

    if (this.isBrowser) {
      this.persistRunState(true);
      this.documentRef.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      this.setContextOverlayBodyState(false);
    }
  }

  get valuationLabel(): string {
    return formatMoney(this.state.valuation, 'headline');
  }

  get peakValuationLabel(): string {
    return formatMoney(this.state.peakValuation, 'headline');
  }

  get valuationPerSecondLabel(): string {
    return formatMoneyRate(valuationPerSecond(this.state, this.definitions));
  }

  get netWorthLabel(): string {
    return formatMoney(this.state.netWorth, 'net-worth');
  }

  get wealthAdvantageLabel(): string {
    const outputAdvantagePercent = (wealthAdvantageMultiplier(this.state.netWorth) - 1) * 100;

    return `Up to +${formatPercentage(outputAdvantagePercent)} established output`;
  }

  get rugPullNetWorthGainLabel(): string {
    return `+${formatMoney(this.rugPullPreview.projectedNetWorthGain, 'payout')}`;
  }

  get rugPullResultingNetWorthLabel(): string {
    return formatMoney(this.rugPullPreview.resultingNetWorth, 'net-worth');
  }

  get rugPullTargetLabel(): string {
    return formatMoney(this.rugPullPreview.requiredPeakValuation, 'headline');
  }

  get rugPullWealthAdvantageLabel(): string {
    return `Up to +${formatPercentage(this.rugPullPreview.wealthAdvantagePercent)} established next-run output`;
  }

  get rugPullRecoveryMultiplierLabel(): string {
    return formatMultiplier(this.rugPullPreview.recoveryMultiplier);
  }

  get presentation(): EnterprisePresentation {
    return deriveEnterprisePresentation(this.state, this.definitions);
  }

  get enterpriseIntensityPercent(): number {
    return Math.round(this.presentation.enterpriseIntensity * 100);
  }

  get stageLabel(): string {
    return STAGE_COPY[this.presentation.enterpriseStage].label;
  }

  get stageSummary(): string {
    return STAGE_COPY[this.presentation.enterpriseStage].summary;
  }

  get resetHustleCount(): number {
    return this.definitions.filter((definition) => this.state.hustles[definition.id].units > 0).length;
  }

  get resetAutomationCount(): number {
    return this.definitions.filter((definition) => this.state.hustles[definition.id].isAutomated).length;
  }

  get resetMilestoneCount(): number {
    return this.definitions.reduce(
      (count, definition) => count + this.state.hustles[definition.id].reachedMilestones.length,
      0
    );
  }

  get selectedHustle(): HustleViewModel {
    return this.hustleRows.find((row) => row.id === this.selectedHustleId) ?? this.hustleRows[0];
  }

  get visibleHustleRows(): HustleViewModel[] {
    return this.hustleRows.filter((row) => row.units > 0);
  }

  get ownedHustleCount(): number {
    return this.definitions.filter((definition) => this.state.hustles[definition.id].units > 0).length;
  }

  get hasExpandedBeyondInitialState(): boolean {
    return this.definitions.some((definition) =>
      this.state.hustles[definition.id].units > definition.initialUnits
    );
  }

  get showNextHustleHorizon(): boolean {
    return this.ownedHustleCount > 1 || this.hasExpandedBeyondInitialState;
  }

  get nextHustleHorizon(): HustleHorizonView | null {
    const definition = this.definitions
      .slice()
      .sort((first, second) => first.order - second.order)
      .find((candidate) => this.state.hustles[candidate.id].units <= 0);

    if (!definition) {
      return null;
    }

    const cost = nextHustleCost(
      definition,
      this.state.hustles[definition.id].units,
      this.state,
      this.definitions
    );
    return {
      definition,
      id: definition.id,
      costLabel: formatMoney(cost, 'transaction'),
      shortfallLabel: formatMoney(Math.max(0, cost - this.state.valuation), 'transaction'),
      canBuy: this.state.valuation >= cost,
    };
  }

  get visibleHustleCountLabel(): string {
    const count = this.ownedHustleCount;
    const unit = count === 1 ? 'Hustle active' : 'Hustles active';

    return `${count} ${unit}`;
  }

  get hasAnyAutomation(): boolean {
    return this.definitions.some((definition) => this.state.hustles[definition.id].isAutomated);
  }

  get hasAnyMilestone(): boolean {
    return this.definitions.some((definition) => this.state.hustles[definition.id].reachedMilestones.length > 0);
  }

  get showPinnedSelectedContext(): boolean {
    return this.ownedHustleCount >= 2;
  }

  get showSelectedContextSurface(): boolean {
    return this.showPinnedSelectedContext || this.selectedContextOpen;
  }

  get showNetWorth(): boolean {
    return this.state.netWorth > 0;
  }

  get availableTabs(): readonly { id: GameTabId; label: string }[] {
    return this.tabs.filter((tab) => this.isTabAvailable(tab.id));
  }

  get showModeTabs(): boolean {
    return this.availableTabs.length > 1;
  }

  get selectedVisibleTab(): GameTabId {
    return this.isTabAvailable(this.selectedTab) ? this.selectedTab : 'hustles';
  }

  get rugPullPreview(): RugPullPreview {
    return createRugPullPreview(this.state, this.definitions);
  }

  get founderTake(): FounderTakeStatus {
    return founderTakeStatus(this.state);
  }

  get founderTakeRateLabel(): string {
    return formatPercentage(this.founderTake.takeRate * 100);
  }

  get founderTakeNextCostLabel(): string {
    return formatMoney(this.founderTake.nextStageCost, 'transaction');
  }

  get founderTakeDurationLabel(): string {
    return this.founderTake.nextStage
      ? this.formatElapsed(this.founderTake.nextStage.durationMs)
      : '';
  }

  get founderTakeRemainingLabel(): string {
    return this.formatElapsed(this.founderTake.remainingMs);
  }

  get founderTakeOutputLabel(): string {
    return `${formatPercentage(this.founderTake.outputRetention * 100)} output retained`;
  }

  get founderTakeNextOutputLabel(): string {
    const nextStage = this.founderTake.nextStage;

    return nextStage
      ? `${formatPercentage(nextStage.outputRetention * 100)} output retained`
      : '';
  }

  get founderTakeProgressScale(): string {
    const stage = this.founderTake.activeStage;

    if (!stage || stage.durationMs <= 0) {
      return '0';
    }

    return Math.min(1, this.founderTake.progressMs / stage.durationMs).toFixed(4);
  }

  get leverageDeals(): readonly LeverageDealView[] {
    return LEVERAGE_DEFINITIONS
      .filter((definition) => this.state.netWorth >= definition.unlockNetWorth)
      .map((definition) => {
        const isPurchased = this.state.leveragePurchases.includes(definition.id);
        const isUnlocked = isLeverageUnlocked(this.state, definition);
        const affordable = this.state.valuation >= definition.cost;
        const requirements = leverageRequirements(this.state, definition);
        const missingOwnedCount = requirements.missingOwnedHustles.length;
        const missingAutomationCount = requirements.missingAutomatedHustles.length;

        return {
          definition,
          id: definition.id,
          costLabel: formatMoney(definition.cost, 'transaction'),
          isPurchased,
          isUnlocked,
          canBuy: canBuyLeverage(this.state, definition.id),
          statusLabel: isPurchased
            ? 'Operating for this run'
            : requirements.netWorthRequired > 0
              ? `Requires ${formatMoney(definition.unlockNetWorth, 'net-worth')} Net Worth`
              : missingOwnedCount > 0
                ? `Establish ${missingOwnedCount} linked Hustle${missingOwnedCount === 1 ? '' : 's'}`
                : missingAutomationCount > 0
                  ? `Automate ${missingAutomationCount} linked Hustle${missingAutomationCount === 1 ? '' : 's'}`
            : isUnlocked && !affordable
                ? `Need ${formatMoney(definition.cost - this.state.valuation, 'transaction')} more`
              : `Invest ${formatMoney(definition.cost, 'transaction')} Valuation`,
          effectLabels: definition.modifiers.map((modifier) => modifier.label),
        };
      });
  }

  get leveragePurchaseCount(): number {
    return this.state.leveragePurchases.length;
  }

  get audioSettings(): AudioSettings {
    return this.audioDirector.settings();
  }

  get isMusicMuted(): boolean {
    return this.audioSettings.isMuted || this.audioSettings.musicVolume <= 0;
  }

  get isSfxMuted(): boolean {
    return this.audioSettings.isMuted || this.audioSettings.sfxVolume <= 0;
  }

  get musicToggleLabel(): string {
    return this.isMusicMuted ? 'Music off' : 'Music on';
  }

  get sfxToggleLabel(): string {
    return this.isSfxMuted ? 'SFX off' : 'SFX on';
  }

  get hustleRows(): HustleViewModel[] {
    if (this.cachedHustleRowsState === this.state) {
      return this.cachedHustleRows;
    }

    const hasAnyAutomation = this.hasAnyAutomation;
    const hasAnyMilestone = this.hasAnyMilestone;

    const rows = this.definitions.map((definition) => {
      const hustle = this.state.hustles[definition.id];
      const cadenceSeconds = effectiveCadenceSeconds(this.state, this.definitions, definition.id);
      const cadenceMs = cadenceSeconds * 1000;
      const progressPercent = hustle.isActive
        ? Math.min(100, (hustle.progressMs / cadenceMs) * 100)
        : 0;
      const nextCost = nextHustleCost(definition, hustle.units, this.state, this.definitions);
      const buyMaxCount = maxAffordableQuantity(
        definition,
        hustle.units,
        this.state.valuation,
        this.state,
        this.definitions
      );
      const payout = hustlePayout(this.state, this.definitions, definition.id);
      const nextMilestone = definition.milestones.find((milestone) =>
        !hustle.reachedMilestones.includes(milestone.id)
      );
      const remainingUnitsForMilestone = nextMilestone ? nextMilestone.requiredUnits - hustle.units : Infinity;
      const isNearMilestone = nextMilestone
        ? remainingUnitsForMilestone <= Math.max(2, Math.ceil(nextMilestone.requiredUnits * 0.2))
        : false;
      const automationEligible = hustle.units > 0 && !hustle.isAutomated;
      const canBuyAutomationForHustle = canBuyAutomation(this.state, this.definitions, definition.id);
      const modifierSummaryLabel = this.modifierSummaryLabel(definition.id);
      const isPlayerDependent = hustle.units > 0 && !hustle.isAutomated;
      const showNextMilestone = hustle.units > 0 && nextMilestone !== undefined && (hasAnyMilestone || isNearMilestone);

      return {
        definition,
        id: definition.id,
        units: hustle.units,
        unitCountLabel: `${formatCount(hustle.units)} ${this.unitLabel(definition, hustle.units)}`,
        isActive: hustle.isActive,
        isAutomated: hustle.isAutomated,
        isProgressResetting: this.progressTransitionResetIds.has(definition.id),
        progressPercent,
        progressScale: (progressPercent / 100).toFixed(4),
        progressAnimationDuration: `${Math.max(1, cadenceMs - PROGRESS_VISUAL_LEAD_MS)}ms`,
        progressLabel: hustle.isActive
          ? `${Math.floor(progressPercent)}%`
          : hustle.isAutomated
            ? 'Cycling'
            : 'Ready',
        payoutLabel: formatMoney(payout, 'payout'),
        averageRateLabel: formatMoneyRate(payout / cadenceSeconds),
        cadenceLabel: `Every ${this.formatSeconds(cadenceSeconds)}`,
        productionLabel: `${formatMoney(payout, 'payout')} every ${this.formatSeconds(cadenceSeconds)}`,
        nextCostLabel: formatMoney(nextCost, 'transaction'),
        automationCostLabel: formatMoney(
          automationCost(this.state, this.definitions, definition.id),
          'transaction'
        ),
        automationStatusLabel: hustle.isAutomated
          ? `${definition.automationName} · ${definition.automationActivityLabel}`
          : canBuyAutomationForHustle
            ? `${definition.automationName} ready`
            : automationEligible && hasAnyAutomation
              ? `${definition.automationName} ahead`
              : 'Acquire this Hustle to automate',
        automationContextLabel: hustle.isAutomated
          ? 'Automation active'
          : canBuyAutomationForHustle
            ? `${definition.automationName} ready`
            : `${definition.automationName} ahead`,
        expansionButtonLabel: `${definition.expansionActionLabel} · ${formatMoney(nextCost, 'transaction')}`,
        manualButtonLabel: `${definition.manualActionLabel} · ${formatMoney(payout, 'payout')}`,
        manualActiveLabel: `${definition.manualActionLabel}...`,
        buyMaxLabel: buyMaxCount > 0
          ? `Buy +${formatCount(buyMaxCount)}`
          : 'Buy Max',
        buyMaxCount,
        canManualAction: hustle.units > 0 && !hustle.isActive && !hustle.isAutomated,
        canBuyOne: this.state.valuation >= hustleCostForQuantity(
          definition,
          hustle.units,
          1,
          this.state,
          this.definitions
        ),
        canBuyMax: buyMaxCount > 0,
        canBuyAutomation: canBuyAutomationForHustle,
        automationEligible,
        isPlayerDependent,
        isSettledAutomated: hustle.isAutomated && !canBuyAutomationForHustle,
        hasContextualAttention: definition.id === this.selectedHustleId || isNearMilestone,
        showAutomationState: hustle.isAutomated || (automationEligible && (hasAnyAutomation || canBuyAutomationForHustle)),
        showAutomationOpportunity: automationEligible && canBuyAutomationForHustle,
        showNextMilestone,
        showBuyMax: buyMaxCount >= 2,
        showModifierSummary: modifierSummaryLabel.length > 0,
        nextMilestoneLabel: nextMilestone
          ? `${formatCount(nextMilestone.requiredUnits)} ${this.unitLabel(definition, nextMilestone.requiredUnits)}`
          : 'All current milestones reached',
        nextMilestoneCompactLabel: nextMilestone
          ? `Next ${formatCount(nextMilestone.requiredUnits)}`
          : 'Complete',
        nextMilestoneDescription: nextMilestone
          ? `${nextMilestone.reward.label} · ${nextMilestone.description ?? 'Milestone effect'}`
          : 'Future milestone tuning can extend this track.',
        milestoneProgressScale: nextMilestone
          ? Math.min(1, Math.max(0, hustle.units / nextMilestone.requiredUnits)).toFixed(4)
          : '1',
        modifierSummaryLabel,
      };
    });

    this.cachedHustleRowsState = this.state;
    this.cachedHustleRows = rows;

    return rows;
  }

  get latestNotificationMessage(): string {
    return this.payoutFeedback[0]
      ? `${this.payoutFeedback[0].text} ${this.payoutFeedback[0].hustleName}`.trim()
      : '';
  }

  get playtestElapsedLabel(): string {
    if (!this.playtestSession) {
      return '0m 0s';
    }

    return this.formatElapsed(Date.now() - this.playtestSession.startedAtMs);
  }

  get playtestEventCount(): number {
    return this.playtestSession?.events.length ?? 0;
  }

  get playtestSessionIdLabel(): string {
    return this.playtestSession?.sessionId ?? 'not started';
  }

  setGameTab(tabId: GameTabId): void {
    if (!this.isTabAvailable(tabId)) {
      return;
    }

    if (this.selectedTab === tabId) {
      return;
    }

    this.selectedTab = tabId;
    this.closeSelectedContext(false);
    this.emitGameEvent({ type: 'gameTab.changed', tabId });

    if (tabId === 'rugPull') {
      this.emitGameEvent({ type: 'rugPull.previewOpened', rugPullState: this.rugPullPreview.state });
      this.updatePlaytestSession((session, nowMs) =>
        appendPlaytestEvent(session, 'rug_pull_preview_opened', {}, nowMs)
      );
    }

    this.changeDetectorRef.markForCheck();
  }

  unlockAudio(): void {
    this.audioDirector.unlockFromTrustedInteraction();
  }

  activate(hustleId: HustleId): void {
    this.unlockAudio();
    this.selectHustle(hustleId);
    const previousState = this.state;
    const nextState = activateHustleInState(this.state, hustleId);
    this.state = nextState;

    if (nextState !== previousState) {
      if (this.isBrowser) {
        this.lastTickTime = performance.now();
      }

      const definition = this.getDefinition(hustleId);

      if (definition) {
        this.emitGameEvent({ type: 'hustle.manualActionStarted', hustleId });
        this.updatePlaytestSession((session, nowMs) =>
          recordManualActivation(session, definition, nextState, nowMs)
        );
      }
    }

    this.updateAudioPresentation();
    this.persistRunState(true);
    this.changeDetectorRef.markForCheck();
  }

  buyOne(hustleId: HustleId): void {
    this.buyUnits(hustleId, 1);
  }

  buyMax(hustleId: HustleId): void {
    this.buyUnits(hustleId, 'max');
  }

  automate(hustleId: HustleId): void {
    this.unlockAudio();
    this.selectHustle(hustleId);
    this.capturePlaytestDiscoveries();
    const previousState = this.state;
    const result = buyAutomation(this.state, this.definitions, hustleId);
    this.state = result.state;

    if (result.purchased) {
      this.lastTickTime = performance.now();
      const definition = this.getDefinition(hustleId);
      this.addValuationFlyout('spend', result.totalCost);
      this.addFeedback(definition?.automationName ?? 'Automation', 'online', 'automation', hustleId);
      this.emitGameEvent({
        type: 'hustle.automationActivated',
        hustleId,
        automationName: definition?.automationName,
      });
      this.emitGameEvent({
        type: 'purchase.completed',
        target: 'automation',
        hustleId,
        totalCost: result.totalCost,
      });

      if (definition) {
        this.updatePlaytestSession((session, nowMs) =>
          recordAutomationPurchase(
            session,
            definition,
            result.totalCost,
            result.state.hustles[hustleId].units,
            previousState.valuation,
            result.state.valuation,
            nowMs
          )
        );
      }
    } else {
      this.emitGameEvent({ type: 'purchase.denied', target: 'automation', hustleId });
    }

    this.updateAudioPresentation();
    this.persistRunState(true);
    this.changeDetectorRef.markForCheck();
  }

  purchaseLeverage(leverageId: LeverageId): void {
    this.unlockAudio();
    const definition = LEVERAGE_DEFINITIONS.find((candidate) => candidate.id === leverageId);
    const result = buyLeverage(this.state, leverageId);
    this.state = result.state;

    if (result.purchased && definition) {
      this.addValuationFlyout('spend', result.totalCost);
      this.addFeedback(definition.name, 'secured', 'leverage', null);
      this.emitGameEvent({ type: 'leverage.purchased', leverageId });
      this.emitGameEvent({
        type: 'purchase.completed',
        target: 'leverage',
        totalCost: result.totalCost,
      });
      this.updatePlaytestSession((session, nowMs) =>
        appendPlaytestEvent(
          session,
          'leverage_purchased',
          { leverageId, totalCost: result.totalCost },
          nowMs
        )
      );
    } else {
      this.emitGameEvent({ type: 'purchase.denied', target: 'leverage' });
    }

    this.updateAudioPresentation();
    this.persistRunState(true);
    this.changeDetectorRef.markForCheck();
  }

  prepareFounderTake(): void {
    this.unlockAudio();
    const stage = this.founderTake.nextStage;
    const result = startFounderTakePreparation(this.state);
    this.state = result.state;

    if (result.started && stage) {
      this.addValuationFlyout('spend', result.totalCost);
      this.addFeedback(stage.name, 'in progress', 'rug-pull', null);
      this.emitGameEvent({
        type: 'purchase.completed',
        target: 'founder-take',
        totalCost: result.totalCost,
      });
    } else {
      this.emitGameEvent({ type: 'purchase.denied', target: 'founder-take' });
    }

    this.persistRunState(true);
    this.changeDetectorRef.markForCheck();
  }

  selectHustle(hustleId: HustleId): void {
    this.selectedHustleId = hustleId;
    this.emitGameEvent({ type: 'inspector.selectionChanged', hustleId });
  }

  openSelectedContext(hustleId: HustleId, event?: Event): void {
    this.selectHustle(hustleId);

    const currentTarget = event?.currentTarget;
    this.selectedContextReturnTarget = currentTarget instanceof HTMLElement ? currentTarget : null;
    this.selectedContextReturnHustleId = hustleId;
    this.selectedContextOpen = true;
    this.setContextOverlayBodyState(true);
    this.changeDetectorRef.markForCheck();

    if (this.isBrowser) {
      const focusPanel = (): void => {
        this.changeDetectorRef.detectChanges();
        this.selectedContextPanel?.nativeElement.focus();
      };

      window.setTimeout(focusPanel, 0);
      window.setTimeout(focusPanel, 80);
    }
  }

  closeSelectedContext(restoreFocus = true): void {
    if (!this.selectedContextOpen) {
      return;
    }

    this.selectedContextOpen = false;
    this.setContextOverlayBodyState(false);
    const returnTarget = this.selectedContextReturnTarget;
    const returnHustleId = this.selectedContextReturnHustleId;
    this.selectedContextReturnTarget = null;
    this.selectedContextReturnHustleId = null;
    this.changeDetectorRef.markForCheck();

    if (!restoreFocus || !this.isBrowser || !returnTarget) {
      return;
    }

    window.setTimeout(() => {
      const fallbackTarget = returnHustleId
        ? this.documentRef.querySelector<HTMLElement>(`[data-grift-hustle-select="${returnHustleId}"]`)
        : null;
      const focusTarget = returnTarget?.isConnected ? returnTarget : fallbackTarget;
      focusTarget?.focus();
    }, 0);
  }

  closeUtilityMenu(event: Event): void {
    const trigger = event.currentTarget;

    if (!(trigger instanceof HTMLElement)) {
      return;
    }

    const menu = trigger.closest('details');

    if (!menu) {
      return;
    }

    menu.removeAttribute('open');
    const summary = menu.querySelector('summary');

    if (summary instanceof HTMLElement) {
      summary.focus();
    }
  }

  @HostListener('document:keydown.escape')
  closeSelectedContextFromEscape(): void {
    this.closeSelectedContext();
  }

  @HostListener('window:beforeunload')
  persistRunBeforeUnload(): void {
    this.persistRunState(true);
  }

  commitRugPull(): void {
    if (!this.rugPullPreview.isAvailable || !this.isBrowser) {
      return;
    }

    if (!window.confirm('Commit Rug Pull? This run ends. Net Worth persists into the next run.')) {
      return;
    }

    const previousState = this.state;
    const result = commitRugPull(this.state, this.definitions);
    this.state = result.state;
    this.selectedTab = 'hustles';
    this.selectedHustleId = this.definitions[0].id;
    this.selectedContextOpen = false;
    this.setContextOverlayBodyState(false);
    this.selectedContextReturnTarget = null;
    this.selectedContextReturnHustleId = null;
    this.rugPullResolution = this.createRugPullResolution(
      result.netWorthGained,
      result.state.netWorth,
      previousState.peakValuation
    );
    this.persistNetWorth();
    this.persistRunState(true);
    this.emitGameEvent({
      type: 'rugPull.committed',
      rugPullState: 'committed',
      netWorthGain: result.netWorthGained,
    });
    this.emitGameEvent({ type: 'rugPull.completed', rugPullState: 'returning', netWorthGain: result.netWorthGained });
    this.emitGameEvent({ type: 'newRun.started', rugPullState: 'returning' });
    this.payoutFeedback = [];
    this.clearValuationFlyouts();
    this.updatePlaytestSession((session, nowMs) =>
      recordRugPullCommit(
        session,
        previousState.valuation,
        previousState.netWorth,
        result.state.netWorth,
        result.netWorthGained,
        nowMs
      )
    );
    this.progressTransitionResetIds.clear();
    this.updateAudioPresentation();
    this.changeDetectorRef.markForCheck();
    window.setTimeout(() => this.hustlesSurface?.nativeElement.focus(), 0);
  }

  dismissRugPullResolution(): void {
    this.rugPullResolution = null;
    this.persistRunState(true);
    this.changeDetectorRef.markForCheck();
  }

  resetSimulationRun(): void {
    if (!this.isBrowser) {
      return;
    }

    if (!window.confirm('Reset this test run and clear Net Worth? Audio settings will remain.')) {
      return;
    }

    this.resetRunState(false);
    this.updatePlaytestSession((session, nowMs) =>
      appendPlaytestEvent(session, 'session_reset', {}, nowMs)
    );
    this.playtestStatusMessage = 'Run reset to initial conditions.';
    this.persistRunState(true);
    this.changeDetectorRef.markForCheck();
  }

  startFreshPlaytestSession(): void {
    if (!this.isPlaytestMode || !this.isBrowser) {
      return;
    }

    if (!window.confirm('Start a fresh GriftOS playtest session and reset the current run? Net Worth remains.')) {
      return;
    }

    this.resetRunState();
    this.playtestSession = createPlaytestSession(Date.now());
    this.playtestStatusMessage = 'Fresh playtest session started.';
    this.persistPlaytestSession();
    this.persistRunState(true);
    this.changeDetectorRef.markForCheck();
  }

  applyRunShortcut(shortcutId: RunShortcutId): void {
    this.state = this.createRunShortcutState(shortcutId);
    this.selectedTab = 'hustles';
    this.selectedContextOpen = false;
    this.setContextOverlayBodyState(false);
    this.selectedContextReturnTarget = null;
    this.selectedContextReturnHustleId = null;
    this.progressTransitionResetIds.clear();
    this.payoutFeedback = [];
    this.clearValuationFlyouts();
    this.rugPullResolution = shortcutId === 'post-rug'
      ? this.createRugPullResolution(
          projectedNetWorthGain(RUG_PULL_CONFIG.unlockValuation),
          this.state.netWorth,
          RUG_PULL_CONFIG.unlockValuation
        )
      : null;
    this.lastTickTime = this.isBrowser ? performance.now() : 0;
    if (shortcutId === 'two-hustles') {
      this.selectedHustleId = 'podcast-network';
    } else if (shortcutId === 'portfolio-mid') {
      this.selectedHustleId = 'culture-war-media';
    } else if (shortcutId === 'portfolio-scale') {
      this.selectedHustleId = 'venture-portfolio';
    } else if (shortcutId === 'endgame') {
      this.selectedHustleId = 'sovereign-network';
    } else {
      this.selectedHustleId = 'troll-network';
    }
    this.playtestStatusMessage = `Jumped to ${this.runShortcutLabel(shortcutId)}.`;
    this.updateAudioPresentation();
    this.persistNetWorth();
    this.persistRunState(true);
    this.changeDetectorRef.markForCheck();
  }

  exportPlaytestLog(): void {
    if (!this.playtestSession || !this.isBrowser) {
      return;
    }

    this.updatePlaytestSession((session, nowMs) =>
      appendPlaytestEvent(session, 'session_export_requested', {}, nowMs)
    );

    if (!this.playtestSession) {
      return;
    }

    const exportJson = createPlaytestExportJson(
      this.playtestSession,
      this.state,
      this.definitions,
      Date.now()
    );
    const blob = new Blob([exportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.playtestSession.sessionId}.json`;
    link.click();
    URL.revokeObjectURL(url);
    this.playtestStatusMessage = 'Playtest log exported locally.';
    this.changeDetectorRef.markForCheck();
  }

  copyPlaytestSummary(): void {
    if (!this.playtestSession || !this.isBrowser) {
      return;
    }

    this.updatePlaytestSession((session, nowMs) =>
      appendPlaytestEvent(session, 'session_export_requested', {}, nowMs)
    );

    if (!this.playtestSession) {
      return;
    }

    const summary = createHumanReadablePlaytestSummary(
      this.playtestSession,
      this.state,
      this.definitions,
      Date.now()
    );

    if (!navigator.clipboard) {
      this.playtestStatusMessage = 'Clipboard unavailable. Export JSON is still available.';
      this.changeDetectorRef.markForCheck();
      return;
    }

    void navigator.clipboard.writeText(summary).then(
      () => {
        this.ngZone.run(() => {
          this.playtestStatusMessage = 'Playtest summary copied.';
          this.changeDetectorRef.markForCheck();
        });
      },
      () => {
        this.ngZone.run(() => {
          this.playtestStatusMessage = 'Clipboard unavailable. Export JSON is still available.';
          this.changeDetectorRef.markForCheck();
        });
      }
    );
  }

  clearStoredPlaytestLogs(): void {
    if (!this.isPlaytestMode || !this.isBrowser) {
      return;
    }

    if (!window.confirm('Clear stored local GriftOS playtest logs?')) {
      return;
    }

    const storage = this.getPlaytestStorage();

    if (storage) {
      clearStoredPlaytestSessions(storage);
    }

    this.playtestSession = createPlaytestSession(Date.now());
    this.persistPlaytestSession();
    this.playtestStatusMessage = 'Stored playtest logs cleared.';
    this.changeDetectorRef.markForCheck();
  }

  updateAudioBoolean(setting: 'isMuted' | 'adaptiveMusic', value: boolean): void {
    this.audioDirector.updateSettings({
      ...this.audioSettings,
      [setting]: value,
    });
  }

  toggleAudioChannel(channel: 'music' | 'sfx'): void {
    const setting = channel === 'music' ? 'musicVolume' : 'sfxVolume';
    const restoreVolume = channel === 'music' ? DEFAULT_MUSIC_VOLUME : DEFAULT_SFX_VOLUME;
    const currentVolume = this.audioSettings[setting];

    this.audioDirector.updateSettings({
      ...this.audioSettings,
      isMuted: false,
      [setting]: currentVolume > 0 ? 0 : restoreVolume,
    });
  }

  updateAudioVolume(
    setting: 'masterVolume' | 'musicVolume' | 'sfxVolume',
    event: Event
  ): void {
    const input = event.target as HTMLInputElement;

    this.audioDirector.updateSettings({
      ...this.audioSettings,
      [setting]: Number(input.value),
    });
  }

  testAudioCue(): void {
    this.audioDirector.testCue('automation-online');
  }

  dismissOfflineReturn(): void {
    this.offlineReturn = null;
    this.changeDetectorRef.markForCheck();
  }

  trackHustle(_index: number, row: HustleViewModel): HustleId {
    return row.id;
  }

  trackTab(_index: number, tab: { id: GameTabId; label: string }): GameTabId {
    return tab.id;
  }

  trackRunShortcut(_index: number, shortcut: { id: RunShortcutId; label: string }): RunShortcutId {
    return shortcut.id;
  }

  trackFeedback(_index: number, feedback: PayoutFeedback): number {
    return feedback.id;
  }

  trackValuationFlyout(_index: number, flyout: ValuationFlyout): number {
    return flyout.id;
  }

  trackGameEvent(_index: number, event: GameEventRecord): number {
    return event.id;
  }

  private readonly tick = (): void => {
    const timestamp = performance.now();

    if (this.documentRef.hidden) {
      this.lastTickTime = timestamp;
      return;
    }

    const elapsedMs = elapsedForegroundSimulationMs(this.lastTickTime, timestamp);
    this.lastTickTime = timestamp;

    this.ngZone.runOutsideAngular(() => {
      const previousState = this.state;
      const result = advanceGame(this.state, this.definitions, elapsedMs);
      this.state = result.state;
      const nowMs = Date.now();

      if (result.events.length > 0) {
        const previousPresentation = deriveEnterprisePresentation(previousState, this.definitions);

        for (const event of result.events) {
          this.progressTransitionResetIds.add(event.hustleId);
          this.addPayoutFeedback(event, timestamp);
          this.recordPlaytestCycle(event, previousState, nowMs);
          this.emitGameEvent({ type: 'hustle.manualActionCompleted', hustleId: event.hustleId });
        }

        this.scheduleProgressTransitionRestore();
        this.capturePlaytestDiscoveries(nowMs);
        this.emitStageChangeIfNeeded(previousPresentation, this.presentation);
        this.updateAudioPresentation();
        this.persistRunState(true);
      }

      this.capturePlaytestSnapshot(nowMs);
      this.persistRunState();

      if (this.payoutFeedback.length > 0) {
        this.payoutFeedback = this.payoutFeedback.filter((feedback) => feedback.expiresAt > timestamp);
      }

      if (
        result.events.length > 0 ||
        timestamp - this.lastUiRenderTime >= UI_RENDER_INTERVAL_MS
      ) {
        this.changeDetectorRef.detectChanges();
        this.lastUiRenderTime = timestamp;
      }
    });
  };

  private startSimulationTimer(): void {
    if (this.simulationTimerId !== null) {
      return;
    }

    this.lastTickTime = performance.now();
    this.lastUiRenderTime = this.lastTickTime;
    this.documentRef.addEventListener('visibilitychange', this.visibilityChangeHandler);

    this.ngZone.runOutsideAngular(() => {
      this.simulationTimerId = window.setInterval(this.tick, SIMULATION_TICK_MS);
    });
  }

  private buyUnits(hustleId: HustleId, quantity: number | 'max'): void {
    this.unlockAudio();
    this.selectHustle(hustleId);
    this.capturePlaytestDiscoveries();
    const previousState = this.state;
    const result = buyHustle(this.state, this.definitions, hustleId, quantity);
    this.state = result.state;

    if (result.quantityPurchased > 0) {
      const definition = this.getDefinition(hustleId);
      const wasAcquisition = previousState.hustles[hustleId].units <= 0;

      this.addValuationFlyout('spend', result.totalCost);
      this.emitGameEvent({
        type: wasAcquisition ? 'hustle.acquired' : 'hustle.expanded',
        hustleId,
        quantity: result.quantityPurchased,
        totalCost: result.totalCost,
      });
      this.emitGameEvent({
        type: 'purchase.completed',
        target: 'hustle',
        hustleId,
        totalCost: result.totalCost,
      });

      if (definition) {
        this.updatePlaytestSession((session, nowMs) =>
          recordHustlePurchase(
            session,
            definition,
            result.quantityPurchased,
            result.totalCost,
            result.state.hustles[hustleId].units,
            previousState.valuation,
            result.state.valuation,
            quantity === 'max',
            nowMs
          )
        );

        for (const milestoneEvent of result.milestonesReached) {
          this.addFeedback('Milestone', definition.name, 'milestone', hustleId);
          this.emitGameEvent({
            type: 'hustle.milestoneReached',
            hustleId,
            milestoneId: milestoneEvent.milestoneId,
            tier: result.state.hustles[hustleId].reachedMilestones.length,
          });
          this.updatePlaytestSession((session, nowMs) =>
            recordMilestoneReached(session, definition, milestoneEvent.milestoneId, nowMs)
          );
        }
      }
    } else {
      this.emitGameEvent({ type: 'purchase.denied', target: 'hustle', hustleId });
    }

    this.updateAudioPresentation();
    this.persistRunState(true);
    this.changeDetectorRef.markForCheck();
  }

  private addPayoutFeedback(event: ProductionEvent, timestamp: number): void {
    const definition = this.definitions.find((candidate) => candidate.id === event.hustleId);
    const totalPayout = event.payout * event.cyclesCompleted;

    this.addValuationFlyout('gain', totalPayout);
    this.feedbackId += 1;
    this.payoutFeedback = [
      {
        id: this.feedbackId,
        text: `+${formatMoney(totalPayout, 'payout')}`,
        hustleName: definition?.name ?? 'Hustle',
        hustleId: event.hustleId,
        tone: 'payout' as const,
        expiresAt: timestamp + 1000,
      },
      ...this.payoutFeedback,
    ].slice(0, 4);
  }

  private addFeedback(
    text: string,
    hustleName: string,
    tone: PayoutFeedback['tone'],
    hustleId: HustleId | null
  ): void {
    const timestamp = this.isBrowser ? performance.now() : 0;

    this.feedbackId += 1;
    this.payoutFeedback = [
      {
        id: this.feedbackId,
        text,
        hustleName,
        hustleId,
        tone,
        expiresAt: timestamp + 1800,
      },
      ...this.payoutFeedback,
    ].slice(0, 4);
  }

  private initializePlaytestSession(): void {
    const storage = this.getPlaytestStorage();
    this.playtestSession = storage ? loadStoredPlaytestSession(storage) : null;

    if (!this.playtestSession) {
      this.playtestSession = createPlaytestSession(Date.now());
    }

    this.persistPlaytestSession();
  }

  private createRugPullResolution(
    netWorthGained: number,
    resultingNetWorth: number,
    peakValuation: number
  ): RugPullResolution {
    const preview = createRugPullPreview(createInitialGameState(this.definitions, resultingNetWorth));

    return {
      netWorthGainLabel: `+${formatMoney(netWorthGained, 'payout')}`,
      resultingNetWorthLabel: formatMoney(resultingNetWorth, 'net-worth'),
      wealthAdvantageLabel: `up to +${formatPercentage(preview.wealthAdvantagePercent)} established Hustle output`,
      peakValuationLabel: formatMoney(peakValuation, 'headline'),
    };
  }

  private resetRunState(preserveMeta = true): void {
    this.state = createInitialGameState(
      this.definitions,
      preserveMeta ? this.state.netWorth : 0,
      preserveMeta ? this.state.rugPullCount : 0
    );
    this.selectedHustleId = this.definitions[0].id;
    this.selectedContextOpen = false;
    this.setContextOverlayBodyState(false);
    this.selectedContextReturnTarget = null;
    this.selectedContextReturnHustleId = null;
    this.selectedTab = 'hustles';
    this.payoutFeedback = [];
    this.clearValuationFlyouts();
    this.rugPullResolution = null;
    this.progressTransitionResetIds.clear();
    this.feedbackId = 0;
    this.lastTickTime = performance.now();
    this.persistNetWorth();
    this.updateAudioPresentation();
  }

  private createRunShortcutState(shortcutId: RunShortcutId): GriftOsGameState {
    const state = createInitialGameState(
      this.definitions,
      this.state.netWorth,
      this.state.rugPullCount
    );

    switch (shortcutId) {
      case 'fresh':
        return state;
      case 'first-expansion':
        return {
          ...state,
          valuation: 75,
          peakValuation: 75,
          hustles: {
            ...state.hustles,
            'troll-network': {
              ...state.hustles['troll-network'],
              units: 2,
            },
          },
        };
      case 'automation-ready':
        return {
          ...state,
          valuation: 220,
          peakValuation: 220,
          hustles: {
            ...state.hustles,
            'troll-network': {
              ...state.hustles['troll-network'],
              units: 2,
            },
          },
        };
      case 'two-hustles':
        return {
          ...state,
          valuation: 320,
          peakValuation: 320,
          hustles: {
            ...state.hustles,
            'troll-network': {
              ...state.hustles['troll-network'],
              units: 2,
            },
            'podcast-network': {
              ...state.hustles['podcast-network'],
              units: 1,
            },
          },
        };
      case 'milestone-near':
        return {
          ...state,
          valuation: 650,
          peakValuation: 650,
          hustles: {
            ...state.hustles,
            'troll-network': {
              ...state.hustles['troll-network'],
              units: 8,
            },
          },
        };
      case 'portfolio-mid':
        return {
          ...state,
          valuation: 60_000,
          peakValuation: 60_000,
          hustles: {
            ...state.hustles,
            'troll-network': {
              ...state.hustles['troll-network'],
              units: 18,
              isAutomated: true,
              isActive: true,
              reachedMilestones: ['troll-network-10'],
            },
            'podcast-network': {
              ...state.hustles['podcast-network'],
              units: 8,
              isAutomated: true,
              isActive: true,
            },
            'culture-war-media': {
              ...state.hustles['culture-war-media'],
              units: 4,
            },
            'masterclass-business': {
              ...state.hustles['masterclass-business'],
              units: 1,
            },
          },
        };
      case 'portfolio-scale':
        return {
          ...state,
          valuation: 999_900_000,
          peakValuation: 999_900_000,
          hustles: {
            ...state.hustles,
            'troll-network': {
              ...state.hustles['troll-network'],
              units: 30,
              isAutomated: true,
              isActive: true,
              reachedMilestones: ['troll-network-10', 'troll-network-25'],
            },
            'podcast-network': {
              ...state.hustles['podcast-network'],
              units: 20,
              isAutomated: true,
              isActive: true,
              reachedMilestones: ['podcast-network-5'],
            },
            'culture-war-media': {
              ...state.hustles['culture-war-media'],
              units: 12,
              isAutomated: true,
              isActive: true,
              reachedMilestones: ['culture-war-media-5'],
            },
            'masterclass-business': {
              ...state.hustles['masterclass-business'],
              units: 8,
              isAutomated: true,
              isActive: true,
            },
            'manifesto-imprint': {
              ...state.hustles['manifesto-imprint'],
              units: 6,
              isAutomated: true,
              isActive: true,
            },
            'founder-retreat-circuit': {
              ...state.hustles['founder-retreat-circuit'],
              units: 4,
              isAutomated: true,
              isActive: true,
            },
            'ai-venture': {
              ...state.hustles['ai-venture'],
              units: 2,
              isAutomated: true,
              isActive: true,
            },
            'venture-portfolio': {
              ...state.hustles['venture-portfolio'],
              units: 1,
            },
          },
        };
      case 'rug-pull-ready':
        return {
          ...state,
          valuation: createRugPullPreview(state, this.definitions).requiredPeakValuation,
          peakValuation: createRugPullPreview(state, this.definitions).requiredPeakValuation,
          hustles: {
            ...state.hustles,
            'troll-network': {
              ...state.hustles['troll-network'],
              units: 10,
              isAutomated: true,
              isActive: true,
              reachedMilestones: ['troll-network-10'],
            },
            'podcast-network': {
              ...state.hustles['podcast-network'],
              units: 5,
              isAutomated: true,
              isActive: true,
            },
            'culture-war-media': {
              ...state.hustles['culture-war-media'],
              units: 3,
            },
          },
        };
      case 'post-rug':
        return createInitialGameState(
          this.definitions,
          Math.max(
            state.netWorth,
            projectedNetWorthGain(RUG_PULL_CONFIG.unlockValuation)
          ),
          Math.max(state.rugPullCount, 1)
        );
      case 'endgame': {
        const endgameState = createInitialGameState(
          this.definitions,
          ENDGAME_NET_WORTH,
          ENDGAME_RUG_PULL_COUNT
        );

        return {
          ...endgameState,
          valuation: ENDGAME_VALUATION,
          peakValuation: ENDGAME_VALUATION,
          hustles: Object.fromEntries(
            this.definitions.map((definition) => {
              const finalMilestone = definition.milestones.at(-1);

              return [
                definition.id,
                {
                  ...endgameState.hustles[definition.id],
                  units: Math.max(1, finalMilestone?.requiredUnits ?? 1),
                  isActive: true,
                  isAutomated: true,
                  reachedMilestones: definition.milestones.map((milestone) => milestone.id),
                },
              ];
            })
          ) as unknown as GriftOsGameState['hustles'],
        };
      }
    }
  }

  private parseInitialRouteRunState(value: string | null): InitialRouteRunState | null {
    if (
      value === 'fresh' ||
      value === 'first-expansion' ||
      value === 'automation-ready' ||
      value === 'two-hustles' ||
      value === 'milestone-near' ||
      value === 'portfolio-mid' ||
      value === 'portfolio-scale' ||
      value === 'rug-pull-ready' ||
      value === 'post-rug' ||
      value === 'endgame'
    ) {
      return value;
    }

    return null;
  }

  private parseInitialRouteSurface(value: string | null): GameTabId | null {
    if (value === 'hustles' || value === 'leverage' || value === 'rugPull') {
      return value;
    }

    return null;
  }

  private applyInitialRouteState(netWorth: number): void {
    if (!this.isPlaytestMode || this.initialRouteRunState === null) {
      return;
    }

    if (this.initialRouteRunState === 'post-rug') {
      const firstRugGain = projectedNetWorthGain(RUG_PULL_CONFIG.unlockValuation);
      const resultingNetWorth = Math.max(netWorth, firstRugGain);
      this.state = createInitialGameState(
        this.definitions,
        resultingNetWorth,
        Math.max(this.state.rugPullCount, 1)
      );
      this.selectedTab = 'hustles';
      this.selectedHustleId = this.definitions[0].id;
      this.rugPullResolution = this.createRugPullResolution(
        firstRugGain,
        resultingNetWorth,
        RUG_PULL_CONFIG.unlockValuation
      );
      return;
    }

    this.state = this.createRunShortcutState(this.initialRouteRunState);

    if (this.initialRouteRunState === 'two-hustles') {
      this.selectedHustleId = 'podcast-network';
    } else if (this.initialRouteRunState === 'portfolio-mid') {
      this.selectedHustleId = 'culture-war-media';
    } else if (this.initialRouteRunState === 'portfolio-scale') {
      this.selectedHustleId = 'venture-portfolio';
    } else if (this.initialRouteRunState === 'endgame') {
      this.selectedHustleId = 'sovereign-network';
    } else {
      this.selectedHustleId = 'troll-network';
    }

    if (this.initialRouteSurface && this.isTabAvailable(this.initialRouteSurface)) {
      this.selectedTab = this.initialRouteSurface;
    }
  }

  private runShortcutLabel(shortcutId: RunShortcutId): string {
    return this.runShortcuts.find((shortcut) => shortcut.id === shortcutId)?.label ?? 'shortcut';
  }

  private scheduleProgressTransitionRestore(): void {
    if (!this.isBrowser) {
      return;
    }

    if (this.progressTransitionRestoreTimerId !== null) {
      window.clearTimeout(this.progressTransitionRestoreTimerId);
    }

    this.progressTransitionRestoreTimerId = window.setTimeout(() => {
      this.ngZone.run(() => {
        this.progressTransitionResetIds.clear();
        this.progressTransitionRestoreTimerId = null;
        this.changeDetectorRef.markForCheck();
      });
    }, PROGRESS_RESET_RESTORE_MS);
  }

  private addValuationFlyout(direction: ValuationFlyoutDirection, amount: number): void {
    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    this.valuationFlyoutId += 1;
    const limit = direction === 'gain' ? VALUATION_GAIN_FLYOUT_LIMIT : VALUATION_SPEND_FLYOUT_LIMIT;
    const sameDirectionCount = this.valuationFlyouts.filter((flyout) => flyout.direction === direction).length;
    const flyout: ValuationFlyout = {
      id: this.valuationFlyoutId,
      direction,
      label: `${direction === 'gain' ? '↑ +' : '↓ -'}${formatMoney(
        amount,
        direction === 'gain' ? 'payout' : 'transaction'
      )}`,
      lane: sameDirectionCount % limit,
    };
    const nextFlyouts = [
      flyout,
      ...this.valuationFlyouts,
    ];
    const keptFlyouts = [
      ...nextFlyouts.filter((candidate) => candidate.direction === 'gain').slice(0, VALUATION_GAIN_FLYOUT_LIMIT),
      ...nextFlyouts.filter((candidate) => candidate.direction === 'spend').slice(0, VALUATION_SPEND_FLYOUT_LIMIT),
    ].sort((first, second) => second.id - first.id);
    const keptIds = new Set(keptFlyouts.map((candidate) => candidate.id));

    for (const existing of this.valuationFlyouts) {
      if (!keptIds.has(existing.id)) {
        this.clearValuationFlyoutTimer(existing.id);
      }
    }

    this.valuationFlyouts = keptFlyouts;

    if (!this.isBrowser) {
      return;
    }

    const timerId = window.setTimeout(() => {
      this.ngZone.run(() => {
        this.valuationFlyouts = this.valuationFlyouts.filter((candidate) => candidate.id !== flyout.id);
        this.valuationFlyoutTimerIds.delete(flyout.id);
        this.changeDetectorRef.markForCheck();
      });
    }, VALUATION_FLYOUT_LIFETIME_MS);

    this.valuationFlyoutTimerIds.set(flyout.id, timerId);
  }

  private clearValuationFlyouts(): void {
    for (const timerId of this.valuationFlyoutTimerIds.values()) {
      window.clearTimeout(timerId);
    }

    this.valuationFlyoutTimerIds.clear();
    this.valuationFlyouts = [];
  }

  private clearValuationFlyoutTimer(flyoutId: number): void {
    const timerId = this.valuationFlyoutTimerIds.get(flyoutId);

    if (timerId === undefined) {
      return;
    }

    window.clearTimeout(timerId);
    this.valuationFlyoutTimerIds.delete(flyoutId);
  }

  private setContextOverlayBodyState(isOpen: boolean): void {
    if (!this.isBrowser) {
      return;
    }

    this.documentRef.body.classList.toggle('grift-context-overlay-open', isOpen);
  }

  private modifierSummaryLabel(hustleId: HustleId): string {
    const breakdown = modifierBreakdownForHustle(this.state, this.definitions, hustleId);
    const outputMultiplier = combinedMultiplier(breakdown.output);
    const cadenceMultiplier = combinedMultiplier(breakdown.cadence);
    const parts: string[] = [];

    if (outputMultiplier !== 1) {
      parts.push(`${formatMultiplier(outputMultiplier)} output`);
    }

    if (cadenceMultiplier !== 1) {
      parts.push(`${formatMultiplier(cadenceMultiplier)} speed`);
    }

    return parts.join(' · ');
  }

  private recordPlaytestCycle(
    event: ProductionEvent,
    previousState: GriftOsGameState,
    nowMs: number
  ): void {
    const definition = this.getDefinition(event.hustleId);

    if (!definition) {
      return;
    }

    this.updatePlaytestSession((session) =>
      recordCycleCompleted(
        session,
        definition,
        event.payout,
        previousState.hustles[event.hustleId].isAutomated,
        nowMs
      )
    );
  }

  private capturePlaytestDiscoveries(nowMs = Date.now()): void {
    this.updatePlaytestSession((session) =>
      recordDiscoveryEvents(session, this.state, this.definitions, nowMs)
    );
  }

  private capturePlaytestSnapshot(nowMs = Date.now()): void {
    this.updatePlaytestSession((session) =>
      recordSnapshotIfDue(session, this.state, this.definitions, nowMs)
    );
  }

  private updatePlaytestSession(
    updater: (session: PlaytestSession, nowMs: number) => PlaytestSession,
    nowMs = Date.now()
  ): void {
    if (!this.isPlaytestMode || !this.playtestSession) {
      return;
    }

    const nextSession = updater(this.playtestSession, nowMs);

    if (nextSession === this.playtestSession) {
      return;
    }

    this.playtestSession = nextSession;
    this.persistPlaytestSession();
  }

  private persistPlaytestSession(): void {
    if (!this.playtestSession || !this.isBrowser) {
      return;
    }

    const storage = this.getPlaytestStorage();

    if (!storage) {
      return;
    }

    try {
      savePlaytestSession(storage, this.playtestSession);
    } catch {
      this.playtestStatusMessage = 'Local playtest storage unavailable.';
    }
  }

  private getPlaytestStorage(): Storage | null {
    if (!this.isBrowser) {
      return null;
    }

    try {
      return window.localStorage;
    } catch {
      return null;
    }
  }

  private loadSavedRunState(savedMeta: GriftMetaSave): GriftRunSave | null {
    if (!this.isBrowser) {
      return null;
    }

    try {
      const rawSave = window.localStorage.getItem(RUN_STORAGE_KEY);

      if (!rawSave) {
        return null;
      }

      const parsed = JSON.parse(rawSave) as Partial<GriftRunSave>;

      if (parsed.version !== 1 || !parsed.state) {
        return null;
      }

      const selectedHustleId = this.isKnownHustleId(parsed.selectedHustleId)
        ? parsed.selectedHustleId
        : this.definitions[0].id;

      return {
        version: 1,
        savedAt: Number.isFinite(parsed.savedAt) ? Number(parsed.savedAt) : Date.now(),
        selectedHustleId,
        state: this.reconcileSavedGameState(parsed.state, savedMeta),
      };
    } catch {
      return null;
    }
  }

  private prepareOfflineReturn(savedRun: GriftRunSave | null): void {
    if (!savedRun) {
      return;
    }

    const elapsedMs = Date.now() - savedRun.savedAt;

    if (elapsedMs < OFFLINE_RETURN_MIN_MS) {
      return;
    }

    const simulatedElapsedMs = Math.min(elapsedMs, OFFLINE_RETURN_CAP_MS);
    const offlineBaseState = {
      ...this.state,
      hustles: Object.fromEntries(
        this.definitions.map((definition) => {
          const hustle = this.state.hustles[definition.id];

          return [
            definition.id,
            hustle.isAutomated
              ? hustle
              : {
                  ...hustle,
                  isActive: false,
                  progressMs: 0,
                },
          ];
        })
      ) as unknown as GriftOsGameState['hustles'],
    };
    const result = advanceGame(offlineBaseState, this.definitions, simulatedElapsedMs);
    const pendingPayout = Math.max(0, result.state.valuation - offlineBaseState.valuation);

    if (pendingPayout <= 0) {
      return;
    }

    this.state = result.state;
    this.offlineReturn = {
      elapsedLabel: this.formatElapsed(elapsedMs),
      payoutLabel: formatMoney(pendingPayout, 'payout'),
      pendingPayout,
    };
    this.addValuationFlyout('gain', pendingPayout);
    this.addFeedback('Away money', this.offlineReturn.payoutLabel, 'payout', null);
    this.persistRunState(true);
    this.updateAudioPresentation();
  }

  private reconcileSavedGameState(
    savedState: Partial<GriftOsGameState>,
    savedMeta: GriftMetaSave
  ): GriftOsGameState {
    const netWorth = Math.max(
      0,
      this.finiteNumber(savedState.netWorth, savedMeta.netWorth),
      savedMeta.netWorth
    );
    const rugPullCount = Math.max(
      0,
      Math.floor(this.finiteNumber(savedState.rugPullCount, savedMeta.rugPullCount)),
      savedMeta.rugPullCount
    );
    const initialState = createInitialGameState(this.definitions, netWorth, rugPullCount);
    const valuation = Math.max(0, this.finiteNumber(savedState.valuation, initialState.valuation));
    const peakValuation = Math.max(valuation, this.finiteNumber(savedState.peakValuation, valuation));
    const validLeverageIds = new Set(LEVERAGE_DEFINITIONS.map((definition) => definition.id));
    const leveragePurchases = Array.isArray(savedState.leveragePurchases)
      ? savedState.leveragePurchases.filter((leverageId): leverageId is LeverageId =>
          typeof leverageId === 'string' && validLeverageIds.has(leverageId as LeverageId)
        )
      : [];
    const savedPreparation = savedState.founderTakePreparation;
    const completedFounderTakeStages = Math.min(
      GRIFT_OS_FOUNDER_TAKE_TUNING.stages.length,
      Math.max(0, Math.floor(this.finiteNumber(savedPreparation?.completedStages, 0)))
    );
    const activeFounderTakeStage = GRIFT_OS_FOUNDER_TAKE_TUNING.stages[completedFounderTakeStages];
    const isFounderTakePreparationActive = Boolean(savedPreparation?.isActive && activeFounderTakeStage);
    const founderTakeProgressMs = isFounderTakePreparationActive
      ? Math.min(
          activeFounderTakeStage.durationMs,
          Math.max(0, this.finiteNumber(savedPreparation?.progressMs, 0))
        )
      : 0;
    const hustles = Object.fromEntries(
      this.definitions.map((definition) => {
        const fallback = initialState.hustles[definition.id];
        const savedHustle = savedState.hustles?.[definition.id];
        const validMilestones = new Set(definition.milestones.map((milestone) => milestone.id));

        return [
          definition.id,
          {
            ...fallback,
            units: Math.max(0, Math.floor(this.finiteNumber(savedHustle?.units, fallback.units))),
            isActive: Boolean(savedHustle?.isActive),
            isAutomated: Boolean(savedHustle?.isAutomated),
            progressMs: Math.max(0, this.finiteNumber(savedHustle?.progressMs, 0)),
            reachedMilestones: Array.isArray(savedHustle?.reachedMilestones)
              ? savedHustle.reachedMilestones.filter((milestoneId): milestoneId is string =>
                  typeof milestoneId === 'string' && validMilestones.has(milestoneId)
                )
              : [],
          },
        ];
      })
    ) as unknown as GriftOsGameState['hustles'];

    return {
      ...initialState,
      valuation,
      peakValuation,
      netWorth,
      rugPullCount,
      rugPullState: savedState.rugPullState ?? initialState.rugPullState,
      founderTakePreparation: {
        completedStages: completedFounderTakeStages,
        isActive: isFounderTakePreparationActive,
        progressMs: founderTakeProgressMs,
      },
      leveragePurchases,
      hustles,
    };
  }

  private persistRunState(force = false): void {
    if (!this.isBrowser) {
      return;
    }

    const now = Date.now();

    if (!force && now - this.lastRunSaveAt < RUN_SAVE_THROTTLE_MS) {
      return;
    }

    try {
      const save: GriftRunSave = {
        version: 1,
        savedAt: now,
        state: this.state,
        selectedHustleId: this.selectedHustleId,
      };

      window.localStorage.setItem(RUN_STORAGE_KEY, JSON.stringify(save));
      this.lastRunSaveAt = now;
    } catch {
      // Local run persistence is non-critical for the active simulation.
    }
  }

  private isKnownHustleId(value: unknown): value is HustleId {
    return typeof value === 'string' && this.definitions.some((definition) => definition.id === value);
  }

  private finiteNumber(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  }

  private loadSavedMeta(): GriftMetaSave {
    if (!this.isBrowser) {
      return { netWorth: 0, rugPullCount: 0 };
    }

    try {
      const rawMeta = window.localStorage.getItem(META_STORAGE_KEY);

      if (!rawMeta) {
        return { netWorth: 0, rugPullCount: 0 };
      }

      const meta = JSON.parse(rawMeta) as Partial<GriftMetaSave>;

      return {
        netWorth: Math.max(0, this.finiteNumber(meta.netWorth, 0)),
        rugPullCount: Math.max(0, Math.floor(this.finiteNumber(meta.rugPullCount, 0))),
      };
    } catch {
      return { netWorth: 0, rugPullCount: 0 };
    }
  }

  private persistNetWorth(): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      const meta: GriftMetaSave = {
        netWorth: this.state.netWorth,
        rugPullCount: this.state.rugPullCount,
      };
      window.localStorage.setItem(META_STORAGE_KEY, JSON.stringify(meta));
    } catch {
      // Net Worth persistence is local-only and non-critical for the running sim.
    }
  }

  private emitGameEvent(event: GameEvent): void {
    this.gameEventId += 1;
    const timestampMs = this.isBrowser ? performance.now() : Date.now();
    const record = createGameEventRecord(this.gameEventId, event, timestampMs);
    this.gameEvents = [record, ...this.gameEvents].slice(0, 12);
    this.audioDirector.handleGameEvent(event, Date.now());
  }

  private emitStageChangeIfNeeded(
    previousPresentation: EnterprisePresentation,
    nextPresentation: EnterprisePresentation
  ): void {
    if (previousPresentation.enterpriseStage === nextPresentation.enterpriseStage) {
      return;
    }

    this.emitGameEvent({
      type: 'enterprise.stageChanged',
      stage: nextPresentation.enterpriseStage,
      intensity: nextPresentation.enterpriseIntensity,
    });
  }

  private updateAudioPresentation(): void {
    this.audioDirector.updatePresentation(this.presentation);
  }

  private isTabAvailable(tabId: GameTabId): boolean {
    if (tabId === 'hustles') {
      return true;
    }

    if (tabId === 'rugPull') {
      return this.rugPullPreview.isAvailable;
    }

    return LEVERAGE_DEFINITIONS.some((definition) =>
      this.state.leveragePurchases.includes(definition.id) ||
      (
        this.state.netWorth >= definition.unlockNetWorth &&
        definition.requiredOwnedHustles.every((hustleId) => this.state.hustles[hustleId].units > 0)
      )
    );
  }

  private getDefinition(hustleId: HustleId): HustleDefinition | undefined {
    return this.definitions.find((candidate) => candidate.id === hustleId);
  }

  private unitLabel(definition: HustleDefinition, units: number): string {
    return units === 1 ? definition.unitSingular : definition.unitPlural;
  }

  private formatSeconds(value: number): string {
    return Number.isInteger(value) ? `${value}s` : `${value.toFixed(1)}s`;
  }

  private formatElapsed(valueMs: number): string {
    const totalSeconds = Math.max(0, Math.floor(valueMs / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m ${seconds}s`;
  }
}

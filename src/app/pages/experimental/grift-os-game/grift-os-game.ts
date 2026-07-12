import { DOCUMENT, NgComponentOutlet, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AudioDirectorService } from './audio/audio-director.service';
import { AudioSettings } from './audio/audio-engine';
import { GRIFT_OS_COPY } from './content/game-copy';
import {
  FounderTakeStatus,
  startFounderTakePreparation,
} from './content/founder-take';
import { HUSTLE_DEFINITIONS } from './content/hustle-definitions';
import { LEVERAGE_DEFINITIONS } from './content/leverage-definitions';
import {
  commitRugPull,
  createRugPullPreview,
  projectedNetWorthGain,
  RugPullPreview,
  RUG_PULL_CONFIG,
} from './content/rug-pull-preview';
import { INFLUENCE_ENGINE_MECHANICS } from './empires/influence/mechanics/influence-mechanics';
import { ACTIVE_EMPIRE_RENDERER } from './empires/empire-renderer-registry';
import {
  activateHustle as activateHustleInState,
  buyAutomation,
  buyHustle,
  createInitialGameState,
} from './game-engine/economy';
import { GameEvent, GameEventRecord, GameTabId } from './game-engine/game-events';
import { buyLeverage } from './game-engine/leverage';
import { deriveEnterprisePresentation, EnterprisePresentation } from './game-engine/presentation';
import {
  GriftOsGameState,
  HustleDefinition,
  HustleId,
  LeverageId,
  ProductionEvent,
} from './game-engine/types';
import {
  formatMoney,
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
import { GameAction } from './presentation/game-action';
import {
  GamePresentationFacade,
  GamePresentationSnapshot,
  HustleHorizonView,
  HustleViewModel,
  LeverageDealView,
  VisualCondition,
} from './presentation/game-presentation';
import { GameEventLog } from './runtime/game-event-log';
import {
  EmpireRendererHostView,
  EmpireRendererRequest,
  OfflineReturnView,
  RugPullResolutionView,
  ValuationFlyoutView,
} from './host/empire-renderer-contract';
import {
  GriftMetaSaveV1,
  GriftRunSaveV1,
  GriftV1Persistence,
} from './runtime/run-persistence';
import { GriftRunRuntime } from './runtime/run-runtime';

interface PayoutFeedback {
  id: number;
  text: string;
  hustleName: string;
  hustleId: HustleId | null;
  tone: 'payout' | 'automation' | 'milestone' | 'leverage' | 'rug-pull';
  expiresAt: number;
}

type ValuationFlyoutDirection = ValuationFlyoutView['direction'];

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

const SIMULATION_TICK_MS = 50;
const UI_RENDER_INTERVAL_MS = 100;
const PROGRESS_RESET_RESTORE_MS = 24;
const VALUATION_GAIN_FLYOUT_LIMIT = 3;
const VALUATION_SPEND_FLYOUT_LIMIT = 2;
const VALUATION_FLYOUT_LIFETIME_MS = 680;
const DEFAULT_MUSIC_VOLUME = 0.45;
const DEFAULT_SFX_VOLUME = 0.7;
const ENDGAME_NET_WORTH = 1_000_000_000_000;
const ENDGAME_RUG_PULL_COUNT = 8;
const ENDGAME_VALUATION = 1_000_000_000_000_000;

@Component({
  selector: 'app-grift-os-game',
  standalone: true,
  imports: [NgComponentOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './grift-os-host.html',
  styleUrl: './grift-os-game.scss',
})
export class GriftOsGameComponent implements OnInit, OnDestroy {
  private readonly activeEmpireRegistration = inject(ACTIVE_EMPIRE_RENDERER);
  readonly activeEmpireId = this.activeEmpireRegistration.id;
  readonly activeEmpireRenderer = this.activeEmpireRegistration.component;
  readonly copy = GRIFT_OS_COPY;
  readonly definitions = HUSTLE_DEFINITIONS;
  readonly mechanics = INFLUENCE_ENGINE_MECHANICS;
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
  private readonly gamePresentation = new GamePresentationFacade(
    this.definitions,
    LEVERAGE_DEFINITIONS,
    this.mechanics,
    this.tabs
  );
  private readonly runRuntime = new GriftRunRuntime(this.mechanics);
  private readonly gameEventLog = new GameEventLog();

  state: GriftOsGameState = createInitialGameState(this.mechanics);
  payoutFeedback: PayoutFeedback[] = [];
  valuationFlyouts: ValuationFlyoutView[] = [];
  rugPullResolution: RugPullResolutionView | null = null;
  playtestSession: PlaytestSession | null = null;
  playtestStatusMessage = '';
  selectedHustleId: HustleId = this.definitions[0].id;
  selectedContextOpen = false;
  selectedTab: GameTabId = 'hustles';
  gameEvents: GameEventRecord[] = [];
  offlineReturn: OfflineReturnView | null = null;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly documentRef = inject(DOCUMENT);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);
  private readonly route = inject(ActivatedRoute);
  readonly audioDirector = inject(AudioDirectorService);
  private readonly isBrowser: boolean;
  private readonly persistence: GriftV1Persistence;
  private simulationTimerId: number | null = null;
  private progressTransitionRestoreTimerId: number | null = null;
  private readonly progressTransitionResetIds = new Set<HustleId>();
  private lastTickTime = 0;
  private feedbackId = 0;
  private valuationFlyoutId = 0;
  private readonly valuationFlyoutTimerIds = new Map<number, number>();
  private selectedContextReturnTarget: HTMLElement | null = null;
  private selectedContextReturnHustleId: HustleId | null = null;
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
    this.persistence = new GriftV1Persistence(this.getLocalStorage(), this.mechanics);
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
      this.mechanics,
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

  get presentationView(): GamePresentationSnapshot {
    return this.gamePresentation.derive({
      state: this.state,
      selectedHustleId: this.selectedHustleId,
      selectedTab: this.selectedTab,
      selectedContextOpen: this.selectedContextOpen,
      progressResetIds: this.progressTransitionResetIds,
    });
  }

  get activeEmpireRendererInputs(): Record<string, unknown> {
    const view: EmpireRendererHostView = {
      presentation: this.presentationView,
      valuationFlyouts: this.valuationFlyouts,
      rugPullResolution: this.rugPullResolution,
      offlineReturn: this.offlineReturn,
      selectedHustleId: this.selectedHustleId,
      selectedContextOpen: this.selectedContextOpen,
    };

    return this.activeEmpireRegistration.createInputs(
      view,
      this.dispatchEmpireRendererRequest
    );
  }

  private readonly dispatchEmpireRendererRequest = (request: EmpireRendererRequest): void => {
    this.dispatchGameAction(request.action, request.sourceEvent);
  };

  get valuationLabel(): string {
    return this.presentationView.valuationLabel;
  }

  get peakValuationLabel(): string {
    return this.presentationView.peakValuationLabel;
  }

  get valuationPerSecondLabel(): string {
    return this.presentationView.valuationPerSecondLabel;
  }

  get netWorthLabel(): string {
    return this.presentationView.netWorthLabel;
  }

  get wealthAdvantageLabel(): string {
    return this.presentationView.wealthAdvantageLabel;
  }

  get rugPullNetWorthGainLabel(): string {
    return this.presentationView.rugPullNetWorthGainLabel;
  }

  get rugPullResultingNetWorthLabel(): string {
    return this.presentationView.rugPullResultingNetWorthLabel;
  }

  get rugPullTargetLabel(): string {
    return this.presentationView.rugPullTargetLabel;
  }

  get rugPullWealthAdvantageLabel(): string {
    return this.presentationView.rugPullWealthAdvantageLabel;
  }

  get rugPullRecoveryMultiplierLabel(): string {
    return this.presentationView.rugPullRecoveryMultiplierLabel;
  }

  get presentation(): EnterprisePresentation {
    return this.presentationView.enterprise;
  }

  get enterpriseIntensityPercent(): number {
    return this.presentationView.enterpriseIntensityPercent;
  }

  get stageLabel(): string {
    return this.presentationView.stageLabel;
  }

  get stageSummary(): string {
    return this.presentationView.stageSummary;
  }

  get resetHustleCount(): number {
    return this.presentationView.resetHustleCount;
  }

  get resetAutomationCount(): number {
    return this.presentationView.resetAutomationCount;
  }

  get resetMilestoneCount(): number {
    return this.presentationView.resetMilestoneCount;
  }

  get selectedHustle(): HustleViewModel {
    return this.presentationView.selectedHustle;
  }

  get visibleHustleRows(): HustleViewModel[] {
    return [...this.presentationView.visibleHustleRows];
  }

  get ownedHustleCount(): number {
    return this.presentationView.ownedHustleCount;
  }

  get hasExpandedBeyondInitialState(): boolean {
    return this.presentationView.hasExpandedBeyondInitialState;
  }

  get showNextHustleHorizon(): boolean {
    return this.presentationView.showNextHustleHorizon;
  }

  get nextHustleHorizon(): HustleHorizonView | null {
    return this.presentationView.nextHustleHorizon;
  }

  get visibleHustleCountLabel(): string {
    return this.presentationView.visibleHustleCountLabel;
  }

  get hasAnyAutomation(): boolean {
    return this.presentationView.hustleRows.some((row) => row.isAutomated);
  }

  get hasAnyMilestone(): boolean {
    return this.definitions.some((definition) => this.state.hustles[definition.id].reachedMilestones.length > 0);
  }

  get visualCondition(): VisualCondition {
    return this.presentationView.visualCondition;
  }

  get showPinnedSelectedContext(): boolean {
    return this.presentationView.showPinnedSelectedContext;
  }

  get showSelectedContextSurface(): boolean {
    return this.presentationView.showSelectedContextSurface;
  }

  get showNetWorth(): boolean {
    return this.presentationView.showNetWorth;
  }

  get availableTabs(): readonly { id: GameTabId; label: string }[] {
    return this.presentationView.availableTabs;
  }

  get showModeTabs(): boolean {
    return this.presentationView.showModeTabs;
  }

  get selectedVisibleTab(): GameTabId {
    return this.presentationView.selectedVisibleTab;
  }

  get rugPullPreview(): RugPullPreview {
    return this.presentationView.rugPullPreview;
  }

  get founderTake(): FounderTakeStatus {
    return this.presentationView.founderTake;
  }

  get founderTakeRateLabel(): string {
    return this.presentationView.founderTakeRateLabel;
  }

  get founderTakeNextCostLabel(): string {
    return this.presentationView.founderTakeNextCostLabel;
  }

  get founderTakeDurationLabel(): string {
    return this.presentationView.founderTakeDurationLabel;
  }

  get founderTakeRemainingLabel(): string {
    return this.presentationView.founderTakeRemainingLabel;
  }

  get founderTakeOutputLabel(): string {
    return this.presentationView.founderTakeOutputLabel;
  }

  get founderTakeNextOutputLabel(): string {
    return this.presentationView.founderTakeNextOutputLabel;
  }

  get founderTakeProgressScale(): string {
    return this.presentationView.founderTakeProgressScale;
  }

  get leverageDeals(): readonly LeverageDealView[] {
    return this.presentationView.leverageDeals;
  }

  get leveragePurchaseCount(): number {
    return this.presentationView.leveragePurchaseCount;
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
    return [...this.presentationView.hustleRows];
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

  dispatchGameAction(action: GameAction, sourceEvent?: Event): void {
    switch (action.type) {
      case 'mode.select':
        this.setGameTab(action.modeId);
        return;
      case 'context.open':
        this.openSelectedContext(action.hustleId, sourceEvent);
        return;
      case 'context.close':
        this.closeSelectedContext(action.restoreFocus ?? true);
        return;
      case 'hustle.activate':
        this.activate(action.hustleId);
        return;
      case 'hustle.expand':
        if (action.quantity === 'max') {
          this.buyMax(action.hustleId);
        } else {
          this.buyOne(action.hustleId);
        }
        return;
      case 'hustle.automate':
        this.automate(action.hustleId);
        return;
      case 'leverage.purchase':
        this.purchaseLeverage(action.leverageId);
        return;
      case 'offline.dismiss':
        this.dismissOfflineReturn();
        return;
      case 'rugPull.prepare':
        this.prepareFounderTake();
        return;
      case 'rugPull.commit':
        this.commitRugPull();
        return;
      case 'rugPull.resolution.dismiss':
        this.dismissRugPullResolution();
    }
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
    const result = buyAutomation(this.state, this.mechanics, hustleId);
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
    const result = buyLeverage(this.state, leverageId, this.mechanics);
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
    const result = commitRugPull(this.state);
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

    const storage = this.getLocalStorage();

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

  trackGameEvent(_index: number, event: GameEventRecord): number {
    return event.id;
  }

  private readonly tick = (): void => {
    const timestamp = performance.now();

    if (this.documentRef.hidden) {
      this.lastTickTime = timestamp;
      return;
    }

    const previousTimestamp = this.lastTickTime;
    this.lastTickTime = timestamp;

    this.ngZone.runOutsideAngular(() => {
      const previousState = this.state;
      const result = this.runRuntime.advanceForeground(this.state, previousTimestamp, timestamp);
      this.state = result.state;
      const nowMs = Date.now();

      if (result.events.length > 0) {
        const previousPresentation = deriveEnterprisePresentation(previousState, this.mechanics);

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
    const result = buyHustle(this.state, this.mechanics, hustleId, quantity);
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
    const storage = this.getLocalStorage();
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
  ): RugPullResolutionView {
    const preview = createRugPullPreview(createInitialGameState(this.mechanics, resultingNetWorth));

    return {
      netWorthGainLabel: `+${formatMoney(netWorthGained, 'payout')}`,
      resultingNetWorthLabel: formatMoney(resultingNetWorth, 'net-worth'),
      wealthAdvantageLabel: `up to +${formatPercentage(preview.wealthAdvantagePercent)} established Hustle output`,
      peakValuationLabel: formatMoney(peakValuation, 'headline'),
    };
  }

  private resetRunState(preserveMeta = true): void {
    this.state = createInitialGameState(
      this.mechanics,
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
      this.mechanics,
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
          valuation: createRugPullPreview(state).requiredPeakValuation,
          peakValuation: createRugPullPreview(state).requiredPeakValuation,
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
          this.mechanics,
          Math.max(
            state.netWorth,
            projectedNetWorthGain(RUG_PULL_CONFIG.unlockValuation)
          ),
          Math.max(state.rugPullCount, 1)
        );
      case 'endgame': {
        const endgameState = createInitialGameState(
          this.mechanics,
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
        this.mechanics,
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
    const flyout: ValuationFlyoutView = {
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
      recordDiscoveryEvents(session, this.state, this.definitions, this.mechanics, nowMs)
    );
  }

  private capturePlaytestSnapshot(nowMs = Date.now()): void {
    this.updatePlaytestSession((session) =>
      recordSnapshotIfDue(session, this.state, this.definitions, this.mechanics, nowMs)
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

    const storage = this.getLocalStorage();

    if (!storage) {
      return;
    }

    try {
      savePlaytestSession(storage, this.playtestSession);
    } catch {
      this.playtestStatusMessage = 'Local playtest storage unavailable.';
    }
  }

  private getLocalStorage(): Storage | null {
    if (!this.isBrowser) {
      return null;
    }

    try {
      return window.localStorage;
    } catch {
      return null;
    }
  }

  private loadSavedRunState(savedMeta: GriftMetaSaveV1): GriftRunSaveV1 | null {
    return this.persistence.loadRun(savedMeta);
  }

  private prepareOfflineReturn(savedRun: GriftRunSaveV1 | null): void {
    if (!savedRun) {
      return;
    }

    const elapsedMs = Date.now() - savedRun.savedAt;
    const result = this.runRuntime.creditOffline(this.state, elapsedMs);

    if (!result) {
      return;
    }

    this.state = result.state;
    this.offlineReturn = {
      elapsedLabel: this.formatElapsed(elapsedMs),
      payoutLabel: formatMoney(result.pendingPayout, 'payout'),
      pendingPayout: result.pendingPayout,
    };
    this.addValuationFlyout('gain', result.pendingPayout);
    this.addFeedback('Away money', this.offlineReturn.payoutLabel, 'payout', null);
    this.persistRunState(true);
    this.updateAudioPresentation();
  }

  private persistRunState(force = false): void {
    this.persistence.saveRun(this.state, this.selectedHustleId, force);
  }

  private loadSavedMeta(): GriftMetaSaveV1 {
    return this.persistence.loadMeta();
  }

  private persistNetWorth(): void {
    this.persistence.saveMeta(this.state);
  }

  private emitGameEvent(event: GameEvent): void {
    const timestampMs = this.isBrowser ? performance.now() : Date.now();
    this.gameEvents = [...this.gameEventLog.record(event, timestampMs)];
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

import { CurrencyPipe, DOCUMENT, isPlatformBrowser, PercentPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AudioDirectorService } from './audio/audio-director.service';
import { AudioSettings } from './audio/audio-engine';
import { GRIFT_OS_COPY } from './content/game-copy';
import { HUSTLE_DEFINITIONS } from './content/hustle-definitions';
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
import { combinedMultiplier, modifierBreakdownForHustle } from './game-engine/modifiers';
import { deriveEnterprisePresentation, EnterprisePresentation, EnterpriseStage } from './game-engine/presentation';
import { commitRugPull, createRugPullPreview, RugPullPreview } from './game-engine/rug-pull';
import { elapsedForegroundSimulationMs } from './game-engine/simulation-clock';
import { GriftOsGameState, HustleDefinition, HustleId, ProductionEvent } from './game-engine/types';
import { formatValuation, formatValuationRate } from './formatting/number-format';
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
  progressLabel: string;
  payoutLabel: string;
  averageRateLabel: string;
  cadenceLabel: string;
  nextCostLabel: string;
  automationCostLabel: string;
  automationStatusLabel: string;
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
  showAutomationState: boolean;
  showAutomationOpportunity: boolean;
  showNextMilestone: boolean;
  showBuyMax: boolean;
  showModifierSummary: boolean;
  nextMilestoneLabel: string;
  nextMilestoneDescription: string;
  modifierSummaryLabel: string;
}

interface HustleHorizonView {
  definition: HustleDefinition;
  id: HustleId;
  costLabel: string;
  canBuy: boolean;
}

interface PayoutFeedback {
  id: number;
  text: string;
  hustleName: string;
  hustleId: HustleId | null;
  tone: 'payout' | 'automation' | 'milestone' | 'rug-pull';
  expiresAt: number;
}

interface LeverageDomainDefinition {
  id: 'attention' | 'doctrine' | 'capital';
  label: string;
  title: string;
  thesis: string;
  description: string;
  accent: 'info' | 'value' | 'automation';
  hustleIds: readonly HustleId[];
}

interface LeverageDomainView {
  id: LeverageDomainDefinition['id'];
  label: string;
  title: string;
  thesis: string;
  description: string;
  accent: LeverageDomainDefinition['accent'];
  activeCount: number;
  automationCount: number;
  milestoneCount: number;
  totalUnits: number;
  coverageLabel: string;
  pressureLabel: string;
  linkedHustles: readonly HustleViewModel[];
}

interface GriftMetaSave {
  netWorth: number;
}

type RunShortcutId =
  | 'fresh'
  | 'first-expansion'
  | 'automation-ready'
  | 'two-hustles'
  | 'milestone-near'
  | 'rug-pull-ready';

const META_STORAGE_KEY = 'grift-os-meta-v1';

const LEVERAGE_DOMAINS: readonly LeverageDomainDefinition[] = [
  {
    id: 'attention',
    label: 'Attention',
    title: 'Public surface area',
    thesis: 'Narrative ingress',
    description: 'Own the channels that make ambient reaction look like consensus.',
    accent: 'info',
    hustleIds: ['troll-network', 'podcast-network', 'culture-war-media'],
  },
  {
    id: 'doctrine',
    label: 'Doctrine',
    title: 'Belief manufacturing',
    thesis: 'Portable certainty',
    description: 'Package worldview into products, retreats, and repeated conversion rituals.',
    accent: 'value',
    hustleIds: ['masterclass-business', 'manifesto-imprint', 'founder-retreat-circuit'],
  },
  {
    id: 'capital',
    label: 'Capital',
    title: 'Institutional gravity',
    thesis: 'Permanent leverage',
    description: 'Turn access and ownership into systems that keep compounding after the pitch ends.',
    accent: 'automation',
    hustleIds: ['ai-venture', 'venture-portfolio', 'media-holdings', 'sovereign-network'],
  },
];

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
  imports: [CurrencyPipe, PercentPipe],
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
    { id: 'rug-pull-ready', label: 'Late Game' },
  ];
  readonly tabs: readonly { id: GameTabId; label: string }[] = [
    { id: 'hustles', label: GRIFT_OS_COPY.tabs.hustles },
    { id: 'leverage', label: GRIFT_OS_COPY.tabs.leverage },
    { id: 'rugPull', label: GRIFT_OS_COPY.tabs.rugPull },
  ];

  @ViewChild('selectedContextPanel') private selectedContextPanel?: ElementRef<HTMLElement>;

  state: GriftOsGameState = createInitialGameState(this.definitions);
  payoutFeedback: PayoutFeedback[] = [];
  playtestSession: PlaytestSession | null = null;
  playtestStatusMessage = '';
  selectedHustleId: HustleId = this.definitions[0].id;
  selectedContextOpen = false;
  selectedTab: GameTabId = 'hustles';
  gameEvents: GameEventRecord[] = [];

  private readonly isBrowser: boolean;
  private simulationTimerId: number | null = null;
  private progressTransitionRestoreTimerId: number | null = null;
  private readonly progressTransitionResetIds = new Set<HustleId>();
  private lastTickTime = 0;
  private feedbackId = 0;
  private gameEventId = 0;
  private selectedContextReturnTarget: HTMLElement | null = null;
  private readonly visibilityChangeHandler = (): void => {
    if (!this.isBrowser) {
      return;
    }

    this.lastTickTime = performance.now();
  };

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    @Inject(DOCUMENT) private readonly documentRef: Document,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly ngZone: NgZone,
    private readonly route: ActivatedRoute,
    readonly audioDirector: AudioDirectorService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.isPlaytestMode = this.route.snapshot.queryParamMap.get('playtest') === '1';
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.state = createInitialGameState(this.definitions, this.loadSavedNetWorth());

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

    if (this.isBrowser) {
      this.documentRef.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      this.setContextOverlayBodyState(false);
    }
  }

  get valuationLabel(): string {
    return formatValuation(this.state.valuation);
  }

  get peakValuationLabel(): string {
    return formatValuation(this.state.peakValuation);
  }

  get valuationPerSecondLabel(): string {
    return formatValuationRate(valuationPerSecond(this.state, this.definitions));
  }

  get netWorthLabel(): string {
    return formatValuation(this.state.netWorth);
  }

  get wealthAdvantageLabel(): string {
    return `+${this.rugPullPreview.wealthAdvantagePercent.toFixed(0)}% all Hustle output`;
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
      costLabel: formatValuation(cost),
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
    return createRugPullPreview(this.state);
  }

  get leverageDomains(): readonly LeverageDomainView[] {
    return LEVERAGE_DOMAINS.map((domain) => {
      const linkedHustles = domain.hustleIds
        .map((hustleId) => this.hustleRows.find((row) => row.id === hustleId))
        .filter((row): row is HustleViewModel => row !== undefined);
      const activeCount = linkedHustles.filter((row) => row.units > 0).length;
      const automationCount = linkedHustles.filter((row) => row.isAutomated).length;
      const milestoneCount = linkedHustles.reduce((count, row) => {
        const reached = this.state.hustles[row.id].reachedMilestones.length;

        return count + reached;
      }, 0);
      const totalUnits = linkedHustles.reduce((count, row) => count + row.units, 0);

      return {
        ...domain,
        activeCount,
        automationCount,
        milestoneCount,
        totalUnits,
        coverageLabel: `${activeCount}/${linkedHustles.length} online`,
        pressureLabel: automationCount > 0
          ? `${automationCount} automated`
          : milestoneCount > 0
            ? `${milestoneCount} milestones`
            : totalUnits > 0
              ? `${totalUnits} units live`
              : 'No durable surface yet',
        linkedHustles,
      };
    });
  }

  get audioSettings(): AudioSettings {
    return this.audioDirector.settings();
  }

  get hustleRows(): HustleViewModel[] {
    const hasAnyAutomation = this.hasAnyAutomation;
    const hasAnyMilestone = this.hasAnyMilestone;

    return this.definitions.map((definition) => {
      const hustle = this.state.hustles[definition.id];
      const cadenceSeconds = effectiveCadenceSeconds(this.state, this.definitions, definition.id);
      const progressPercent = hustle.isActive
        ? Math.min(100, (hustle.progressMs / (cadenceSeconds * 1000)) * 100)
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

      return {
        definition,
        id: definition.id,
        units: hustle.units,
        unitCountLabel: `${hustle.units} ${this.unitLabel(definition, hustle.units)}`,
        isActive: hustle.isActive,
        isAutomated: hustle.isAutomated,
        isProgressResetting: this.progressTransitionResetIds.has(definition.id),
        progressPercent,
        progressLabel: hustle.isActive
          ? `${Math.floor(progressPercent)}%`
          : hustle.isAutomated
            ? 'Cycling'
            : 'Ready',
        payoutLabel: formatValuation(payout),
        averageRateLabel: formatValuationRate(payout / cadenceSeconds),
        cadenceLabel: `Every ${this.formatSeconds(cadenceSeconds)}`,
        nextCostLabel: formatValuation(nextCost),
        automationCostLabel: formatValuation(automationCost(this.state, this.definitions, definition.id)),
        automationStatusLabel: hustle.isAutomated
          ? `${definition.automationName} online`
          : automationEligible
            ? `${definition.automationName} available`
            : 'Acquire this Hustle to automate',
        expansionButtonLabel: `${definition.expansionActionLabel} · ${formatValuation(nextCost)}`,
        manualButtonLabel: `${definition.manualActionLabel} · ${formatValuation(payout)}`,
        manualActiveLabel: `${definition.manualActionLabel}...`,
        buyMaxLabel: buyMaxCount > 0
          ? `Max (${buyMaxCount})`
          : 'Max',
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
        showAutomationState: hustle.isAutomated || (automationEligible && (hasAnyAutomation || canBuyAutomationForHustle)),
        showAutomationOpportunity: automationEligible && canBuyAutomationForHustle,
        showNextMilestone: hustle.units > 0 && nextMilestone !== undefined && (hasAnyMilestone || isNearMilestone),
        showBuyMax: buyMaxCount >= 2,
        showModifierSummary: modifierSummaryLabel.length > 0,
        nextMilestoneLabel: nextMilestone
          ? `${nextMilestone.requiredUnits} ${this.unitLabel(definition, nextMilestone.requiredUnits)}`
          : 'All current milestones reached',
        nextMilestoneDescription: nextMilestone
          ? `${nextMilestone.reward.label} · ${nextMilestone.description ?? 'Milestone effect'}`
          : 'Future milestone tuning can extend this track.',
        modifierSummaryLabel,
      };
    });
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
      const definition = this.getDefinition(hustleId);

      if (definition) {
        this.emitGameEvent({ type: 'hustle.manualActionStarted', hustleId });
        this.updatePlaytestSession((session, nowMs) =>
          recordManualActivation(session, definition, nextState, nowMs)
        );
      }
    }

    this.updateAudioPresentation();
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
      const definition = this.getDefinition(hustleId);
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
    this.selectedContextOpen = true;
    this.setContextOverlayBodyState(true);
    this.changeDetectorRef.markForCheck();

    if (this.isBrowser) {
      window.setTimeout(() => this.selectedContextPanel?.nativeElement.focus(), 0);
      window.setTimeout(() => this.selectedContextPanel?.nativeElement.focus(), 80);
    }
  }

  closeSelectedContext(restoreFocus = true): void {
    if (!this.selectedContextOpen) {
      return;
    }

    this.selectedContextOpen = false;
    this.setContextOverlayBodyState(false);
    const returnTarget = this.selectedContextReturnTarget;
    this.selectedContextReturnTarget = null;
    this.changeDetectorRef.markForCheck();

    if (!restoreFocus || !this.isBrowser || !returnTarget) {
      return;
    }

    window.setTimeout(() => returnTarget.focus(), 0);
  }

  @HostListener('document:keydown.escape')
  closeSelectedContextFromEscape(): void {
    this.closeSelectedContext();
  }

  commitRugPull(): void {
    if (!this.rugPullPreview.isAvailable || !this.isBrowser) {
      return;
    }

    if (!window.confirm('Rug Pull this run and convert part of peak Valuation into Net Worth?')) {
      return;
    }

    const previousState = this.state;
    const result = commitRugPull(this.state, this.definitions);
    this.state = result.state;
    this.persistNetWorth();
    this.emitGameEvent({
      type: 'rugPull.committed',
      rugPullState: 'committed',
      netWorthGain: result.netWorthGained,
    });
    this.emitGameEvent({ type: 'rugPull.completed', rugPullState: 'returning', netWorthGain: result.netWorthGained });
    this.emitGameEvent({ type: 'newRun.started', rugPullState: 'returning' });
    this.addFeedback(`+${formatValuation(result.netWorthGained)}`, 'Net Worth extracted', 'rug-pull', null);
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

  resetSimulationRun(): void {
    if (!this.isBrowser) {
      return;
    }

    if (!window.confirm('Reset this test run? Net Worth and settings will remain.')) {
      return;
    }

    this.resetRunState();
    this.updatePlaytestSession((session, nowMs) =>
      appendPlaytestEvent(session, 'session_reset', {}, nowMs)
    );
    this.playtestStatusMessage = 'Run reset to initial conditions.';
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
    this.changeDetectorRef.markForCheck();
  }

  applyRunShortcut(shortcutId: RunShortcutId): void {
    this.state = this.createRunShortcutState(shortcutId);
    this.selectedTab = 'hustles';
    this.selectedContextOpen = false;
    this.setContextOverlayBodyState(false);
    this.selectedContextReturnTarget = null;
    this.progressTransitionResetIds.clear();
    this.payoutFeedback = [];
    this.lastTickTime = this.isBrowser ? performance.now() : 0;
    this.selectedHustleId = shortcutId === 'two-hustles' ? 'podcast-network' : 'troll-network';
    this.playtestStatusMessage = `Jumped to ${this.runShortcutLabel(shortcutId)}.`;
    this.updateAudioPresentation();
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

    const elapsedMs = elapsedForegroundSimulationMs(this.lastTickTime, timestamp);
    this.lastTickTime = timestamp;

    this.ngZone.run(() => {
      const previousState = this.state;
      const previousPresentation = this.presentation;
      const result = advanceGame(this.state, this.definitions, elapsedMs);
      this.state = result.state;
      const nowMs = Date.now();

      for (const event of result.events) {
        this.progressTransitionResetIds.add(event.hustleId);
        this.addPayoutFeedback(event, timestamp);
        this.recordPlaytestCycle(event, previousState, nowMs);
        this.emitGameEvent({ type: 'hustle.manualActionCompleted', hustleId: event.hustleId });
      }

      if (result.events.length > 0) {
        this.scheduleProgressTransitionRestore();
      }

      this.capturePlaytestDiscoveries(nowMs);
      this.capturePlaytestSnapshot(nowMs);
      this.payoutFeedback = this.payoutFeedback.filter((feedback) => feedback.expiresAt > timestamp);
      this.emitStageChangeIfNeeded(previousPresentation, this.presentation);
      this.updateAudioPresentation();
      this.changeDetectorRef.markForCheck();
    });
  };

  private startSimulationTimer(): void {
    if (this.simulationTimerId !== null) {
      return;
    }

    this.lastTickTime = performance.now();
    this.documentRef.addEventListener('visibilitychange', this.visibilityChangeHandler);

    this.ngZone.runOutsideAngular(() => {
      this.simulationTimerId = window.setInterval(this.tick, 100);
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
    this.changeDetectorRef.markForCheck();
  }

  private addPayoutFeedback(event: ProductionEvent, timestamp: number): void {
    const definition = this.definitions.find((candidate) => candidate.id === event.hustleId);

    this.feedbackId += 1;
    this.payoutFeedback = [
      {
        id: this.feedbackId,
        text: `+${formatValuation(event.payout * event.cyclesCompleted)}`,
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

  private resetRunState(): void {
    this.state = createInitialGameState(this.definitions, this.state.netWorth);
    this.selectedHustleId = this.definitions[0].id;
    this.selectedContextOpen = false;
    this.setContextOverlayBodyState(false);
    this.selectedContextReturnTarget = null;
    this.selectedTab = 'hustles';
    this.payoutFeedback = [];
    this.progressTransitionResetIds.clear();
    this.feedbackId = 0;
    this.lastTickTime = performance.now();
    this.persistNetWorth();
    this.updateAudioPresentation();
  }

  private createRunShortcutState(shortcutId: RunShortcutId): GriftOsGameState {
    const state = createInitialGameState(this.definitions, this.state.netWorth);

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
          valuation: 130,
          peakValuation: 130,
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
      case 'rug-pull-ready':
        return {
          ...state,
          valuation: 50_000_000,
          peakValuation: 50_000_000,
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
    }, 40);
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
      parts.push(`x${outputMultiplier.toFixed(2)} output`);
    }

    if (cadenceMultiplier !== 1) {
      parts.push(`x${cadenceMultiplier.toFixed(2)} speed`);
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

  private loadSavedNetWorth(): number {
    if (!this.isBrowser) {
      return 0;
    }

    try {
      const rawMeta = window.localStorage.getItem(META_STORAGE_KEY);

      if (!rawMeta) {
        return 0;
      }

      const meta = JSON.parse(rawMeta) as Partial<GriftMetaSave>;

      return Number.isFinite(meta.netWorth) ? Number(meta.netWorth) : 0;
    } catch {
      return 0;
    }
  }

  private persistNetWorth(): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      const meta: GriftMetaSave = {
        netWorth: this.state.netWorth,
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

    return false;
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
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}m ${seconds}s`;
  }
}

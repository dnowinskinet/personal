import { ExtractionStatus, extractionStatus } from '../content/extraction';
import { createRugPullPreview, RugPullPreview } from '../content/rug-pull-preview';
import {
  automationCost,
  canBuyAutomation,
  effectiveCadenceSeconds,
  hustleCostForQuantity,
  hustlePayout,
  maxAffordableQuantity,
  nextHustleCost,
  valuationPerSecond,
} from '../game-engine/economy';
import { GameTabId } from '../game-engine/game-events';
import { canBuyLeverage, isLeverageUnlocked, leverageRequirements } from '../game-engine/leverage';
import { GameMechanics } from '../game-engine/mechanics';
import {
  combinedMultiplier,
  modifierBreakdownForHustle,
  wealthAdvantageMultiplier,
} from '../game-engine/modifiers';
import {
  deriveEnterprisePresentation,
  EnterprisePresentation,
  EnterpriseStage,
} from '../game-engine/presentation';
import {
  GriftOsGameState,
  HustleDefinition,
  HustleId,
  LeverageDefinition,
  LeverageId,
} from '../game-engine/types';
import {
  formatCount,
  formatMoney,
  formatMoneyRate,
  formatMultiplier,
  formatPercentage,
} from '../formatting/number-format';

export interface HustleViewModel {
  definition: HustleDefinition;
  id: HustleId;
  scaleCount: number;
  unitCountLabel: string;
  isActive: boolean;
  isAutomated: boolean;
  progressPercent: number;
  progressAnimationDuration: string;
  progressAnimationDelay: string;
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

export interface HustleHorizonView {
  definition: HustleDefinition;
  id: HustleId;
  costLabel: string;
  shortfallLabel: string;
  canBuy: boolean;
}

export interface LeverageDealView {
  definition: LeverageDefinition;
  id: LeverageId;
  costLabel: string;
  isPurchased: boolean;
  isUnlocked: boolean;
  canBuy: boolean;
  statusLabel: string;
  effectLabels: readonly string[];
}

export type VisualCondition = 'manual' | 'automated' | 'structural';

export interface GamePresentationSnapshot {
  valuationLabel: string;
  peakValuationLabel: string;
  valuationPerSecondLabel: string;
  netWorthLabel: string;
  wealthAdvantageLabel: string;
  showNetWorth: boolean;
  enterprise: EnterprisePresentation;
  enterpriseIntensityPercent: number;
  stageLabel: string;
  stageSummary: string;
  visualCondition: VisualCondition;
  hustleRows: readonly HustleViewModel[];
  visibleHustleRows: readonly HustleViewModel[];
  selectedHustle: HustleViewModel;
  ownedHustleCount: number;
  hasExpandedBeyondInitialState: boolean;
  visibleHustleCountLabel: string;
  showPinnedSelectedContext: boolean;
  showSelectedContextSurface: boolean;
  showNextHustleHorizon: boolean;
  nextHustleHorizon: HustleHorizonView | null;
  availableTabs: readonly { id: GameTabId; label: string }[];
  showModeTabs: boolean;
  selectedVisibleTab: GameTabId;
  leverageDeals: readonly LeverageDealView[];
  leveragePurchaseCount: number;
  rugPullPreview: RugPullPreview;
  rugPullNetWorthGainLabel: string;
  rugPullResultingNetWorthLabel: string;
  rugPullTargetLabel: string;
  rugPullWealthAdvantageLabel: string;
  rugPullRecoveryMultiplierLabel: string;
  extraction: ExtractionStatus;
  extractionRateLabel: string;
  extractionNextCostLabel: string;
  extractionDurationLabel: string;
  extractionRemainingLabel: string;
  extractionOutputLabel: string;
  extractionNextOutputLabel: string;
  extractionProgressScale: string;
  resetHustleCount: number;
  resetAutomationCount: number;
  resetMilestoneCount: number;
}

export interface GamePresentationInput {
  state: GriftOsGameState;
  selectedHustleId: HustleId;
  selectedTab: GameTabId;
  selectedContextOpen: boolean;
}

const STAGE_COPY: Record<EnterpriseStage, { label: string; summary: string }> = {
  scrappy: { label: 'Scrappy cover story', summary: 'One working Hustle and almost no institutional camouflage.' },
  traction: { label: 'Traction theater', summary: 'The stack starts to look repeatable, even if it is still mostly personal labor.' },
  legitimate: { label: 'Legibility threshold', summary: 'Milestones and owned surfaces start reading like a business instead of a stunt.' },
  institutional: { label: 'Institutional polish', summary: 'Automation, belief products, and ownership layers begin reinforcing each other.' },
  power: { label: 'Power consolidation', summary: 'The network starts manufacturing inevitability across channels at once.' },
  'pre-rug': { label: 'Extraction window', summary: 'The machine is large enough to convert paper status into persistent personal gravity.' },
};

export class GamePresentationFacade {
  private lastInput: GamePresentationInput | null = null;
  private lastSnapshot: GamePresentationSnapshot | null = null;

  constructor(
    private readonly definitions: readonly HustleDefinition[],
    private readonly leverageDefinitions: readonly LeverageDefinition[],
    private readonly mechanics: GameMechanics,
    private readonly tabs: readonly { id: GameTabId; label: string }[]
  ) {}

  derive(input: GamePresentationInput): GamePresentationSnapshot {
    if (
      this.lastSnapshot &&
      this.lastInput?.state === input.state &&
      this.lastInput.selectedHustleId === input.selectedHustleId &&
      this.lastInput.selectedTab === input.selectedTab &&
      this.lastInput.selectedContextOpen === input.selectedContextOpen
    ) {
      return this.lastSnapshot;
    }

    const snapshot = this.createSnapshot(input);
    this.lastInput = input;
    this.lastSnapshot = snapshot;
    return snapshot;
  }

  private createSnapshot(input: GamePresentationInput): GamePresentationSnapshot {
    const { state } = input;
    const rugPullPreview = createRugPullPreview(state);
    const extraction = extractionStatus(state);
    const enterprise = deriveEnterprisePresentation(state, this.mechanics);
    const hasAnyAutomation = this.definitions.some((definition) => state.hustles[definition.id].isAutomated);
    const hasAnyMilestone = this.definitions.some((definition) => state.hustles[definition.id].reachedMilestones.length > 0);
    const hustleRows = this.createHustleRows(input, hasAnyAutomation, hasAnyMilestone);
    const visibleHustleRows = hustleRows.filter((row) => row.scaleCount > 0);
    const selectedHustle = hustleRows.find((row) => row.id === input.selectedHustleId) ?? hustleRows[0];
    const ownedHustleCount = visibleHustleRows.length;
    const hasExpandedBeyondInitialState = this.definitions.some((definition) =>
      state.hustles[definition.id].scaleCount > definition.initialScaleCount
    );
    const availableTabs = this.tabs.filter((tab) => this.isTabAvailable(tab.id, state, rugPullPreview));
    const nextHustleHorizon = this.createHorizon(state);
    const stageCopy = STAGE_COPY[enterprise.enterpriseStage];
    const outputAdvantagePercent = (wealthAdvantageMultiplier(state.netWorth, this.mechanics) - 1) * 100;

    return {
      valuationLabel: formatMoney(state.valuation, 'headline'),
      peakValuationLabel: formatMoney(state.peakValuation, 'headline'),
      valuationPerSecondLabel: formatMoneyRate(valuationPerSecond(state, this.mechanics)),
      netWorthLabel: formatMoney(state.netWorth, 'net-worth'),
      wealthAdvantageLabel: `Up to +${formatPercentage(outputAdvantagePercent)} established output`,
      showNetWorth: state.netWorth > 0,
      enterprise,
      enterpriseIntensityPercent: Math.round(enterprise.enterpriseIntensity * 100),
      stageLabel: stageCopy.label,
      stageSummary: stageCopy.summary,
      visualCondition: state.leveragePurchases.length > 0 ? 'structural' : hasAnyAutomation ? 'automated' : 'manual',
      hustleRows,
      visibleHustleRows,
      selectedHustle,
      ownedHustleCount,
      hasExpandedBeyondInitialState,
      visibleHustleCountLabel: `${ownedHustleCount} ${ownedHustleCount === 1 ? 'Hustle active' : 'Hustles active'}`,
      showPinnedSelectedContext: ownedHustleCount >= 2,
      showSelectedContextSurface: ownedHustleCount >= 2 || input.selectedContextOpen,
      showNextHustleHorizon: ownedHustleCount > 1 || hasExpandedBeyondInitialState,
      nextHustleHorizon,
      availableTabs,
      showModeTabs: availableTabs.length > 1,
      selectedVisibleTab: this.isTabAvailable(input.selectedTab, state, rugPullPreview) ? input.selectedTab : 'hustles',
      leverageDeals: this.createLeverageDeals(state),
      leveragePurchaseCount: state.leveragePurchases.length,
      rugPullPreview,
      rugPullNetWorthGainLabel: `+${formatMoney(rugPullPreview.projectedNetWorthGain, 'payout')}`,
      rugPullResultingNetWorthLabel: formatMoney(rugPullPreview.resultingNetWorth, 'net-worth'),
      rugPullTargetLabel: formatMoney(rugPullPreview.requiredPeakValuation, 'headline'),
      rugPullWealthAdvantageLabel: `Up to +${formatPercentage(rugPullPreview.wealthAdvantagePercent)} established next-run output`,
      rugPullRecoveryMultiplierLabel: formatMultiplier(rugPullPreview.recoveryMultiplier),
      extraction,
      extractionRateLabel: formatPercentage(extraction.takeRate * 100),
      extractionNextCostLabel: formatMoney(extraction.nextStageCost, 'transaction'),
      extractionDurationLabel: extraction.nextStage ? formatElapsed(extraction.nextStage.durationMs) : '',
      extractionRemainingLabel: formatElapsed(extraction.remainingMs),
      extractionOutputLabel: `${formatPercentage(extraction.outputRetention * 100)} output retained`,
      extractionNextOutputLabel: extraction.nextStage
        ? `${formatPercentage(extraction.nextStage.outputRetention * 100)} output retained`
        : '',
      extractionProgressScale: extraction.activeStage && extraction.activeStage.durationMs > 0
        ? Math.min(1, extraction.progressMs / extraction.activeStage.durationMs).toFixed(4)
        : '0',
      resetHustleCount: visibleHustleRows.length,
      resetAutomationCount: hustleRows.filter((row) => row.isAutomated).length,
      resetMilestoneCount: this.definitions.reduce(
        (count, definition) => count + state.hustles[definition.id].reachedMilestones.length,
        0
      ),
    };
  }

  private createHorizon(state: GriftOsGameState): HustleHorizonView | null {
    const definition = [...this.definitions]
      .sort((first, second) => first.order - second.order)
      .find((candidate) => state.hustles[candidate.id].scaleCount <= 0);

    if (!definition) {
      return null;
    }

    const cost = nextHustleCost(definition, state.hustles[definition.id].scaleCount, state, this.mechanics);
    return {
      definition,
      id: definition.id,
      costLabel: formatMoney(cost, 'transaction'),
      shortfallLabel: formatMoney(Math.max(0, cost - state.valuation), 'transaction'),
      canBuy: state.valuation >= cost,
    };
  }

  private createLeverageDeals(state: GriftOsGameState): readonly LeverageDealView[] {
    return this.leverageDefinitions
      .filter((definition) => state.peakNetWorth >= definition.unlockNetWorth)
      .map((definition) => {
        const isPurchased = state.leveragePurchases.includes(definition.id);
        const isUnlocked = isLeverageUnlocked(state, definition);
        const requirements = leverageRequirements(state, definition);
        const missingOwnedCount = requirements.missingOwnedHustles.length;
        const missingAutomationCount = requirements.missingAutomatedHustles.length;

        return {
          definition,
          id: definition.id,
          costLabel: formatMoney(definition.cost, 'transaction'),
          isPurchased,
          isUnlocked,
          canBuy: canBuyLeverage(state, definition.id, this.mechanics),
          statusLabel: isPurchased
            ? 'Operating for this run'
            : requirements.netWorthRequired > 0
              ? `Requires ${formatMoney(definition.unlockNetWorth, 'net-worth')} Net Worth`
              : missingOwnedCount > 0
                ? `Establish ${missingOwnedCount} linked Hustle${missingOwnedCount === 1 ? '' : 's'}`
                : missingAutomationCount > 0
                  ? `Automate ${missingAutomationCount} linked Hustle${missingAutomationCount === 1 ? '' : 's'}`
                  : isUnlocked && state.netWorth < definition.cost
                    ? `Need ${formatMoney(definition.cost - state.netWorth, 'net-worth')} more Net Worth`
                    : `Sacrifice ${formatMoney(definition.cost, 'net-worth')} Net Worth`,
          effectLabels: definition.modifiers.map((modifier) => modifier.label),
        };
      });
  }

  private createHustleRows(
    input: GamePresentationInput,
    hasAnyAutomation: boolean,
    hasAnyMilestone: boolean
  ): HustleViewModel[] {
    return this.definitions.map((definition) => {
      const hustle = input.state.hustles[definition.id];
      const cadenceSeconds = effectiveCadenceSeconds(input.state, this.mechanics, definition.id);
      const cadenceMs = cadenceSeconds * 1000;
      const progressPercent = hustle.isActive ? Math.min(100, (hustle.progressMs / cadenceMs) * 100) : 0;
      const nextCost = nextHustleCost(definition, hustle.scaleCount, input.state, this.mechanics);
      const buyMaxCount = maxAffordableQuantity(
        definition,
        hustle.scaleCount,
        input.state.valuation,
        input.state,
        this.mechanics
      );
      const payout = hustlePayout(input.state, this.mechanics, definition.id);
      const nextMilestone = definition.milestones.find((milestone) =>
        !hustle.reachedMilestones.includes(milestone.id)
      );
      const remainingScaleCount = nextMilestone
        ? nextMilestone.requiredScaleCount - hustle.scaleCount
        : Infinity;
      const isNearMilestone = nextMilestone
        ? remainingScaleCount <= Math.max(2, Math.ceil(nextMilestone.requiredScaleCount * 0.2))
        : false;
      const automationEligible = hustle.scaleCount > 0 && !hustle.isAutomated;
      const canAutomate = canBuyAutomation(input.state, this.mechanics, definition.id);
      const modifierSummaryLabel = this.modifierSummaryLabel(input.state, definition.id);

      return {
        definition,
        id: definition.id,
        scaleCount: hustle.scaleCount,
        unitCountLabel: scaleCountLabel(definition, hustle.scaleCount),
        isActive: hustle.isActive,
        isAutomated: hustle.isAutomated,
        progressPercent,
        progressAnimationDuration: `${Math.max(1, cadenceMs)}ms`,
        progressAnimationDelay: `${-Math.max(0, hustle.progressMs)}ms`,
        progressLabel: hustle.isActive ? `${Math.floor(progressPercent)}%` : hustle.isAutomated ? 'Cycling' : 'Ready',
        payoutLabel: formatMoney(payout, 'payout'),
        averageRateLabel: formatMoneyRate(payout / cadenceSeconds),
        cadenceLabel: `Every ${formatSeconds(cadenceSeconds)}`,
        productionLabel: `${formatMoney(payout, 'payout')} every ${formatSeconds(cadenceSeconds)}`,
        nextCostLabel: formatMoney(nextCost, 'transaction'),
        automationCostLabel: formatMoney(automationCost(input.state, this.mechanics, definition.id), 'transaction'),
        automationStatusLabel: hustle.isAutomated
          ? `${definition.automationName} · ${definition.automationActivityLabel}`
          : canAutomate
            ? `${definition.automationName} ready`
            : automationEligible && hasAnyAutomation
              ? `${definition.automationName} ahead`
              : 'Acquire this Hustle to automate',
        automationContextLabel: hustle.isAutomated
          ? 'Automation active'
          : canAutomate ? `${definition.automationName} ready` : `${definition.automationName} ahead`,
        expansionButtonLabel: `${definition.expansionActionLabel} · ${formatMoney(nextCost, 'transaction')}`,
        manualButtonLabel: `${definition.manualActionLabel} · ${formatMoney(payout, 'payout')}`,
        manualActiveLabel: `${definition.manualActionLabel}...`,
        buyMaxLabel: buyMaxCount > 0 ? `Buy +${formatCount(buyMaxCount)}` : 'Buy Max',
        buyMaxCount,
        canManualAction: hustle.scaleCount > 0 && !hustle.isActive && !hustle.isAutomated,
        canBuyOne: input.state.valuation >= hustleCostForQuantity(
          definition,
          hustle.scaleCount,
          1,
          input.state,
          this.mechanics
        ),
        canBuyMax: buyMaxCount > 0,
        canBuyAutomation: canAutomate,
        automationEligible,
        isPlayerDependent: hustle.scaleCount > 0 && !hustle.isAutomated,
        isSettledAutomated: hustle.isAutomated && !canAutomate,
        hasContextualAttention: definition.id === input.selectedHustleId || isNearMilestone,
        showAutomationState: hustle.isAutomated || (automationEligible && (hasAnyAutomation || canAutomate)),
        showAutomationOpportunity: automationEligible && canAutomate,
        showNextMilestone: hustle.scaleCount > 0 && nextMilestone !== undefined && (hasAnyMilestone || isNearMilestone),
        showBuyMax: buyMaxCount >= 2,
        showModifierSummary: modifierSummaryLabel.length > 0,
        nextMilestoneLabel: nextMilestone
          ? scaleCountLabel(definition, nextMilestone.requiredScaleCount)
          : 'All current milestones reached',
        nextMilestoneCompactLabel: nextMilestone ? `Next ${formatCount(nextMilestone.requiredScaleCount)}` : 'Complete',
        nextMilestoneDescription: nextMilestone
          ? `${nextMilestone.reward.label} · ${nextMilestone.description ?? 'Milestone effect'}`
          : 'Future milestone tuning can extend this track.',
        milestoneProgressScale: nextMilestone
          ? Math.min(1, Math.max(0, hustle.scaleCount / nextMilestone.requiredScaleCount)).toFixed(4)
          : '1',
        modifierSummaryLabel,
      };
    });
  }

  private modifierSummaryLabel(state: GriftOsGameState, hustleId: HustleId): string {
    const breakdown = modifierBreakdownForHustle(state, this.mechanics, hustleId);
    const outputMultiplier = combinedMultiplier(breakdown.output);
    const cadenceMultiplier = combinedMultiplier(breakdown.cadence);
    const parts: string[] = [];

    if (outputMultiplier !== 1) parts.push(`${formatMultiplier(outputMultiplier)} output`);
    if (cadenceMultiplier !== 1) parts.push(`${formatMultiplier(cadenceMultiplier)} speed`);
    return parts.join(' · ');
  }

  private isTabAvailable(
    tabId: GameTabId,
    state: GriftOsGameState,
    rugPullPreview: RugPullPreview
  ): boolean {
    if (tabId === 'hustles') return true;
    if (tabId === 'rugPull') return rugPullPreview.isAvailable;

    return this.leverageDefinitions.some((definition) =>
      state.leveragePurchases.includes(definition.id) ||
      (
        state.peakNetWorth >= definition.unlockNetWorth &&
        definition.requiredOwnedHustles.every((hustleId) => state.hustles[hustleId].scaleCount > 0)
      )
    );
  }
}

function scaleCountLabel(definition: HustleDefinition, scaleCount: number): string {
  const displayedCount = scaleCount * (definition.scaleDisplayMultiplier ?? 1);
  const unitLabel = displayedCount === 1 ? definition.unitSingular : definition.unitPlural;
  return `${formatCount(displayedCount)} ${unitLabel}`;
}

function formatSeconds(value: number): string {
  return Number.isInteger(value) ? `${value}s` : `${value.toFixed(1)}s`;
}

function formatElapsed(valueMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(valueMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds}s`;
}

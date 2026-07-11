export type HustleId =
  | 'troll-network'
  | 'podcast-network'
  | 'culture-war-media'
  | 'masterclass-business'
  | 'manifesto-imprint'
  | 'founder-retreat-circuit'
  | 'ai-venture'
  | 'venture-portfolio'
  | 'media-holdings'
  | 'sovereign-network';

export type HustleIconKind =
  | 'signal'
  | 'broadcast'
  | 'outrage'
  | 'funnel'
  | 'manifesto'
  | 'summit'
  | 'ai'
  | 'fund'
  | 'media'
  | 'sovereignty';

export type LeverageId =
  | 'attention-loop'
  | 'closed-circuit-doctrine'
  | 'capital-access'
  | 'institutional-capture'
  | 'sovereign-stack';

export type LeverageDomain =
  | 'attention'
  | 'doctrine'
  | 'capital'
  | 'sovereignty';

export type ModifierScope =
  | 'hustle'
  | 'global'
  | 'synergy'
  | 'temporary'
  | 'meta';

export type ModifierKind =
  | 'output'
  | 'cadence'
  | 'cost'
  | 'automation-cost'
  | 'starting-value';

export interface ModifierDefinition {
  id: string;
  label: string;
  description?: string;
  scope: ModifierScope;
  kind: ModifierKind;
  value: number;
  hustleId?: HustleId;
  hustleIds?: readonly HustleId[];
  source: 'milestone' | 'leverage' | 'rug-pull' | 'system';
}

export interface HustleMilestoneDefinition {
  id: string;
  requiredUnits: number;
  name: string;
  description?: string;
  reward: ModifierDefinition;
}

export interface HustleDefinition {
  id: HustleId;
  name: string;
  description: string;
  unitSingular: string;
  unitPlural: string;
  expansionActionLabel: string;
  manualActionLabel: string;
  automationName: string;
  automationDescription: string;
  automationCost: number;
  acquisitionCost: number;
  growthRate: number;
  basePayout: number;
  cadenceSeconds: number;
  initialUnits: number;
  unlockNetWorth: number;
  order: number;
  iconKind: HustleIconKind;
  milestones: readonly HustleMilestoneDefinition[];
  audio?: {
    manualActionCue?: string;
    automationCue?: string;
    ambientSignature?: string;
  };
}

export interface HustleState {
  id: HustleId;
  units: number;
  isActive: boolean;
  isAutomated: boolean;
  progressMs: number;
  reachedMilestones: readonly string[];
}

export interface FounderTakePreparationState {
  completedStages: number;
  isActive: boolean;
  progressMs: number;
}

export type RugPullState =
  | 'unavailable'
  | 'available'
  | 'preview'
  | 'committed'
  | 'extracting'
  | 'returning';

export interface GriftOsGameState {
  valuation: number;
  peakValuation: number;
  netWorth: number;
  rugPullCount: number;
  rugPullState: RugPullState;
  founderTakePreparation: FounderTakePreparationState;
  leveragePurchases: readonly LeverageId[];
  hustles: Record<HustleId, HustleState>;
}

export interface LeverageDefinition {
  id: LeverageId;
  domain: LeverageDomain;
  name: string;
  description: string;
  cost: number;
  unlockNetWorth: number;
  requiredOwnedHustles: readonly HustleId[];
  requiredAutomatedHustles: readonly HustleId[];
  modifiers: readonly ModifierDefinition[];
}

export interface ProductionEvent {
  hustleId: HustleId;
  payout: number;
  cyclesCompleted: number;
}

export interface MilestoneReachedEvent {
  hustleId: HustleId;
  milestoneId: string;
}

export interface AdvanceResult {
  state: GriftOsGameState;
  events: ProductionEvent[];
}

export interface PurchaseResult {
  state: GriftOsGameState;
  quantityPurchased: number;
  totalCost: number;
  milestonesReached: MilestoneReachedEvent[];
}

export interface AutomationPurchaseResult {
  state: GriftOsGameState;
  purchased: boolean;
  totalCost: number;
}

export interface LeveragePurchaseResult {
  state: GriftOsGameState;
  purchased: boolean;
  totalCost: number;
}

export interface FounderTakePreparationResult {
  state: GriftOsGameState;
  started: boolean;
  totalCost: number;
}

// Temporary aliases keep the migration narrow while older docs/tests are updated.
export type GeneratorId = HustleId;
export type GeneratorDefinition = HustleDefinition;
export type GeneratorIconKind = HustleIconKind;
export type GeneratorState = HustleState;

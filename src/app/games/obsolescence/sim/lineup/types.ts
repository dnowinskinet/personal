/**
 * Lineup domain types.
 *
 * `sim/` owns the schema; `content/` supplies instances that conform to it. The dependency runs one
 * way — the simulation never imports content, so a content pack is always passed in as an argument.
 * I-003 enforces this.
 */

/** Traits a customer can actually perceive and score on. Deliberately few. */
export type Trait =
  | 'prestige'
  | 'repairability'
  | 'capability'
  | 'compatibility'
  | 'reliability'
  | 'longevity';

export type TraitScores = Readonly<Record<Trait, number>>;

/** The four lineup slot roles. Per CANON.md §2 the low slot holds a carried-over sellable offer. */
export type SlotRole = 'low' | 'standard' | 'premium' | 'ecosystem';

// ---------------------------------------------------------------------------
// Content schema — instances live in content/, never here
// ---------------------------------------------------------------------------

export interface SegmentDefinition {
  readonly id: string;
  readonly name: string;
  /** Share of total demand. Weights across all segments should sum to 1. */
  readonly populationWeight: number;
  /** The two or three traits this segment actually scores on, with weights. R5: not all-purpose. */
  readonly salientNeeds: Readonly<Partial<Record<Trait, number>>>;
  /** Hard vetoes applied BEFORE any scoring. R5's must-have rule. */
  readonly mustHave: Readonly<Partial<Record<Trait, number>>>;
  /** Above this price an offer is vetoed outright, regardless of quality. */
  readonly priceCeiling: number;
  /** How much price hurts once inside the ceiling. Higher means more sensitive. */
  readonly priceSensitivity: number;
  /** Minimum score required to buy at all. Below it the segment delays or leaves. */
  readonly purchaseThreshold: number;
  /** What this segment actively dislikes — the anti-dominance mechanism. */
  readonly dislikes: readonly string[];
}

export interface VariantDefinition {
  readonly id: string;
  readonly name: string;
  readonly slot: SlotRole;
  /** True when this is a prior-generation variant carried into the current lineup. */
  readonly carriedOver: boolean;
  /** Cannot be dropped from the lineup. The Standard offer anchors the quarter. */
  readonly mandatory: boolean;
  readonly baseTraits: TraitScores;
  readonly basePrice: number;
  /** Engineering capacity consumed if included. Carried-over variants cost far less. */
  readonly engineeringCost: number;
  /** Unit cost before supplier and tier modifiers. */
  readonly unitCost: number;
}

export interface ContentPack {
  readonly id: string;
  readonly segments: readonly SegmentDefinition[];
  readonly variants: readonly VariantDefinition[];
  /** Total capacity available this quarter. */
  readonly capacity: Capacity;
}

export interface Capacity {
  readonly engineering: number;
  readonly test: number;
  /** One stock pool, split by the player between launch inventory and service reserve. */
  readonly stock: number;
}

// ---------------------------------------------------------------------------
// Player decisions
// ---------------------------------------------------------------------------

export type BatteryArchitecture = 'sealed' | 'modular';
export type ConnectorStance = 'universal' | 'proprietary';
export type SupplierChoice = 'incumbent' | 'aggressive';
export type ComponentTier = 'basic' | 'standard' | 'premium';
export type ClaimPosture = 'conservative' | 'confident' | 'aggressive';

/** Platform-level decisions. These propagate to every offer in the lineup. */
export interface PlatformDecisions {
  readonly battery: BatteryArchitecture;
  readonly connector: ConnectorStance;
  readonly supplier: SupplierChoice;
}

export interface OfferDecisions {
  readonly included: boolean;
  readonly price: number;
  readonly tier: ComponentTier;
  readonly supportYears: number;
  readonly claim: ClaimPosture;
}

export interface QuarterDecisions {
  readonly platform: PlatformDecisions;
  /** Keyed by variant id. */
  readonly offers: Readonly<Record<string, OfferDecisions>>;
  /** Fraction of the stock pool held back as service reserve, 0..1. */
  readonly reserveSplit: number;
  /** Test capacity spent investigating the late battery signal. */
  readonly batteryInvestigation: number;
}

// ---------------------------------------------------------------------------
// Derived state
// ---------------------------------------------------------------------------

/** A sellable offer: the missing noun (G-01). Not a design, not units already sold. */
export interface Offer {
  readonly variantId: string;
  readonly name: string;
  readonly slot: SlotRole;
  readonly carriedOver: boolean;
  readonly price: number;
  readonly traits: TraitScores;
  readonly unitCost: number;
  readonly supportYears: number;
  readonly claim: ClaimPosture;
  /** How far public claims outrun what the offer actually delivers. Feeds trust. */
  readonly claimGap: number;
}

export interface CapacityUsage {
  readonly engineeringUsed: number;
  readonly testUsed: number;
  readonly engineeringAvailable: number;
  readonly testAvailable: number;
  readonly overCommitted: boolean;
}

/** What one segment did. This is the evidence the inspector shows. */
export interface SegmentOutcome {
  readonly segmentId: string;
  readonly chosenVariantId: string | null;
  readonly reason: string;
  readonly vetoed: readonly string[];
  readonly score: number;
  readonly unitsIndex: number;
  /** True when two offers scored close enough that the choice was near-arbitrary. */
  readonly confused: boolean;
}

/** R5's five dimensions. They are permitted — expected — to disagree. There is no overall grade. */
export interface QuarterOutcome {
  readonly reach: number;
  readonly portfolio: number;
  readonly clarity: number;
  readonly trust: number;
  readonly ownership: number;
  readonly revenue: number;
  readonly cost: number;
  readonly unitsSold: number;
  readonly defectOccurred: boolean;
  readonly defectSeverity: number;
  readonly stockouts: number;
  readonly overhang: number;
  readonly segments: readonly SegmentOutcome[];
  readonly offers: readonly Offer[];
  readonly notes: readonly string[];
}

export type QuarterPhase = 'planning' | 'signal' | 'locked' | 'resolved';

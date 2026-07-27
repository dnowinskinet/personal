/**
 * The quarter race.
 *
 * A finite clock, one staff pool, three competing sinks, and an assembly step at the end whose menu
 * is whatever you actually managed to produce.
 *
 * `sim/` owns the schema; `content/` supplies instances. The simulation never imports content.
 */

/** The three things capacity can be spent on. Up versus down, plus the probe. */
export type Sink = 'research' | 'production' | 'market';

/** Part categories. A shippable device needs one of each. */
export type PartKind = 'chassis' | 'board' | 'cell';

export const PART_KINDS: readonly PartKind[] = ['chassis', 'board', 'cell'];

/** Part quality tier. Higher tiers need a higher research level to produce at all. */
export type Tier = 1 | 2 | 3;

export const TIERS: readonly Tier[] = [1, 2, 3];

/** Parts on hand, counted by kind and tier. The assembly menu is derived entirely from this. */
export type PartStock = Readonly<Record<PartKind, Readonly<Record<Tier, number>>>>;

/**
 * Which systems are switched on this quarter.
 *
 * The game teaches itself by turning these on one at a time. Quarter one is a single part with no
 * choices at all; by the fifth everything is live. Playtest verdict on the full game cold was that
 * it "hits the learning curve like a brick wall" — this is the ramp.
 */
export interface EnabledSystems {
  /** Can staff be split between sinks, or does everyone just produce? */
  readonly allocation: boolean;
  /** Does research exist, and therefore part tiers above 1? */
  readonly research: boolean;
  /** Does market prep exist, or does everything launch fully prepared? */
  readonly market: boolean;
  /** Can production be pointed at a specific part kind? */
  readonly focus: boolean;
}

export interface QuarterConfig {
  readonly id: string;
  /** Short name for the stage picker. */
  readonly title: string;
  /** One line on what this quarter is teaching. */
  readonly teaches: string;
  readonly enabled: EnabledSystems;
  /** Which part kinds are in play. A build needs one of each of these and no others. */
  readonly partKinds: readonly PartKind[];
  /** Ticks in the quarter. At 10 Hz, 1800 is three minutes. */
  readonly lengthTicks: number;
  /** Total staff to distribute across the three sinks. */
  readonly staff: number;
  /** Baseline competence, 0..1. Raises part tier odds and production rate. */
  readonly workforceSkill: number;
  /** Research points needed per level. Level gates which tiers can be produced. */
  readonly researchPerLevel: number;
  /** Market points needed for a fully prepared launch. */
  readonly marketTarget: number;
  /** Parts produced per staff-tick at full efficiency. */
  readonly productionRate: number;
  /** The score the quarter's goal demands. Missing it costs standing. */
  readonly goalScore: number;
  readonly goalLabel: string;
}

/** How staff are split right now. Values are staff counts and must not exceed the pool. */
export interface Allocation {
  readonly research: number;
  readonly production: number;
  readonly market: number;
}

/** What production is currently trying to make. Changing it mid-quarter is a real decision. */
export type ProductionFocus = PartKind | 'balanced';

export interface QuarterState {
  readonly schemaVersion: number;
  readonly seed: number;
  readonly tick: number;
  readonly phase: QuarterPhase;
  readonly allocation: Allocation;
  readonly focus: ProductionFocus;
  readonly researchPoints: number;
  readonly researchLevel: number;
  readonly marketPoints: number;
  /** Fractional progress toward the next part. Carries across ticks so rate can be sub-unit. */
  readonly productionProgress: number;
  readonly stock: PartStock;
  /** Every reallocation, so a set-and-forget run can be told from an attentive one. */
  readonly reallocations: number;
  readonly log: readonly QuarterEvent[];
}

export type QuarterPhase = 'running' | 'assembly' | 'resolved';

export interface QuarterEvent {
  readonly tick: number;
  readonly text: string;
}

/** A product the player could actually build right now, given stock. */
export interface AssemblyOption {
  readonly id: string;
  readonly label: string;
  /** Which tier of each part it consumes. */
  readonly uses: Readonly<Record<PartKind, Tier>>;
  readonly available: boolean;
  /** Present when unavailable — states exactly what is missing. */
  readonly blockedBy: string | null;
  /** 0..100 before market prep is applied. */
  readonly quality: number;
}

export interface QuarterOutcome {
  readonly shipped: boolean;
  readonly optionId: string | null;
  readonly optionLabel: string;
  readonly quality: number;
  readonly marketReadiness: number;
  readonly score: number;
  readonly goalScore: number;
  readonly goalMet: boolean;
  readonly cash: number;
  readonly standing: number;
  readonly notes: readonly string[];
}

/** Highest tier reachable this quarter. Without research nothing rises above tier 1. */
export function tierCeiling(config: QuarterConfig, researchLevel: number): Tier {
  if (!config.enabled.research) {
    return 1;
  }
  return Math.max(1, Math.min(3, researchLevel)) as Tier;
}

export function emptyStock(): PartStock {
  const kinds = {} as Record<PartKind, Record<Tier, number>>;
  for (const kind of PART_KINDS) {
    kinds[kind] = { 1: 0, 2: 0, 3: 0 };
  }
  return kinds;
}

export function countOf(stock: PartStock, kind: PartKind, tier: Tier): number {
  return stock[kind][tier];
}

export function totalOf(stock: PartStock, kind: PartKind): number {
  return TIERS.reduce((sum, tier) => sum + stock[kind][tier], 0);
}

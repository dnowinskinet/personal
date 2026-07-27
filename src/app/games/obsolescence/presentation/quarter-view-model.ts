/**
 * View models for the lineup prototype.
 *
 * Pure functions — no Angular, no DOM. The component binds to what these return, which keeps the
 * display logic testable headlessly and stops presentation decisions leaking into the simulation.
 */

import {
  computeCapacity,
  launchInventory,
  serviceReserve,
  testCoverage,
  type ContentPack,
  type QuarterDecisions,
  type QuarterOutcome,
  type SegmentDefinition,
  type VariantDefinition,
} from '../sim/index';

export interface DimensionBar {
  readonly key: string;
  readonly label: string;
  readonly value: number;
  readonly hint: string;
}

export interface CapacityBar {
  readonly label: string;
  readonly used: number;
  readonly available: number;
  readonly percent: number;
  readonly over: boolean;
}

export interface SegmentRow {
  readonly id: string;
  readonly name: string;
  readonly share: string;
  readonly bought: string;
  readonly reason: string;
  readonly vetoed: readonly string[];
  readonly confused: boolean;
  readonly units: number;
}

export function capacityBars(pack: ContentPack, decisions: QuarterDecisions): readonly CapacityBar[] {
  const usage = computeCapacity(pack, decisions);
  return [
    bar('Engineering', usage.engineeringUsed, usage.engineeringAvailable),
    bar('Test', usage.testUsed, usage.testAvailable),
    bar('Launch inventory', launchInventory(pack, decisions), pack.capacity.stock),
    bar('Service reserve', serviceReserve(pack, decisions), pack.capacity.stock),
  ];
}

function bar(label: string, used: number, available: number): CapacityBar {
  return {
    label,
    used,
    available,
    percent: available > 0 ? Math.min(100, Math.round((used / available) * 100)) : 0,
    over: used > available,
  };
}

/** Test coverage as a percentage, so the player can see how thin they are running. */
export function coveragePercent(pack: ContentPack, decisions: QuarterDecisions): number {
  return Math.round(testCoverage(computeCapacity(pack, decisions)) * 100);
}

/**
 * The five dimensions, with a plain-language hint each.
 *
 * There is deliberately no total. R5 is explicit: a quarter can be commercially excellent and
 * lifecycle-dangerous at the same time, and collapsing that into one grade destroys the information.
 */
export function dimensionBars(outcome: QuarterOutcome): readonly DimensionBar[] {
  return [
    { key: 'reach', label: 'Reach', value: outcome.reach, hint: 'How much of the market you actually served' },
    { key: 'portfolio', label: 'Portfolio', value: outcome.portfolio, hint: 'Margin and how well stock matched demand' },
    { key: 'clarity', label: 'Clarity', value: outcome.clarity, hint: 'Whether customers understood what each offer was for' },
    { key: 'trust', label: 'Trust', value: outcome.trust, hint: 'Whether your claims and promises held up' },
    { key: 'ownership', label: 'Ownership', value: outcome.ownership, hint: 'What owning it will be like for the next few years' },
  ];
}

export function segmentRows(
  pack: ContentPack,
  outcome: QuarterOutcome
): readonly SegmentRow[] {
  return outcome.segments.map((result) => {
    const definition = pack.segments.find((entry) => entry.id === result.segmentId);
    const offer = outcome.offers.find((entry) => entry.variantId === result.chosenVariantId);
    return {
      id: result.segmentId,
      name: definition?.name ?? result.segmentId,
      share: definition ? `${Math.round(definition.populationWeight * 100)}%` : '',
      bought: offer?.name ?? 'Nothing',
      reason: result.reason,
      vetoed: result.vetoed,
      confused: result.confused,
      units: result.unitsIndex,
    };
  });
}

/** Segments listed with what they want, shown before the player commits. */
export function segmentBriefs(segments: readonly SegmentDefinition[]): readonly {
  id: string;
  name: string;
  share: string;
  wants: string;
  dislikes: string;
}[] {
  return segments.map((segment) => ({
    id: segment.id,
    name: segment.name,
    share: `${Math.round(segment.populationWeight * 100)}%`,
    wants: Object.keys(segment.salientNeeds).join(', '),
    dislikes: segment.dislikes.join('; '),
  }));
}

export function variantsInSlotOrder(pack: ContentPack): readonly VariantDefinition[] {
  const order = ['low', 'standard', 'premium', 'ecosystem'];
  return [...pack.variants].sort((left, right) => order.indexOf(left.slot) - order.indexOf(right.slot));
}

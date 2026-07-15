import { ModifierKind } from '../game-engine/types';

export const HUSTLE_ECONOMIC_SLOT_IDS = [
  'hustle-01',
  'hustle-02',
  'hustle-03',
  'hustle-04',
  'hustle-05',
  'hustle-06',
  'hustle-07',
  'hustle-08',
  'hustle-09',
  'hustle-10',
  'hustle-11',
  'hustle-12',
] as const;

export type HustleEconomicSlotId = (typeof HUSTLE_ECONOMIC_SLOT_IDS)[number];

export interface HustleEconomicTuning {
  acquisitionCost: number;
  growthRate: number;
  basePayout: number;
  cadenceSeconds: number;
  automationCost: number;
  initialScaleCount: number;
  unlockNetWorth: number;
}

export interface HustleEconomicMilestone {
  requiredScaleCount: number;
  kind: Exclude<ModifierKind, 'starting-value'>;
  value: number;
}

export interface HustleEconomicSlot {
  id: HustleEconomicSlotId;
  tuning: HustleEconomicTuning;
  milestones: readonly HustleEconomicMilestone[];
}

export const HUSTLE_ECONOMIC_SLOTS = {
  'hustle-01': slot('hustle-01',
    { acquisitionCost: 0.025, growthRate: 1.18, basePayout: 0.0025, cadenceSeconds: 2, automationCost: 0.5, initialScaleCount: 1, unlockNetWorth: 0 },
    [milestone(10, 'output', 2), milestone(25, 'cadence', 1), milestone(50, 'output', 7), milestone(100, 'cost', 1)]),
  'hustle-02': slot('hustle-02',
    { acquisitionCost: 0.4, growthRate: 1.19, basePayout: 0.096, cadenceSeconds: 4, automationCost: 3, initialScaleCount: 0, unlockNetWorth: 0 },
    [milestone(5, 'output', 1.5), milestone(15, 'automation-cost', 1), milestone(30, 'cadence', 1), milestone(75, 'output', 8.5)]),
  'hustle-03': slot('hustle-03',
    { acquisitionCost: 6, growthRate: 1.2, basePayout: 0.936, cadenceSeconds: 6, automationCost: 36, initialScaleCount: 0, unlockNetWorth: 0 },
    [milestone(5, 'output', 2), milestone(20, 'cadence', 0.75), milestone(40, 'output', 8), milestone(100, 'cost', 1.5)]),
  'hustle-04': slot('hustle-04',
    { acquisitionCost: 90, growthRate: 1.21, basePayout: 10.2, cadenceSeconds: 10, automationCost: 540, initialScaleCount: 0, unlockNetWorth: 0 },
    [milestone(5, 'automation-cost', 1), milestone(15, 'output', 3), milestone(35, 'cadence', 1), milestone(75, 'output', 12)]),
  'hustle-05': slot('hustle-05',
    { acquisitionCost: 2_700, growthRate: 1.22, basePayout: 184.5, cadenceSeconds: 15, automationCost: 16_200, initialScaleCount: 0, unlockNetWorth: 0 },
    [milestone(5, 'output', 3), milestone(15, 'cadence', 1), milestone(30, 'cost', 1), milestone(60, 'output', 15)]),
  'hustle-06': slot('hustle-06',
    { acquisitionCost: 40_000, growthRate: 1.23, basePayout: 1_908, cadenceSeconds: 24, automationCost: 240_000, initialScaleCount: 0, unlockNetWorth: 1_000_000 },
    [milestone(3, 'output', 4), milestone(10, 'automation-cost', 1), milestone(25, 'cadence', 1.5), milestone(50, 'output', 10)]),
  'hustle-07': slot('hustle-07',
    { acquisitionCost: 600_000, growthRate: 1.24, basePayout: 18_576, cadenceSeconds: 36, automationCost: 3_600_000, initialScaleCount: 0, unlockNetWorth: 1_000_000 },
    [milestone(3, 'output', 5), milestone(10, 'cadence', 1), milestone(25, 'cost', 1.5), milestone(50, 'output', 15)]),
  'hustle-08': slot('hustle-08',
    { acquisitionCost: 9_000_000, growthRate: 1.25, basePayout: 167_700, cadenceSeconds: 50, automationCost: 54_000_000, initialScaleCount: 0, unlockNetWorth: 30_000_000 },
    [milestone(2, 'output', 7), milestone(8, 'automation-cost', 1.5), milestone(20, 'cadence', 1.5), milestone(40, 'output', 10)]),
  'hustle-09': slot('hustle-09',
    { acquisitionCost: 270_000_000, growthRate: 1.27, basePayout: 3_018_600, cadenceSeconds: 75, automationCost: 1_350_000_000, initialScaleCount: 0, unlockNetWorth: 30_000_000 },
    [milestone(2, 'output', 9), milestone(6, 'cost', 1.5), milestone(15, 'cadence', 2), milestone(30, 'output', 10)]),
  'hustle-10': slot('hustle-10',
    { acquisitionCost: 4_000_000_000, growthRate: 1.29, basePayout: 26_160_000, cadenceSeconds: 100, automationCost: 20_000_000_000, initialScaleCount: 0, unlockNetWorth: 1_000_000_000 },
    [milestone(2, 'output', 4), milestone(5, 'automation-cost', 2), milestone(12, 'cadence', 1), milestone(25, 'output', 10)]),
  'hustle-11': slot('hustle-11',
    { acquisitionCost: 80_000_000_000, growthRate: 1.32, basePayout: 292_992_000, cadenceSeconds: 140, automationCost: 240_000_000_000, initialScaleCount: 0, unlockNetWorth: 30_000_000_000 },
    [milestone(2, 'output', 5), milestone(6, 'cost', 1.5), milestone(15, 'cadence', 1.5), milestone(30, 'output', 10)]),
  'hustle-12': slot('hustle-12',
    { acquisitionCost: 2_000_000_000_000, growthRate: 1.36, basePayout: 3_767_040_000, cadenceSeconds: 180, automationCost: 6_000_000_000_000, initialScaleCount: 0, unlockNetWorth: 30_000_000_000 },
    [milestone(2, 'output', 4), milestone(5, 'automation-cost', 2), milestone(12, 'cadence', 1), milestone(25, 'output', 10)]),
} as const satisfies Readonly<Record<HustleEconomicSlotId, HustleEconomicSlot>>;

export function validateEconomicSlotMapping(
  empireId: string,
  hustleOrder: readonly string[],
  mapping: Readonly<Record<string, HustleEconomicSlotId>>
): void {
  const mappedHustleIds = Object.keys(mapping);
  if (mappedHustleIds.length !== hustleOrder.length ||
      mappedHustleIds.some((hustleId) => !hustleOrder.includes(hustleId))) {
    throw new Error(`${empireId} economic slot mapping does not match its Hustle catalog`);
  }

  const mappedSlots = hustleOrder.map((hustleId) => {
    const slotId = mapping[hustleId];
    if (!slotId || !HUSTLE_ECONOMIC_SLOTS[slotId]) {
      throw new Error(`Invalid economic slot for ${empireId} Hustle: ${hustleId}`);
    }
    return slotId;
  });
  const uniqueSlots = new Set(mappedSlots);

  if (mappedSlots.length !== HUSTLE_ECONOMIC_SLOT_IDS.length ||
      uniqueSlots.size !== HUSTLE_ECONOMIC_SLOT_IDS.length ||
      HUSTLE_ECONOMIC_SLOT_IDS.some((slotId) => !uniqueSlots.has(slotId))) {
    throw new Error(`${empireId} must map exactly one Hustle to every economic slot`);
  }
}

function slot(
  id: HustleEconomicSlotId,
  tuning: HustleEconomicTuning,
  milestones: readonly HustleEconomicMilestone[]
): HustleEconomicSlot {
  return { id, tuning, milestones };
}

function milestone(
  requiredScaleCount: number,
  kind: HustleEconomicMilestone['kind'],
  value: number
): HustleEconomicMilestone {
  return { requiredScaleCount, kind, value };
}

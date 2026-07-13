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
] as const;

export type HustleEconomicSlotId = (typeof HUSTLE_ECONOMIC_SLOT_IDS)[number];

export interface HustleEconomicTuning {
  acquisitionCost: number;
  growthRate: number;
  basePayout: number;
  cadenceSeconds: number;
  automationCost: number;
  initialUnits: number;
  unlockNetWorth: number;
}

export interface HustleEconomicMilestone {
  requiredUnits: number;
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
    { acquisitionCost: 0.025, growthRate: 1.18, basePayout: 0.0025, cadenceSeconds: 2, automationCost: 0.5, initialUnits: 1, unlockNetWorth: 0 },
    [milestone(10, 'output', 2), milestone(25, 'cadence', 1), milestone(50, 'output', 7), milestone(100, 'cost', 1)]),
  'hustle-02': slot('hustle-02',
    { acquisitionCost: 2, growthRate: 1.2, basePayout: 0.2, cadenceSeconds: 5, automationCost: 12, initialUnits: 0, unlockNetWorth: 0 },
    [milestone(5, 'output', 1.5), milestone(15, 'automation-cost', 1), milestone(30, 'cadence', 1), milestone(75, 'output', 8.5)]),
  'hustle-03': slot('hustle-03',
    { acquisitionCost: 50, growthRate: 1.22, basePayout: 8, cadenceSeconds: 10, automationCost: 300, initialUnits: 0, unlockNetWorth: 0 },
    [milestone(5, 'output', 2), milestone(20, 'cadence', 0.75), milestone(40, 'output', 8), milestone(100, 'cost', 1.5)]),
  'hustle-04': slot('hustle-04',
    { acquisitionCost: 1_500, growthRate: 1.24, basePayout: 250, cadenceSeconds: 20, automationCost: 9_000, initialUnits: 0, unlockNetWorth: 0 },
    [milestone(5, 'automation-cost', 1), milestone(15, 'output', 3), milestone(35, 'cadence', 1), milestone(75, 'output', 12)]),
  'hustle-05': slot('hustle-05',
    { acquisitionCost: 50_000, growthRate: 1.26, basePayout: 8_000, cadenceSeconds: 30, automationCost: 300_000, initialUnits: 0, unlockNetWorth: 0 },
    [milestone(5, 'output', 3), milestone(15, 'cadence', 1), milestone(30, 'cost', 1), milestone(60, 'output', 15)]),
  'hustle-06': slot('hustle-06',
    { acquisitionCost: 2_000_000, growthRate: 1.28, basePayout: 120_000, cadenceSeconds: 45, automationCost: 12_000_000, initialUnits: 0, unlockNetWorth: 1_000_000 },
    [milestone(3, 'output', 4), milestone(10, 'automation-cost', 1), milestone(25, 'cadence', 1.5), milestone(50, 'output', 10)]),
  'hustle-07': slot('hustle-07',
    { acquisitionCost: 75_000_000, growthRate: 1.3, basePayout: 600_000, cadenceSeconds: 60, automationCost: 450_000_000, initialUnits: 0, unlockNetWorth: 30_000_000 },
    [milestone(3, 'output', 5), milestone(10, 'cadence', 1), milestone(25, 'cost', 1.5), milestone(50, 'output', 15)]),
  'hustle-08': slot('hustle-08',
    { acquisitionCost: 3_000_000_000, growthRate: 1.32, basePayout: 30_000_000, cadenceSeconds: 90, automationCost: 18_000_000_000, initialUnits: 0, unlockNetWorth: 1_000_000_000 },
    [milestone(2, 'output', 7), milestone(8, 'automation-cost', 1.5), milestone(20, 'cadence', 1.5), milestone(40, 'output', 10)]),
  'hustle-09': slot('hustle-09',
    { acquisitionCost: 100_000_000_000, growthRate: 1.34, basePayout: 200_000_000, cadenceSeconds: 120, automationCost: 500_000_000_000, initialUnits: 0, unlockNetWorth: 30_000_000_000 },
    [milestone(2, 'output', 9), milestone(6, 'cost', 1.5), milestone(15, 'cadence', 2), milestone(30, 'output', 10)]),
  'hustle-10': slot('hustle-10',
    { acquisitionCost: 2_000_000_000_000, growthRate: 1.36, basePayout: 2_000_000_000, cadenceSeconds: 180, automationCost: 6_000_000_000_000, initialUnits: 0, unlockNetWorth: 30_000_000_000 },
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
  requiredUnits: number,
  kind: HustleEconomicMilestone['kind'],
  value: number
): HustleEconomicMilestone {
  return { requiredUnits, kind, value };
}

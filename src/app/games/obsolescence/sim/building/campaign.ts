/**
 * The campaign shell: what carries between quarters.
 *
 * Per D-020, persistence lives in the institution rather than the product. Products are disposable;
 * **cash and standing** are what survive, and what they buy is floors. There is no installed base,
 * no cohort ledger, and no support obligation.
 */

import { SCHEMA_VERSION } from '../state';
import type { QuarterOutcome } from '../quarter/types';
import { startBuilding } from './building';
import type { BuildingState, FloorDefinition } from './types';

export interface QuarterRecord {
  readonly quarterIndex: number;
  readonly configId: string;
  readonly score: number;
  readonly goalMet: boolean;
  readonly shipped: boolean;
  readonly optionLabel: string;
}

export interface CampaignState {
  readonly schemaVersion: number;
  readonly seed: number;
  /** Zero-based index into the quarter ladder. */
  readonly quarterIndex: number;
  readonly cash: number;
  readonly standing: number;
  readonly building: BuildingState;
  readonly history: readonly QuarterRecord[];
}

export interface CampaignStart {
  readonly seed: number;
  readonly cash: number;
  readonly standing: number;
}

export function startCampaign(
  floors: readonly FloorDefinition[],
  start: CampaignStart
): CampaignState {
  return {
    schemaVersion: SCHEMA_VERSION,
    seed: start.seed,
    quarterIndex: 0,
    cash: start.cash,
    standing: start.standing,
    building: startBuilding(floors),
    history: [],
  };
}

/**
 * Books a finished quarter and moves to the next.
 *
 * Standing floors at zero rather than going negative — the recovery story is that a bad run stalls
 * expansion, not that it becomes unrecoverable. D-020 wants failure to wound, not to end the run.
 */
export function bookQuarter(
  campaign: CampaignState,
  configId: string,
  outcome: QuarterOutcome
): CampaignState {
  const record: QuarterRecord = {
    quarterIndex: campaign.quarterIndex,
    configId,
    score: outcome.score,
    goalMet: outcome.goalMet,
    shipped: outcome.shipped,
    optionLabel: outcome.optionLabel,
  };

  return {
    ...campaign,
    quarterIndex: campaign.quarterIndex + 1,
    cash: campaign.cash + outcome.cash,
    standing: Math.max(0, campaign.standing + outcome.standing),
    history: [...campaign.history, record],
  };
}

/** Applies a floor purchase. */
export function spend(campaign: CampaignState, building: BuildingState, cash: number): CampaignState {
  return { ...campaign, building, cash };
}

/** Total floors owned — the simplest read on how far the company has come. */
export function floorsOwned(campaign: CampaignState): number {
  return Object.values(campaign.building.owned).filter(Boolean).length;
}

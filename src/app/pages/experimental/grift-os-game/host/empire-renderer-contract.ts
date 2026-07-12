import { Type } from '@angular/core';
import { HustleId } from '../game-engine/types';
import { GameAction } from '../presentation/game-action';
import { GamePresentationSnapshot } from '../presentation/game-presentation';

export interface ValuationFlyoutView {
  id: number;
  direction: 'gain' | 'spend';
  label: string;
  lane: number;
}

export interface RugPullResolutionView {
  netWorthGainLabel: string;
  resultingNetWorthLabel: string;
  wealthAdvantageLabel: string;
  peakValuationLabel: string;
}

export interface OfflineReturnView {
  elapsedLabel: string;
  payoutLabel: string;
  pendingPayout: number;
}

export interface EmpireRendererHostView {
  presentation: GamePresentationSnapshot;
  valuationFlyouts: readonly ValuationFlyoutView[];
  rugPullResolution: RugPullResolutionView | null;
  offlineReturn: OfflineReturnView | null;
  selectedHustleId: HustleId;
  selectedContextOpen: boolean;
}

export interface EmpireRendererRequest {
  action: GameAction;
  sourceEvent?: Event;
}

export type EmpireActionDispatcher = (request: EmpireRendererRequest) => void;

export interface EmpireRendererRegistration {
  id: string;
  component: Type<unknown>;
  createInputs(
    view: EmpireRendererHostView,
    dispatch: EmpireActionDispatcher
  ): Record<string, unknown>;
}

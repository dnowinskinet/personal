import { EnterpriseStage } from './presentation';
import { HustleId, RugPullState } from './types';

export type GameTabId = 'hustles' | 'leverage' | 'rugPull';

export type GameEvent =
  | {
      type: 'hustle.acquired' | 'hustle.expanded';
      hustleId: HustleId;
      quantity: number;
      totalCost: number;
    }
  | {
      type: 'hustle.manualActionStarted' | 'hustle.manualActionCompleted';
      hustleId: HustleId;
    }
  | {
      type: 'hustle.automationAffordable' | 'hustle.automationActivated';
      hustleId: HustleId;
      automationName?: string;
    }
  | {
      type: 'hustle.milestoneReached';
      hustleId: HustleId;
      milestoneId: string;
      tier: number;
    }
  | {
      type: 'valuation.thresholdCrossed';
      threshold: number;
      valuation: number;
    }
  | {
      type: 'purchase.completed' | 'purchase.denied';
      target: 'hustle' | 'automation' | 'leverage' | 'extraction';
      hustleId?: HustleId;
      totalCost?: number;
    }
  | {
      type: 'leverage.unlocked' | 'leverage.purchased' | 'leverage.activated' | 'leverage.expired';
      leverageId: string;
    }
  | {
      type: 'rugPull.available' | 'rugPull.previewOpened' | 'rugPull.committed' | 'rugPull.extractionStarted' | 'rugPull.completed' | 'newRun.started';
      rugPullState?: RugPullState;
      netWorthGain?: number;
    }
  | {
      type: 'gameTab.changed';
      tabId: GameTabId;
    }
  | {
      type: 'inspector.selectionChanged';
      hustleId: HustleId;
    }
  | {
      type: 'enterprise.stageChanged';
      stage: EnterpriseStage;
      intensity: number;
    };

export type GameEventRecord = GameEvent & {
  id: number;
  timestampMs: number;
};

export function createGameEventRecord(
  id: number,
  event: GameEvent,
  timestampMs: number
): GameEventRecord {
  return {
    id,
    timestampMs,
    ...event,
  };
}

import { GameTabId } from '../game-engine/game-events';
import { HustleId, LeverageId } from '../game-engine/types';

export type GameAction =
  | { type: 'mode.select'; modeId: GameTabId }
  | { type: 'context.open'; hustleId: HustleId }
  | { type: 'context.close'; restoreFocus?: boolean }
  | { type: 'hustle.activate'; hustleId: HustleId }
  | { type: 'hustle.expand'; hustleId: HustleId; quantity: 1 | 'max' }
  | { type: 'hustle.automate'; hustleId: HustleId }
  | { type: 'leverage.purchase'; leverageId: LeverageId }
  | { type: 'rugPull.prepare' }
  | { type: 'rugPull.commit' };

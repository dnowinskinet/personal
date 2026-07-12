import { GameAction } from '../presentation/game-action';

export interface EmpireRendererRequest {
  action: GameAction;
  sourceEvent?: Event;
}

export type EmpireActionDispatcher = (request: EmpireRendererRequest) => void;

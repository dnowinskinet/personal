import { advanceGame } from '../game-engine/economy';
import { GameMechanics } from '../game-engine/mechanics';
import { elapsedForegroundSimulationMs } from '../game-engine/simulation-clock';
import { GriftOsGameState, ProductionEvent } from '../game-engine/types';

export const OFFLINE_RETURN_MIN_MS = 30_000;
export const OFFLINE_RETURN_CAP_MS = 8 * 60 * 60 * 1000;

export interface RuntimeAdvanceResult {
  state: GriftOsGameState;
  events: readonly ProductionEvent[];
}

export interface OfflineCreditResult extends RuntimeAdvanceResult {
  elapsedMs: number;
  simulatedElapsedMs: number;
  pendingPayout: number;
}

export class GriftRunRuntime {
  constructor(private readonly mechanics: GameMechanics) {}

  advanceForeground(
    state: GriftOsGameState,
    previousTimestamp: number,
    currentTimestamp: number
  ): RuntimeAdvanceResult {
    const elapsedMs = elapsedForegroundSimulationMs(previousTimestamp, currentTimestamp);
    return advanceGame(state, this.mechanics, elapsedMs);
  }

  creditOffline(state: GriftOsGameState, elapsedMs: number): OfflineCreditResult | null {
    if (elapsedMs < OFFLINE_RETURN_MIN_MS) {
      return null;
    }

    const simulatedElapsedMs = Math.min(elapsedMs, OFFLINE_RETURN_CAP_MS);
    const offlineBaseState: GriftOsGameState = {
      ...state,
      hustles: Object.fromEntries(
        this.mechanics.map((definition) => {
          const hustle = state.hustles[definition.id];
          return [
            definition.id,
            hustle.isAutomated
              ? hustle
              : {
                  ...hustle,
                  isActive: false,
                  progressMs: 0,
                },
          ];
        })
      ) as unknown as GriftOsGameState['hustles'],
    };
    const result = advanceGame(offlineBaseState, this.mechanics, simulatedElapsedMs);
    const pendingPayout = Math.max(0, result.state.valuation - offlineBaseState.valuation);

    if (pendingPayout <= 0) {
      return null;
    }

    return {
      ...result,
      elapsedMs,
      simulatedElapsedMs,
      pendingPayout,
    };
  }
}

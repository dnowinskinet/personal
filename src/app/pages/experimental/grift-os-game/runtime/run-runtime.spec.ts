import { createInitialGameState } from '../game-engine/economy';
import { INFLUENCE_ENGINE_MECHANICS } from '../empires/influence/mechanics/influence-mechanics';
import { OFFLINE_RETURN_CAP_MS, GriftRunRuntime } from './run-runtime';

describe('GriftRunRuntime', () => {
  const runtime = new GriftRunRuntime(INFLUENCE_ENGINE_MECHANICS);

  it('uses the foreground clock guard before advancing a run', () => {
    const state = createInitialGameState(INFLUENCE_ENGINE_MECHANICS);
    const activeState = {
      ...state,
      hustles: {
        ...state.hustles,
        'online-rage-farm': {
          ...state.hustles['online-rage-farm'],
          isActive: true,
        },
      },
    };

    const result = runtime.advanceForeground(activeState, 1_000, 11_000);
    expect(result.state.hustles['online-rage-farm'].progressMs).toBeLessThanOrEqual(5_000);
  });

  it('credits only automated production after the threshold and caps it at eight hours', () => {
    const state = createInitialGameState(INFLUENCE_ENGINE_MECHANICS);
    const automatedState = {
      ...state,
      valuation: 100,
      peakValuation: 100,
      hustles: {
        ...state.hustles,
        'online-rage-farm': {
          ...state.hustles['online-rage-farm'],
          isActive: true,
          isAutomated: true,
        },
      },
    };

    expect(runtime.creditOffline(automatedState, 29_999)).toBeNull();
    const credited = runtime.creditOffline(automatedState, 9 * 60 * 60 * 1000);
    expect(credited?.simulatedElapsedMs).toBe(OFFLINE_RETURN_CAP_MS);
    expect(credited?.pendingPayout).toBeGreaterThan(0);

    const manualOnly = runtime.creditOffline(state, 60_000);
    expect(manualOnly).toBeNull();
  });
});

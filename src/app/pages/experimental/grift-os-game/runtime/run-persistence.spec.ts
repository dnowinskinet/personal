import { createInitialGameState } from '../game-engine/economy';
import { INFLUENCE_ENGINE_MECHANICS } from '../empires/influence/mechanics/influence-mechanics';
import {
  GRIFT_META_STORAGE_KEY,
  GRIFT_RUN_STORAGE_KEY,
  GriftV1Persistence,
  RuntimeStorage,
} from './run-persistence';

class MemoryStorage implements RuntimeStorage {
  readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe('GriftV1Persistence', () => {
  it('preserves the v1 keys, envelope, and two-second run-save throttle', () => {
    const storage = new MemoryStorage();
    let now = 10_000;
    const persistence = new GriftV1Persistence(storage, INFLUENCE_ENGINE_MECHANICS, () => now);
    const state = createInitialGameState(INFLUENCE_ENGINE_MECHANICS);

    persistence.saveRun(state, 'troll-network');
    const firstSave = storage.getItem(GRIFT_RUN_STORAGE_KEY);
    expect(JSON.parse(firstSave ?? '{}').version).toBe(1);
    expect(JSON.parse(firstSave ?? '{}').selectedHustleId).toBe('troll-network');

    now = 11_000;
    persistence.saveRun({ ...state, valuation: 12 }, 'troll-network');
    expect(storage.getItem(GRIFT_RUN_STORAGE_KEY)).toBe(firstSave);

    now = 12_000;
    persistence.saveRun({ ...state, valuation: 12 }, 'troll-network');
    expect(JSON.parse(storage.getItem(GRIFT_RUN_STORAGE_KEY) ?? '{}').state.valuation).toBe(12);

    persistence.saveMeta({ netWorth: 25, rugPullCount: 2 });
    expect(JSON.parse(storage.getItem(GRIFT_META_STORAGE_KEY) ?? '{}')).toEqual({
      netWorth: 25,
      rugPullCount: 2,
    });
  });

  it('reconciles damaged v1 data against mechanics and persistent meta', () => {
    const storage = new MemoryStorage();
    const initial = createInitialGameState(INFLUENCE_ENGINE_MECHANICS);
    storage.setItem(GRIFT_RUN_STORAGE_KEY, JSON.stringify({
      version: 1,
      savedAt: 4_000,
      selectedHustleId: 'unknown-hustle',
      state: {
        ...initial,
        valuation: -20,
        peakValuation: -10,
        netWorth: 5,
        rugPullCount: 1,
        leveragePurchases: ['unknown-leverage'],
        hustles: {
          ...initial.hustles,
          'troll-network': {
            ...initial.hustles['troll-network'],
            units: -3,
            reachedMilestones: ['unknown-milestone'],
          },
        },
      },
    }));
    const persistence = new GriftV1Persistence(storage, INFLUENCE_ENGINE_MECHANICS);
    const restored = persistence.loadRun({ netWorth: 50, rugPullCount: 3 });

    expect(restored?.selectedHustleId).toBe('troll-network');
    expect(restored?.state.valuation).toBe(0);
    expect(restored?.state.peakValuation).toBe(0);
    expect(restored?.state.netWorth).toBe(50);
    expect(restored?.state.rugPullCount).toBe(3);
    expect(restored?.state.leveragePurchases).toEqual([]);
    expect(restored?.state.hustles['troll-network'].units).toBe(0);
    expect(restored?.state.hustles['troll-network'].reachedMilestones).toEqual([]);
  });

  it('fails safely when storage is unavailable or corrupt', () => {
    const storage = new MemoryStorage();
    storage.setItem(GRIFT_META_STORAGE_KEY, '{bad json');
    storage.setItem(GRIFT_RUN_STORAGE_KEY, '{bad json');
    const persistence = new GriftV1Persistence(storage, INFLUENCE_ENGINE_MECHANICS);

    expect(persistence.loadMeta()).toEqual({ netWorth: 0, rugPullCount: 0 });
    expect(persistence.loadRun({ netWorth: 0, rugPullCount: 0 })).toBeNull();
    expect(new GriftV1Persistence(null, INFLUENCE_ENGINE_MECHANICS).loadRun({ netWorth: 0, rugPullCount: 0 })).toBeNull();
  });
});

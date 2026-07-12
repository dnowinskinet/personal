import { INFLUENCE_ENGINE_MECHANICS } from '../empires/influence/mechanics/influence-mechanics';
import { createInitialGameState } from '../game-engine/economy';
import {
  GRIFT_META_STORAGE_KEY,
  GRIFT_RUN_STORAGE_KEY,
  LEGACY_GRIFT_META_STORAGE_KEY,
  LEGACY_GRIFT_RUN_STORAGE_KEY,
  GriftMetaSaveV2,
  GriftPersistence,
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

describe('GriftPersistence', () => {
  it('writes the v2 single-active-run envelope, mirrors v1, and throttles run saves', () => {
    const storage = new MemoryStorage();
    let now = 10_000;
    const persistence = new GriftPersistence(
      storage,
      INFLUENCE_ENGINE_MECHANICS,
      'influence',
      () => now
    );
    const state = createInitialGameState(INFLUENCE_ENGINE_MECHANICS);

    persistence.saveRun(state, 'troll-network');
    const firstSave = storage.getItem(GRIFT_RUN_STORAGE_KEY);
    expect(JSON.parse(firstSave ?? '{}')).toEqual(jasmine.objectContaining({
      version: 2,
      empireId: 'influence',
      selectedHustleId: 'troll-network',
    }));
    expect(JSON.parse(storage.getItem(LEGACY_GRIFT_RUN_STORAGE_KEY) ?? '{}').version).toBe(1);

    now = 11_000;
    persistence.saveRun({ ...state, valuation: 12 }, 'troll-network');
    expect(storage.getItem(GRIFT_RUN_STORAGE_KEY)).toBe(firstSave);

    now = 12_000;
    persistence.saveRun({ ...state, valuation: 12 }, 'troll-network');
    expect(JSON.parse(storage.getItem(GRIFT_RUN_STORAGE_KEY) ?? '{}').state.valuation).toBe(12);
    expect(JSON.parse(storage.getItem(LEGACY_GRIFT_RUN_STORAGE_KEY) ?? '{}').state.valuation).toBe(12);

    persistence.saveMeta({ netWorth: 25, rugPullCount: 2 });
    expect(JSON.parse(storage.getItem(GRIFT_META_STORAGE_KEY) ?? '{}')).toEqual({
      version: 2,
      netWorth: 25,
      unlockedEmpireIds: ['influence'],
      exitCountsByEmpire: { influence: 2 },
    });
    expect(JSON.parse(storage.getItem(LEGACY_GRIFT_META_STORAGE_KEY) ?? '{}')).toEqual({
      netWorth: 25,
      rugPullCount: 2,
    });
  });

  it('migrates v1 meta and run data into v2 without deleting or rewriting the legacy records', () => {
    const storage = new MemoryStorage();
    const state = {
      ...createInitialGameState(INFLUENCE_ENGINE_MECHANICS),
      valuation: 123,
      netWorth: 50,
      rugPullCount: 3,
    };
    const legacyMeta = JSON.stringify({ netWorth: 50, rugPullCount: 3 });
    const legacyRun = JSON.stringify({
      version: 1,
      savedAt: 4_000,
      selectedHustleId: 'troll-network',
      state,
    });
    storage.setItem(LEGACY_GRIFT_META_STORAGE_KEY, legacyMeta);
    storage.setItem(LEGACY_GRIFT_RUN_STORAGE_KEY, legacyRun);
    storage.setItem(GRIFT_RUN_STORAGE_KEY, '{bad json');
    const persistence = new GriftPersistence(storage, INFLUENCE_ENGINE_MECHANICS);

    const meta = persistence.loadMeta();
    const run = persistence.loadRun(meta);

    expect(meta).toEqual({
      version: 2,
      netWorth: 50,
      unlockedEmpireIds: ['influence'],
      exitCountsByEmpire: { influence: 3 },
    });
    expect(run).toEqual(jasmine.objectContaining({
      version: 2,
      empireId: 'influence',
      savedAt: 4_000,
      selectedHustleId: 'troll-network',
    }));
    expect(run?.state.valuation).toBe(123);
    expect(storage.getItem(LEGACY_GRIFT_META_STORAGE_KEY)).toBe(legacyMeta);
    expect(storage.getItem(LEGACY_GRIFT_RUN_STORAGE_KEY)).toBe(legacyRun);
    expect(JSON.parse(storage.getItem(GRIFT_META_STORAGE_KEY) ?? '{}').version).toBe(2);
    expect(JSON.parse(storage.getItem(GRIFT_RUN_STORAGE_KEY) ?? '{}').empireId).toBe('influence');
  });

  it('reconciles damaged v2 run data against mechanics and per-empire meta', () => {
    const storage = new MemoryStorage();
    const initial = createInitialGameState(INFLUENCE_ENGINE_MECHANICS);
    const meta: GriftMetaSaveV2 = {
      version: 2,
      netWorth: 50,
      unlockedEmpireIds: ['influence'],
      exitCountsByEmpire: { influence: 3 },
    };
    storage.setItem(GRIFT_META_STORAGE_KEY, JSON.stringify(meta));
    storage.setItem(GRIFT_RUN_STORAGE_KEY, JSON.stringify({
      version: 2,
      savedAt: 4_000,
      empireId: 'influence',
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
    const persistence = new GriftPersistence(storage, INFLUENCE_ENGINE_MECHANICS);
    const restoredMeta = persistence.loadMeta();
    const restored = persistence.loadRun(restoredMeta);

    expect(restored?.selectedHustleId).toBe('troll-network');
    expect(restored?.state.valuation).toBe(0);
    expect(restored?.state.peakValuation).toBe(0);
    expect(restored?.state.netWorth).toBe(50);
    expect(restored?.state.rugPullCount).toBe(3);
    expect(restored?.state.leveragePurchases).toEqual([]);
    expect(restored?.state.hustles['troll-network'].units).toBe(0);
    expect(restored?.state.hustles['troll-network'].reachedMilestones).toEqual([]);
  });

  it('prefers valid v2 data and falls back safely to v1 when v2 is corrupt', () => {
    const storage = new MemoryStorage();
    storage.setItem(LEGACY_GRIFT_META_STORAGE_KEY, JSON.stringify({
      netWorth: 10,
      rugPullCount: 1,
    }));
    storage.setItem(GRIFT_META_STORAGE_KEY, JSON.stringify({
      version: 2,
      netWorth: 20,
      unlockedEmpireIds: ['influence'],
      exitCountsByEmpire: { influence: 2 },
    }));
    let persistence = new GriftPersistence(storage, INFLUENCE_ENGINE_MECHANICS);

    expect(persistence.loadMeta().netWorth).toBe(20);

    storage.setItem(GRIFT_META_STORAGE_KEY, '{bad json');
    persistence = new GriftPersistence(storage, INFLUENCE_ENGINE_MECHANICS);
    expect(persistence.loadMeta()).toEqual({
      version: 2,
      netWorth: 10,
      unlockedEmpireIds: ['influence'],
      exitCountsByEmpire: { influence: 1 },
    });
  });

  it('fails safely when storage is unavailable or both save versions are corrupt', () => {
    const storage = new MemoryStorage();
    storage.setItem(GRIFT_META_STORAGE_KEY, '{bad json');
    storage.setItem(GRIFT_RUN_STORAGE_KEY, '{bad json');
    storage.setItem(LEGACY_GRIFT_META_STORAGE_KEY, '{bad json');
    storage.setItem(LEGACY_GRIFT_RUN_STORAGE_KEY, '{bad json');
    const persistence = new GriftPersistence(storage, INFLUENCE_ENGINE_MECHANICS);
    const emptyMeta: GriftMetaSaveV2 = {
      version: 2,
      netWorth: 0,
      unlockedEmpireIds: ['influence'],
      exitCountsByEmpire: { influence: 0 },
    };

    expect(persistence.loadMeta()).toEqual(emptyMeta);
    expect(persistence.loadRun(emptyMeta)).toBeNull();
    expect(new GriftPersistence(null, INFLUENCE_ENGINE_MECHANICS).loadRun(emptyMeta)).toBeNull();
  });
});

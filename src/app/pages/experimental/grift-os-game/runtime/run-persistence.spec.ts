import { INFLUENCE_ENGINE_MECHANICS } from '../empires/influence/mechanics/influence-mechanics';
import { createInitialGameState } from '../game-engine/economy';
import {
  GRIFT_META_STORAGE_KEY,
  GRIFT_RUN_STORAGE_KEY,
  LEGACY_GRIFT_META_STORAGE_KEY,
  LEGACY_GRIFT_META_V2_STORAGE_KEY,
  LEGACY_GRIFT_RUN_STORAGE_KEY,
  LEGACY_GRIFT_RUN_V2_STORAGE_KEY,
  GriftMetaSaveV3,
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
  it('writes the v3 single-active-run envelope and throttles run saves', () => {
    const storage = new MemoryStorage();
    let now = 10_000;
    const persistence = new GriftPersistence(
      storage,
      INFLUENCE_ENGINE_MECHANICS,
      'influence',
      () => now
    );
    const state = createInitialGameState(INFLUENCE_ENGINE_MECHANICS);

    persistence.saveRun(state, 'online-rage-farm');
    const firstSave = storage.getItem(GRIFT_RUN_STORAGE_KEY);
    expect(JSON.parse(firstSave ?? '{}')).toEqual(jasmine.objectContaining({
      version: 3,
      empireId: 'influence',
      selectedHustleId: 'online-rage-farm',
    }));

    now = 11_000;
    persistence.saveRun({ ...state, valuation: 12 }, 'online-rage-farm');
    expect(storage.getItem(GRIFT_RUN_STORAGE_KEY)).toBe(firstSave);

    now = 12_000;
    persistence.saveRun({ ...state, valuation: 12 }, 'online-rage-farm');
    expect(JSON.parse(storage.getItem(GRIFT_RUN_STORAGE_KEY) ?? '{}').state.valuation).toBe(12);

    persistence.saveMeta({ netWorth: 25, peakNetWorth: 100, rugPullCount: 2 });
    expect(JSON.parse(storage.getItem(GRIFT_META_STORAGE_KEY) ?? '{}')).toEqual({
      version: 3,
      netWorth: 25,
      peakNetWorth: 100,
      unlockedEmpireIds: ['influence'],
      exitCountsByEmpire: { influence: 2 },
    });
    expect(storage.getItem(LEGACY_GRIFT_META_V2_STORAGE_KEY)).toBeNull();
    expect(storage.getItem(LEGACY_GRIFT_META_STORAGE_KEY)).toBeNull();
  });

  it('reports run serialization and storage timing only for completed save stages', () => {
    const storage = new MemoryStorage();
    const samples: {
      stage: 'stringify' | 'setItem';
      force: boolean;
      serializedBytes: number;
    }[] = [];
    const persistence = new GriftPersistence(
      storage,
      INFLUENCE_ENGINE_MECHANICS,
      'influence',
      () => 10_000,
      (sample) => samples.push(sample)
    );

    persistence.saveRun(
      createInitialGameState(INFLUENCE_ENGINE_MECHANICS),
      'online-rage-farm',
      true
    );

    expect(samples.map((sample) => sample.stage)).toEqual(['stringify', 'setItem']);
    expect(samples.every((sample) => sample.force)).toBeTrue();
    expect(samples.every((sample) => sample.serializedBytes > 0)).toBeTrue();
  });

  it('migrates v2 wealth/history and resets the incompatible ten-Hustle run without rewriting it', () => {
    const storage = new MemoryStorage();
    const legacyMeta = JSON.stringify({
      version: 2,
      netWorth: 50,
      unlockedEmpireIds: ['influence'],
      exitCountsByEmpire: { influence: 3 },
    });
    const legacyRun = JSON.stringify({
      version: 2,
      savedAt: 4_000,
      empireId: 'influence',
      selectedHustleId: 'troll-network',
      state: {
        valuation: 123,
        netWorth: 50,
        hustles: { 'troll-network': { units: 99, isAutomated: true } },
      },
    });
    storage.setItem(LEGACY_GRIFT_META_V2_STORAGE_KEY, legacyMeta);
    storage.setItem(LEGACY_GRIFT_RUN_V2_STORAGE_KEY, legacyRun);
    const persistence = new GriftPersistence(storage, INFLUENCE_ENGINE_MECHANICS);

    const meta = persistence.loadMeta();
    const run = persistence.loadRun(meta);

    expect(meta).toEqual({
      version: 3,
      netWorth: 50,
      peakNetWorth: 50,
      unlockedEmpireIds: ['influence'],
      exitCountsByEmpire: { influence: 3 },
    });
    expect(run).toEqual(jasmine.objectContaining({
      version: 3,
      empireId: 'influence',
      savedAt: 4_000,
      selectedHustleId: 'online-rage-farm',
    }));
    expect(run?.state.valuation).toBe(0);
    expect(run?.state.netWorth).toBe(50);
    expect(run?.state.peakNetWorth).toBe(50);
    expect(run?.state.hustles['online-rage-farm'].scaleCount).toBe(1);
    expect(run?.state.hustles['online-rage-farm'].isAutomated).toBeFalse();
    expect(storage.getItem(LEGACY_GRIFT_META_V2_STORAGE_KEY)).toBe(legacyMeta);
    expect(storage.getItem(LEGACY_GRIFT_RUN_V2_STORAGE_KEY)).toBe(legacyRun);
  });

  it('migrates v1 meta when v2 is unavailable and preserves its exit history', () => {
    const storage = new MemoryStorage();
    storage.setItem(LEGACY_GRIFT_META_STORAGE_KEY, JSON.stringify({
      netWorth: 10,
      rugPullCount: 2,
    }));
    storage.setItem(LEGACY_GRIFT_RUN_STORAGE_KEY, JSON.stringify({
      version: 1,
      savedAt: 5_000,
      state: { hustles: {} },
    }));
    const persistence = new GriftPersistence(storage, INFLUENCE_ENGINE_MECHANICS);
    const meta = persistence.loadMeta();

    expect(meta).toEqual({
      version: 3,
      netWorth: 10,
      peakNetWorth: 10,
      unlockedEmpireIds: ['influence'],
      exitCountsByEmpire: { influence: 2 },
    });
    expect(persistence.loadRun(meta)?.state.rugPullCount).toBe(2);
  });

  it('reconciles damaged v3 run data against mechanics and meta high-water state', () => {
    const storage = new MemoryStorage();
    const initial = createInitialGameState(INFLUENCE_ENGINE_MECHANICS);
    const meta: GriftMetaSaveV3 = {
      version: 3,
      netWorth: 25,
      peakNetWorth: 50,
      unlockedEmpireIds: ['influence'],
      exitCountsByEmpire: { influence: 3 },
    };
    storage.setItem(GRIFT_META_STORAGE_KEY, JSON.stringify(meta));
    storage.setItem(GRIFT_RUN_STORAGE_KEY, JSON.stringify({
      version: 3,
      savedAt: 4_000,
      empireId: 'influence',
      selectedHustleId: 'unknown-hustle',
      state: {
        ...initial,
        valuation: -20,
        peakValuation: -10,
        netWorth: 5,
        peakNetWorth: 10,
        rugPullCount: 1,
        leveragePurchases: ['unknown-leverage'],
        hustles: {
          ...initial.hustles,
          'online-rage-farm': {
            ...initial.hustles['online-rage-farm'],
            scaleCount: -3,
            reachedMilestones: ['unknown-milestone'],
          },
        },
      },
    }));
    const persistence = new GriftPersistence(storage, INFLUENCE_ENGINE_MECHANICS);
    const restored = persistence.loadRun(persistence.loadMeta());

    expect(restored?.selectedHustleId).toBe('online-rage-farm');
    expect(restored?.state.valuation).toBe(0);
    expect(restored?.state.peakValuation).toBe(0);
    expect(restored?.state.netWorth).toBe(5);
    expect(restored?.state.peakNetWorth).toBe(50);
    expect(restored?.state.rugPullCount).toBe(3);
    expect(restored?.state.leveragePurchases).toEqual([]);
    expect(restored?.state.hustles['online-rage-farm'].scaleCount).toBe(0);
    expect(restored?.state.hustles['online-rage-farm'].reachedMilestones).toEqual([]);
  });

  it('fails safely when every save version is corrupt or storage is unavailable', () => {
    const storage = new MemoryStorage();
    for (const key of [
      GRIFT_META_STORAGE_KEY,
      GRIFT_RUN_STORAGE_KEY,
      LEGACY_GRIFT_META_V2_STORAGE_KEY,
      LEGACY_GRIFT_RUN_V2_STORAGE_KEY,
      LEGACY_GRIFT_META_STORAGE_KEY,
      LEGACY_GRIFT_RUN_STORAGE_KEY,
    ]) {
      storage.setItem(key, '{bad json');
    }
    const persistence = new GriftPersistence(storage, INFLUENCE_ENGINE_MECHANICS);
    const emptyMeta: GriftMetaSaveV3 = {
      version: 3,
      netWorth: 0,
      peakNetWorth: 0,
      unlockedEmpireIds: ['influence'],
      exitCountsByEmpire: { influence: 0 },
    };

    expect(persistence.loadMeta()).toEqual(emptyMeta);
    expect(persistence.loadRun(emptyMeta)).toBeNull();
    expect(new GriftPersistence(null, INFLUENCE_ENGINE_MECHANICS).loadRun(emptyMeta)).toBeNull();
  });
});

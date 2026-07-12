import { createInitialGameState } from '../game-engine/economy';
import { GameMechanics } from '../game-engine/mechanics';
import { GriftOsGameState, HustleId, LeverageId } from '../game-engine/types';

export const GRIFT_META_STORAGE_KEY = 'grift-os-meta-v1';
export const GRIFT_RUN_STORAGE_KEY = 'grift-os-run-v1';

export interface GriftMetaSaveV1 {
  netWorth: number;
  rugPullCount: number;
}

export interface GriftRunSaveV1 {
  version: 1;
  savedAt: number;
  state: GriftOsGameState;
  selectedHustleId: HustleId;
}

export interface RuntimeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const RUN_SAVE_THROTTLE_MS = 2000;

export class GriftV1Persistence {
  private lastRunSaveAt = 0;

  constructor(
    private readonly storage: RuntimeStorage | null,
    private readonly mechanics: GameMechanics,
    private readonly now: () => number = Date.now
  ) {}

  loadMeta(): GriftMetaSaveV1 {
    if (!this.storage) {
      return emptyMeta();
    }

    try {
      const rawMeta = this.storage.getItem(GRIFT_META_STORAGE_KEY);

      if (!rawMeta) {
        return emptyMeta();
      }

      const meta = JSON.parse(rawMeta) as Partial<GriftMetaSaveV1>;
      return {
        netWorth: Math.max(0, finiteNumber(meta.netWorth, 0)),
        rugPullCount: Math.max(0, Math.floor(finiteNumber(meta.rugPullCount, 0))),
      };
    } catch {
      return emptyMeta();
    }
  }

  loadRun(savedMeta: GriftMetaSaveV1): GriftRunSaveV1 | null {
    if (!this.storage) {
      return null;
    }

    try {
      const rawSave = this.storage.getItem(GRIFT_RUN_STORAGE_KEY);

      if (!rawSave) {
        return null;
      }

      const parsed = JSON.parse(rawSave) as Partial<GriftRunSaveV1>;

      if (parsed.version !== 1 || !parsed.state) {
        return null;
      }

      return {
        version: 1,
        savedAt: Number.isFinite(parsed.savedAt) ? Number(parsed.savedAt) : this.now(),
        selectedHustleId: this.isKnownHustleId(parsed.selectedHustleId)
          ? parsed.selectedHustleId
          : this.mechanics[0].id,
        state: this.reconcileState(parsed.state, savedMeta),
      };
    } catch {
      return null;
    }
  }

  saveRun(state: GriftOsGameState, selectedHustleId: HustleId, force = false): void {
    if (!this.storage) {
      return;
    }

    const savedAt = this.now();

    if (!force && savedAt - this.lastRunSaveAt < RUN_SAVE_THROTTLE_MS) {
      return;
    }

    try {
      const save: GriftRunSaveV1 = {
        version: 1,
        savedAt,
        state,
        selectedHustleId,
      };
      this.storage.setItem(GRIFT_RUN_STORAGE_KEY, JSON.stringify(save));
      this.lastRunSaveAt = savedAt;
    } catch {
      // Local run persistence is non-critical for the active simulation.
    }
  }

  saveMeta(state: Pick<GriftOsGameState, 'netWorth' | 'rugPullCount'>): void {
    if (!this.storage) {
      return;
    }

    try {
      const meta: GriftMetaSaveV1 = {
        netWorth: state.netWorth,
        rugPullCount: state.rugPullCount,
      };
      this.storage.setItem(GRIFT_META_STORAGE_KEY, JSON.stringify(meta));
    } catch {
      // Meta persistence is local-only and non-critical for the running simulation.
    }
  }

  private reconcileState(
    savedState: Partial<GriftOsGameState>,
    savedMeta: GriftMetaSaveV1
  ): GriftOsGameState {
    const netWorth = Math.max(
      0,
      finiteNumber(savedState.netWorth, savedMeta.netWorth),
      savedMeta.netWorth
    );
    const rugPullCount = Math.max(
      0,
      Math.floor(finiteNumber(savedState.rugPullCount, savedMeta.rugPullCount)),
      savedMeta.rugPullCount
    );
    const initialState = createInitialGameState(this.mechanics, netWorth, rugPullCount);
    const valuation = Math.max(0, finiteNumber(savedState.valuation, initialState.valuation));
    const peakValuation = Math.max(valuation, finiteNumber(savedState.peakValuation, valuation));
    const validLeverageIds = new Set(this.mechanics.leverage.map((definition) => definition.id));
    const leveragePurchases = Array.isArray(savedState.leveragePurchases)
      ? savedState.leveragePurchases.filter((leverageId): leverageId is LeverageId =>
          typeof leverageId === 'string' && validLeverageIds.has(leverageId as LeverageId)
        )
      : [];
    const savedPreparation = savedState.founderTakePreparation;
    const completedFounderTakeStages = Math.min(
      this.mechanics.founderTake.stages.length,
      Math.max(0, Math.floor(finiteNumber(savedPreparation?.completedStages, 0)))
    );
    const activeFounderTakeStage = this.mechanics.founderTake.stages[completedFounderTakeStages];
    const isFounderTakePreparationActive = Boolean(savedPreparation?.isActive && activeFounderTakeStage);
    const founderTakeProgressMs = isFounderTakePreparationActive
      ? Math.min(
          activeFounderTakeStage.durationMs,
          Math.max(0, finiteNumber(savedPreparation?.progressMs, 0))
        )
      : 0;
    const hustles = Object.fromEntries(
      this.mechanics.map((definition) => {
        const fallback = initialState.hustles[definition.id];
        const savedHustle = savedState.hustles?.[definition.id];
        const validMilestones = new Set(definition.milestones.map((milestone) => milestone.id));

        return [
          definition.id,
          {
            ...fallback,
            units: Math.max(0, Math.floor(finiteNumber(savedHustle?.units, fallback.units))),
            isActive: Boolean(savedHustle?.isActive),
            isAutomated: Boolean(savedHustle?.isAutomated),
            progressMs: Math.max(0, finiteNumber(savedHustle?.progressMs, 0)),
            reachedMilestones: Array.isArray(savedHustle?.reachedMilestones)
              ? savedHustle.reachedMilestones.filter((milestoneId): milestoneId is string =>
                  typeof milestoneId === 'string' && validMilestones.has(milestoneId)
                )
              : [],
          },
        ];
      })
    ) as unknown as GriftOsGameState['hustles'];

    return {
      ...initialState,
      valuation,
      peakValuation,
      netWorth,
      rugPullCount,
      rugPullState: savedState.rugPullState ?? initialState.rugPullState,
      founderTakePreparation: {
        completedStages: completedFounderTakeStages,
        isActive: isFounderTakePreparationActive,
        progressMs: founderTakeProgressMs,
      },
      leveragePurchases,
      hustles,
    };
  }

  private isKnownHustleId(value: unknown): value is HustleId {
    return typeof value === 'string' && this.mechanics.some((definition) => definition.id === value);
  }
}

function emptyMeta(): GriftMetaSaveV1 {
  return { netWorth: 0, rugPullCount: 0 };
}

function finiteNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

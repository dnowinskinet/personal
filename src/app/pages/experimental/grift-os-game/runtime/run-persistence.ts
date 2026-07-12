import { DEFAULT_EMPIRE_ID, EMPIRE_IDS, EmpireId, isEmpireId } from '../empire-id';
import { createInitialGameState } from '../game-engine/economy';
import { GameMechanics } from '../game-engine/mechanics';
import { GriftOsGameState, HustleId, LeverageId } from '../game-engine/types';

export const LEGACY_GRIFT_META_STORAGE_KEY = 'grift-os-meta-v1';
export const LEGACY_GRIFT_RUN_STORAGE_KEY = 'grift-os-run-v1';
export const GRIFT_META_STORAGE_KEY = 'grift-os-meta-v2';
export const GRIFT_RUN_STORAGE_KEY = 'grift-os-run-v2';

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

export type ExitCountsByEmpire = Record<EmpireId, number>;

export interface GriftMetaSaveV2 {
  version: 2;
  netWorth: number;
  unlockedEmpireIds: readonly EmpireId[];
  exitCountsByEmpire: ExitCountsByEmpire;
}

export interface GriftRunSaveV2 {
  version: 2;
  savedAt: number;
  empireId: EmpireId;
  state: GriftOsGameState;
  selectedHustleId: HustleId;
}

export interface RuntimeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const RUN_SAVE_THROTTLE_MS = 2000;

export class GriftPersistence {
  private lastRunSaveAt = 0;
  private currentMeta: GriftMetaSaveV2;

  constructor(
    private readonly storage: RuntimeStorage | null,
    private readonly mechanics: GameMechanics,
    private readonly activeEmpireId: EmpireId = DEFAULT_EMPIRE_ID,
    private readonly now: () => number = Date.now
  ) {
    this.currentMeta = emptyMeta(activeEmpireId);
  }

  loadMeta(): GriftMetaSaveV2 {
    if (!this.storage) {
      return this.currentMeta;
    }

    const v2 = this.readV2Meta();
    if (v2) {
      this.currentMeta = v2;
      return v2;
    }

    const migrated = migrateV1Meta(this.readV1Meta(), this.activeEmpireId);
    this.currentMeta = migrated;
    this.writeV2Meta(migrated);
    return migrated;
  }

  loadRun(savedMeta: GriftMetaSaveV2): GriftRunSaveV2 | null {
    if (!this.storage) {
      return null;
    }

    const v2 = this.readV2Run(savedMeta);
    if (v2) {
      return v2;
    }

    if (this.activeEmpireId !== 'influence') {
      return null;
    }

    const legacy = this.readV1Run(savedMeta);
    if (!legacy) {
      return null;
    }

    const migrated: GriftRunSaveV2 = {
      version: 2,
      savedAt: legacy.savedAt,
      empireId: this.activeEmpireId,
      state: legacy.state,
      selectedHustleId: legacy.selectedHustleId,
    };
    this.writeV2Run(migrated);
    return migrated;
  }

  saveRun(state: GriftOsGameState, selectedHustleId: HustleId, force = false): void {
    if (!this.storage) {
      return;
    }

    const savedAt = this.now();
    if (!force && savedAt - this.lastRunSaveAt < RUN_SAVE_THROTTLE_MS) {
      return;
    }

    const save: GriftRunSaveV2 = {
      version: 2,
      savedAt,
      empireId: this.activeEmpireId,
      state,
      selectedHustleId,
    };

    if (this.writeV2Run(save)) {
      this.writeLegacyRunMirror(save);
      this.lastRunSaveAt = savedAt;
    }
  }

  saveMeta(state: Pick<GriftOsGameState, 'netWorth' | 'rugPullCount'>): void {
    if (!this.storage) {
      return;
    }

    const meta: GriftMetaSaveV2 = {
      version: 2,
      netWorth: Math.max(0, finiteNumber(state.netWorth, 0)),
      unlockedEmpireIds: uniqueEmpireIds([
        ...this.currentMeta.unlockedEmpireIds,
        this.activeEmpireId,
      ]),
      exitCountsByEmpire: {
        ...this.currentMeta.exitCountsByEmpire,
        [this.activeEmpireId]: Math.max(
          0,
          Math.floor(finiteNumber(state.rugPullCount, 0))
        ),
      },
    };

    if (this.writeV2Meta(meta)) {
      this.currentMeta = meta;
      this.writeLegacyMetaMirror(meta);
    }
  }

  private readV2Meta(): GriftMetaSaveV2 | null {
    try {
      const rawMeta = this.storage?.getItem(GRIFT_META_STORAGE_KEY);
      if (!rawMeta) {
        return null;
      }

      const parsed = JSON.parse(rawMeta) as Partial<GriftMetaSaveV2>;
      if (parsed.version !== 2) {
        return null;
      }

      const unlockedEmpireIds = uniqueEmpireIds([
        ...(Array.isArray(parsed.unlockedEmpireIds)
          ? parsed.unlockedEmpireIds.filter(isEmpireId)
          : []),
        this.activeEmpireId,
      ]);
      const exitCountsByEmpire = emptyExitCounts();
      for (const empireId of EMPIRE_IDS) {
        exitCountsByEmpire[empireId] = Math.max(
          0,
          Math.floor(finiteNumber(parsed.exitCountsByEmpire?.[empireId], 0))
        );
      }

      return {
        version: 2,
        netWorth: Math.max(0, finiteNumber(parsed.netWorth, 0)),
        unlockedEmpireIds,
        exitCountsByEmpire,
      };
    } catch {
      return null;
    }
  }

  private readV1Meta(): GriftMetaSaveV1 | null {
    try {
      const rawMeta = this.storage?.getItem(LEGACY_GRIFT_META_STORAGE_KEY);
      if (!rawMeta) {
        return null;
      }

      const parsed = JSON.parse(rawMeta) as Partial<GriftMetaSaveV1>;
      return {
        netWorth: Math.max(0, finiteNumber(parsed.netWorth, 0)),
        rugPullCount: Math.max(0, Math.floor(finiteNumber(parsed.rugPullCount, 0))),
      };
    } catch {
      return null;
    }
  }

  private readV2Run(savedMeta: GriftMetaSaveV2): GriftRunSaveV2 | null {
    try {
      const rawSave = this.storage?.getItem(GRIFT_RUN_STORAGE_KEY);
      if (!rawSave) {
        return null;
      }

      const parsed = JSON.parse(rawSave) as Partial<GriftRunSaveV2>;
      if (
        parsed.version !== 2 ||
        parsed.empireId !== this.activeEmpireId ||
        !parsed.state
      ) {
        return null;
      }

      return {
        version: 2,
        savedAt: Number.isFinite(parsed.savedAt) ? Number(parsed.savedAt) : this.now(),
        empireId: this.activeEmpireId,
        selectedHustleId: this.isKnownHustleId(parsed.selectedHustleId)
          ? parsed.selectedHustleId
          : this.mechanics[0].id,
        state: this.reconcileState(parsed.state, savedMeta),
      };
    } catch {
      return null;
    }
  }

  private readV1Run(savedMeta: GriftMetaSaveV2): GriftRunSaveV1 | null {
    try {
      const rawSave = this.storage?.getItem(LEGACY_GRIFT_RUN_STORAGE_KEY);
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

  private writeV2Meta(meta: GriftMetaSaveV2): boolean {
    try {
      this.storage?.setItem(GRIFT_META_STORAGE_KEY, JSON.stringify(meta));
      return Boolean(this.storage);
    } catch {
      return false;
    }
  }

  private writeV2Run(save: GriftRunSaveV2): boolean {
    try {
      this.storage?.setItem(GRIFT_RUN_STORAGE_KEY, JSON.stringify(save));
      return Boolean(this.storage);
    } catch {
      return false;
    }
  }

  private writeLegacyMetaMirror(meta: GriftMetaSaveV2): void {
    if (this.activeEmpireId !== 'influence') {
      return;
    }

    try {
      const legacy: GriftMetaSaveV1 = {
        netWorth: meta.netWorth,
        rugPullCount: meta.exitCountsByEmpire.influence,
      };
      this.storage?.setItem(LEGACY_GRIFT_META_STORAGE_KEY, JSON.stringify(legacy));
    } catch {
      // The v2 save is authoritative; the rollback mirror is best effort only.
    }
  }

  private writeLegacyRunMirror(save: GriftRunSaveV2): void {
    if (save.empireId !== 'influence') {
      return;
    }

    try {
      const legacy: GriftRunSaveV1 = {
        version: 1,
        savedAt: save.savedAt,
        state: save.state,
        selectedHustleId: save.selectedHustleId,
      };
      this.storage?.setItem(LEGACY_GRIFT_RUN_STORAGE_KEY, JSON.stringify(legacy));
    } catch {
      // The v2 save is authoritative; the rollback mirror is best effort only.
    }
  }

  private reconcileState(
    savedState: Partial<GriftOsGameState>,
    savedMeta: GriftMetaSaveV2
  ): GriftOsGameState {
    const exitCount = savedMeta.exitCountsByEmpire[this.activeEmpireId];
    const netWorth = Math.max(
      0,
      finiteNumber(savedState.netWorth, savedMeta.netWorth),
      savedMeta.netWorth
    );
    const rugPullCount = Math.max(
      0,
      Math.floor(finiteNumber(savedState.rugPullCount, exitCount)),
      exitCount
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

function migrateV1Meta(
  legacy: GriftMetaSaveV1 | null,
  activeEmpireId: EmpireId
): GriftMetaSaveV2 {
  const meta = emptyMeta(activeEmpireId);
  if (!legacy) {
    return meta;
  }

  return {
    ...meta,
    netWorth: legacy.netWorth,
    exitCountsByEmpire: {
      ...meta.exitCountsByEmpire,
      influence: legacy.rugPullCount,
    },
  };
}

function emptyMeta(activeEmpireId: EmpireId): GriftMetaSaveV2 {
  return {
    version: 2,
    netWorth: 0,
    unlockedEmpireIds: [activeEmpireId],
    exitCountsByEmpire: emptyExitCounts(),
  };
}

function emptyExitCounts(): ExitCountsByEmpire {
  return Object.fromEntries(EMPIRE_IDS.map((empireId) => [empireId, 0])) as ExitCountsByEmpire;
}

function uniqueEmpireIds(values: readonly EmpireId[]): readonly EmpireId[] {
  return [...new Set(values)];
}

function finiteNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

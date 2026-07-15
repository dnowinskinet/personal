import { DEFAULT_EMPIRE_ID, EMPIRE_IDS, EmpireId, isEmpireId } from '../empire-id';
import { createInitialGameState } from '../game-engine/economy';
import { GameMechanics } from '../game-engine/mechanics';
import { GriftOsGameState, HustleId, LeverageId } from '../game-engine/types';

export const LEGACY_GRIFT_META_STORAGE_KEY = 'grift-os-meta-v1';
export const LEGACY_GRIFT_RUN_STORAGE_KEY = 'grift-os-run-v1';
export const LEGACY_GRIFT_META_V2_STORAGE_KEY = 'grift-os-meta-v2';
export const LEGACY_GRIFT_RUN_V2_STORAGE_KEY = 'grift-os-run-v2';
export const GRIFT_META_STORAGE_KEY = 'grift-os-meta-v3';
export const GRIFT_RUN_STORAGE_KEY = 'grift-os-run-v3';

export interface GriftMetaSaveV1 {
  netWorth: number;
  rugPullCount: number;
}

export type ExitCountsByEmpire = Record<EmpireId, number>;

export interface GriftMetaSaveV2 {
  version: 2;
  netWorth: number;
  unlockedEmpireIds: readonly EmpireId[];
  exitCountsByEmpire: ExitCountsByEmpire;
}

export interface GriftMetaSaveV3 {
  version: 3;
  netWorth: number;
  peakNetWorth: number;
  unlockedEmpireIds: readonly EmpireId[];
  exitCountsByEmpire: ExitCountsByEmpire;
}

export interface GriftRunSaveV3 {
  version: 3;
  savedAt: number;
  empireId: EmpireId;
  state: GriftOsGameState;
  selectedHustleId: HustleId;
}

interface LegacyRunEnvelope {
  savedAt: number;
}

export interface RuntimeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const RUN_SAVE_THROTTLE_MS = 2000;

export class GriftPersistence {
  private lastRunSaveAt = 0;
  private currentMeta: GriftMetaSaveV3;

  constructor(
    private readonly storage: RuntimeStorage | null,
    private readonly mechanics: GameMechanics,
    private readonly activeEmpireId: EmpireId = DEFAULT_EMPIRE_ID,
    private readonly now: () => number = Date.now
  ) {
    this.currentMeta = emptyMeta(activeEmpireId);
  }

  loadMeta(): GriftMetaSaveV3 {
    if (!this.storage) {
      return this.currentMeta;
    }

    const current = this.readV3Meta();
    if (current) {
      this.currentMeta = current;
      return current;
    }

    const migrated = migrateLegacyMeta(
      this.readV2Meta(),
      this.readV1Meta(),
      this.activeEmpireId
    );
    this.currentMeta = migrated;
    this.writeV3Meta(migrated);
    return migrated;
  }

  loadRun(savedMeta: GriftMetaSaveV3): GriftRunSaveV3 | null {
    if (!this.storage) {
      return null;
    }

    const current = this.readV3Run(savedMeta);
    if (current) {
      return current;
    }

    const legacy = this.readLegacyRunEnvelope();
    if (!legacy || this.activeEmpireId !== 'influence') {
      return null;
    }

    // The ten-ID run cannot be translated coherently into the rebuilt twelve-slot
    // economy. Preserve persistent wealth/history and start a clean compatible run.
    const exitCount = savedMeta.exitCountsByEmpire[this.activeEmpireId];
    const migrated: GriftRunSaveV3 = {
      version: 3,
      savedAt: legacy.savedAt,
      empireId: this.activeEmpireId,
      state: createInitialGameState(
        this.mechanics,
        savedMeta.netWorth,
        exitCount,
        savedMeta.peakNetWorth
      ),
      selectedHustleId: this.mechanics[0].id,
    };
    this.writeV3Run(migrated);
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

    const save: GriftRunSaveV3 = {
      version: 3,
      savedAt,
      empireId: this.activeEmpireId,
      state,
      selectedHustleId,
    };

    if (this.writeV3Run(save)) {
      this.lastRunSaveAt = savedAt;
    }
  }

  saveMeta(state: Pick<GriftOsGameState, 'netWorth' | 'peakNetWorth' | 'rugPullCount'>): void {
    if (!this.storage) {
      return;
    }

    const netWorth = Math.max(0, finiteNumber(state.netWorth, 0));
    const meta: GriftMetaSaveV3 = {
      version: 3,
      netWorth,
      peakNetWorth: Math.max(netWorth, finiteNumber(state.peakNetWorth, netWorth)),
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

    if (this.writeV3Meta(meta)) {
      this.currentMeta = meta;
    }
  }

  private readV3Meta(): GriftMetaSaveV3 | null {
    try {
      const rawMeta = this.storage?.getItem(GRIFT_META_STORAGE_KEY);
      if (!rawMeta) return null;

      const parsed = JSON.parse(rawMeta) as Partial<GriftMetaSaveV3>;
      if (parsed.version !== 3) return null;

      const netWorth = Math.max(0, finiteNumber(parsed.netWorth, 0));
      return {
        version: 3,
        netWorth,
        peakNetWorth: Math.max(netWorth, finiteNumber(parsed.peakNetWorth, netWorth)),
        unlockedEmpireIds: normalizedUnlockedIds(parsed.unlockedEmpireIds, this.activeEmpireId),
        exitCountsByEmpire: normalizedExitCounts(parsed.exitCountsByEmpire),
      };
    } catch {
      return null;
    }
  }

  private readV2Meta(): GriftMetaSaveV2 | null {
    try {
      const rawMeta = this.storage?.getItem(LEGACY_GRIFT_META_V2_STORAGE_KEY);
      if (!rawMeta) return null;

      const parsed = JSON.parse(rawMeta) as Partial<GriftMetaSaveV2>;
      if (parsed.version !== 2) return null;

      return {
        version: 2,
        netWorth: Math.max(0, finiteNumber(parsed.netWorth, 0)),
        unlockedEmpireIds: normalizedUnlockedIds(parsed.unlockedEmpireIds, this.activeEmpireId),
        exitCountsByEmpire: normalizedExitCounts(parsed.exitCountsByEmpire),
      };
    } catch {
      return null;
    }
  }

  private readV1Meta(): GriftMetaSaveV1 | null {
    try {
      const rawMeta = this.storage?.getItem(LEGACY_GRIFT_META_STORAGE_KEY);
      if (!rawMeta) return null;

      const parsed = JSON.parse(rawMeta) as Partial<GriftMetaSaveV1>;
      return {
        netWorth: Math.max(0, finiteNumber(parsed.netWorth, 0)),
        rugPullCount: Math.max(0, Math.floor(finiteNumber(parsed.rugPullCount, 0))),
      };
    } catch {
      return null;
    }
  }

  private readV3Run(savedMeta: GriftMetaSaveV3): GriftRunSaveV3 | null {
    try {
      const rawSave = this.storage?.getItem(GRIFT_RUN_STORAGE_KEY);
      if (!rawSave) return null;

      const parsed = JSON.parse(rawSave) as Partial<GriftRunSaveV3>;
      if (parsed.version !== 3 || parsed.empireId !== this.activeEmpireId || !parsed.state) {
        return null;
      }

      return {
        version: 3,
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

  private readLegacyRunEnvelope(): LegacyRunEnvelope | null {
    for (const key of [LEGACY_GRIFT_RUN_V2_STORAGE_KEY, LEGACY_GRIFT_RUN_STORAGE_KEY]) {
      try {
        const rawSave = this.storage?.getItem(key);
        if (!rawSave) continue;

        const parsed = JSON.parse(rawSave) as { savedAt?: unknown; state?: unknown };
        if (!parsed.state) continue;

        return {
          savedAt: Number.isFinite(parsed.savedAt) ? Number(parsed.savedAt) : this.now(),
        };
      } catch {
        // Try the next rollback-safe legacy record.
      }
    }

    return null;
  }

  private writeV3Meta(meta: GriftMetaSaveV3): boolean {
    try {
      this.storage?.setItem(GRIFT_META_STORAGE_KEY, JSON.stringify(meta));
      return Boolean(this.storage);
    } catch {
      return false;
    }
  }

  private writeV3Run(save: GriftRunSaveV3): boolean {
    try {
      this.storage?.setItem(GRIFT_RUN_STORAGE_KEY, JSON.stringify(save));
      return Boolean(this.storage);
    } catch {
      return false;
    }
  }

  private reconcileState(
    savedState: Partial<GriftOsGameState>,
    savedMeta: GriftMetaSaveV3
  ): GriftOsGameState {
    const exitCount = savedMeta.exitCountsByEmpire[this.activeEmpireId];
    const netWorth = Math.max(0, finiteNumber(savedState.netWorth, savedMeta.netWorth));
    const peakNetWorth = Math.max(
      netWorth,
      savedMeta.peakNetWorth,
      finiteNumber(savedState.peakNetWorth, savedMeta.peakNetWorth)
    );
    const rugPullCount = Math.max(
      0,
      Math.floor(finiteNumber(savedState.rugPullCount, exitCount)),
      exitCount
    );
    const initialState = createInitialGameState(
      this.mechanics,
      netWorth,
      rugPullCount,
      peakNetWorth
    );
    const valuation = Math.max(0, finiteNumber(savedState.valuation, initialState.valuation));
    const peakValuation = Math.max(valuation, finiteNumber(savedState.peakValuation, valuation));
    const validLeverageIds = new Set(this.mechanics.leverage.map((definition) => definition.id));
    const leveragePurchases = Array.isArray(savedState.leveragePurchases)
      ? savedState.leveragePurchases.filter((leverageId): leverageId is LeverageId =>
          typeof leverageId === 'string' && validLeverageIds.has(leverageId as LeverageId)
        )
      : [];
    const savedPreparation = savedState.extractionPreparation;
    const completedExtractionStages = Math.min(
      this.mechanics.extraction.stages.length,
      Math.max(0, Math.floor(finiteNumber(savedPreparation?.completedStages, 0)))
    );
    const activeExtractionStage = this.mechanics.extraction.stages[completedExtractionStages];
    const isExtractionPreparationActive = Boolean(savedPreparation?.isActive && activeExtractionStage);
    const extractionProgressMs = isExtractionPreparationActive
      ? Math.min(
          activeExtractionStage.durationMs,
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
            scaleCount: Math.max(
              0,
              Math.floor(finiteNumber(savedHustle?.scaleCount, fallback.scaleCount))
            ),
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
      peakNetWorth,
      rugPullCount,
      rugPullState: savedState.rugPullState ?? initialState.rugPullState,
      extractionPreparation: {
        completedStages: completedExtractionStages,
        isActive: isExtractionPreparationActive,
        progressMs: extractionProgressMs,
      },
      leveragePurchases,
      hustles,
    };
  }

  private isKnownHustleId(value: unknown): value is HustleId {
    return typeof value === 'string' && this.mechanics.some((definition) => definition.id === value);
  }
}

function migrateLegacyMeta(
  legacyV2: GriftMetaSaveV2 | null,
  legacyV1: GriftMetaSaveV1 | null,
  activeEmpireId: EmpireId
): GriftMetaSaveV3 {
  if (legacyV2) {
    const netWorth = Math.max(0, legacyV2.netWorth);
    return {
      version: 3,
      netWorth,
      peakNetWorth: netWorth,
      unlockedEmpireIds: uniqueEmpireIds([...legacyV2.unlockedEmpireIds, activeEmpireId]),
      exitCountsByEmpire: normalizedExitCounts(legacyV2.exitCountsByEmpire),
    };
  }

  const meta = emptyMeta(activeEmpireId);
  if (!legacyV1) return meta;

  return {
    ...meta,
    netWorth: legacyV1.netWorth,
    peakNetWorth: legacyV1.netWorth,
    exitCountsByEmpire: {
      ...meta.exitCountsByEmpire,
      influence: legacyV1.rugPullCount,
    },
  };
}

function emptyMeta(activeEmpireId: EmpireId): GriftMetaSaveV3 {
  return {
    version: 3,
    netWorth: 0,
    peakNetWorth: 0,
    unlockedEmpireIds: [activeEmpireId],
    exitCountsByEmpire: emptyExitCounts(),
  };
}

function normalizedUnlockedIds(value: unknown, activeEmpireId: EmpireId): readonly EmpireId[] {
  return uniqueEmpireIds([
    ...(Array.isArray(value) ? value.filter(isEmpireId) : []),
    activeEmpireId,
  ]);
}

function normalizedExitCounts(value: Partial<ExitCountsByEmpire> | undefined): ExitCountsByEmpire {
  const counts = emptyExitCounts();
  for (const empireId of EMPIRE_IDS) {
    counts[empireId] = Math.max(
      0,
      Math.floor(finiteNumber(value?.[empireId], 0))
    );
  }
  return counts;
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

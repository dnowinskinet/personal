import { nextHustleCost, valuationPerSecond } from '../game-engine/economy';
import { createRugPullPreview } from '../content/rug-pull-preview';
import { GameMechanics } from '../game-engine/mechanics';
import { GriftOsGameState, HustleDefinition, HustleId, LeverageId } from '../game-engine/types';

export const PLAYTEST_SCHEMA_VERSION = 2;
export const GRIFT_OS_PLAYTEST_BUILD_ID = 'grift-os-modernization-playtest';
export const DEFAULT_SNAPSHOT_INTERVAL_MS = 10_000;
export const PLAYTEST_STORAGE_KEY = 'grift-os-playtest-session-v2';

export type PlaytestEventType =
  | 'session_started'
  | 'session_reset'
  | 'session_export_requested'
  | 'new_run_started'
  | 'manual_action_started'
  | 'manual_action_completed'
  | 'automated_cycle_completed'
  | 'hustle_acquired'
  | 'hustle_expanded'
  | 'buy_max_purchase'
  | 'hustle_affordable'
  | 'automation_affordable'
  | 'automation_activated'
  | 'leverage_purchased'
  | 'milestone_reached'
  | 'rug_pull_available'
  | 'rug_pull_preview_opened'
  | 'rug_pull_committed'
  | 'economy_snapshot';

export interface PlaytestHustleSnapshot {
  units: number;
  isActive: boolean;
  isAutomated: boolean;
  progressMs: number;
  reachedMilestones: readonly string[];
}

export interface PlaytestEconomySnapshot {
  valuation: number;
  peakValuation: number;
  netWorth: number;
  valuationPerSecond: number;
  rugPullAvailable: boolean;
  hustles: Record<HustleId, PlaytestHustleSnapshot>;
}

export interface PlaytestEvent {
  id: string;
  type: PlaytestEventType;
  timestampIso: string;
  elapsedMs: number;
  hustleId?: HustleId;
  hustleName?: string;
  automationName?: string;
  milestoneId?: string;
  milestoneName?: string;
  leverageId?: LeverageId;
  quantityPurchased?: number;
  resultingUnits?: number;
  valuationBefore?: number;
  valuationAfter?: number;
  netWorthBefore?: number;
  netWorthAfter?: number;
  netWorthGain?: number;
  totalCost?: number;
  payout?: number;
  snapshot?: PlaytestEconomySnapshot;
}

export interface PlaytestSession {
  schemaVersion: number;
  gameId: 'grift-os';
  buildId: string;
  sessionId: string;
  startedAtIso: string;
  startedAtMs: number;
  snapshotIntervalMs: number;
  lastSnapshotElapsedMs: number;
  events: PlaytestEvent[];
}

export interface PlaytestTuningHustle {
  id: HustleId;
  name: string;
  unitSingular: string;
  unitPlural: string;
  acquisitionCost: number;
  growthRate: number;
  basePayout: number;
  cadenceSeconds: number;
  automationName: string;
  automationCost: number;
  initialUnits: number;
  milestones: readonly {
    id: string;
    requiredUnits: number;
    rewardLabel: string;
  }[];
}

export interface PlaytestExport {
  schemaVersion: number;
  gameId: 'grift-os';
  buildId: string;
  sessionId: string;
  sessionStartedAt: string;
  exportedAt: string;
  totalElapsedMs: number;
  tuning: {
    snapshotIntervalMs: number;
    hustles: PlaytestTuningHustle[];
  };
  events: PlaytestEvent[];
  summary: PlaytestSummaryMetrics;
}

export interface PlaytestSummaryMetrics {
  totalElapsedMs: number;
  timeToFirstPayoutMs: number | null;
  timeToFirstExpansionMs: number | null;
  manualActionsBeforeFirstExpansion: number;
  timeToHustle2Ms: number | null;
  timeToFirstAutomationMs: number | null;
  manualActionsBeforeFirstAutomation: number;
  timeToFirstMilestoneMs: number | null;
  timeToHustle3Ms: number | null;
  timeToHustle4Ms: number | null;
  timeRugPullAvailableMs: number | null;
  timeRugPullUsedMs: number | null;
  netWorthGain: number;
  buyMaxUses: number;
  finalUnits: Record<HustleId, number>;
  automationStates: Partial<Record<HustleId, boolean>>;
  eventCount: number;
  snapshotCount: number;
  longestIntervalWithoutPlayerInputMs: number;
}

const HUSTLE_2_ID: HustleId = 'podcast-network';
const HUSTLE_3_ID: HustleId = 'culture-war-media';
const HUSTLE_4_ID: HustleId = 'masterclass-business';

const PLAYER_INPUT_EVENT_TYPES = new Set<PlaytestEventType>([
  'manual_action_started',
  'hustle_acquired',
  'hustle_expanded',
  'buy_max_purchase',
  'automation_activated',
  'leverage_purchased',
  'rug_pull_preview_opened',
  'rug_pull_committed',
  'session_reset',
]);

export function createPlaytestSession(
  nowMs = Date.now(),
  sessionId = createSessionId(nowMs),
  snapshotIntervalMs = DEFAULT_SNAPSHOT_INTERVAL_MS
): PlaytestSession {
  const startedAtIso = new Date(nowMs).toISOString();
  const session: PlaytestSession = {
    schemaVersion: PLAYTEST_SCHEMA_VERSION,
    gameId: 'grift-os',
    buildId: GRIFT_OS_PLAYTEST_BUILD_ID,
    sessionId,
    startedAtIso,
    startedAtMs: nowMs,
    snapshotIntervalMs,
    lastSnapshotElapsedMs: 0,
    events: [],
  };

  return appendPlaytestEvent(session, 'session_started', {}, nowMs);
}

export function appendPlaytestEvent(
  session: PlaytestSession,
  type: PlaytestEventType,
  details: Partial<Omit<PlaytestEvent, 'id' | 'type' | 'timestampIso' | 'elapsedMs'>> = {},
  nowMs = Date.now()
): PlaytestSession {
  const elapsedMs = elapsedForSession(session, nowMs);
  const event: PlaytestEvent = {
    id: `${session.sessionId}-${session.events.length + 1}`,
    type,
    timestampIso: new Date(session.startedAtMs + elapsedMs).toISOString(),
    elapsedMs,
    ...details,
  };

  return {
    ...session,
    events: [...session.events, event],
  };
}

export function recordManualActivation(
  session: PlaytestSession,
  definition: HustleDefinition,
  state: GriftOsGameState,
  nowMs = Date.now()
): PlaytestSession {
  const hustle = state.hustles[definition.id];

  return appendPlaytestEvent(
    session,
    'manual_action_started',
    {
      hustleId: definition.id,
      hustleName: definition.name,
      resultingUnits: hustle.units,
      valuationBefore: state.valuation,
      valuationAfter: state.valuation,
    },
    nowMs
  );
}

export function recordCycleCompleted(
  session: PlaytestSession,
  definition: HustleDefinition,
  payout: number,
  isAutomated: boolean,
  nowMs = Date.now()
): PlaytestSession {
  return appendPlaytestEvent(
    session,
    isAutomated ? 'automated_cycle_completed' : 'manual_action_completed',
    {
      hustleId: definition.id,
      hustleName: definition.name,
      automationName: isAutomated ? definition.automationName : undefined,
      payout,
    },
    nowMs
  );
}

export function recordHustlePurchase(
  session: PlaytestSession,
  definition: HustleDefinition,
  quantityPurchased: number,
  totalCost: number,
  resultingUnits: number,
  valuationBefore: number,
  valuationAfter: number,
  wasBuyMax: boolean,
  nowMs = Date.now()
): PlaytestSession {
  const eventType: PlaytestEventType =
    resultingUnits === quantityPurchased ? 'hustle_acquired' : 'hustle_expanded';
  let nextSession = appendPlaytestEvent(
    session,
    wasBuyMax ? 'buy_max_purchase' : eventType,
    {
      hustleId: definition.id,
      hustleName: definition.name,
      quantityPurchased,
      resultingUnits,
      valuationBefore,
      valuationAfter,
      totalCost,
    },
    nowMs
  );

  if (wasBuyMax) {
    nextSession = appendPlaytestEvent(
      nextSession,
      eventType,
      {
        hustleId: definition.id,
        hustleName: definition.name,
        quantityPurchased,
        resultingUnits,
        valuationBefore,
        valuationAfter,
        totalCost,
      },
      nowMs
    );
  }

  return nextSession;
}

export function recordAutomationPurchase(
  session: PlaytestSession,
  definition: HustleDefinition,
  totalCost: number,
  unitsAtPurchase: number,
  valuationBefore: number,
  valuationAfter: number,
  nowMs = Date.now()
): PlaytestSession {
  return appendPlaytestEvent(
    session,
    'automation_activated',
    {
      hustleId: definition.id,
      hustleName: definition.name,
      automationName: definition.automationName,
      resultingUnits: unitsAtPurchase,
      valuationBefore,
      valuationAfter,
      totalCost,
    },
    nowMs
  );
}

export function recordMilestoneReached(
  session: PlaytestSession,
  definition: HustleDefinition,
  milestoneId: string,
  nowMs = Date.now()
): PlaytestSession {
  const milestone = definition.milestones.find((candidate) => candidate.id === milestoneId);

  return appendPlaytestEvent(
    session,
    'milestone_reached',
    {
      hustleId: definition.id,
      hustleName: definition.name,
      milestoneId,
      milestoneName: milestone?.name,
    },
    nowMs
  );
}

export function recordRugPullCommit(
  session: PlaytestSession,
  valuationBefore: number,
  netWorthBefore: number,
  netWorthAfter: number,
  netWorthGain: number,
  nowMs = Date.now()
): PlaytestSession {
  return appendPlaytestEvent(
    session,
    'rug_pull_committed',
    {
      valuationBefore,
      valuationAfter: 0,
      netWorthBefore,
      netWorthAfter,
      netWorthGain,
    },
    nowMs
  );
}

export function recordDiscoveryEvents(
  session: PlaytestSession,
  state: GriftOsGameState,
  definitions: readonly HustleDefinition[],
  mechanics: GameMechanics,
  nowMs = Date.now()
): PlaytestSession {
  let nextSession = session;

  for (const definition of definitions) {
    const hustle = state.hustles[definition.id];

    if (
      hustle.units <= 0 &&
      state.valuation >= nextHustleCost(definition, 0, state, mechanics) &&
      !hasEvent(nextSession, 'hustle_affordable', (event) => event.hustleId === definition.id)
    ) {
      nextSession = appendPlaytestEvent(
        nextSession,
        'hustle_affordable',
        {
          hustleId: definition.id,
          hustleName: definition.name,
          valuationAfter: state.valuation,
          totalCost: nextHustleCost(definition, 0, state, mechanics),
        },
        nowMs
      );
    }

    if (
      hustle.units > 0 &&
      !hustle.isAutomated &&
      state.valuation >= definition.automationCost &&
      !hasEvent(nextSession, 'automation_affordable', (event) => event.hustleId === definition.id)
    ) {
      nextSession = appendPlaytestEvent(
        nextSession,
        'automation_affordable',
        {
          hustleId: definition.id,
          hustleName: definition.name,
          automationName: definition.automationName,
          resultingUnits: hustle.units,
          valuationAfter: state.valuation,
          totalCost: definition.automationCost,
        },
        nowMs
      );
    }
  }

  if (
    createRugPullPreview(state).isAvailable &&
    !hasEvent(nextSession, 'rug_pull_available')
  ) {
    nextSession = appendPlaytestEvent(
      nextSession,
      'rug_pull_available',
      {
        valuationAfter: state.valuation,
        netWorthGain: createRugPullPreview(state).projectedNetWorthGain,
      },
      nowMs
    );
  }

  return nextSession;
}

export function recordSnapshotIfDue(
  session: PlaytestSession,
  state: GriftOsGameState,
  definitions: readonly HustleDefinition[],
  mechanics: GameMechanics,
  nowMs = Date.now()
): PlaytestSession {
  const elapsedMs = elapsedForSession(session, nowMs);

  if (elapsedMs - session.lastSnapshotElapsedMs < session.snapshotIntervalMs) {
    return session;
  }

  const nextSession = appendPlaytestEvent(
    session,
    'economy_snapshot',
    {
      snapshot: createEconomySnapshot(state, definitions, mechanics),
    },
    nowMs
  );

  return {
    ...nextSession,
    lastSnapshotElapsedMs: nextSession.events[nextSession.events.length - 1].elapsedMs,
  };
}

export function createPlaytestExport(
  session: PlaytestSession,
  state: GriftOsGameState,
  definitions: readonly HustleDefinition[],
  nowMs = Date.now()
): PlaytestExport {
  return {
    schemaVersion: PLAYTEST_SCHEMA_VERSION,
    gameId: 'grift-os',
    buildId: session.buildId,
    sessionId: session.sessionId,
    sessionStartedAt: session.startedAtIso,
    exportedAt: new Date(session.startedAtMs + elapsedForSession(session, nowMs)).toISOString(),
    totalElapsedMs: elapsedForSession(session, nowMs),
    tuning: {
      snapshotIntervalMs: session.snapshotIntervalMs,
      hustles: definitions.map((definition) => ({
        id: definition.id,
        name: definition.name,
        unitSingular: definition.unitSingular,
        unitPlural: definition.unitPlural,
        acquisitionCost: definition.acquisitionCost,
        growthRate: definition.growthRate,
        basePayout: definition.basePayout,
        cadenceSeconds: definition.cadenceSeconds,
        automationName: definition.automationName,
        automationCost: definition.automationCost,
        initialUnits: definition.initialUnits,
        milestones: definition.milestones.map((milestone) => ({
          id: milestone.id,
          requiredUnits: milestone.requiredUnits,
          rewardLabel: milestone.reward.label,
        })),
      })),
    },
    events: session.events,
    summary: summarizePlaytestSession(session, state, definitions, nowMs),
  };
}

export function createPlaytestExportJson(
  session: PlaytestSession,
  state: GriftOsGameState,
  definitions: readonly HustleDefinition[],
  nowMs = Date.now()
): string {
  return JSON.stringify(createPlaytestExport(session, state, definitions, nowMs), null, 2);
}

export function summarizePlaytestSession(
  session: PlaytestSession,
  state: GriftOsGameState,
  definitions: readonly HustleDefinition[],
  nowMs = Date.now()
): PlaytestSummaryMetrics {
  const firstPayout = firstEvent(session, (event) =>
    event.type === 'manual_action_completed' || event.type === 'automated_cycle_completed'
  );
  const firstExpansion = firstEvent(session, (event) => event.type === 'hustle_expanded');
  const firstAutomation = firstEvent(session, (event) => event.type === 'automation_activated');
  const firstMilestone = firstEvent(session, (event) => event.type === 'milestone_reached');
  const hustle2 = firstEvent(session, (event) => event.type === 'hustle_acquired' && event.hustleId === HUSTLE_2_ID);
  const hustle3 = firstEvent(session, (event) => event.type === 'hustle_acquired' && event.hustleId === HUSTLE_3_ID);
  const hustle4 = firstEvent(session, (event) => event.type === 'hustle_acquired' && event.hustleId === HUSTLE_4_ID);
  const rugPullAvailable = firstEvent(session, (event) => event.type === 'rug_pull_available');
  const rugPullUsed = firstEvent(session, (event) => event.type === 'rug_pull_committed');
  const finalUnits = Object.fromEntries(
    definitions.map((definition) => [definition.id, state.hustles[definition.id].units])
  ) as Record<HustleId, number>;
  const automationStates = Object.fromEntries(
    definitions.map((definition) => [definition.id, state.hustles[definition.id].isAutomated])
  ) as Partial<Record<HustleId, boolean>>;

  return {
    totalElapsedMs: elapsedForSession(session, nowMs),
    timeToFirstPayoutMs: firstPayout?.elapsedMs ?? null,
    timeToFirstExpansionMs: firstExpansion?.elapsedMs ?? null,
    manualActionsBeforeFirstExpansion: countEventsBefore(session, 'manual_action_started', firstExpansion?.elapsedMs),
    timeToHustle2Ms: hustle2?.elapsedMs ?? null,
    timeToFirstAutomationMs: firstAutomation?.elapsedMs ?? null,
    manualActionsBeforeFirstAutomation: countEventsBefore(session, 'manual_action_started', firstAutomation?.elapsedMs),
    timeToFirstMilestoneMs: firstMilestone?.elapsedMs ?? null,
    timeToHustle3Ms: hustle3?.elapsedMs ?? null,
    timeToHustle4Ms: hustle4?.elapsedMs ?? null,
    timeRugPullAvailableMs: rugPullAvailable?.elapsedMs ?? null,
    timeRugPullUsedMs: rugPullUsed?.elapsedMs ?? null,
    netWorthGain: session.events.reduce((total, event) => total + (event.netWorthGain ?? 0), 0),
    buyMaxUses: session.events.filter((event) => event.type === 'buy_max_purchase').length,
    finalUnits,
    automationStates,
    eventCount: session.events.length,
    snapshotCount: session.events.filter((event) => event.type === 'economy_snapshot').length,
    longestIntervalWithoutPlayerInputMs: longestIntervalWithoutPlayerInput(session, nowMs),
  };
}

export function createHumanReadablePlaytestSummary(
  session: PlaytestSession,
  state: GriftOsGameState,
  definitions: readonly HustleDefinition[],
  nowMs = Date.now()
): string {
  const summary = summarizePlaytestSession(session, state, definitions, nowMs);
  const lines = [
    'GriftOS Playtest Summary',
    '',
    `Duration: ${formatDuration(summary.totalElapsedMs)}`,
    `First payout: ${formatNullableDuration(summary.timeToFirstPayoutMs)}`,
    `First expansion: ${formatNullableDuration(summary.timeToFirstExpansionMs)}`,
    `Hustle 2 acquired: ${formatNullableDuration(summary.timeToHustle2Ms)}`,
    `First automation: ${formatNullableDuration(summary.timeToFirstAutomationMs)}`,
    `First milestone: ${formatNullableDuration(summary.timeToFirstMilestoneMs)}`,
    `Rug Pull available: ${formatNullableDuration(summary.timeRugPullAvailableMs)}`,
    `Rug Pull used: ${formatNullableDuration(summary.timeRugPullUsedMs)}`,
    '',
    `Manual actions before first expansion: ${summary.manualActionsBeforeFirstExpansion}`,
    `Manual actions before first automation: ${summary.manualActionsBeforeFirstAutomation}`,
    `Buy Max uses: ${summary.buyMaxUses}`,
    `Net Worth gain: ${summary.netWorthGain}`,
    `Longest interval without player input: ${formatDuration(summary.longestIntervalWithoutPlayerInputMs)}`,
    '',
    'Final units:',
    ...definitions.map((definition) =>
      `${definition.name}: ${summary.finalUnits[definition.id]} ${unitLabel(definition, summary.finalUnits[definition.id])}`
    ),
    '',
    'Subjective note:',
    'Not recorded by instrumentation.',
  ];

  return lines.join('\n');
}

export function loadStoredPlaytestSession(storage: Storage): PlaytestSession | null {
  const rawSession = storage.getItem(PLAYTEST_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawSession) as PlaytestSession;

    if (
      parsed.schemaVersion !== PLAYTEST_SCHEMA_VERSION ||
      parsed.gameId !== 'grift-os' ||
      parsed.buildId !== GRIFT_OS_PLAYTEST_BUILD_ID ||
      !Array.isArray(parsed.events)
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function savePlaytestSession(storage: Storage, session: PlaytestSession): void {
  storage.setItem(PLAYTEST_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredPlaytestSessions(storage: Storage): void {
  storage.removeItem(PLAYTEST_STORAGE_KEY);
}

function createEconomySnapshot(
  state: GriftOsGameState,
  definitions: readonly HustleDefinition[],
  mechanics: GameMechanics
): PlaytestEconomySnapshot {
  const hustles = Object.fromEntries(
    definitions.map((definition) => {
      const hustle = state.hustles[definition.id];

      return [
        definition.id,
        {
          units: hustle.units,
          isActive: hustle.isActive,
          isAutomated: hustle.isAutomated,
          progressMs: hustle.progressMs,
          reachedMilestones: hustle.reachedMilestones,
        },
      ];
    })
  ) as Record<HustleId, PlaytestHustleSnapshot>;

  return {
    valuation: state.valuation,
    peakValuation: state.peakValuation,
    netWorth: state.netWorth,
    valuationPerSecond: valuationPerSecond(state, mechanics),
    rugPullAvailable: createRugPullPreview(state).isAvailable,
    hustles,
  };
}

function hasEvent(
  session: PlaytestSession,
  type: PlaytestEventType,
  predicate: (event: PlaytestEvent) => boolean = () => true
): boolean {
  return session.events.some((event) => event.type === type && predicate(event));
}

function firstEvent(
  session: PlaytestSession,
  predicate: (event: PlaytestEvent) => boolean
): PlaytestEvent | undefined {
  return session.events.find(predicate);
}

function elapsedForSession(session: PlaytestSession, nowMs: number): number {
  const lastElapsedMs = session.events[session.events.length - 1]?.elapsedMs ?? 0;

  return Math.max(lastElapsedMs, nowMs - session.startedAtMs, 0);
}

function countEventsBefore(
  session: PlaytestSession,
  type: PlaytestEventType,
  beforeElapsedMs: number | undefined
): number {
  return session.events.filter((event) =>
    event.type === type &&
    (beforeElapsedMs === undefined || event.elapsedMs < beforeElapsedMs)
  ).length;
}

function longestIntervalWithoutPlayerInput(session: PlaytestSession, nowMs: number): number {
  const inputElapsedTimes = session.events
    .filter((event) => PLAYER_INPUT_EVENT_TYPES.has(event.type))
    .map((event) => event.elapsedMs);
  const finalElapsedMs = elapsedForSession(session, nowMs);
  let longestMs = 0;
  let previousMs = 0;

  for (const elapsedMs of inputElapsedTimes) {
    longestMs = Math.max(longestMs, elapsedMs - previousMs);
    previousMs = elapsedMs;
  }

  return Math.max(longestMs, finalElapsedMs - previousMs);
}

function formatNullableDuration(valueMs: number | null): string {
  return valueMs === null ? 'not reached' : formatDuration(valueMs);
}

function formatDuration(valueMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(valueMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}m ${seconds}s`;
}

function unitLabel(definition: HustleDefinition, units: number): string {
  return units === 1 ? definition.unitSingular : definition.unitPlural;
}

function createSessionId(nowMs: number): string {
  return `grift-${nowMs.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

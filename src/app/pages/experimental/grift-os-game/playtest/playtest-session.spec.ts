import { HUSTLE_DEFINITIONS } from '../content/hustle-definitions';
import { createInitialGameState } from '../game-engine/economy';
import { RUG_PULL_CONFIG } from '../content/rug-pull-preview';
import {
  appendPlaytestEvent,
  createHumanReadablePlaytestSummary,
  createPlaytestExport,
  createPlaytestExportJson,
  createPlaytestSession,
  loadStoredPlaytestSession,
  PLAYTEST_STORAGE_KEY,
  recordAutomationPurchase,
  recordCycleCompleted,
  recordDiscoveryEvents,
  recordHustlePurchase,
  recordManualActivation,
  recordMilestoneReached,
  recordRugPullCommit,
  recordSnapshotIfDue,
  summarizePlaytestSession,
} from './playtest-session';

describe('GriftOS playtest session', () => {
  const startedAtMs = Date.UTC(2026, 6, 4, 12, 0, 0);
  const trollDefinition = HUSTLE_DEFINITIONS[0];
  const podcastDefinition = HUSTLE_DEFINITIONS[1];

  afterEach(() => {
    window.localStorage.removeItem(PLAYTEST_STORAGE_KEY);
  });

  it('records a schema v2 session start event', () => {
    const session = createPlaytestSession(startedAtMs, 'test-session');

    expect(session.schemaVersion).toBe(2);
    expect(session.sessionId).toBe('test-session');
    expect(session.events.length).toBe(1);
    expect(session.events[0].type).toBe('session_started');
    expect(session.events[0].elapsedMs).toBe(0);
  });

  it('records Hustle purchase, automation, milestone, and Rug Pull events with ordered timestamps', () => {
    let session = createPlaytestSession(startedAtMs, 'test-session');
    session = recordHustlePurchase(
      session,
      trollDefinition,
      1,
      56.9,
      2,
      60,
      3.1,
      false,
      startedAtMs + 1_000
    );
    session = recordAutomationPurchase(
      session,
      trollDefinition,
      110,
      2,
      120,
      10,
      startedAtMs + 500
    );
    session = recordMilestoneReached(session, trollDefinition, 'troll-network-10', startedAtMs + 3_000);
    session = recordRugPullCommit(session, 50_000_000, 0, 100_000, 100_000, startedAtMs + 4_000);

    expect(session.events[1].type).toBe('hustle_expanded');
    expect(session.events[2].type).toBe('automation_activated');
    expect(session.events[2].elapsedMs).toBeGreaterThanOrEqual(session.events[1].elapsedMs);
    expect(session.events[2].automationName).toBe('Auto-Poster');
    expect(session.events[3].type).toBe('milestone_reached');
    expect(session.events[4].type).toBe('rug_pull_committed');
  });

  it('derives required modernization summary metrics from event history', () => {
    let session = createPlaytestSession(startedAtMs, 'summary-session');
    const initialState = createInitialGameState(HUSTLE_DEFINITIONS);
    const podcastOwnedState = {
      ...initialState,
      valuation: 800,
      peakValuation: 800,
      hustles: {
        ...initialState.hustles,
        'podcast-network': {
          ...initialState.hustles['podcast-network'],
          units: 1,
        },
      },
    };

    session = recordManualActivation(session, trollDefinition, initialState, startedAtMs + 1_000);
    session = recordCycleCompleted(session, trollDefinition, 4, false, startedAtMs + 3_000);
    session = recordHustlePurchase(
      session,
      trollDefinition,
      1,
      56.9,
      2,
      60,
      3.1,
      false,
      startedAtMs + 4_000
    );
    session = recordHustlePurchase(
      session,
      podcastDefinition,
      1,
      160,
      1,
      200,
      40,
      false,
      startedAtMs + 6_000
    );
    session = recordAutomationPurchase(
      session,
      trollDefinition,
      110,
      2,
      120,
      10,
      startedAtMs + 7_000
    );
    session = recordMilestoneReached(session, trollDefinition, 'troll-network-10', startedAtMs + 8_000);
    session = recordHustlePurchase(
      session,
      HUSTLE_DEFINITIONS[2],
      1,
      900,
      1,
      950,
      50,
      false,
      startedAtMs + 9_000
    );
    session = recordHustlePurchase(
      session,
      HUSTLE_DEFINITIONS[3],
      1,
      6_500,
      1,
      7_000,
      500,
      false,
      startedAtMs + 10_000
    );
    session = recordRugPullCommit(session, 50_000_000, 0, 100_000, 100_000, startedAtMs + 11_000);

    const summary = summarizePlaytestSession(session, podcastOwnedState, HUSTLE_DEFINITIONS, startedAtMs + 15_000);

    expect(summary.timeToFirstPayoutMs).toBe(3_000);
    expect(summary.timeToFirstExpansionMs).toBe(4_000);
    expect(summary.manualActionsBeforeFirstExpansion).toBe(1);
    expect(summary.timeToHustle2Ms).toBe(6_000);
    expect(summary.timeToFirstAutomationMs).toBe(7_000);
    expect(summary.manualActionsBeforeFirstAutomation).toBe(1);
    expect(summary.timeToFirstMilestoneMs).toBe(8_000);
    expect(summary.timeToHustle3Ms).toBe(9_000);
    expect(summary.timeToHustle4Ms).toBe(10_000);
    expect(summary.timeRugPullUsedMs).toBe(11_000);
    expect(summary.netWorthGain).toBe(100_000);
  });

  it('records affordability discoveries and low-frequency snapshots', () => {
    let session = createPlaytestSession(startedAtMs, 'snapshot-session');
    const state = {
      ...createInitialGameState(HUSTLE_DEFINITIONS),
      valuation: RUG_PULL_CONFIG.unlockValuation,
      peakValuation: RUG_PULL_CONFIG.unlockValuation,
    };

    session = recordDiscoveryEvents(
      session,
      state,
      HUSTLE_DEFINITIONS,
      HUSTLE_DEFINITIONS,
      startedAtMs + 1_000
    );
    session = recordSnapshotIfDue(
      session,
      state,
      HUSTLE_DEFINITIONS,
      HUSTLE_DEFINITIONS,
      startedAtMs + 5_000
    );
    session = recordSnapshotIfDue(
      session,
      state,
      HUSTLE_DEFINITIONS,
      HUSTLE_DEFINITIONS,
      startedAtMs + 10_000
    );
    session = recordSnapshotIfDue(
      session,
      state,
      HUSTLE_DEFINITIONS,
      HUSTLE_DEFINITIONS,
      startedAtMs + 11_000
    );
    session = recordSnapshotIfDue(
      session,
      state,
      HUSTLE_DEFINITIONS,
      HUSTLE_DEFINITIONS,
      startedAtMs + 20_000
    );

    expect(session.events.some((event) => event.type === 'hustle_affordable' && event.hustleId === 'podcast-network')).toBeTrue();
    expect(session.events.some((event) => event.type === 'rug_pull_available')).toBeTrue();
    expect(session.events.filter((event) => event.type === 'economy_snapshot').length).toBe(2);
  });

  it('exports valid JSON with schema, tuning, summary, and no unrelated site data', () => {
    let session = createPlaytestSession(startedAtMs, 'export-session');
    const state = createInitialGameState(HUSTLE_DEFINITIONS);
    session = appendPlaytestEvent(session, 'session_export_requested', {}, startedAtMs + 3_000);

    const exportJson = createPlaytestExportJson(session, state, HUSTLE_DEFINITIONS, startedAtMs + 3_000);
    const parsed = JSON.parse(exportJson) as ReturnType<typeof createPlaytestExport>;

    expect(parsed.schemaVersion).toBe(2);
    expect(parsed.gameId).toBe('grift-os');
    expect(parsed.tuning.hustles.length).toBe(10);
    expect(parsed.tuning.hustles[0].name).toBe('Social Media Account');
    expect(parsed.tuning.hustles[0].unitPlural).toBe('Followers');
    expect(parsed.tuning.hustles[0].automationCost).toBe(0.5);
    expect(parsed.tuning.hustles[2].name).toBe('Merch Store');
    expect(parsed.tuning.hustles[3].automationName).toBe('Ad Sales Team');
    expect(parsed.tuning.hustles[9].name).toBe('Private Community');
    expect(parsed.summary.totalElapsedMs).toBe(3_000);
    expect(exportJson).not.toContain('emailAddress');
    expect(exportJson).not.toContain('ipAddress');
    expect(exportJson).not.toContain('userAgent');
    expect(exportJson).not.toContain('browsingHistory');
  });

  it('ignores stored sessions from older playtest builds', () => {
    const session = {
      ...createPlaytestSession(startedAtMs, 'old-build-session'),
      buildId: 'grift-os-ten-generator-layout-playtest',
    };

    window.localStorage.setItem(PLAYTEST_STORAGE_KEY, JSON.stringify(session));

    expect(loadStoredPlaytestSession(window.localStorage)).toBeNull();
  });

  it('formats a concise human-readable summary in Hustle vocabulary', () => {
    const session = createPlaytestSession(startedAtMs, 'human-session');
    const state = createInitialGameState(HUSTLE_DEFINITIONS);
    const summary = createHumanReadablePlaytestSummary(
      session,
      state,
      HUSTLE_DEFINITIONS,
      startedAtMs + 12_000
    );

    expect(summary).toContain('GriftOS Playtest Summary');
    expect(summary).toContain('Duration: 0m 12s');
    expect(summary).toContain('Final units:');
    expect(summary).toContain('Social Media Account: 1 Follower');
    expect(summary).toContain('Paid Fan Club: 0 Members');
    expect(summary).toContain('Private Community: 0 Towns');
  });
});

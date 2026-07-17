import { GriftPerformanceDiagnostics } from './performance-diagnostics';

describe('GriftPerformanceDiagnostics', () => {
  it('aggregates thresholds, percentiles, context, and long tasks without logging normal ticks', () => {
    const diagnostics = new GriftPerformanceDiagnostics(true);

    diagnostics.notePendingUiContext({ purchaseCount: 2, milestoneCount: 1 });
    diagnostics.runWithContext({ payoutCount: 3 }, () => {
      for (const durationMs of [10, 20, 60, 110, 510]) {
        diagnostics.record('tick', durationMs, { saveCount: 1, forcedSaveCount: 1 });
      }
    });
    diagnostics.recordLongTask(75);

    const summary = diagnostics.summarize();
    const tick = summary.stages.find((stage) => stage.stage === 'tick');

    expect(tick).toEqual(jasmine.objectContaining({
      count: 5,
      averageMs: 142,
      p50Ms: 60,
      p95Ms: 510,
      p99Ms: 510,
      maxMs: 510,
      over16Ms: 4,
      over50Ms: 3,
      over100Ms: 2,
      over500Ms: 1,
      slowestContext: {
        payoutCount: 3,
        purchaseCount: 2,
        milestoneCount: 1,
        saveCount: 1,
        forcedSaveCount: 1,
      },
    }));
    expect(summary.longTasks).toEqual({ count: 1, totalMs: 75, maxMs: 75 });
    expect(diagnostics.compactSummary()).toContain('over=4/3/2/1');
  });

  it('becomes a no-op outside playtest mode and resets collected samples', () => {
    const disabled = new GriftPerformanceDiagnostics(false);
    const work = jasmine.createSpy('work').and.returnValue('done');

    expect(disabled.runWithContext({ payoutCount: 1 }, work)).toBe('done');
    disabled.record('tick', 500);
    disabled.recordLongTask(500);
    expect(disabled.summarize()).toEqual({
      stages: [],
      longTasks: { count: 0, totalMs: 0, maxMs: 0 },
    });

    const enabled = new GriftPerformanceDiagnostics(true);
    enabled.record('events', 20);
    enabled.reset();
    expect(enabled.compactSummary()).toBe('No performance samples yet.');
    expect(enabled.summarize().stages).toEqual([]);
  });
});

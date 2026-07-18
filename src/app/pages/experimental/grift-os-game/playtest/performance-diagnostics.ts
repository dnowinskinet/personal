export type PlaytestPerformanceStage =
  | 'scheduler.delay'
  | 'runtime.advance'
  | 'presentation.snapshot'
  | 'persistence.stringify'
  | 'persistence.setItem'
  | 'events'
  | 'detectChanges'
  | 'ui-render'
  | 'angular-turn'
  | 'payout.frame'
  | 'tick';

export interface PlaytestPerformanceContext {
  payoutCount?: number;
  purchaseCount?: number;
  milestoneCount?: number;
  saveCount?: number;
  forcedSaveCount?: number;
}

export interface PlaytestPerformanceStageSummary {
  stage: PlaytestPerformanceStage;
  count: number;
  averageMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  maxMs: number;
  maxAtMs: number;
  over16Ms: number;
  over50Ms: number;
  over100Ms: number;
  over500Ms: number;
  slowestContext: Required<PlaytestPerformanceContext>;
}

export interface PlaytestPerformanceSummary {
  stages: readonly PlaytestPerformanceStageSummary[];
  longTasks: {
    count: number;
    totalMs: number;
    maxMs: number;
    maxStartedAtMs: number;
    lastStartedAtMs: number;
    lastDurationMs: number;
  };
}

interface StageAccumulator {
  count: number;
  totalMs: number;
  maxMs: number;
  maxAtMs: number;
  over16Ms: number;
  over50Ms: number;
  over100Ms: number;
  over500Ms: number;
  samples: number[];
  slowestContext: Required<PlaytestPerformanceContext>;
}

const MAX_RECENT_SAMPLES = 512;
const EMPTY_CONTEXT: Required<PlaytestPerformanceContext> = {
  payoutCount: 0,
  purchaseCount: 0,
  milestoneCount: 0,
  saveCount: 0,
  forcedSaveCount: 0,
};

export class GriftPerformanceDiagnostics {
  private readonly accumulators = new Map<PlaytestPerformanceStage, StageAccumulator>();
  private activeContext: Required<PlaytestPerformanceContext> = { ...EMPTY_CONTEXT };
  private pendingUiContext: Required<PlaytestPerformanceContext> = { ...EMPTY_CONTEXT };
  private longTaskCount = 0;
  private longTaskTotalMs = 0;
  private longTaskMaxMs = 0;
  private longTaskMaxStartedAtMs = 0;
  private longTaskLastStartedAtMs = 0;
  private longTaskLastDurationMs = 0;
  private cachedSummary = 'No performance samples yet.';
  private summaryDirty = false;
  private lastSummaryAtMs = 0;

  constructor(readonly enabled: boolean) {}

  runWithContext<T>(context: PlaytestPerformanceContext, work: () => T): T {
    if (!this.enabled) {
      return work();
    }

    const previousContext = this.activeContext;
    this.activeContext = mergeContext(previousContext, context);

    try {
      return work();
    } finally {
      this.activeContext = previousContext;
    }
  }

  notePendingUiContext(context: PlaytestPerformanceContext): void {
    if (!this.enabled) {
      return;
    }

    this.pendingUiContext = mergeContext(this.pendingUiContext, context);
  }

  completeUiRender(durationMs: number, context: PlaytestPerformanceContext = {}): void {
    this.record('ui-render', durationMs, context);
    this.pendingUiContext = { ...EMPTY_CONTEXT };
  }

  completeAngularTurn(
    durationMs: number,
    startedAtMs: number,
    context: PlaytestPerformanceContext = {}
  ): void {
    this.record('angular-turn', durationMs, context, startedAtMs);
    this.pendingUiContext = { ...EMPTY_CONTEXT };
  }

  record(
    stage: PlaytestPerformanceStage,
    durationMs: number,
    context: PlaytestPerformanceContext = {},
    recordedAtMs = performanceNow()
  ): void {
    if (!this.enabled || !Number.isFinite(durationMs) || durationMs < 0) {
      return;
    }

    const accumulator = this.accumulators.get(stage) ?? createAccumulator();
    const resolvedContext = mergeContext(
      mergeContext(this.pendingUiContext, this.activeContext),
      context
    );

    accumulator.count += 1;
    accumulator.totalMs += durationMs;
    accumulator.over16Ms += durationMs > 16 ? 1 : 0;
    accumulator.over50Ms += durationMs > 50 ? 1 : 0;
    accumulator.over100Ms += durationMs > 100 ? 1 : 0;
    accumulator.over500Ms += durationMs > 500 ? 1 : 0;
    accumulator.samples.push(durationMs);

    if (accumulator.samples.length > MAX_RECENT_SAMPLES) {
      accumulator.samples.shift();
    }

    if (durationMs >= accumulator.maxMs) {
      accumulator.maxMs = durationMs;
      accumulator.maxAtMs = recordedAtMs;
      accumulator.slowestContext = resolvedContext;
    }

    this.accumulators.set(stage, accumulator);
    this.summaryDirty = true;
  }

  recordLongTask(durationMs: number, startedAtMs = performanceNow()): void {
    if (!this.enabled || !Number.isFinite(durationMs) || durationMs < 0) {
      return;
    }

    this.longTaskCount += 1;
    this.longTaskTotalMs += durationMs;
    this.longTaskLastStartedAtMs = startedAtMs;
    this.longTaskLastDurationMs = durationMs;
    if (durationMs >= this.longTaskMaxMs) {
      this.longTaskMaxMs = durationMs;
      this.longTaskMaxStartedAtMs = startedAtMs;
    }
    this.summaryDirty = true;
  }

  summarize(): PlaytestPerformanceSummary {
    return {
      stages: [...this.accumulators.entries()].map(([stage, accumulator]) => {
        const sorted = [...accumulator.samples].sort((first, second) => first - second);

        return {
          stage,
          count: accumulator.count,
          averageMs: accumulator.count > 0 ? accumulator.totalMs / accumulator.count : 0,
          p50Ms: percentile(sorted, 0.5),
          p95Ms: percentile(sorted, 0.95),
          p99Ms: percentile(sorted, 0.99),
          maxMs: accumulator.maxMs,
          maxAtMs: accumulator.maxAtMs,
          over16Ms: accumulator.over16Ms,
          over50Ms: accumulator.over50Ms,
          over100Ms: accumulator.over100Ms,
          over500Ms: accumulator.over500Ms,
          slowestContext: accumulator.slowestContext,
        };
      }),
      longTasks: {
        count: this.longTaskCount,
        totalMs: this.longTaskTotalMs,
        maxMs: this.longTaskMaxMs,
        maxStartedAtMs: this.longTaskMaxStartedAtMs,
        lastStartedAtMs: this.longTaskLastStartedAtMs,
        lastDurationMs: this.longTaskLastDurationMs,
      },
    };
  }

  compactSummary(): string {
    if (!this.summaryDirty) {
      return this.cachedSummary;
    }

    const nowMs = Date.now();
    if (nowMs - this.lastSummaryAtMs < 1_000) {
      return this.cachedSummary;
    }

    const summary = this.summarize();
    const lines = summary.stages.map((stage) => {
      const context = stage.slowestContext;
      return [
        `${stage.stage}: n=${stage.count}`,
        `avg=${formatMs(stage.averageMs)}`,
        `p95=${formatMs(stage.p95Ms)}`,
        `p99=${formatMs(stage.p99Ms)}`,
        `max=${formatMs(stage.maxMs)}`,
        `at=${formatTimeline(stage.maxAtMs)}`,
        `over=${stage.over16Ms}/${stage.over50Ms}/${stage.over100Ms}/${stage.over500Ms}`,
        `slow[p=${context.payoutCount} buy=${context.purchaseCount}`,
        `milestone=${context.milestoneCount} save=${context.saveCount}`,
        `forced=${context.forcedSaveCount}]`,
      ].join(' ');
    });
    lines.push(
      [
        `longtasks: n=${summary.longTasks.count}`,
        `total=${formatMs(summary.longTasks.totalMs)}`,
        `max=${formatMs(summary.longTasks.maxMs)}`,
        `maxAt=${formatTimeline(summary.longTasks.maxStartedAtMs)}`,
        `last=${formatMs(summary.longTasks.lastDurationMs)}@${formatTimeline(summary.longTasks.lastStartedAtMs)}`,
      ].join(' ')
    );

    this.cachedSummary = lines.join('\n');
    this.summaryDirty = false;
    this.lastSummaryAtMs = nowMs;
    return this.cachedSummary;
  }

  reset(): void {
    this.accumulators.clear();
    this.activeContext = { ...EMPTY_CONTEXT };
    this.pendingUiContext = { ...EMPTY_CONTEXT };
    this.longTaskCount = 0;
    this.longTaskTotalMs = 0;
    this.longTaskMaxMs = 0;
    this.longTaskMaxStartedAtMs = 0;
    this.longTaskLastStartedAtMs = 0;
    this.longTaskLastDurationMs = 0;
    this.cachedSummary = 'No performance samples yet.';
    this.summaryDirty = false;
    this.lastSummaryAtMs = 0;
  }
}

function createAccumulator(): StageAccumulator {
  return {
    count: 0,
    totalMs: 0,
    maxMs: 0,
    maxAtMs: 0,
    over16Ms: 0,
    over50Ms: 0,
    over100Ms: 0,
    over500Ms: 0,
    samples: [],
    slowestContext: { ...EMPTY_CONTEXT },
  };
}

function mergeContext(
  base: PlaytestPerformanceContext,
  additional: PlaytestPerformanceContext
): Required<PlaytestPerformanceContext> {
  return {
    payoutCount: (base.payoutCount ?? 0) + (additional.payoutCount ?? 0),
    purchaseCount: (base.purchaseCount ?? 0) + (additional.purchaseCount ?? 0),
    milestoneCount: (base.milestoneCount ?? 0) + (additional.milestoneCount ?? 0),
    saveCount: (base.saveCount ?? 0) + (additional.saveCount ?? 0),
    forcedSaveCount: (base.forcedSaveCount ?? 0) + (additional.forcedSaveCount ?? 0),
  };
}

function percentile(sortedValues: readonly number[], percentileValue: number): number {
  if (sortedValues.length === 0) {
    return 0;
  }

  const index = Math.min(
    sortedValues.length - 1,
    Math.max(0, Math.ceil(sortedValues.length * percentileValue) - 1)
  );
  return sortedValues[index];
}

function formatMs(value: number): string {
  return `${value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)}ms`;
}

function formatTimeline(valueMs: number): string {
  return `${(valueMs / 1000).toFixed(2)}s`;
}

function performanceNow(): number {
  return globalThis.performance?.now() ?? Date.now();
}

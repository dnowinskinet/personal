export const MAX_FOREGROUND_TICK_MS = 5_000;

export function elapsedForegroundSimulationMs(
  previousTimestampMs: number,
  currentTimestampMs: number,
  maxElapsedMs = MAX_FOREGROUND_TICK_MS
): number {
  if (!Number.isFinite(previousTimestampMs) || !Number.isFinite(currentTimestampMs)) {
    return 0;
  }

  return Math.min(maxElapsedMs, Math.max(0, currentTimestampMs - previousTimestampMs));
}

import { elapsedForegroundSimulationMs, MAX_FOREGROUND_TICK_MS } from './simulation-clock';

describe('GriftOS simulation clock', () => {
  it('uses real foreground elapsed time instead of dropping delayed ticks', () => {
    expect(elapsedForegroundSimulationMs(1_000, 1_370)).toBe(370);
    expect(elapsedForegroundSimulationMs(1_000, 4_000)).toBe(3_000);
  });

  it('caps extreme foreground gaps without creating offline progress', () => {
    expect(elapsedForegroundSimulationMs(1_000, 10_000)).toBe(MAX_FOREGROUND_TICK_MS);
  });

  it('guards invalid or reversed timestamps', () => {
    expect(elapsedForegroundSimulationMs(2_000, 1_000)).toBe(0);
    expect(elapsedForegroundSimulationMs(Number.NaN, 1_000)).toBe(0);
  });
});

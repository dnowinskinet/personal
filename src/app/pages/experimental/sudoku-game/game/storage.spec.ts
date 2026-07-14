import { generatePuzzle } from './generator';
import { createSession } from './state';
import {
  SUDOKU_BEST_TIMES_KEY,
  SUDOKU_SESSIONS_KEY,
  emptyStoredSessions,
  loadBestTimes,
  loadStoredSessions,
  saveStoredSessions,
  updateBestTime,
} from './storage';
import { EMPTY_BEST_TIMES } from './types';

describe('Sudoku storage', () => {
  beforeEach(() => {
    localStorage.removeItem(SUDOKU_SESSIONS_KEY);
    localStorage.removeItem(SUDOKU_BEST_TIMES_KEY);
  });

  it('round-trips sessions in a reload-safe paused state', () => {
    const session = createSession(generatePuzzle('storage:daily', 'easy'), 'daily', '2026-07-13', 1000);
    const stored = emptyStoredSessions('2026-07-13');
    stored.daily.easy = session;

    saveStoredSessions(localStorage, stored, 5000);
    const loaded = loadStoredSessions(localStorage, '2026-07-13');

    expect(loaded.daily.easy?.paused).toBeTrue();
    expect(loaded.daily.easy?.runningSince).toBeNull();
    expect(loaded.daily.easy?.elapsedMs).toBe(4000);
  });

  it('prunes old daily sessions while retaining a random game', () => {
    const stored = emptyStoredSessions('2026-07-12');
    stored.daily.easy = createSession(generatePuzzle('storage:old', 'easy'), 'daily', '2026-07-12', 1000);
    stored.random = createSession(generatePuzzle('storage:random', 'medium'), 'random', null, 1000);
    saveStoredSessions(localStorage, stored, 2000);

    const loaded = loadStoredSessions(localStorage, '2026-07-13');
    expect(loaded.daily.easy).toBeUndefined();
    expect(loaded.random?.seed).toBe('storage:random');
  });

  it('falls back safely when persisted JSON is corrupt', () => {
    localStorage.setItem(SUDOKU_SESSIONS_KEY, '{broken');
    localStorage.setItem(SUDOKU_BEST_TIMES_KEY, '{broken');

    expect(loadStoredSessions(localStorage, '2026-07-13').daily).toEqual({});
    expect(loadBestTimes(localStorage)).toEqual(EMPTY_BEST_TIMES);
  });

  it('records only eligible faster times', () => {
    const first = updateBestTime(EMPTY_BEST_TIMES, 'random', 'hard', 120000, true);
    const slower = updateBestTime(first.bestTimes, 'random', 'hard', 180000, true);
    const assisted = updateBestTime(first.bestTimes, 'random', 'hard', 90000, false);

    expect(first.isNewRecord).toBeTrue();
    expect(slower.isNewRecord).toBeFalse();
    expect(assisted.isNewRecord).toBeFalse();
    expect(assisted.bestTimes.random.hard).toBe(120000);
  });
});

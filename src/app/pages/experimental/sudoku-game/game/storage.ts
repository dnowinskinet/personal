import {
  DIFFICULTIES,
  Difficulty,
  EMPTY_BEST_TIMES,
  GameKind,
  StoredSudokuSessions,
  SudokuBestTimes,
  SudokuHistorySnapshot,
  SudokuSession,
} from './types';
import { pauseSession } from './state';

export const SUDOKU_SESSIONS_KEY = 'sudoku-sessions-v1';
export const SUDOKU_BEST_TIMES_KEY = 'sudoku-best-times-v1';

export function emptyStoredSessions(dailyDate: string): StoredSudokuSessions {
  return {
    version: 1,
    dailyDate,
    daily: {},
    random: null,
  };
}

export function loadStoredSessions(storage: Storage, dailyDate: string): StoredSudokuSessions {
  try {
    const parsed = JSON.parse(storage.getItem(SUDOKU_SESSIONS_KEY) ?? 'null') as unknown;

    if (!isStoredSessions(parsed)) {
      return emptyStoredSessions(dailyDate);
    }

    return {
      version: 1,
      dailyDate,
      daily: parsed.dailyDate === dailyDate ? parsed.daily : {},
      random: parsed.random,
    };
  } catch {
    return emptyStoredSessions(dailyDate);
  }
}

export function saveStoredSessions(
  storage: Storage,
  sessions: StoredSudokuSessions,
  now: number,
): void {
  const serializable: StoredSudokuSessions = {
    version: 1,
    dailyDate: sessions.dailyDate,
    daily: Object.fromEntries(
      Object.entries(sessions.daily).map(([difficulty, session]) => [
        difficulty,
        session ? pauseForStorage(session, now) : session,
      ]),
    ) as Partial<Record<Difficulty, SudokuSession>>,
    random: sessions.random ? pauseForStorage(sessions.random, now) : null,
  };

  storage.setItem(SUDOKU_SESSIONS_KEY, JSON.stringify(serializable));
}

export function loadBestTimes(storage: Storage): SudokuBestTimes {
  try {
    const parsed = JSON.parse(storage.getItem(SUDOKU_BEST_TIMES_KEY) ?? 'null') as unknown;
    return isBestTimes(parsed) ? parsed : cloneBestTimes(EMPTY_BEST_TIMES);
  } catch {
    return cloneBestTimes(EMPTY_BEST_TIMES);
  }
}

export function saveBestTimes(storage: Storage, bestTimes: SudokuBestTimes): void {
  storage.setItem(SUDOKU_BEST_TIMES_KEY, JSON.stringify(bestTimes));
}

export function updateBestTime(
  bestTimes: SudokuBestTimes,
  kind: GameKind,
  difficulty: Difficulty,
  elapsedMs: number,
  eligible: boolean,
): { bestTimes: SudokuBestTimes; isNewRecord: boolean } {
  if (!eligible || elapsedMs <= 0) {
    return { bestTimes, isNewRecord: false };
  }

  const current = bestTimes[kind][difficulty];
  if (current !== undefined && current <= elapsedMs) {
    return { bestTimes, isNewRecord: false };
  }

  return {
    bestTimes: {
      ...bestTimes,
      [kind]: {
        ...bestTimes[kind],
        [difficulty]: elapsedMs,
      },
    },
    isNewRecord: true,
  };
}

function pauseForStorage(session: SudokuSession, now: number): SudokuSession {
  const paused = pauseSession(session, now);
  return paused.paused || paused.completed ? paused : { ...paused, paused: true, runningSince: null };
}

function isStoredSessions(value: unknown): value is StoredSudokuSessions {
  if (!isRecord(value) || value['version'] !== 1 || typeof value['dailyDate'] !== 'string') {
    return false;
  }

  const daily = value['daily'];
  if (!isRecord(daily)) {
    return false;
  }

  for (const [difficulty, session] of Object.entries(daily)) {
    if (!isDifficulty(difficulty) || !isSession(session)) {
      return false;
    }
  }

  return (value['random'] === null || isSession(value['random']));
}

function isSession(value: unknown): value is SudokuSession {
  if (!isRecord(value) || value['version'] !== 1 ||
      !isDifficulty(value['difficulty']) || !isGameKind(value['kind'])) {
    return false;
  }

  return typeof value['id'] === 'string' &&
    typeof value['seed'] === 'string' &&
    (value['dailyDate'] === null || typeof value['dailyDate'] === 'string') &&
    isBoard(value['puzzle']) && isBoard(value['solution']) && isBoard(value['values']) &&
    isNotes(value['notes']) &&
    Number.isInteger(value['selectedIndex']) && Number(value['selectedIndex']) >= 0 && Number(value['selectedIndex']) < 81 &&
    typeof value['notesMode'] === 'boolean' &&
    isHistory(value['undoStack']) && isHistory(value['redoStack']) &&
    typeof value['elapsedMs'] === 'number' && Number(value['elapsedMs']) >= 0 &&
    (value['runningSince'] === null || typeof value['runningSince'] === 'number') &&
    typeof value['paused'] === 'boolean' && typeof value['completed'] === 'boolean' &&
    (value['completedAt'] === null || typeof value['completedAt'] === 'number') &&
    typeof value['usedHint'] === 'boolean';
}

function isBestTimes(value: unknown): value is SudokuBestTimes {
  if (!isRecord(value) || value['version'] !== 1) {
    return false;
  }

  return isBestTimeMap(value['daily']) && isBestTimeMap(value['random']);
}

function isBestTimeMap(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return Object.entries(value).every(([difficulty, time]) =>
    isDifficulty(difficulty) && typeof time === 'number' && time > 0,
  );
}

function isBoard(value: unknown): value is number[] {
  return Array.isArray(value) && value.length === 81 && value.every((cell) =>
    Number.isInteger(cell) && cell >= 0 && cell <= 9,
  );
}

function isNotes(value: unknown): value is number[][] {
  return Array.isArray(value) && value.length === 81 && value.every((notes) =>
    Array.isArray(notes) && notes.every((note) => Number.isInteger(note) && note >= 1 && note <= 9),
  );
}

function isHistory(value: unknown): value is SudokuHistorySnapshot[] {
  return Array.isArray(value) && value.length <= 100 && value.every((snapshot) =>
    isRecord(snapshot) && isBoard(snapshot['values']) && isNotes(snapshot['notes']),
  );
}

function isDifficulty(value: unknown): value is Difficulty {
  return typeof value === 'string' && DIFFICULTIES.includes(value as Difficulty);
}

function isGameKind(value: unknown): value is GameKind {
  return value === 'daily' || value === 'random';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cloneBestTimes(bestTimes: SudokuBestTimes): SudokuBestTimes {
  return {
    version: 1,
    daily: { ...bestTimes.daily },
    random: { ...bestTimes.random },
  };
}

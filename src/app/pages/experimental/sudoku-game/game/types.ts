export const DIFFICULTIES = ['easy', 'medium', 'hard', 'expert'] as const;

export type Difficulty = typeof DIFFICULTIES[number];
export type GameKind = 'daily' | 'random';

export interface SudokuPuzzle {
  seed: string;
  difficulty: Difficulty;
  puzzle: number[];
  solution: number[];
}

export interface SudokuHistorySnapshot {
  values: number[];
  notes: number[][];
}

export interface SudokuSession {
  version: 1;
  id: string;
  kind: GameKind;
  difficulty: Difficulty;
  dailyDate: string | null;
  seed: string;
  puzzle: number[];
  solution: number[];
  values: number[];
  notes: number[][];
  selectedIndex: number;
  notesMode: boolean;
  undoStack: SudokuHistorySnapshot[];
  redoStack: SudokuHistorySnapshot[];
  elapsedMs: number;
  runningSince: number | null;
  paused: boolean;
  completed: boolean;
  completedAt: number | null;
  usedHint: boolean;
}

export interface StoredSudokuSessions {
  version: 1;
  dailyDate: string;
  daily: Partial<Record<Difficulty, SudokuSession>>;
  random: SudokuSession | null;
}

export interface SudokuBestTimes {
  version: 1;
  daily: Partial<Record<Difficulty, number>>;
  random: Partial<Record<Difficulty, number>>;
}

export const EMPTY_BEST_TIMES: SudokuBestTimes = {
  version: 1,
  daily: {},
  random: {},
};

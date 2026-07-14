import { Difficulty, SudokuPuzzle } from './types';

export const DIFFICULTY_CLUES: Record<Difficulty, number> = {
  easy: 46,
  medium: 38,
  hard: 32,
  expert: 27,
};

const BOARD_SIZE = 81;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

type RandomSource = () => number;

export function utcDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function dailySeed(dateKey: string, difficulty: Difficulty): string {
  return `sudoku-v1:${dateKey}:${difficulty}`;
}

export function generatePuzzle(seed: string, difficulty: Difficulty): SudokuPuzzle {
  const targetClues = DIFFICULTY_CLUES[difficulty];
  let closestPuzzle: number[] | null = null;
  let closestSolution: number[] | null = null;
  let closestClues = BOARD_SIZE;

  for (let attempt = 0; attempt < 96; attempt += 1) {
    const solution = generateSolution(`${seed}:solution:${attempt}`);
    const puzzle = solution.slice();
    const removalOrder = shuffle(
      Array.from({ length: BOARD_SIZE }, (_, index) => index),
      seededRandom(`${seed}:removal:${attempt}`),
    );
    let clueCount = BOARD_SIZE;

    for (const index of removalOrder) {
      if (clueCount === targetClues) {
        break;
      }

      const previous = puzzle[index];
      puzzle[index] = 0;

      if (countSolutions(puzzle, 2) !== 1) {
        puzzle[index] = previous;
      } else {
        clueCount -= 1;
      }
    }

    if (clueCount < closestClues) {
      closestClues = clueCount;
      closestPuzzle = puzzle.slice();
      closestSolution = solution.slice();
    }

    if (clueCount === targetClues) {
      return { seed, difficulty, puzzle, solution };
    }
  }

  if (closestPuzzle && closestSolution) {
    return {
      seed,
      difficulty,
      puzzle: closestPuzzle,
      solution: closestSolution,
    };
  }

  throw new Error('Unable to generate a Sudoku puzzle.');
}

export function countSolutions(board: readonly number[], limit = 2): number {
  if (board.length !== BOARD_SIZE || !isValidPartialBoard(board)) {
    return 0;
  }

  const working = board.slice();
  let solutions = 0;

  const search = (): void => {
    if (solutions >= limit) {
      return;
    }

    let targetIndex = -1;
    let targetCandidates: number[] = [];

    for (let index = 0; index < BOARD_SIZE; index += 1) {
      if (working[index] !== 0) {
        continue;
      }

      const candidates = candidatesFor(working, index);
      if (candidates.length === 0) {
        return;
      }

      if (targetIndex === -1 || candidates.length < targetCandidates.length) {
        targetIndex = index;
        targetCandidates = candidates;
      }

      if (targetCandidates.length === 1) {
        break;
      }
    }

    if (targetIndex === -1) {
      solutions += 1;
      return;
    }

    for (const candidate of targetCandidates) {
      working[targetIndex] = candidate;
      search();
      working[targetIndex] = 0;

      if (solutions >= limit) {
        return;
      }
    }
  };

  search();
  return solutions;
}

export function isValidSolution(board: readonly number[]): boolean {
  if (board.length !== BOARD_SIZE || board.some((value) => value < 1 || value > 9)) {
    return false;
  }

  return isValidPartialBoard(board);
}

function generateSolution(seed: string): number[] {
  const random = seededRandom(seed);
  const digits = shuffle(DIGITS, random);
  const bands = shuffle([0, 1, 2], random);
  const stacks = shuffle([0, 1, 2], random);
  const rows = bands.flatMap((band) =>
    shuffle([0, 1, 2], random).map((row) => band * 3 + row),
  );
  const columns = stacks.flatMap((stack) =>
    shuffle([0, 1, 2], random).map((column) => stack * 3 + column),
  );

  return rows.flatMap((row) =>
    columns.map((column) => digits[(row * 3 + Math.floor(row / 3) + column) % 9]),
  );
}

function candidatesFor(board: readonly number[], index: number): number[] {
  const row = Math.floor(index / 9);
  const column = index % 9;
  const boxRow = Math.floor(row / 3) * 3;
  const boxColumn = Math.floor(column / 3) * 3;
  const used = new Set<number>();

  for (let offset = 0; offset < 9; offset += 1) {
    used.add(board[row * 9 + offset]);
    used.add(board[offset * 9 + column]);
    used.add(board[(boxRow + Math.floor(offset / 3)) * 9 + boxColumn + (offset % 3)]);
  }

  return DIGITS.filter((digit) => !used.has(digit));
}

function isValidPartialBoard(board: readonly number[]): boolean {
  if (board.some((value) => !Number.isInteger(value) || value < 0 || value > 9)) {
    return false;
  }

  const units: number[][] = [];

  for (let index = 0; index < 9; index += 1) {
    units.push(Array.from({ length: 9 }, (_, offset) => index * 9 + offset));
    units.push(Array.from({ length: 9 }, (_, offset) => offset * 9 + index));
  }

  for (let boxRow = 0; boxRow < 3; boxRow += 1) {
    for (let boxColumn = 0; boxColumn < 3; boxColumn += 1) {
      units.push(Array.from({ length: 9 }, (_, offset) =>
        (boxRow * 3 + Math.floor(offset / 3)) * 9 + boxColumn * 3 + (offset % 3),
      ));
    }
  }

  return units.every((unit) => {
    const values = unit.map((index) => board[index]).filter((value) => value !== 0);
    return new Set(values).size === values.length;
  });
}

function seededRandom(seed: string): RandomSource {
  let value = hashSeed(seed);

  return () => {
    value += 0x6D2B79F5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(seed: string): number {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function shuffle<T>(values: readonly T[], random: RandomSource): T[] {
  const shuffled = values.slice();

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }

  return shuffled;
}

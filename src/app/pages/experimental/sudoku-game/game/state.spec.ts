import { generatePuzzle } from './generator';
import {
  applyDigit,
  applyHint,
  completedDigits,
  conflictIndices,
  createSession,
  pauseSession,
  redo,
  resumeSession,
  sessionElapsed,
  toggleNote,
  undo,
} from './state';
import { SudokuPuzzle } from './types';

describe('Sudoku state', () => {
  let solution: number[];

  beforeAll(() => {
    solution = generatePuzzle('sudoku-v1:state-tests', 'easy').solution;
  });

  it('highlights row, column, and box conflicts', () => {
    const values = Array.from({ length: 81 }, () => 0);
    values[0] = 4;
    values[1] = 4;
    values[9] = 4;

    const conflicts = conflictIndices(values);
    expect(conflicts.has(0)).toBeTrue();
    expect(conflicts.has(1)).toBeTrue();
    expect(conflicts.has(9)).toBeTrue();
  });

  it('treats a value placement and peer-note cleanup as one undoable action', () => {
    const session = createSession(puzzleWithOpenCells([0, 1]), 'random', null, 1000);
    const noted = toggleNote({ ...session, selectedIndex: 1 }, solution[0]);
    const placed = applyDigit({ ...noted, selectedIndex: 0 }, solution[0], 2000);

    expect(placed.notes[1]).not.toContain(solution[0]);
    const undone = undo(placed);
    expect(undone.values[0]).toBe(0);
    expect(undone.notes[1]).toContain(solution[0]);
    const redone = redo(undone);
    expect(redone.values[0]).toBe(solution[0]);
    expect(redone.notes[1]).not.toContain(solution[0]);
  });

  it('clears redo history after a new action', () => {
    const session = createSession(puzzleWithOpenCells([0, 1]), 'random', null, 1000);
    const placed = applyDigit({ ...session, selectedIndex: 0 }, solution[0], 2000);
    const undone = undo(placed);
    const replacement = applyDigit({ ...undone, selectedIndex: 1 }, solution[1], 3000);

    expect(replacement.redoStack.length).toBe(0);
  });

  it('keeps a game assisted after undoing a hint', () => {
    const session = createSession(puzzleWithOpenCells([0, 1]), 'daily', '2026-07-13', 1000);
    const hinted = applyHint(session, 2000);
    const undone = undo(hinted);

    expect(hinted.usedHint).toBeTrue();
    expect(undone.usedHint).toBeTrue();
    expect(undone.values[session.selectedIndex]).toBe(0);
  });

  it('stops and resumes elapsed time without drift', () => {
    const session = createSession(puzzleWithOpenCells([0]), 'random', null, 1000);
    const paused = pauseSession(session, 4500);
    const resumed = resumeSession(paused, 9000);

    expect(paused.elapsedMs).toBe(3500);
    expect(sessionElapsed(paused, 8000)).toBe(3500);
    expect(sessionElapsed(resumed, 11000)).toBe(5500);
  });

  it('detects completed digits and a finished board', () => {
    expect(completedDigits(solution).size).toBe(9);

    const session = createSession(puzzleWithOpenCells([0]), 'random', null, 1000);
    const completed = applyDigit(session, solution[0], 6000);

    expect(completed.completed).toBeTrue();
    expect(completed.elapsedMs).toBe(5000);
    expect(completed.runningSince).toBeNull();
  });

  function puzzleWithOpenCells(indexes: number[]): SudokuPuzzle {
    const puzzle = solution.slice();
    indexes.forEach((index) => puzzle[index] = 0);

    return {
      seed: `state:${indexes.join('-')}`,
      difficulty: 'easy',
      puzzle,
      solution: solution.slice(),
    };
  }
});

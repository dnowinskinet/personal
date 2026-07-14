import {
  DIFFICULTY_CLUES,
  countSolutions,
  dailySeed,
  generatePuzzle,
  isValidSolution,
} from './generator';
import { DIFFICULTIES } from './types';

describe('Sudoku generator', () => {
  it('generates reproducible uniquely solvable daily puzzles at each difficulty', () => {
    for (const difficulty of DIFFICULTIES) {
      const seed = dailySeed('2026-07-13', difficulty);
      const first = generatePuzzle(seed, difficulty);
      const second = generatePuzzle(seed, difficulty);

      expect(second).toEqual(first);
      expect(first.puzzle.filter(Boolean).length).toBe(DIFFICULTY_CLUES[difficulty]);
      expect(isValidSolution(first.solution)).toBeTrue();
      expect(countSolutions(first.puzzle)).toBe(1);
      expect(first.puzzle.every((value, index) => value === 0 || value === first.solution[index])).toBeTrue();
    }
  });

  it('uses the seed to produce different boards', () => {
    const first = generatePuzzle('sudoku-v1:test:first', 'medium');
    const second = generatePuzzle('sudoku-v1:test:second', 'medium');

    expect(second.solution).not.toEqual(first.solution);
    expect(second.puzzle).not.toEqual(first.puzzle);
  });

  it('meets the requested clue count and uniqueness across random seed samples', () => {
    for (const difficulty of DIFFICULTIES) {
      for (let sample = 0; sample < 12; sample += 1) {
        const puzzle = generatePuzzle(`sudoku-v1:qc:${difficulty}:${sample}`, difficulty);

        expect(puzzle.puzzle.filter(Boolean).length).toBe(DIFFICULTY_CLUES[difficulty]);
        expect(countSolutions(puzzle.puzzle)).toBe(1);
      }
    }
  });

  it('rejects invalid boards when counting solutions', () => {
    const invalid = Array.from({ length: 81 }, () => 0);
    invalid[0] = 1;
    invalid[1] = 1;

    expect(countSolutions(invalid)).toBe(0);
  });
});

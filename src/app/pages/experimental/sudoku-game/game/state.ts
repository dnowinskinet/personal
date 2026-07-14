import { GameKind, SudokuHistorySnapshot, SudokuPuzzle, SudokuSession } from './types';

const HISTORY_LIMIT = 100;

export function createSession(
  puzzle: SudokuPuzzle,
  kind: GameKind,
  dailyDate: string | null,
  now: number,
): SudokuSession {
  const selectedIndex = puzzle.puzzle.findIndex((value) => value === 0);

  return {
    version: 1,
    id: `${kind}:${puzzle.seed}`,
    kind,
    difficulty: puzzle.difficulty,
    dailyDate,
    seed: puzzle.seed,
    puzzle: puzzle.puzzle.slice(),
    solution: puzzle.solution.slice(),
    values: puzzle.puzzle.slice(),
    notes: emptyNotes(),
    selectedIndex: selectedIndex >= 0 ? selectedIndex : 0,
    notesMode: false,
    undoStack: [],
    redoStack: [],
    elapsedMs: 0,
    runningSince: now,
    paused: false,
    completed: false,
    completedAt: null,
    usedHint: false,
  };
}

export function sessionElapsed(session: SudokuSession, now: number): number {
  if (session.runningSince === null || session.paused || session.completed) {
    return session.elapsedMs;
  }

  return session.elapsedMs + Math.max(0, now - session.runningSince);
}

export function pauseSession(session: SudokuSession, now: number): SudokuSession {
  if (session.paused || session.completed) {
    return session;
  }

  return {
    ...session,
    elapsedMs: sessionElapsed(session, now),
    runningSince: null,
    paused: true,
  };
}

export function resumeSession(session: SudokuSession, now: number): SudokuSession {
  if (!session.paused || session.completed) {
    return session;
  }

  return {
    ...session,
    runningSince: now,
    paused: false,
  };
}

export function applyDigit(session: SudokuSession, digit: number, now: number): SudokuSession {
  const index = session.selectedIndex;

  if (!canEdit(session, index) || digit < 1 || digit > 9) {
    return session;
  }

  if (session.notesMode && session.values[index] === 0) {
    return toggleNote(session, digit);
  }

  if (session.values[index] === digit && session.notes[index].length === 0) {
    return session;
  }

  const values = session.values.slice();
  const notes = cloneNotes(session.notes);
  values[index] = digit;
  notes[index] = [];

  for (const peer of peerIndices(index)) {
    notes[peer] = notes[peer].filter((note) => note !== digit);
  }

  return commitBoardChange(session, values, notes, now);
}

export function clearSelectedCell(session: SudokuSession, now: number): SudokuSession {
  const index = session.selectedIndex;

  if (!canEdit(session, index) || (session.values[index] === 0 && session.notes[index].length === 0)) {
    return session;
  }

  const values = session.values.slice();
  const notes = cloneNotes(session.notes);
  values[index] = 0;
  notes[index] = [];

  return commitBoardChange(session, values, notes, now);
}

export function toggleNote(session: SudokuSession, digit: number): SudokuSession {
  const index = session.selectedIndex;

  if (!canEdit(session, index) || session.values[index] !== 0 || digit < 1 || digit > 9) {
    return session;
  }

  const values = session.values.slice();
  const notes = cloneNotes(session.notes);
  const current = notes[index];
  notes[index] = current.includes(digit)
    ? current.filter((note) => note !== digit)
    : [...current, digit].sort((left, right) => left - right);

  return {
    ...session,
    values,
    notes,
    undoStack: appendHistory(session.undoStack, snapshot(session)),
    redoStack: [],
  };
}

export function applyHint(session: SudokuSession, now: number): SudokuSession {
  if (session.paused || session.completed) {
    return session;
  }

  let index = session.selectedIndex;
  if (!canEdit(session, index) || session.values[index] === session.solution[index]) {
    index = session.puzzle.findIndex((value, candidate) =>
      value === 0 && session.values[candidate] !== session.solution[candidate],
    );
  }

  if (index < 0) {
    return session;
  }

  const selectedSession = { ...session, selectedIndex: index, notesMode: false };
  const hinted = applyDigit(selectedSession, selectedSession.solution[index], now);

  return hinted === selectedSession
    ? session
    : { ...hinted, usedHint: true };
}

export function undo(session: SudokuSession): SudokuSession {
  if (session.paused || session.completed || session.undoStack.length === 0) {
    return session;
  }

  const previous = session.undoStack[session.undoStack.length - 1];

  return {
    ...session,
    values: previous.values.slice(),
    notes: cloneNotes(previous.notes),
    undoStack: session.undoStack.slice(0, -1),
    redoStack: appendHistory(session.redoStack, snapshot(session)),
  };
}

export function redo(session: SudokuSession): SudokuSession {
  if (session.paused || session.completed || session.redoStack.length === 0) {
    return session;
  }

  const next = session.redoStack[session.redoStack.length - 1];

  return {
    ...session,
    values: next.values.slice(),
    notes: cloneNotes(next.notes),
    undoStack: appendHistory(session.undoStack, snapshot(session)),
    redoStack: session.redoStack.slice(0, -1),
  };
}

export function conflictIndices(values: readonly number[]): Set<number> {
  const conflicts = new Set<number>();

  if (values.length !== 81) {
    return conflicts;
  }

  for (const unit of allUnits()) {
    const positions = new Map<number, number[]>();

    for (const index of unit) {
      const value = values[index];
      if (value === 0) {
        continue;
      }

      positions.set(value, [...(positions.get(value) ?? []), index]);
    }

    for (const indexes of positions.values()) {
      if (indexes.length > 1) {
        indexes.forEach((index) => conflicts.add(index));
      }
    }
  }

  return conflicts;
}

export function completedDigits(values: readonly number[]): Set<number> {
  if (values.length !== 81) {
    return new Set<number>();
  }

  const conflicts = conflictIndices(values);
  const completed = new Set<number>();

  for (let digit = 1; digit <= 9; digit += 1) {
    const indexes = values
      .map((value, index) => value === digit ? index : -1)
      .filter((index) => index >= 0);

    if (indexes.length === 9 && indexes.every((index) => !conflicts.has(index))) {
      completed.add(digit);
    }
  }

  return completed;
}

export function peerIndices(index: number): number[] {
  const row = Math.floor(index / 9);
  const column = index % 9;
  const boxRow = Math.floor(row / 3) * 3;
  const boxColumn = Math.floor(column / 3) * 3;
  const peers = new Set<number>();

  for (let offset = 0; offset < 9; offset += 1) {
    peers.add(row * 9 + offset);
    peers.add(offset * 9 + column);
    peers.add((boxRow + Math.floor(offset / 3)) * 9 + boxColumn + (offset % 3));
  }

  peers.delete(index);
  return [...peers];
}

export function hasGameProgress(session: SudokuSession): boolean {
  return session.completed || session.elapsedMs > 0 || session.runningSince !== null ||
    session.values.some((value, index) => session.puzzle[index] === 0 && value !== 0) ||
    session.notes.some((notes) => notes.length > 0);
}

function commitBoardChange(
  session: SudokuSession,
  values: number[],
  notes: number[][],
  now: number,
): SudokuSession {
  const completed = values.every((value, index) => value === session.solution[index]);

  return {
    ...session,
    values,
    notes,
    undoStack: appendHistory(session.undoStack, snapshot(session)),
    redoStack: [],
    completed,
    completedAt: completed ? now : null,
    elapsedMs: completed ? sessionElapsed(session, now) : session.elapsedMs,
    runningSince: completed ? null : session.runningSince,
  };
}

function canEdit(session: SudokuSession, index: number): boolean {
  return !session.paused && !session.completed && index >= 0 && session.puzzle[index] === 0;
}

function snapshot(session: SudokuSession): SudokuHistorySnapshot {
  return {
    values: session.values.slice(),
    notes: cloneNotes(session.notes),
  };
}

function appendHistory(
  history: SudokuHistorySnapshot[],
  next: SudokuHistorySnapshot,
): SudokuHistorySnapshot[] {
  return [...history, next].slice(-HISTORY_LIMIT);
}

function emptyNotes(): number[][] {
  return Array.from({ length: 81 }, () => []);
}

function cloneNotes(notes: readonly number[][]): number[][] {
  return notes.map((cellNotes) => cellNotes.slice());
}

function allUnits(): number[][] {
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

  return units;
}

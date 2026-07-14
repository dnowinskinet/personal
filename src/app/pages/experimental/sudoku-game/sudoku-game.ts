import { DOCUMENT, NgClass, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  PLATFORM_ID,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MetaService } from '@core/services/meta.service';
import profileData from '@data/profile.data';
import { dailySeed, generatePuzzle, utcDateKey } from './game/generator';
import {
  applyDigit,
  applyHint,
  clearSelectedCell,
  completedDigits,
  conflictIndices,
  createSession,
  hasGameProgress,
  pauseSession,
  peerIndices,
  redo,
  resumeSession,
  sessionElapsed,
  undo,
} from './game/state';
import {
  emptyStoredSessions,
  loadBestTimes,
  loadStoredSessions,
  saveBestTimes,
  saveStoredSessions,
  updateBestTime,
} from './game/storage';
import {
  DIFFICULTIES,
  Difficulty,
  EMPTY_BEST_TIMES,
  GameKind,
  StoredSudokuSessions,
  SudokuBestTimes,
  SudokuPuzzle,
  SudokuSession,
} from './game/types';

type ConfirmationAction =
  | { type: 'restart' }
  | { type: 'new-random' }
  | { type: 'random-difficulty'; difficulty: Difficulty };

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  templateUrl: './sudoku-game.html',
  styleUrls: ['./sudoku-game.scss', './sudoku-controls.scss'],
})
export class SudokuGameComponent implements OnDestroy {
  readonly difficulties = DIFFICULTIES;
  readonly digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  readonly cells = Array.from({ length: 81 }, (_, index) => index);
  readonly activeKind = signal<GameKind>('daily');
  readonly activeDifficulty = signal<Difficulty>('medium');
  readonly session = signal<SudokuSession | null>(null);
  readonly bestTimes = signal<SudokuBestTimes>({
    version: 1,
    daily: { ...EMPTY_BEST_TIMES.daily },
    random: { ...EMPTY_BEST_TIMES.random },
  });
  readonly now = signal(Date.now());
  readonly announcement = signal('');
  readonly confirmation = signal<ConfirmationAction | null>(null);
  readonly isNewRecord = signal(false);
  readonly initialized = signal(false);

  readonly elapsedMs = computed(() => {
    const current = this.session();
    const now = this.now();
    return current ? sessionElapsed(current, now) : 0;
  });
  readonly conflicts = computed(() => {
    const current = this.session();
    return current ? conflictIndices(current.values) : new Set<number>();
  });
  readonly completedNumberSet = computed(() => {
    const current = this.session();
    return current ? completedDigits(current.values) : new Set<number>();
  });
  readonly selectedPeers = computed(() => {
    const current = this.session();
    return new Set(current ? peerIndices(current.selectedIndex) : []);
  });
  readonly selectedValue = computed(() => {
    const current = this.session();
    return current ? current.values[current.selectedIndex] : 0;
  });
  readonly bestTime = computed(() =>
    this.bestTimes()[this.activeKind()][this.activeDifficulty()] ?? null,
  );

  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly metaService = inject(MetaService);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private storage: Storage | null = null;
  private storedSessions: StoredSudokuSessions = emptyStoredSessions(utcDateKey());
  private timerId: number | null = null;
  private lastAutoSave = 0;
  private randomCounter = 0;
  private confirmationReturnFocus: HTMLElement | null = null;

  constructor() {
    this.metaService.setMetaTags(
      `Sudoku - ${profileData.name}`,
      'Play daily and unlimited Sudoku puzzles with notes, hints, undo, and local best times.',
      ['sudoku', 'daily sudoku', 'browser game', 'puzzle game', 'angular game'],
    );

    afterNextRender(() => this.initializeBrowser());
  }

  ngOnDestroy(): void {
    if (this.timerId !== null && this.isBrowser) {
      window.clearInterval(this.timerId);
    }
    this.saveAll();
  }

  activateKind(kind: GameKind): void {
    if (!this.initialized() || kind === this.activeKind()) {
      return;
    }

    this.stashCurrent(true);
    this.isNewRecord.set(false);

    if (kind === 'daily') {
      this.activateDaily(this.activeDifficulty(), false);
      return;
    }

    if (this.storedSessions.random) {
      this.activeKind.set('random');
      this.activeDifficulty.set(this.storedSessions.random.difficulty);
      this.session.set(this.storedSessions.random);
      this.announcement.set('Random game restored. Resume when ready.');
      this.saveAll();
      return;
    }

    this.startRandom(this.activeDifficulty());
  }

  activateDifficulty(difficulty: Difficulty): void {
    if (!this.initialized() || difficulty === this.activeDifficulty()) {
      return;
    }

    if (this.activeKind() === 'daily') {
      this.activateDaily(difficulty);
      return;
    }

    const current = this.session();
    if (current && !current.completed && hasGameProgress(current)) {
      this.openConfirmation({ type: 'random-difficulty', difficulty });
      return;
    }

    this.startRandom(difficulty);
  }

  selectCell(index: number, focus = false): void {
    const current = this.session();
    if (!current || current.paused || current.completed) {
      return;
    }

    this.session.set({ ...current, selectedIndex: index });
    this.stashCurrent(false);

    if (focus && this.isBrowser) {
      queueMicrotask(() => this.document.getElementById(`sudoku-cell-${index}`)?.focus());
    }
  }

  enterDigit(digit: number): void {
    const current = this.session();
    if (!current) {
      return;
    }

    const next = applyDigit(current, digit, Date.now());
    this.commitSession(next);

    if (next !== current && this.conflicts().has(next.selectedIndex)) {
      this.announcement.set(`${digit} conflicts with another ${digit}.`);
    }
  }

  clearCell(): void {
    const current = this.session();
    if (current) {
      this.commitSession(clearSelectedCell(current, Date.now()));
    }
  }

  toggleNotesMode(): void {
    const current = this.session();
    if (!current || current.paused || current.completed) {
      return;
    }

    const notesMode = !current.notesMode;
    this.session.set({ ...current, notesMode });
    this.stashCurrent(false);
    this.saveAll();
    this.announcement.set(`Notes mode ${notesMode ? 'on' : 'off'}.`);
  }

  useHint(): void {
    const current = this.session();
    if (!current) {
      return;
    }

    const next = applyHint(current, Date.now());
    if (next !== current) {
      this.announcement.set('Hint placed. This game is now assisted.');
      this.commitSession(next);
    }
  }

  undoMove(): void {
    const current = this.session();
    if (current) {
      this.commitSession(undo(current), false);
    }
  }

  redoMove(): void {
    const current = this.session();
    if (current) {
      this.commitSession(redo(current), false);
    }
  }

  togglePause(): void {
    const current = this.session();
    if (!current || current.completed) {
      return;
    }

    const now = Date.now();
    const next = current.paused ? resumeSession(current, now) : pauseSession(current, now);
    this.session.set(next);
    this.stashCurrent(false);
    this.saveAll();
    this.announcement.set(next.paused ? 'Game paused.' : 'Game resumed.');
  }

  requestRestart(): void {
    if (this.session()) {
      this.openConfirmation({ type: 'restart' });
    }
  }

  requestNewRandom(): void {
    const current = this.session();
    if (current && this.activeKind() === 'random' && !current.completed && hasGameProgress(current)) {
      this.openConfirmation({ type: 'new-random' });
      return;
    }

    this.startRandom(this.activeDifficulty());
  }

  confirmAction(): void {
    const action = this.confirmation();
    this.closeConfirmation();

    if (!action) {
      return;
    }

    if (action.type === 'restart') {
      const current = this.session();
      if (current) {
        const puzzle: SudokuPuzzle = {
          seed: current.seed,
          difficulty: current.difficulty,
          puzzle: current.puzzle,
          solution: current.solution,
        };
        const restarted = createSession(puzzle, current.kind, current.dailyDate, Date.now());
        this.session.set(restarted);
        this.isNewRecord.set(false);
        this.stashCurrent(false);
        this.saveAll();
        this.announcement.set('Puzzle restarted.');
      }
      return;
    }

    if (action.type === 'random-difficulty') {
      this.startRandom(action.difficulty);
      return;
    }

    this.startRandom(this.activeDifficulty());
  }

  cancelConfirmation(): void {
    this.closeConfirmation();
  }

  confirmationTitle(): string {
    const action = this.confirmation();
    if (action?.type === 'restart') {
      return 'Restart this puzzle?';
    }
    if (action?.type === 'random-difficulty') {
      return `Start a ${this.difficultyLabel(action.difficulty)} game?`;
    }
    return 'Start a new random game?';
  }

  confirmationDescription(): string {
    return 'Your current unfinished progress will be replaced. Local best times will be kept.';
  }

  difficultyLabel(difficulty: Difficulty): string {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  }

  kindLabel(kind: GameKind): string {
    return kind.charAt(0).toUpperCase() + kind.slice(1);
  }

  formatTime(milliseconds: number | null): string {
    if (milliseconds === null) {
      return '—';
    }

    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return hours > 0
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      : `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  dailyDisplay(): string {
    return `${this.storedSessions.dailyDate} UTC`;
  }

  cellValue(index: number): number {
    return this.session()?.values[index] ?? 0;
  }

  cellNotes(index: number): number[] {
    return this.session()?.notes[index] ?? [];
  }

  isGiven(index: number): boolean {
    return (this.session()?.puzzle[index] ?? 0) !== 0;
  }

  isPeer(index: number): boolean {
    return this.selectedPeers().has(index);
  }

  isMatching(index: number): boolean {
    const selectedValue = this.selectedValue();
    return selectedValue !== 0 && this.cellValue(index) === selectedValue;
  }

  isConflict(index: number): boolean {
    return this.conflicts().has(index);
  }

  isCompletedDigit(digit: number): boolean {
    return this.completedNumberSet().has(digit);
  }

  cellClasses(index: number): Record<string, boolean> {
    const current = this.session();
    return {
      'is-given': this.isGiven(index),
      'is-user-value': !this.isGiven(index) && this.cellValue(index) !== 0,
      'is-peer': this.isPeer(index),
      'is-matching': this.isMatching(index),
      'is-selected': current?.selectedIndex === index,
      'is-conflict': this.isConflict(index),
      'box-right': index % 9 === 2 || index % 9 === 5,
      'box-bottom': Math.floor(index / 9) === 2 || Math.floor(index / 9) === 5,
    };
  }

  cellAriaLabel(index: number): string {
    const row = Math.floor(index / 9) + 1;
    const column = index % 9 + 1;
    const value = this.cellValue(index);
    const notes = this.cellNotes(index);
    const content = value
      ? `${this.isGiven(index) ? 'given ' : ''}${value}`
      : notes.length > 0 ? `notes ${notes.join(', ')}` : 'empty';
    const conflict = this.isConflict(index) ? ', conflict' : '';

    return `Row ${row}, column ${column}, ${content}${conflict}`;
  }

  canUndo(): boolean {
    const current = this.session();
    return Boolean(current && !current.paused && !current.completed && current.undoStack.length > 0);
  }

  canRedo(): boolean {
    const current = this.session();
    return Boolean(current && !current.paused && !current.completed && current.redoStack.length > 0);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.isBrowser || !this.initialized()) {
      return;
    }

    if (this.confirmation()) {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.cancelConfirmation();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        this.confirmAction();
      }
      return;
    }

    const modifier = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();

    if (modifier && key === 'z') {
      event.preventDefault();
      if (event.shiftKey) {
        this.redoMove();
      } else {
        this.undoMove();
      }
      return;
    }

    if (modifier && key === 'y') {
      event.preventDefault();
      this.redoMove();
      return;
    }

    if (/^[1-9]$/.test(event.key)) {
      event.preventDefault();
      this.enterDigit(Number(event.key));
      return;
    }

    if (event.key === '0' || event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      this.clearCell();
      return;
    }

    if (key === 'n') {
      event.preventDefault();
      this.toggleNotesMode();
      return;
    }

    if (key === 'h') {
      event.preventDefault();
      this.useHint();
      return;
    }

    if (key === 'p') {
      event.preventDefault();
      this.togglePause();
      return;
    }

    if (event.target instanceof HTMLElement && event.target.classList.contains('sudoku-cell')) {
      const movement: Record<string, [number, number]> = {
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1],
      };
      const delta = movement[event.key];
      if (delta) {
        event.preventDefault();
        this.moveSelection(delta[0], delta[1]);
      }
    }
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange(): void {
    if (!this.isBrowser || !this.initialized()) {
      return;
    }

    if (this.document.hidden) {
      const current = this.session();
      if (current && !current.paused && !current.completed) {
        this.session.set(pauseSession(current, Date.now()));
        this.stashCurrent(false);
        this.saveAll();
        this.announcement.set('Game auto-paused while the page was hidden.');
      }
      return;
    }

    this.checkDailyRollover();
  }

  @HostListener('window:beforeunload')
  onBeforeUnload(): void {
    this.saveAll();
  }

  private initializeBrowser(): void {
    if (!this.isBrowser || this.initialized()) {
      return;
    }

    try {
      this.storage = window.localStorage;
      const date = utcDateKey();
      this.storedSessions = loadStoredSessions(this.storage, date);
      this.bestTimes.set(loadBestTimes(this.storage));
    } catch {
      this.storage = null;
      this.storedSessions = emptyStoredSessions(utcDateKey());
    }

    this.initialized.set(true);
    this.activateDaily('medium', false);
    this.lastAutoSave = Date.now();
    this.timerId = window.setInterval(() => {
      const now = Date.now();
      this.now.set(now);
      if (now - this.lastAutoSave >= 5000) {
        this.checkDailyRollover();
        this.saveAll();
        this.lastAutoSave = now;
      }
    }, 250);
  }

  private activateDaily(difficulty: Difficulty, stashCurrent = true): void {
    if (stashCurrent) {
      this.stashCurrent(true);
    }

    this.activeKind.set('daily');
    this.activeDifficulty.set(difficulty);
    this.isNewRecord.set(false);

    const existing = this.storedSessions.daily[difficulty];
    if (existing) {
      this.session.set(existing);
      this.announcement.set(`${this.difficultyLabel(difficulty)} daily restored. Resume when ready.`);
    } else {
      const seed = dailySeed(this.storedSessions.dailyDate, difficulty);
      const created = createSession(
        generatePuzzle(seed, difficulty),
        'daily',
        this.storedSessions.dailyDate,
        Date.now(),
      );
      this.session.set(created);
      this.storedSessions.daily[difficulty] = created;
      this.announcement.set(`${this.difficultyLabel(difficulty)} daily started.`);
    }

    this.saveAll();
  }

  private startRandom(difficulty: Difficulty): void {
    this.stashCurrent(true);
    const seed = this.createRandomSeed(difficulty);
    const created = createSession(generatePuzzle(seed, difficulty), 'random', null, Date.now());
    this.activeKind.set('random');
    this.activeDifficulty.set(difficulty);
    this.session.set(created);
    this.storedSessions.random = created;
    this.isNewRecord.set(false);
    this.announcement.set(`New ${this.difficultyLabel(difficulty)} random game started.`);
    this.saveAll();
  }

  private createRandomSeed(difficulty: Difficulty): string {
    this.randomCounter += 1;
    const randomValues = new Uint32Array(2);

    if (this.isBrowser && window.crypto?.getRandomValues) {
      window.crypto.getRandomValues(randomValues);
    } else {
      randomValues[0] = Date.now() >>> 0;
      randomValues[1] = this.randomCounter;
    }

    return `sudoku-v1:random:${difficulty}:${randomValues[0]}:${randomValues[1]}:${this.randomCounter}`;
  }

  private commitSession(next: SudokuSession, announceCompletion = true): void {
    const previous = this.session();
    if (!previous || next === previous) {
      return;
    }

    this.session.set(next);

    if (!previous.completed && next.completed) {
      const result = updateBestTime(
        this.bestTimes(),
        next.kind,
        next.difficulty,
        next.elapsedMs,
        !next.usedHint,
      );
      this.bestTimes.set(result.bestTimes);
      this.isNewRecord.set(result.isNewRecord);

      if (announceCompletion) {
        this.announcement.set(next.usedHint
          ? `Puzzle completed in ${this.formatTime(next.elapsedMs)}. Assisted games do not set records.`
          : `Puzzle completed in ${this.formatTime(next.elapsedMs)}${result.isNewRecord ? ', a new local best' : ''}.`,
        );
      }

      if (this.storage) {
        try {
          saveBestTimes(this.storage, result.bestTimes);
        } catch {
          // Storage is optional; the active game continues in memory.
        }
      }
    }

    this.stashCurrent(false);
    this.saveAll();
  }

  private stashCurrent(pause: boolean): void {
    const current = this.session();
    if (!current) {
      return;
    }

    const stored = pause ? pauseSession(current, Date.now()) : current;
    if (pause && stored !== current) {
      this.session.set(stored);
    }

    if (stored.kind === 'daily') {
      this.storedSessions.daily[stored.difficulty] = stored;
    } else {
      this.storedSessions.random = stored;
    }
  }

  private saveAll(): void {
    if (!this.storage || !this.initialized()) {
      return;
    }

    this.stashCurrent(false);

    try {
      saveStoredSessions(this.storage, this.storedSessions, Date.now());
      saveBestTimes(this.storage, this.bestTimes());
    } catch {
      // Storage can be unavailable or full; gameplay remains fully in memory.
    }
  }

  private moveSelection(rowDelta: number, columnDelta: number): void {
    const current = this.session();
    if (!current || current.paused || current.completed) {
      return;
    }

    const row = Math.floor(current.selectedIndex / 9);
    const column = current.selectedIndex % 9;
    const nextRow = Math.min(8, Math.max(0, row + rowDelta));
    const nextColumn = Math.min(8, Math.max(0, column + columnDelta));
    this.selectCell(nextRow * 9 + nextColumn, true);
  }

  private openConfirmation(action: ConfirmationAction): void {
    if (this.isBrowser && this.document.activeElement instanceof HTMLElement) {
      this.confirmationReturnFocus = this.document.activeElement;
    }

    this.confirmation.set(action);

    if (this.isBrowser) {
      queueMicrotask(() => this.document.getElementById('sudoku-confirm-cancel')?.focus());
    }
  }

  private closeConfirmation(): void {
    this.confirmation.set(null);

    if (this.isBrowser) {
      const returnFocus = this.confirmationReturnFocus;
      this.confirmationReturnFocus = null;
      queueMicrotask(() => returnFocus?.focus());
    }
  }

  private checkDailyRollover(): void {
    const date = utcDateKey();
    if (date === this.storedSessions.dailyDate) {
      return;
    }

    this.stashCurrent(true);
    this.storedSessions = {
      version: 1,
      dailyDate: date,
      daily: {},
      random: this.storedSessions.random,
    };

    if (this.activeKind() === 'daily') {
      this.activateDaily(this.activeDifficulty(), false);
      this.announcement.set('A new UTC daily puzzle is available.');
    } else {
      this.saveAll();
    }
  }
}

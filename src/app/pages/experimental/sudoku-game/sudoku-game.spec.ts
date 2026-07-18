import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SudokuGameComponent } from './sudoku-game';
import { SUDOKU_BEST_TIMES_KEY, SUDOKU_SESSIONS_KEY } from './game/storage';

const ACCENT_COLORS = [
  '#0252a7',
  '#E94823',
  '#eab308',
  '#a70210',
  '#02a736',
  '#4b369d',
  '#79911d',
] as const;

type Rgb = [number, number, number];

function parseCssColor(value: string): Rgb {
  const rgb = value.match(
    /^rgba?\(\s*([\d.]+)(?:\s*,\s*|\s+)([\d.]+)(?:\s*,\s*|\s+)([\d.]+)/i,
  );
  if (rgb) {
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  }

  const srgb = value.match(
    /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/i,
  );
  if (srgb) {
    return [
      Number(srgb[1]) * 255,
      Number(srgb[2]) * 255,
      Number(srgb[3]) * 255,
    ];
  }

  throw new Error('Unsupported computed color: ' + value);
}

function contrastRatio(foreground: string, background: string): number {
  const luminance = (color: Rgb): number => {
    const channels = color.map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.04045
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });

    return (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
  };

  const foregroundLuminance = luminance(parseCssColor(foreground));
  const backgroundLuminance = luminance(parseCssColor(background));
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
    / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
}

describe('SudokuGameComponent', () => {
  let component: SudokuGameComponent;
  let fixture: ComponentFixture<SudokuGameComponent>;

  beforeEach(async () => {
    localStorage.removeItem(SUDOKU_SESSIONS_KEY);
    localStorage.removeItem(SUDOKU_BEST_TIMES_KEY);

    await TestBed.configureTestingModule({
      imports: [SudokuGameComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SudokuGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
    fixture.nativeElement.style.removeProperty('--primary-color');
    fixture.destroy();
  });

  it('starts on the medium daily puzzle with an accessible 81-cell grid', () => {
    expect(component.activeKind()).toBe('daily');
    expect(component.activeDifficulty()).toBe('medium');
    expect(component.session()).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('[role="gridcell"]').length).toBe(81);
    expect(fixture.nativeElement.querySelector('[role="grid"]')?.getAttribute('aria-label')).toBe('Sudoku board');
  });

  it('supports notes, undo, redo, and keyboard pause', () => {
    const editableIndex = component.session()!.puzzle.findIndex((value) => value === 0);
    component.selectCell(editableIndex);
    component.toggleNotesMode();
    component.enterDigit(3);
    expect(component.session()!.notes[editableIndex]).toContain(3);

    component.undoMove();
    expect(component.session()!.notes[editableIndex]).not.toContain(3);
    component.redoMove();
    expect(component.session()!.notes[editableIndex]).toContain(3);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }));
    expect(component.session()!.paused).toBeTrue();
  });

  it('marks hints as assisted and auto-pauses when hidden', () => {
    component.useHint();
    expect(component.session()!.usedHint).toBeTrue();

    const visibility = spyOnProperty(document, 'hidden', 'get').and.returnValue(true);
    component.onVisibilityChange();
    expect(component.session()!.paused).toBeTrue();
    visibility.and.callThrough();
  });

  it('disables gameplay controls while paused and focuses modal confirmation', async () => {
    component.togglePause();
    fixture.detectChanges();

    const numberButtons = fixture.nativeElement.querySelectorAll('.number-pad button') as NodeListOf<HTMLButtonElement>;
    expect([...numberButtons].every((button) => button.disabled)).toBeTrue();

    component.requestRestart();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement?.id).toBe('sudoku-confirm-cancel');
  });

  it('shows the daily identity as a short UTC-safe date', () => {
    const internals = component as unknown as {
      storedSessions: { dailyDate: string };
    };
    internals.storedSessions.dailyDate = '2026-07-18';

    expect(component.dailyDisplay()).toBe('Jul 18');
  });

  it('labels the selected-cell action Erase and removes all notes together', () => {
    const editableIndex = component.session()!.puzzle.findIndex((value) => value === 0);
    component.session.update((current) => current ? {
      ...current,
      selectedIndex: editableIndex,
      notes: current.notes.map((notes, index) =>
        index === editableIndex ? [1, 4, 9] : notes,
      ),
    } : current);
    fixture.detectChanges();

    const buttons = [...fixture.nativeElement.querySelectorAll('.tool-grid button')] as HTMLButtonElement[];
    const eraseButton = buttons.find((button) => button.textContent?.trim() === 'Erase');
    expect(eraseButton).toBeDefined();
    expect(buttons.some((button) => button.textContent?.trim() === 'Clear')).toBeFalse();

    eraseButton!.click();
    fixture.detectChanges();
    expect(component.session()!.notes[editableIndex]).toEqual([]);
    expect(fixture.nativeElement.querySelector('.keyboard-help').textContent).toContain(
      'Delete erases the selected cell',
    );
  });

  it('keeps dense candidate notes in readable fixed 3 by 3 positions', () => {
    const editableIndex = component.session()!.puzzle.findIndex((value) => value === 0);
    component.session.update((current) => current ? {
      ...current,
      selectedIndex: editableIndex,
      notes: current.notes.map((notes, index) =>
        index === editableIndex ? [...component.digits] : notes,
      ),
    } : current);

    const host = fixture.nativeElement as HTMLElement;
    host.style.width = '358px';
    fixture.detectChanges();

    const cell = host.querySelector('#sudoku-cell-' + editableIndex) as HTMLElement;
    const noteGrid = cell.querySelector('.cell-notes') as HTMLElement;
    const slots = [...noteGrid.querySelectorAll('span')] as HTMLElement[];
    const rows = new Set(slots.map((slot) => slot.getBoundingClientRect().top.toFixed(1)));
    const columns = new Set(slots.map((slot) => slot.getBoundingClientRect().left.toFixed(1)));
    const cellRect = cell.getBoundingClientRect();

    expect(slots.map((slot) => slot.textContent?.trim())).toEqual(
      component.digits.map(String),
    );
    expect(rows.size).toBe(3);
    expect(columns.size).toBe(3);
    expect(parseFloat(getComputedStyle(noteGrid).fontSize)).toBeGreaterThanOrEqual(8);
    expect(slots.every((slot) => {
      const rect = slot.getBoundingClientRect();
      return rect.left >= cellRect.left && rect.right <= cellRect.right
        && rect.top >= cellRect.top && rect.bottom <= cellRect.bottom;
    })).toBeTrue();
  });

  it('preserves independent Daily and Random progress through theme changes', () => {
    const daily = component.session()!;
    const dailyIndex = daily.puzzle.findIndex((value) => value === 0);
    component.selectCell(dailyIndex);
    component.enterDigit(daily.solution[dailyIndex]);
    const dailyState = {
      seed: component.session()!.seed,
      values: [...component.session()!.values],
      notes: component.session()!.notes.map((notes) => [...notes]),
    };

    component.activateKind('random');
    const random = component.session()!;
    const randomIndex = random.puzzle.findIndex((value) => value === 0);
    component.selectCell(randomIndex);
    component.enterDigit(random.solution[randomIndex]);
    const randomState = {
      seed: component.session()!.seed,
      values: [...component.session()!.values],
      notes: component.session()!.notes.map((notes) => [...notes]),
    };

    fixture.nativeElement.style.setProperty('--primary-color', '#eab308');
    document.documentElement.classList.add('dark');
    fixture.detectChanges();

    component.activateKind('daily');
    expect(component.session()!.seed).toBe(dailyState.seed);
    expect(component.session()!.values).toEqual(dailyState.values);
    expect(component.session()!.notes).toEqual(dailyState.notes);

    component.activateKind('random');
    expect(component.session()!.seed).toBe(randomState.seed);
    expect(component.session()!.values).toEqual(randomState.values);
    expect(component.session()!.notes).toEqual(randomState.notes);
  });

  it('keeps functional state contrast distinct across all accent and theme combinations', () => {
    const current = component.session()!;
    let conflictPair: number[] = [];

    for (let row = 0; row < 9 && conflictPair.length === 0; row += 1) {
      const editable = current.puzzle
        .map((value, index) => ({ value, index }))
        .filter((cell) => cell.value === 0 && Math.floor(cell.index / 9) === row)
        .map((cell) => cell.index);
      if (editable.length >= 2) {
        conflictPair = editable.slice(0, 2);
      }
    }

    expect(conflictPair.length).toBe(2);
    const duplicateDigit = current.solution[conflictPair[0]];
    const userIndex = current.puzzle.findIndex((value, index) =>
      value === 0 && !conflictPair.includes(index) && current.solution[index] !== duplicateDigit,
    );
    const notesIndex = current.puzzle.findIndex((value, index) =>
      value === 0 && !conflictPair.includes(index) && index !== userIndex,
    );
    const values = [...current.values];
    values[conflictPair[0]] = duplicateDigit;
    values[conflictPair[1]] = duplicateDigit;
    values[userIndex] = current.solution[userIndex];

    component.activeKind.set('random');
    component.session.set({
      ...current,
      kind: 'random',
      values,
      selectedIndex: userIndex,
      notesMode: true,
      usedHint: true,
      notes: current.notes.map((notes, index) =>
        index === notesIndex ? [...component.digits] : notes,
      ),
      undoStack: [],
      redoStack: [],
    });
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const activeMode = host.querySelector('.mode-group button[aria-pressed="true"]') as HTMLElement;
    const activeNotes = [...host.querySelectorAll('.tool-grid button')]
      .find((button) => button.textContent?.includes('Notes')) as HTMLElement;
    const primaryAction = host.querySelector('.primary-action') as HTMLElement;
    const disabledUndo = [...host.querySelectorAll('.tool-grid button')]
      .find((button) => button.textContent?.trim() === 'Undo') as HTMLButtonElement;
    const givenCell = host.querySelector('.sudoku-cell.is-given') as HTMLElement;
    const userCell = host.querySelector('#sudoku-cell-' + userIndex) as HTMLElement;
    const notesCell = host.querySelector('#sudoku-cell-' + notesIndex) as HTMLElement;
    const conflictCell = host.querySelector('#sudoku-cell-' + conflictPair[0]) as HTMLElement;
    const lightErrorColors = new Set<string>();
    const darkErrorColors = new Set<string>();

    for (const accent of ACCENT_COLORS) {
      for (const dark of [false, true]) {
        host.style.setProperty('--primary-color', accent);
        document.documentElement.classList.toggle('dark', dark);
        fixture.detectChanges();

        for (const element of [activeMode, activeNotes, primaryAction, userCell, notesCell, conflictCell]) {
          const style = getComputedStyle(element);
          expect(contrastRatio(style.color, style.backgroundColor))
            .withContext(accent + ' ' + (dark ? 'dark' : 'light') + ' ' + element.className)
            .toBeGreaterThanOrEqual(4.5);
        }

        const conflictStyle = getComputedStyle(conflictCell);
        (dark ? darkErrorColors : lightErrorColors).add(conflictStyle.color);
        expect(getComputedStyle(givenCell).color).not.toBe(getComputedStyle(userCell).color);
        expect(Number(getComputedStyle(disabledUndo).opacity)).toBeLessThan(1);
        expect(host.querySelector('.assisted-badge')).not.toBeNull();

        component.session.update((session) => session ? {
          ...session,
          selectedIndex: conflictPair[0],
        } : session);
        fixture.detectChanges();
        const selectedConflict = host.querySelector('#sudoku-cell-' + conflictPair[0]) as HTMLElement;
        expect(getComputedStyle(selectedConflict).boxShadow).not.toBe('none');
        expect(getComputedStyle(selectedConflict.querySelector('.cell-value')!).textDecorationLine)
          .toContain('underline');

        component.session.update((session) => session ? {
          ...session,
          selectedIndex: userIndex,
        } : session);
        fixture.detectChanges();
      }
    }

    expect(lightErrorColors.size).toBe(1);
    expect(darkErrorColors.size).toBe(1);
  });

  for (const { viewportWidth, viewportHeight, contentWidth, stacked } of [
    { viewportWidth: 390, viewportHeight: 844, contentWidth: 358, stacked: true },
    { viewportWidth: 430, viewportHeight: 932, contentWidth: 398, stacked: true },
    { viewportWidth: 1366, viewportHeight: 768, contentWidth: 944, stacked: false },
    { viewportWidth: 1440, viewportHeight: 900, contentWidth: 944, stacked: false },
  ]) {
    it(`renders without responsive collisions at ${viewportWidth} by ${viewportHeight}`, () => {
      const host = fixture.nativeElement as HTMLElement;
      host.style.display = 'block';
      host.style.width = `${contentWidth}px`;
      fixture.detectChanges();

      expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth);

      const board = host.querySelector('.sudoku-board') as HTMLElement;
      const controlPanel = host.querySelector('.control-panel') as HTMLElement;
      const intro = host.querySelector('.sudoku-header > div:first-child') as HTMLElement;
      const modeGroup = host.querySelector('.mode-group') as HTMLElement;
      const numberButtons = [...host.querySelectorAll('.number-pad button')] as HTMLButtonElement[];
      const selectorButtons = [...host.querySelectorAll('.mode-group button, .difficulty-bar button')] as HTMLButtonElement[];

      expect(board).not.toBeNull();
      expect(numberButtons.length).toBe(9);
      expect(numberButtons.every((button) => button.getBoundingClientRect().width >= 44)).toBeTrue();
      expect(numberButtons.every((button) => button.getBoundingClientRect().height >= 44)).toBeTrue();
      expect(selectorButtons.every((button) => button.getBoundingClientRect().height >= 44)).toBeTrue();

      if (stacked) {
        expect(controlPanel.getBoundingClientRect().top)
          .toBeGreaterThanOrEqual(board.getBoundingClientRect().bottom);
        expect(modeGroup.getBoundingClientRect().height).toBeLessThan(80);
        expect(modeGroup.getBoundingClientRect().top - intro.getBoundingClientRect().bottom)
          .toBeLessThanOrEqual(24);
      } else {
        expect(controlPanel.getBoundingClientRect().left)
          .toBeGreaterThanOrEqual(board.getBoundingClientRect().right);
      }
    });
  }
});

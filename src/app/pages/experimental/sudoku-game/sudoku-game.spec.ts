import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SudokuGameComponent } from './sudoku-game';
import { SUDOKU_BEST_TIMES_KEY, SUDOKU_SESSIONS_KEY } from './game/storage';

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

  afterEach(() => fixture.destroy());

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

  for (const { viewportWidth, contentWidth } of [
    { viewportWidth: 393, contentWidth: 361 },
    { viewportWidth: 320, contentWidth: 288 },
  ]) {
    it(`fits and keeps touch controls usable in a ${viewportWidth}px portrait viewport`, () => {
      const host = fixture.nativeElement as HTMLElement;
      host.style.display = 'block';
      host.style.width = `${contentWidth}px`;
      fixture.detectChanges();

      expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth);

      const board = host.querySelector('.sudoku-board') as HTMLElement;
      const controlPanel = host.querySelector('.control-panel') as HTMLElement;
      const numberButtons = [...host.querySelectorAll('.number-pad button')] as HTMLButtonElement[];
      const selectorButtons = [...host.querySelectorAll('.mode-group button, .difficulty-bar button')] as HTMLButtonElement[];

      expect(board).not.toBeNull();
      expect(controlPanel.getBoundingClientRect().top).toBeGreaterThanOrEqual(board.getBoundingClientRect().bottom);
      expect(numberButtons.length).toBe(9);
      expect(numberButtons.every((button) => button.getBoundingClientRect().width >= 44)).toBeTrue();
      expect(numberButtons.every((button) => button.getBoundingClientRect().height >= 44)).toBeTrue();
      expect(selectorButtons.every((button) => button.getBoundingClientRect().height >= 44)).toBeTrue();
    });
  }
});

/**
 * Gate A — the quarter race.
 *
 * A ticking clock, three competing sinks, and an assembly step at the end whose menu is whatever
 * you actually managed to produce.
 *
 * Angular HTML and colored blocks. **If this looks good, effort went to the wrong place.**
 */

import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Q1 } from '../content/quarters';
import {
  advanceBy,
  assemblyOptions,
  reallocate,
  resolveQuarter,
  setFocus,
  startQuarter,
  type Allocation,
  type PartKind,
  type ProductionFocus,
  type QuarterOutcome,
  type QuarterState,
} from '../sim/index';
import {
  inEndgame,
  marketReadiness,
  quarterProgress,
  researchProgress,
  stockRows,
  timeRemaining,
} from './quarter-view-model';

/** Real milliseconds between simulation steps. Matches the 10 Hz authoritative tick (I-005). */
const STEP_MS = 100;

@Component({
  selector: 'obsolescence-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './obsolescence-game.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObsolescenceGameComponent implements OnDestroy {
  readonly config = Q1;

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private timer: ReturnType<typeof setInterval> | null = null;

  readonly state = signal<QuarterState>(startQuarter(Q1, 4242));
  readonly seed = signal(4242);
  readonly speed = signal(1);
  readonly running = signal(false);
  readonly outcome = signal<QuarterOutcome | null>(null);

  readonly remaining = computed(() => timeRemaining(this.state(), this.config));
  readonly progress = computed(() => quarterProgress(this.state(), this.config));
  readonly endgame = computed(() => inEndgame(this.state(), this.config));
  readonly stock = computed(() => stockRows(this.state().stock));
  readonly research = computed(() => researchProgress(this.state(), this.config));
  readonly market = computed(() => marketReadiness(this.state(), this.config));
  readonly options = computed(() => assemblyOptions(this.state().stock));
  readonly atDeadline = computed(() => this.state().phase !== 'running');
  readonly recentLog = computed(() => this.state().log.slice(-5).reverse());

  readonly focusOptions: readonly ProductionFocus[] = ['balanced', 'chassis', 'board', 'cell'];
  readonly speeds = [1, 2, 4];

  /** Typed here rather than inline in the template, which `strictTemplates` will not index. */
  readonly sinks: readonly { key: keyof Allocation; label: string; note: string }[] = [
    { key: 'research', label: 'Research', note: 'Raises the tier you can build' },
    { key: 'production', label: 'Production', note: 'Fills the shelves' },
    { key: 'market', label: 'Market prep', note: 'Decides if anyone hears about it' },
  ];

  staffIn(sink: keyof Allocation): number {
    return this.state().allocation[sink];
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  // --- clock --------------------------------------------------------------

  toggleRun(): void {
    if (this.running()) {
      this.pause();
      return;
    }
    if (this.atDeadline()) {
      return;
    }
    this.running.set(true);
    if (!this.isBrowser) {
      return;
    }
    this.timer = setInterval(() => this.step(), STEP_MS);
  }

  pause(): void {
    this.running.set(false);
    this.stopTimer();
  }

  setSpeed(value: number): void {
    this.speed.set(value);
  }

  /** Skips to the deadline. Useful when the interesting decisions are already made. */
  skipToDeadline(): void {
    this.pause();
    this.state.update((current) => advanceBy(current, this.config, this.config.lengthTicks));
  }

  restart(): void {
    this.pause();
    this.outcome.set(null);
    this.state.set(startQuarter(this.config, this.seed()));
  }

  nextSeed(): void {
    this.seed.update((value) => value + 1);
    this.restart();
  }

  private step(): void {
    const next = advanceBy(this.state(), this.config, this.speed());
    this.state.set(next);
    if (next.phase !== 'running') {
      this.pause();
    }
  }

  private stopTimer(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  // --- decisions ----------------------------------------------------------

  get allocation(): Allocation {
    return this.state().allocation;
  }

  /** Staff not currently assigned to anything. */
  readonly unassigned = computed(() => {
    const { research, production, market } = this.state().allocation;
    return this.config.staff - research - production - market;
  });

  assign(sink: keyof Allocation, value: number): void {
    const current = this.state().allocation;
    const requested = Math.max(0, Math.round(value));
    const others = this.config.staff - (current.research + current.production + current.market - current[sink]);
    const next: Allocation = { ...current, [sink]: Math.min(requested, Math.max(0, others)) };
    this.state.update((state) => reallocate(state, this.config, next));
  }

  chooseFocus(focus: ProductionFocus): void {
    this.state.update((state) => setFocus(state, focus));
  }

  asNumber(value: unknown): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  labelFor(kind: PartKind): string {
    return kind.charAt(0).toUpperCase() + kind.slice(1);
  }

  // --- assembly -----------------------------------------------------------

  build(optionId: string): void {
    this.outcome.set(resolveQuarter(this.state(), this.config, optionId));
  }

  shipNothing(): void {
    this.outcome.set(resolveQuarter(this.state(), this.config, null));
  }
}

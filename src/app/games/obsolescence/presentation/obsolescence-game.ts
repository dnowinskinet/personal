/**
 * The tower.
 *
 * The quarter race from Gate A, played on a building. Staff assignment is spatial: you put people
 * on floors, and a floor you have not built cannot hold anyone. Cash and standing carry between
 * quarters and buy floors (D-020, D-021).
 *
 * Still deliberately plain — boxes in a column, no renderer, no art.
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

import { CAMPAIGN_START, FLOORS } from '../content/floors';
import { FACILITY_CONFIG } from '../content/facility/balance';
import { FACILITY_CONTENT } from '../content/facility/catalogue';
import { SCENARIOS, scenarioById } from '../content/facility/scenarios';
import { LADDER } from '../content/quarters';
import {
  advanceBy,
  applyConstruction,
  assemblyOptions,
  buildTopology,
  createFacility,
  tickFacility,
  DEFAULT_TRAVEL_COSTS,
  bookQuarter,
  buyFloor,
  deriveAllocation,
  floorViews,
  idleStaff,
  placeStaff,
  reallocate,
  resolveQuarter,
  setFocus,
  spend,
  startCampaign,
  startQuarter,
  totalStaffPlaced,
  type FacilityState,
  type FloorDefinition,
  type ProductionFocus,
  type Room,
  type QuarterOutcome,
  type QuarterState,
} from '../sim/index';
import { FacilityViewComponent, type RoomDraft } from './facility-view';
import { TowerViewComponent } from './tower-view';
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

type Mode = 'tower' | 'quarter' | 'facility';

@Component({
  selector: 'obsolescence-game',
  standalone: true,
  imports: [CommonModule, FacilityViewComponent, TowerViewComponent],
  templateUrl: './obsolescence-game.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObsolescenceGameComponent implements OnDestroy {
  readonly floors = FLOORS;
  readonly speeds = [1, 2, 4];

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private timer: ReturnType<typeof setInterval> | null = null;

  readonly campaign = signal(startCampaign(FLOORS, CAMPAIGN_START));
  readonly mode = signal<Mode>('tower');
  readonly speed = signal(1);
  readonly running = signal(false);
  readonly outcome = signal<QuarterOutcome | null>(null);

  /** The quarter about to be played. Clamps to the last rung so the ladder does not run out. */
  readonly config = computed(() => LADDER[Math.min(this.campaign().quarterIndex, LADDER.length - 1)]);

  readonly state = signal<QuarterState>(startQuarter(LADDER[0], CAMPAIGN_START.seed));

  // --- tower --------------------------------------------------------------

  readonly tower = computed(() => {
    const campaign = this.campaign();
    return floorViews(campaign.building, this.floors, campaign.cash, campaign.standing);
  });

  readonly placed = computed(() => totalStaffPlaced(this.campaign().building));
  readonly unplaced = computed(() => this.config().staff - this.placed());
  readonly idle = computed(() => idleStaff(this.campaign().building, this.floors));
  readonly allocation = computed(() => deriveAllocation(this.campaign().building, this.floors));

  /** Everything on the shelf, drawn as crates in the stores. */
  readonly partsOnHand = computed(() => {
    const stock = this.state().stock;
    let total = 0;
    for (const kind of this.config().partKinds) {
      total += stock[kind][1] + stock[kind][2] + stock[kind][3];
    }
    return total;
  });

  /** True when nobody is anywhere useful — starting a quarter like this would waste it. */
  readonly nobodyWorking = computed(() => {
    const { research, production, market } = this.allocation();
    return research + production + market === 0;
  });

  // --- quarter ------------------------------------------------------------

  readonly remaining = computed(() => timeRemaining(this.state(), this.config()));
  readonly progress = computed(() => quarterProgress(this.state(), this.config()));
  readonly endgame = computed(() => inEndgame(this.state(), this.config()));
  readonly stock = computed(() => stockRows(this.state().stock, this.config().partKinds));
  readonly research = computed(() => researchProgress(this.state(), this.config()));
  readonly market = computed(() => marketReadiness(this.state(), this.config()));
  readonly atDeadline = computed(() => this.state().phase !== 'running');
  readonly options = computed(() =>
    assemblyOptions(this.state().stock, this.config().partKinds, this.config().enabled.research ? 3 : 1)
  );
  readonly focusOptions = computed<readonly ProductionFocus[]>(() => [
    'balanced',
    ...this.config().partKinds,
  ]);

  // --- facility -----------------------------------------------------------

  /**
   * The facility runs on the same 10 Hz tick as the quarter, driven by the same play/pause.
   *
   * It starts on the baseline fixture rather than an empty building, because an empty facility has
   * nothing to explain and the whole point of this view is the explanations.
   */
  readonly facility = signal<FacilityState>(facilityFrom(SCENARIOS[0].id));

  /** Room layouts before each edit, so construction mistakes are recoverable. */
  private readonly facilityHistory = signal<readonly (readonly Room[])[]>([]);

  onBuildRoom(draft: RoomDraft): void {
    const room: Room = {
      id: `${draft.typeId}-${this.facility().rooms.length + 1}`,
      typeId: draft.typeId,
      level: draft.level,
      span: { from: draft.from, to: draft.to },
      objects: draft.objects,
    };
    this.editFacility((rooms) => [...rooms, room]);
  }

  onDemolishRoom(id: string): void {
    this.editFacility((rooms) => rooms.filter((room) => room.id !== id));
  }

  onMoveRoom(event: { id: string; from: number; to: number; level: number }): void {
    this.editFacility((rooms) =>
      rooms.map((room) =>
        room.id === event.id ? { ...room, span: { from: event.from, to: event.to } } : room
      )
    );
  }

  showFacility(): void {
    this.pause();
    this.mode.set('facility');
  }

  showCampaign(): void {
    this.pause();
    this.mode.set(this.state().phase === 'running' && this.running() ? 'quarter' : 'tower');
  }

  onLoadScenario(id: string): void {
    this.pause();
    this.facilityHistory.set([]);
    this.facility.set(facilityFrom(id));
  }

  onUndoFacility(): void {
    const history = this.facilityHistory();
    const previous = history[history.length - 1];
    if (previous === undefined) {
      return;
    }
    this.facilityHistory.set(history.slice(0, -1));
    this.facility.update((state) => applyConstruction(state, previous));
  }

  /**
   * Applies a construction edit through `applyConstruction`, which is what invalidates topology and
   * releases reservations. The view never writes rooms directly.
   */
  private editFacility(change: (rooms: readonly Room[]) => readonly Room[]): void {
    const state = this.facility();
    this.facilityHistory.update((history) => [...history.slice(-19), state.rooms]);
    this.facility.set(applyConstruction(state, change(state.rooms)));
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  // --- staffing and building ----------------------------------------------

  /** Moves one person on or off a floor. Buttons rather than a drag — works on a phone (I-014). */
  onAdjust(event: { floorId: string; delta: number }): void {
    this.adjustStaff(event.floorId, event.delta);
  }

  adjustStaff(floorId: string, delta: number): void {
    const campaign = this.campaign();
    const current = campaign.building.staffing[floorId] ?? 0;
    const building = placeStaff(
      campaign.building,
      this.floors,
      floorId,
      current + delta,
      this.config().staff
    );
    if (building === campaign.building) {
      return;
    }
    this.campaign.set({ ...campaign, building });

    // Moving people mid-quarter IS the reallocation the design rewards, so push it straight through.
    if (this.mode() === 'quarter' && !this.atDeadline()) {
      this.state.update((state) =>
        reallocate(state, this.config(), deriveAllocation(building, this.floors))
      );
    }
  }

  buy(floor: FloorDefinition): void {
    const campaign = this.campaign();
    const result = buyFloor(campaign.building, floor, campaign.cash, campaign.standing);
    if (result === null) {
      return;
    }
    this.campaign.set(spend(campaign, result.building, result.cash));
  }

  // --- quarter lifecycle --------------------------------------------------

  beginQuarter(): void {
    const config = this.config();
    let next = startQuarter(config, this.campaign().seed + this.campaign().quarterIndex);
    next = reallocate(next, config, this.allocation());
    this.state.set(next);
    this.outcome.set(null);
    this.mode.set('quarter');
  }

  toggleRun(): void {
    if (this.running()) {
      this.pause();
      return;
    }
    if (this.mode() !== 'facility' && this.atDeadline()) {
      return;
    }
    this.running.set(true);
    if (this.isBrowser) {
      this.timer = setInterval(() => this.step(), STEP_MS);
    }
  }

  pause(): void {
    this.running.set(false);
    this.stopTimer();
  }

  setSpeed(value: number): void {
    this.speed.set(value);
  }

  skipToDeadline(): void {
    this.pause();
    this.state.update((current) => advanceBy(current, this.config(), this.config().lengthTicks));
  }

  chooseFocus(focus: ProductionFocus): void {
    this.state.update((state) => setFocus(state, focus, this.config()));
  }

  build(optionId: string | null): void {
    this.pause();
    this.outcome.set(resolveQuarter(this.state(), this.config(), optionId));
  }

  /** Books the quarter and returns to the tower to spend what it earned. */
  finishQuarter(): void {
    const result = this.outcome();
    if (result === null) {
      return;
    }
    this.campaign.update((campaign) => bookQuarter(campaign, this.config().id, result));
    this.outcome.set(null);
    this.mode.set('tower');
  }

  restartCampaign(): void {
    this.pause();
    this.campaign.set(startCampaign(FLOORS, CAMPAIGN_START));
    this.state.set(startQuarter(LADDER[0], CAMPAIGN_START.seed));
    this.outcome.set(null);
    this.mode.set('tower');
  }

  private step(): void {
    if (this.mode() === 'facility') {
      let next = this.facility();
      for (let i = 0; i < this.speed(); i += 1) {
        next = tickFacility(next, FACILITY_CONTENT, FACILITY_CONFIG);
      }
      this.facility.set(next);
      return;
    }
    const next = advanceBy(this.state(), this.config(), this.speed());
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

  // --- display helpers ----------------------------------------------------

  levelLabel(level: number): string {
    if (level === 0) {
      return 'ST';
    }
    return level > 0 ? `+${level}` : `B${-level}`;
  }

  sinkLabel(sink: string | null): string {
    switch (sink) {
      case 'research':
        return 'research';
      case 'production':
        return 'production';
      case 'market':
        return 'market prep';
      default:
        return 'no job yet';
    }
  }

  money(value: number): string {
    return value.toLocaleString();
  }
}

/** Builds a facility from a named fixture. Falls back to the baseline if the id is unknown. */
function facilityFrom(id: string): FacilityState {
  const scenario = scenarioById(id) ?? SCENARIOS[0];
  return createFacility(
    scenario.rooms,
    scenario.staff,
    buildTopology(scenario.levels, DEFAULT_TRAVEL_COSTS),
    scenario.seed
  );
}

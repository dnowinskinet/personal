/**
 * The facility floor plan.
 *
 * A cutaway of the building drawn from simulation state, plus the inspector that answers the nine
 * questions the milestone requires, plus a development overlay and scenario drawer.
 *
 * Read-only with respect to the simulation (I-011): every mutation goes through a command on the
 * facility state, never through the view touching state directly.
 */

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

import { FACILITY_CONFIG } from '../content/facility/balance';
import { FACILITY_CONTENT, OBJECTS, PROFESSION_NAMES, ROOM_TYPES } from '../content/facility/catalogue';
import { SCENARIOS } from '../content/facility/scenarios';
import {
  blockerLine,
  timeShares,
  type FacilityState,
  type Room,
  type Staff,
} from '../sim/index';
import {
  GRID,
  floorRows,
  interruptingNeed,
  levelLabel,
  missingQualification,
  resumptionStatus,
  scoreRows,
  utilizationRows,
  whatWaitingFor,
  whereGoing,
  whichJob,
  whyNotThisStation,
  whyNotWorking,
  whyRoomInvalid,
  type FloorRow,
  type RoomBox,
} from './facility-view-model';

/** A room the player is drawing but has not committed. */
export interface RoomDraft {
  readonly typeId: string;
  readonly level: number;
  readonly from: number;
  readonly to: number;
  readonly objects: readonly string[];
}

@Component({
  selector: 'facility-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './facility-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacilityViewComponent {
  readonly state = input.required<FacilityState>();

  readonly build = output<RoomDraft>();
  readonly demolish = output<string>();
  readonly moveRoom = output<{ id: string; from: number; to: number; level: number }>();
  readonly loadScenario = output<string>();
  readonly undo = output<void>();

  readonly content = FACILITY_CONTENT;
  readonly roomTypes = ROOM_TYPES;
  readonly scenarios = SCENARIOS;
  readonly grid = GRID;
  readonly professionNames = PROFESSION_NAMES;

  readonly selectedStaffId = signal<string | null>(null);
  readonly selectedRoomId = signal<string | null>(null);
  readonly showOverlay = signal(false);
  readonly showDrawer = signal(false);

  /** Room construction: the type being placed, and the span being drawn. */
  readonly draftTypeId = signal<string>(ROOM_TYPES[0].id);
  readonly draftLevel = signal<number>(1);
  readonly draftFrom = signal<number | null>(null);
  readonly draftTo = signal<number | null>(null);
  readonly draftObjects = signal<readonly string[]>([]);

  readonly floors = computed<readonly FloorRow[]>(() => floorRows(this.state(), this.content));
  readonly shares = computed(() => timeShares(this.state()));
  readonly utilization = computed(() => utilizationRows(this.state(), this.content));

  readonly selectedStaff = computed<Staff | null>(
    () => this.state().staff.find((worker) => worker.id === this.selectedStaffId()) ?? null
  );
  readonly selectedRoom = computed<Room | null>(
    () => this.state().rooms.find((room) => room.id === this.selectedRoomId()) ?? null
  );

  /** Objects that may go in the room type currently being drafted. */
  readonly draftableObjects = computed(() => {
    const definition = ROOM_TYPES.find((entry) => entry.id === this.draftTypeId());
    if (definition === undefined) {
      return [];
    }
    const allowed = new Set<string>([
      ...definition.requiredObjects.map((entry) => entry.category),
      ...definition.optionalCategories,
    ]);
    return OBJECTS.filter((object) => allowed.has(object.category));
  });

  /** Whether the current draft would be a legal room, and why not if it would not. */
  readonly draftProblems = computed<readonly string[]>(() => {
    const from = this.draftFrom();
    const to = this.draftTo();
    if (from === null || to === null) {
      return ['Click two cells on a floor to set the room extent.'];
    }
    const draft: Room = {
      id: '__draft__',
      typeId: this.draftTypeId(),
      level: this.draftLevel(),
      span: { from: Math.min(from, to), to: Math.max(from, to) },
      objects: this.draftObjects(),
    };
    const state = this.state();
    return whyRoomInvalid(draft, { ...state, rooms: [...state.rooms, draft] }, this.content);
  });

  readonly draftValid = computed(() => this.draftProblems().length === 0);

  // --- the nine questions ------------------------------------------------------------------

  readonly answers = computed<readonly { question: string; answer: string }[]>(() => {
    const worker = this.selectedStaff();
    const state = this.state();
    if (worker === null) {
      return [];
    }
    return [
      { question: 'Why is this employee not working?', answer: whyNotWorking(worker, state) },
      { question: 'What job are they trying to perform?', answer: whichJob(worker, state, this.content) },
      { question: 'What are they waiting for?', answer: whatWaitingFor(worker, state) },
      {
        question: 'What qualification is missing?',
        answer: missingQualification(worker, state, this.content, this.professionNames).join(' '),
      },
      {
        question: 'Why is this room invalid?',
        answer: this.roomProblemAnswer(),
      },
      { question: 'Why can this employee not use this station?', answer: this.stationAnswer() },
      { question: 'Which need interrupted the job?', answer: interruptingNeed(worker, FACILITY_CONFIG.thresholds) },
      { question: 'Where is the employee going?', answer: whereGoing(worker, state, this.content) },
      { question: 'Was their prior job reserved for resumption?', answer: resumptionStatus(worker, state) },
    ];
  });

  private roomProblemAnswer(): string {
    const room = this.selectedRoom();
    if (room === null) {
      return 'Select a room to check it.';
    }
    const problems = whyRoomInvalid(room, this.state(), this.content);
    return problems.length === 0 ? `${room.id} is operational.` : problems.join(' ');
  }

  private stationAnswer(): string {
    const worker = this.selectedStaff();
    const room = this.selectedRoom();
    if (worker === null || room === null) {
      return 'Select an employee and a room.';
    }
    const box = this.floors()
      .flatMap((floor) => floor.rooms)
      .find((entry) => entry.id === room.id);
    const station = box?.stations.find((entry) => entry.role === 'station');
    if (station === undefined) {
      return `${room.id} has no work station.`;
    }
    return whyNotThisStation(worker, station.stationId, this.state(), this.content, this.professionNames);
  }

  readonly staffBlocker = computed(() => {
    const worker = this.selectedStaff();
    return worker === null ? '' : blockerLine(this.state().blockers[worker.id] ?? null);
  });

  readonly scores = computed(() => {
    const worker = this.selectedStaff();
    return worker === null ? [] : scoreRows(worker, this.state());
  });

  // --- interaction --------------------------------------------------------------------------

  selectStaff(id: string): void {
    this.selectedStaffId.set(this.selectedStaffId() === id ? null : id);
  }

  selectRoom(id: string): void {
    this.selectedRoomId.set(this.selectedRoomId() === id ? null : id);
  }

  cellClicked(level: number, cell: number): void {
    this.draftLevel.set(level);
    const from = this.draftFrom();
    if (from === null || this.draftTo() !== null) {
      this.draftFrom.set(cell);
      this.draftTo.set(null);
      return;
    }
    this.draftTo.set(cell);
  }

  toggleDraftObject(objectId: string): void {
    const current = this.draftObjects();
    this.draftObjects.set(
      current.includes(objectId)
        ? current.filter((entry) => entry !== objectId)
        : [...current, objectId]
    );
  }

  addDraftObject(objectId: string): void {
    this.draftObjects.set([...this.draftObjects(), objectId]);
  }

  clearDraft(): void {
    this.draftFrom.set(null);
    this.draftTo.set(null);
    this.draftObjects.set([]);
  }

  commitDraft(): void {
    const from = this.draftFrom();
    const to = this.draftTo();
    if (from === null || to === null || !this.draftValid()) {
      return;
    }
    this.build.emit({
      typeId: this.draftTypeId(),
      level: this.draftLevel(),
      from: Math.min(from, to),
      to: Math.max(from, to),
      objects: this.draftObjects(),
    });
    this.clearDraft();
  }

  setDraftType(typeId: string): void {
    this.draftTypeId.set(typeId);
    this.draftObjects.set([]);
  }

  demolishSelected(): void {
    const room = this.selectedRoom();
    if (room !== null) {
      this.demolish.emit(room.id);
      this.selectedRoomId.set(null);
    }
  }

  /** Problems with the currently selected room, for the room panel. */
  readonly whyInvalid = computed<readonly string[]>(() => {
    const room = this.selectedRoom();
    return room === null ? [] : whyRoomInvalid(room, this.state(), this.content);
  });

  /** Nudge the selected room along its floor — the cheapest way to exercise topology invalidation. */
  nudgeSelected(by: number): void {
    const room = this.selectedRoom();
    if (room === null) {
      return;
    }
    this.moveRoom.emit({
      id: room.id,
      from: room.span.from + by,
      to: room.span.to + by,
      level: room.level,
    });
  }

  cells(): readonly number[] {
    return Array.from({ length: GRID.width }, (_, index) => index);
  }

  isCore(cell: number): boolean {
    return (
      (cell >= GRID.personnelCore.from && cell <= GRID.personnelCore.to) ||
      (cell >= GRID.freightCore.from && cell <= GRID.freightCore.to)
    );
  }

  inDraft(level: number, cell: number): boolean {
    const from = this.draftFrom();
    const to = this.draftTo();
    if (from === null || this.draftLevel() !== level) {
      return false;
    }
    if (to === null) {
      return cell === from;
    }
    return cell >= Math.min(from, to) && cell <= Math.max(from, to);
  }

  percent(value: number): string {
    return `${Math.round(value * 100)}%`;
  }

  levelName(level: number): string {
    return levelLabel(level);
  }

  trackByRoom = (_: number, room: RoomBox): string => room.id;
  trackByFloor = (_: number, floor: FloorRow): number => floor.level;
  trackByCell = (_: number, cell: number): number => cell;
}

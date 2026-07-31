/**
 * The facility view: the canonical tower scene, plus the panels around it.
 *
 * The building is the primary surface — rooms, staff, needs and blockers are read off the cutaway
 * itself. The inspector still answers the nine required questions, the development overlay and
 * scenario drawer remain, and build mode overlays bay guides on the tower for zoning rooms.
 *
 * Read-only with respect to the simulation (I-002): every mutation goes through a command on the
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
  validateRoom,
  type FacilityState,
  type Room,
  type Staff,
} from '../sim/index';
import { FacilityTowerViewComponent } from './facility-tower-view';
import {
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
  imports: [CommonModule, FacilityTowerViewComponent],
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
  readonly professionNames = PROFESSION_NAMES;

  readonly selectedStaffId = signal<string | null>(null);
  readonly selectedRoomId = signal<string | null>(null);
  readonly showOverlay = signal(false);
  readonly showDrawer = signal(false);

  /** Build mode shows the bay guides on the tower and arms the cell targets. */
  readonly buildMode = signal(false);

  /** Room construction: the type being placed, and the span being drawn. */
  readonly draftTypeId = signal<string>(ROOM_TYPES[0].id);
  readonly draftLevel = signal<number>(1);
  readonly draftFrom = signal<number | null>(null);
  readonly draftTo = signal<number | null>(null);
  readonly draftObjects = signal<readonly string[]>([]);

  /** Bay currently under the pointer, for the live span preview. */
  readonly hover = signal<{ level: number; cell: number } | null>(null);

  readonly floors = computed<readonly FloorRow[]>(() => floorRows(this.state(), this.content));
  readonly shares = computed(() => timeShares(this.state()));
  readonly utilization = computed(() => utilizationRows(this.state(), this.content));

  readonly selectedStaff = computed<Staff | null>(
    () => this.state().staff.find((worker) => worker.id === this.selectedStaffId()) ?? null
  );
  readonly selectedRoom = computed<Room | null>(
    () => this.state().rooms.find((room) => room.id === this.selectedRoomId()) ?? null
  );

  readonly draftTypeName = computed(
    () => ROOM_TYPES.find((entry) => entry.id === this.draftTypeId())?.name ?? 'Room'
  );

  /** Hovered bay on the floor being drafted, for extending the preview. */
  readonly hoverCellOnDraftLevel = computed<number | null>(() => {
    const hover = this.hover();
    if (hover === null) {
      return null;
    }
    if (this.draftFrom() !== null && hover.level !== this.draftLevel()) {
      return null;
    }
    return hover.cell;
  });

  /**
   * Structural validity of the span being previewed — everything except equipment requirements,
   * which cannot be satisfied while still dragging out walls. Colors the preview on the tower.
   */
  readonly previewValid = computed<boolean | null>(() => {
    const from = this.draftFrom();
    if (from === null) {
      return null;
    }
    const to = this.draftTo() ?? this.hoverCellOnDraftLevel() ?? from;
    const draft: Room = {
      id: '__draft__',
      typeId: this.draftTypeId(),
      level: this.draftLevel(),
      span: { from: Math.min(from, to), to: Math.max(from, to) },
      objects: this.draftObjects(),
    };
    const state = this.state();
    const validity = validateRoom(draft, this.content, state.rooms, state.topology.levels);
    return !validity.reasons.some((reason) => reason !== 'missing-required-object');
  });

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

  /** Names of the objects placed in the draft, in placement order. */
  readonly draftObjectNames = computed(() =>
    this.draftObjects().map((objectId, index) => ({
      key: `${objectId}-${index}`,
      index,
      name: OBJECTS.find((object) => object.id === objectId)?.name ?? objectId,
    }))
  );

  /** Whether the current draft would be a legal room, and why not if it would not. */
  readonly draftProblems = computed<readonly string[]>(() => {
    const from = this.draftFrom();
    const to = this.draftTo();
    if (from === null || to === null) {
      return ['Pick two bays on a floor to set the room extent.'];
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

  readonly draftStatus = computed<string>(() => {
    const from = this.draftFrom();
    const to = this.draftTo();
    if (from === null) {
      return 'Click a bay on any floor to start the room.';
    }
    if (to === null) {
      return `Started on ${levelLabel(this.draftLevel())}. Click the far end of the room.`;
    }
    const width = Math.abs(to - from) + 1;
    return `${width} ${width === 1 ? 'bay' : 'bays'} on ${levelLabel(this.draftLevel())}.`;
  });

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

  /** Problems with the currently selected room, for the room panel. */
  readonly whyInvalid = computed<readonly string[]>(() => {
    const room = this.selectedRoom();
    return room === null ? [] : whyRoomInvalid(room, this.state(), this.content);
  });

  readonly selectedRoomTypeName = computed<string>(() => {
    const room = this.selectedRoom();
    if (room === null) {
      return '';
    }
    return ROOM_TYPES.find((entry) => entry.id === room.typeId)?.name ?? room.typeId;
  });

  // --- interaction --------------------------------------------------------------------------

  toggleBuildMode(): void {
    const next = !this.buildMode();
    this.buildMode.set(next);
    if (!next) {
      this.clearDraft();
      this.hover.set(null);
    }
  }

  selectStaff(id: string): void {
    this.selectedStaffId.set(this.selectedStaffId() === id ? null : id);
  }

  selectRoom(id: string): void {
    this.selectedRoomId.set(this.selectedRoomId() === id ? null : id);
  }

  onCellPick(event: { level: number; cell: number }): void {
    const from = this.draftFrom();
    if (from === null || this.draftTo() !== null || this.draftLevel() !== event.level) {
      this.draftLevel.set(event.level);
      this.draftFrom.set(event.cell);
      this.draftTo.set(null);
      return;
    }
    this.draftTo.set(event.cell);
  }

  onCellHover(event: { level: number; cell: number } | null): void {
    this.hover.set(event);
  }

  toggleDraftObject(index: number): void {
    this.draftObjects.set(this.draftObjects().filter((_, position) => position !== index));
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

  percent(value: number): string {
    return `${Math.round(value * 100)}%`;
  }

  levelName(level: number): string {
    return levelLabel(level);
  }
}

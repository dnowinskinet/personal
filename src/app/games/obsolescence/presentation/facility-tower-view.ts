/**
 * The facility tower — the canonical cutaway scene.
 *
 * A fixed-width, side-on building drawn from simulation state: offices above, the Showroom at
 * grade, the Loading Dock below it with an exterior ramp and truck apron, basements beneath, the
 * stair core on the right and the freight core on the left. Rooms, equipment and staff are all
 * projections of `FacilityState`; nothing here mutates anything (I-002).
 *
 * The scene commits to its own night palette rather than `currentColor`. This is a game canvas —
 * the same miniature building in both site themes — while every panel around it stays theme-aware.
 * Positions come from `facility-tower-layout.ts`, which also documents the mirrored x-projection.
 *
 * Movement: staff translate between cell positions with a CSS transition on `transform`. The
 * interpolation is cosmetic; simulation positions stay whole cells (I-005).
 */

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, output } from '@angular/core';

import { FACILITY_CONFIG } from '../content/facility/balance';
import { FACILITY_CONTENT } from '../content/facility/catalogue';
import {
  CORRIDOR_FROM,
  CORRIDOR_TO,
  pressingNeed,
  type FacilityState,
  type NeedKind,
  type Staff,
} from '../sim/index';
import {
  BUILDING_LEFT,
  BUILDING_RIGHT,
  CANVAS_W,
  CELL_W,
  FREIGHT_CORE,
  INTERIOR_LEFT,
  INTERIOR_RIGHT,
  RAMP_TOP_X,
  ROOF_T,
  SKY_H,
  SLAB_T,
  STAIR_CORE,
  bayGuideXs,
  cellCenterX,
  cellLeftX,
  cityBlocks,
  facilityTowerLayout,
  spanRect,
  stairFlight,
  ceilingLightXs,
  storyFor,
  type CityBlock,
  type StairFlight,
  type Story,
} from './facility-tower-layout';
import { floorRows, type FloorRow } from './facility-view-model';

interface CellHit {
  readonly cell: number;
  readonly x: number;
}

interface StoryDraw {
  readonly level: number;
  readonly kind: Story['kind'];
  readonly label: string;
  readonly y: number;
  readonly h: number;
  readonly floorY: number;
  readonly slabY: number;
  readonly lights: readonly number[];
  readonly stair: StairFlight;
  readonly pipes: boolean;
  readonly pipeJoints: readonly number[];
  readonly isDock: boolean;
  readonly isShowroom: boolean;
  readonly mullions: readonly number[];
  readonly cells: readonly CellHit[];
}

interface EquipmentDraw {
  readonly key: string;
  readonly objectId: string;
  readonly x: number;
  readonly w: number;
  readonly occupied: boolean;
  readonly title: string;
}

interface RoomDraw {
  readonly id: string;
  readonly x: number;
  readonly w: number;
  readonly y: number;
  readonly h: number;
  readonly floorY: number;
  readonly typeClass: string;
  readonly label: string;
  readonly valid: boolean;
  readonly selected: boolean;
  readonly doorX: number;
  readonly equipment: readonly EquipmentDraw[];
  readonly title: string;
}

type Pose = 'stand' | 'walk' | 'work' | 'use' | 'sit' | 'queue';

interface StaffDraw {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly pose: Pose;
  readonly professionClass: string;
  readonly blocked: boolean;
  readonly need: NeedKind | null;
  readonly selected: boolean;
  readonly name: string;
  readonly title: string;
}

interface DraftDraw {
  readonly x: number;
  readonly w: number;
  readonly y: number;
  readonly h: number;
  /** true = would be a legal box, false = would not, null = still picking the first end. */
  readonly valid: boolean | null;
  readonly label: string;
  readonly doorX: number;
  readonly floorY: number;
}

interface PlinthDraw {
  readonly key: string;
  readonly x: number;
}

/** Where a station or amenity stands, for placing the figures that work or use it. */
interface SpotIndex {
  readonly centerX: number;
  readonly level: number;
  readonly restores: NeedKind | null;
}

@Component({
  selector: 'oi-facility-tower',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './facility-tower-view.html',
  styleUrl: './facility-tower-view.scss',
  // Every class is oit- prefixed; emulated encapsulation would only bloat each selector with
  // scoping attributes, which is what blew the component-style budget.
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacilityTowerViewComponent {
  readonly state = input.required<FacilityState>();
  readonly buildMode = input<boolean>(false);
  readonly draftLevel = input<number | null>(null);
  readonly draftFrom = input<number | null>(null);
  readonly draftTo = input<number | null>(null);
  readonly hoverCell = input<number | null>(null);
  /** Structural validity of the previewed span, computed by the parent. */
  readonly hoverValid = input<boolean | null>(null);
  readonly draftTypeLabel = input<string>('Room');
  readonly selectedStaffId = input<string | null>(null);
  readonly selectedRoomId = input<string | null>(null);

  readonly cellPick = output<{ level: number; cell: number }>();
  readonly cellHover = output<{ level: number; cell: number } | null>();
  readonly roomPick = output<string>();
  readonly staffPick = output<string>();

  private readonly content = FACILITY_CONTENT;

  // Layout constants the template draws with directly.
  readonly canvasW = CANVAS_W;
  readonly skyH = SKY_H;
  readonly roofT = ROOF_T;
  readonly slabT = SLAB_T;
  readonly cellW = CELL_W;
  readonly buildingLeft = BUILDING_LEFT;
  readonly buildingRight = BUILDING_RIGHT;
  readonly interiorLeft = INTERIOR_LEFT;
  readonly interiorRight = INTERIOR_RIGHT;
  readonly stairCore = STAIR_CORE;
  readonly freightCore = FREIGHT_CORE;
  readonly rampTopX = RAMP_TOP_X;
  readonly guideXs = bayGuideXs();

  readonly layout = computed(() => facilityTowerLayout(this.state().topology.levels));
  readonly viewBox = computed(() => `0 0 ${this.layout().width} ${this.layout().height}`);
  readonly city = computed<readonly CityBlock[]>(() => cityBlocks(this.layout()));

  private readonly rows = computed<readonly FloorRow[]>(() => floorRows(this.state(), this.content));

  readonly stories = computed<readonly StoryDraw[]>(() =>
    this.layout().stories.map((story, index) => ({
      level: story.level,
      kind: story.kind,
      label: story.label,
      y: story.y,
      h: story.h,
      floorY: story.floorY,
      slabY: story.y - SLAB_T,
      lights: ceilingLightXs(story),
      stair: stairFlight(story, index),
      pipes: story.kind === 'basement' || story.kind === 'dock',
      pipeJoints: pipeJointXs(),
      isDock: story.kind === 'dock',
      isShowroom: story.kind === 'showroom',
      mullions: story.kind === 'showroom' ? mullionXs() : [],
      cells: this.zonableCells(),
    }))
  );

  private zonableCells(): readonly CellHit[] {
    const cells: CellHit[] = [];
    for (let cell = CORRIDOR_FROM; cell <= CORRIDOR_TO; cell += 1) {
      cells.push({ cell, x: cellLeftX(cell) });
    }
    return cells;
  }

  readonly rooms = computed<readonly RoomDraw[]>(() => {
    const layout = this.layout();
    const selected = this.selectedRoomId();
    const draws: RoomDraw[] = [];
    for (const row of this.rows()) {
      const story = storyFor(layout, row.level);
      if (story === undefined) {
        continue;
      }
      for (const room of row.rooms) {
        const rect = spanRect({ from: room.from, to: room.from + room.width - 1 });
        draws.push({
          id: room.id,
          x: rect.x,
          w: rect.width,
          y: story.y,
          h: story.h,
          floorY: story.floorY,
          typeClass: `oit-room--${room.isSupport ? 'support' : 'work'} oit-room--${cssSafe(room.typeName)}`,
          label: room.typeName.toUpperCase(),
          valid: room.valid,
          selected: selected === room.id,
          doorX: cellLeftX(room.doorAt) + (CELL_W - 26) / 2,
          equipment: room.stations.map((station) => ({
            key: station.stationId,
            objectId: station.objectId,
            x: cellLeftX(station.from + station.width - 1),
            w: station.width * CELL_W,
            occupied: station.occupiedBy !== null,
            title: `${station.name} — ${station.status}`,
          })),
          title: room.valid
            ? `${room.typeName} — operational`
            : `${room.typeName} — ${room.problems.join(' ')}`,
        });
      }
    }
    return draws;
  });

  /** Station and amenity positions, for standing the figures that hold or use them. */
  private readonly spots = computed<ReadonlyMap<string, SpotIndex>>(() => {
    const map = new Map<string, SpotIndex>();
    for (const row of this.rows()) {
      for (const room of row.rooms) {
        for (const station of room.stations) {
          const left = cellLeftX(station.from + station.width - 1);
          const object = this.content.objects.find((entry) => entry.id === station.objectId);
          map.set(station.stationId, {
            centerX: left + (station.width * CELL_W) / 2,
            level: room.level,
            restores: object?.restoresNeed ?? null,
          });
        }
      }
    }
    return map;
  });

  readonly staff = computed<readonly StaffDraw[]>(() => {
    const state = this.state();
    const layout = this.layout();
    const spots = this.spots();
    const selected = this.selectedStaffId();
    const draws: StaffDraw[] = [];
    for (const worker of state.staff) {
      const placed = this.place(worker, state, spots);
      const story = storyFor(layout, placed.level);
      if (story === undefined) {
        continue;
      }
      draws.push({
        id: worker.id,
        x: placed.x,
        y: story.floorY,
        pose: placed.pose,
        professionClass: `oit-staff--${cssSafe(worker.profession)}`,
        blocked: state.blockers[worker.id] != null,
        need: this.needFor(worker, spots),
        selected: selected === worker.id,
        name: worker.name,
        title: `${worker.name} — ${worker.state.replace(/_/g, ' ')}`,
      });
    }
    return draws;
  });

  /**
   * Where a figure stands. Working staff stand at their reserved station and amenity users at
   * their amenity; the simulation parks both on the room's access cell, which would pile every
   * figure onto one spot. Purely cosmetic — selection and the inspector still report sim truth.
   */
  private place(
    worker: Staff,
    state: FacilityState,
    spots: ReadonlyMap<string, SpotIndex>
  ): { x: number; level: number; pose: Pose } {
    if (worker.state === 'working' && worker.reservation !== null) {
      const spot = spots.get(worker.reservation.stationId);
      if (spot !== undefined) {
        return { x: spot.centerX, level: spot.level, pose: 'work' };
      }
    }
    if (worker.state === 'using_amenity' && worker.amenityId !== null) {
      const spot = spots.get(worker.amenityId);
      if (spot !== undefined) {
        return { x: spot.centerX, level: spot.level, pose: spot.restores === 'energy' ? 'sit' : 'use' };
      }
    }
    if (worker.state === 'queue_for_amenity' && worker.amenityId !== null) {
      const spot = spots.get(worker.amenityId);
      if (spot !== undefined) {
        const queue = state.queues[worker.amenityId] ?? [];
        const position = Math.max(0, queue.indexOf(worker.id));
        return { x: spot.centerX + 14 + position * 13, level: spot.level, pose: 'queue' };
      }
    }
    const pose: Pose =
      worker.state === 'travel_to_job' || worker.state === 'travel_to_amenity'
        ? 'walk'
        : worker.state === 'working'
          ? 'work'
          : 'stand';
    return { x: cellCenterX(worker.location.x), level: worker.location.level, pose };
  }

  private needFor(worker: Staff, spots: ReadonlyMap<string, SpotIndex>): NeedKind | null {
    if (worker.state === 'travel_to_amenity' || worker.state === 'queue_for_amenity' || worker.state === 'using_amenity') {
      if (worker.amenityId !== null) {
        const spot = spots.get(worker.amenityId);
        if (spot?.restores != null) {
          return spot.restores;
        }
      }
      return pressingNeed(worker.needs, FACILITY_CONFIG.thresholds);
    }
    if (worker.state === 'urgent_need_interrupt') {
      return pressingNeed(worker.needs, FACILITY_CONFIG.thresholds);
    }
    return null;
  }

  /** The in-progress room box while building: committed span, or first end plus hover. */
  readonly draft = computed<DraftDraw | null>(() => {
    if (!this.buildMode()) {
      return null;
    }
    const level = this.draftLevel();
    const from = this.draftFrom();
    if (level === null || from === null) {
      return null;
    }
    const story = storyFor(this.layout(), level);
    if (story === undefined) {
      return null;
    }
    const to = this.draftTo() ?? this.hoverCell() ?? from;
    const span = { from: Math.min(from, to), to: Math.max(from, to) };
    const rect = spanRect(span);
    const width = span.to - span.from + 1;
    return {
      x: rect.x,
      w: rect.width,
      y: story.y,
      h: story.h,
      floorY: story.floorY,
      valid: this.hoverValid(),
      label: `${this.draftTypeLabel()} — ${width} ${width === 1 ? 'bay' : 'bays'}`,
      doorX: cellLeftX(Math.max(span.from, CORRIDOR_FROM)) + (CELL_W - 26) / 2,
    };
  });

  /** Display plinths in showroom span not covered by rooms — set dressing, not simulation. */
  readonly plinths = computed<readonly PlinthDraw[]>(() => {
    const showroom = this.layout().stories.find((story) => story.kind === 'showroom');
    if (showroom === undefined) {
      return [];
    }
    const covered = new Set<number>();
    for (const row of this.rows()) {
      if (row.level !== showroom.level) {
        continue;
      }
      for (const room of row.rooms) {
        for (let cell = room.from; cell < room.from + room.width; cell += 1) {
          covered.add(cell);
        }
      }
    }
    const runs: { from: number; to: number }[] = [];
    let run: { from: number; to: number } | null = null;
    for (let cell = CORRIDOR_FROM; cell <= CORRIDOR_TO; cell += 1) {
      if (covered.has(cell)) {
        run = null;
        continue;
      }
      if (run === null) {
        run = { from: cell, to: cell };
        runs.push(run);
      } else {
        run.to = cell;
      }
    }
    const draws: PlinthDraw[] = [];
    for (const span of runs) {
      const width = span.to - span.from + 1;
      if (width < 3) {
        continue;
      }
      const step = Math.max(3, Math.floor(width / 3));
      for (let cell = span.from + 1; cell + 1 <= span.to && draws.length < 6; cell += step) {
        draws.push({ key: `plinth-${cell}`, x: cellCenterX(cell) });
      }
    }
    return draws;
  });

  /** Entrance doors sit in the widest uncovered showroom run. */
  readonly entranceX = computed<number | null>(() => {
    const showroom = this.layout().stories.find((story) => story.kind === 'showroom');
    if (showroom === undefined) {
      return null;
    }
    const covered = new Set<number>();
    for (const row of this.rows()) {
      if (row.level !== showroom.level) {
        continue;
      }
      for (const room of row.rooms) {
        for (let cell = room.from; cell < room.from + room.width; cell += 1) {
          covered.add(cell);
        }
      }
    }
    let best: { from: number; to: number } | null = null;
    let run: { from: number; to: number } | null = null;
    for (let cell = CORRIDOR_FROM; cell <= CORRIDOR_TO; cell += 1) {
      if (covered.has(cell)) {
        run = null;
        continue;
      }
      run = run === null ? { from: cell, to: cell } : { from: run.from, to: cell };
      if (best === null || run.to - run.from > best.to - best.from) {
        best = run;
      }
    }
    if (best === null || best.to - best.from + 1 < 2) {
      return null;
    }
    return cellCenterX(Math.round((best.from + best.to) / 2));
  });

  onCellClick(level: number, cell: number): void {
    this.cellPick.emit({ level, cell });
  }

  onCellEnter(level: number, cell: number): void {
    this.cellHover.emit({ level, cell });
  }

  onCellLeave(): void {
    this.cellHover.emit(null);
  }

  trackStory = (_: number, story: StoryDraw): number => story.level;
  trackRoom = (_: number, room: RoomDraw): string => room.id;
  trackStaff = (_: number, worker: StaffDraw): string => worker.id;
  trackCell = (_: number, hit: CellHit): number => hit.cell;
  trackEquipment = (_: number, item: EquipmentDraw): string => item.key;
}

/** Lowercase id-safe fragment for a CSS class. */
function cssSafe(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
}

/** Storefront glazing mullions, every two bays across the showroom glass. */
function mullionXs(): readonly number[] {
  const xs: number[] = [];
  const from = FREIGHT_CORE.left + FREIGHT_CORE.width;
  for (let x = from + CELL_W * 2; x < STAIR_CORE.left - 4; x += CELL_W * 2) {
    xs.push(x);
  }
  return xs;
}

/** Valve positions along the basement ceiling pipe run. */
function pipeJointXs(): readonly number[] {
  const from = FREIGHT_CORE.left + FREIGHT_CORE.width + 6;
  const to = STAIR_CORE.left - 6;
  return [0.22, 0.52, 0.84].map((fraction) => from + fraction * (to - from));
}

/**
 * Geometry for the tower cutaway.
 *
 * Pure arithmetic — no Angular, no DOM. The component binds to what this returns, so the layout is
 * testable headlessly and the drawing code stays declarative.
 *
 * Coordinates follow R3's fixed-width vertical section: a constant building width, ordinary floors
 * on a constant pitch, a double-height showroom at the street hinge, and continuous personnel and
 * freight cores running the full height.
 */

import type { FloorView } from '../sim/index';

/** Overall canvas. Fixed width — the building never gets wider, only taller (R3). */
export const CANVAS_WIDTH = 400;

/** Outer walls of the building. */
export const BUILDING_LEFT = 44;
export const BUILDING_RIGHT = 360;

/** Personnel core on the left, freight core on the right. Visibly related, never merged (R3). */
export const PERSONNEL_CORE = { x: 52, width: 26 };
export const FREIGHT_CORE = { x: 326, width: 26 };

/** Interior between the two cores, where the work actually happens. */
export const INTERIOR_LEFT = PERSONNEL_CORE.x + PERSONNEL_CORE.width;
export const INTERIOR_RIGHT = FREIGHT_CORE.x;

const SKY_HEIGHT = 44;
const ORDINARY_FLOOR = 58;
const STREET_FLOOR = 86;
const BEDROCK_FLOOR = 34;

export interface FloorLayout {
  readonly view: FloorView;
  readonly y: number;
  readonly height: number;
  readonly midY: number;
  /** True for the street-level hinge, drawn taller and heavier. */
  readonly isStreet: boolean;
  readonly isBelowGround: boolean;
}

export interface TowerLayout {
  readonly width: number;
  readonly height: number;
  /** Y of the pavement — the bottom of the street floor. Everything below is underground. */
  readonly groundY: number;
  readonly skyHeight: number;
  readonly floors: readonly FloorLayout[];
}

function heightFor(view: FloorView): number {
  if (view.definition.level === 0) {
    return STREET_FLOOR;
  }
  return view.definition.kind === 'bedrock' ? BEDROCK_FLOOR : ORDINARY_FLOOR;
}

/**
 * Stacks floors top-down and reports where the ground is.
 *
 * `views` must already be sorted highest level first, which `floorViews` guarantees.
 */
export function towerLayout(views: readonly FloorView[]): TowerLayout {
  const floors: FloorLayout[] = [];
  let y = SKY_HEIGHT;
  let groundY = SKY_HEIGHT;

  for (const view of views) {
    const height = heightFor(view);
    const isStreet = view.definition.level === 0;
    floors.push({
      view,
      y,
      height,
      midY: y + height / 2,
      isStreet,
      isBelowGround: view.definition.level < 0,
    });
    y += height;
    if (isStreet) {
      // The pavement sits at the bottom of the street floor: the showroom stands ON the ground.
      groundY = y;
    }
  }

  return { width: CANVAS_WIDTH, height: y + 8, groundY, skyHeight: SKY_HEIGHT, floors };
}

export interface StaffMark {
  readonly x: number;
  readonly y: number;
}

/**
 * Positions for the little figures on a floor.
 *
 * They fill the work lane left to right and wrap onto a second row, so a busy floor reads as busy
 * at a glance without any number being needed.
 */
export function staffMarks(floor: FloorLayout, count: number): readonly StaffMark[] {
  const marks: StaffMark[] = [];
  const laneLeft = INTERIOR_LEFT + 12;
  const laneRight = INTERIOR_RIGHT - 12;
  const perRow = Math.max(1, Math.floor((laneRight - laneLeft) / 16));
  const baseline = floor.y + floor.height - 12;

  for (let index = 0; index < count; index += 1) {
    const row = Math.floor(index / perRow);
    const column = index % perRow;
    marks.push({ x: laneLeft + column * 16, y: baseline - row * 15 });
  }
  return marks;
}

/** Small stacked crates for parts held on a basement floor. */
export function crateMarks(floor: FloorLayout, count: number): readonly StaffMark[] {
  const marks: StaffMark[] = [];
  const capped = Math.min(count, 12);
  for (let index = 0; index < capped; index += 1) {
    const column = index % 4;
    const row = Math.floor(index / 4);
    marks.push({
      x: INTERIOR_RIGHT - 16 - column * 11,
      y: floor.y + floor.height - 14 - row * 10,
    });
  }
  return marks;
}

/** Window slots along an above-ground floor, so offices read as offices. */
export function windowMarks(floor: FloorLayout): readonly StaffMark[] {
  const marks: StaffMark[] = [];
  for (let x = INTERIOR_LEFT + 10; x < INTERIOR_RIGHT - 14; x += 26) {
    marks.push({ x, y: floor.y + 12 });
  }
  return marks;
}

/**
 * Geometry for the facility tower — the canonical cutaway.
 *
 * Pure arithmetic, no Angular, no DOM. The scene component binds to what this returns, so the
 * layout is testable headlessly and the drawing stays declarative.
 *
 * The canonical vertical stack (VISUAL-CANON-NOTES.md):
 *
 *   Office Level 2        third above-ground story
 *   Office Level 1        second above-ground story
 *   Showroom              ground floor, at grade
 *   Loading Dock          first below-ground story
 *   B1                    second below-ground story
 *   B2                    third below-ground story
 *
 * One aligned rectangular footprint from the top office to the deepest basement. The vehicle ramp
 * is OUTSIDE the footprint: it leaves the street, descends to a flat truck apron, and the truck
 * backs against the Loading Dock wall. The dock interior stays a flat usable strip.
 *
 * The x-axis is MIRRORED relative to simulation cells: sim cell 0 (personnel core / stairs) draws
 * at the right edge and sim cells 22–23 (freight core) draw at the left edge, beside the apron.
 * This is a pure projection — freight enters where the truck stands, stairs read on the right —
 * and simulation coordinates remain the only truth. Nothing outside this module knows about it.
 */

import {
  CORRIDOR_FROM,
  CORRIDOR_TO,
  FLOOR_WIDTH,
  FREIGHT_CORE_CELLS,
  PERSONNEL_CORE_CELLS,
  type Span,
} from '../sim/index';

// --- horizontal metrics ----------------------------------------------------

/** Width of one simulation cell in scene units. */
export const CELL_W = 34;
/** Outer wall thickness. */
export const WALL_T = 10;
/** Slab between stories. */
export const SLAB_T = 12;

/** Exterior zone left of the footprint: ramp run plus truck apron. */
export const RAMP_RUN = 112;
export const APRON_W = 152;
export const RAMP_TOP_X = 18;

export const BUILDING_LEFT = RAMP_TOP_X + RAMP_RUN + APRON_W; // 282
export const INTERIOR_LEFT = BUILDING_LEFT + WALL_T;
export const INTERIOR_RIGHT = INTERIOR_LEFT + FLOOR_WIDTH * CELL_W;
export const BUILDING_RIGHT = INTERIOR_RIGHT + WALL_T;
export const CANVAS_W = BUILDING_RIGHT + 58;

/** Sky above the parapet, and the parapet band itself. */
export const SKY_H = 132;
export const ROOF_T = 22;

/** Cores in visual space. Personnel/stairs right, freight left — see the mirror note above. */
export const STAIR_CORE = {
  left: INTERIOR_RIGHT - (PERSONNEL_CORE_CELLS.to + 1) * CELL_W,
  width: (PERSONNEL_CORE_CELLS.to - PERSONNEL_CORE_CELLS.from + 1) * CELL_W,
} as const;
export const FREIGHT_CORE = {
  left: INTERIOR_LEFT,
  width: (FREIGHT_CORE_CELLS.to - FREIGHT_CORE_CELLS.from + 1) * CELL_W,
} as const;

/** Mirrored projection: left edge / centre of a simulation cell. */
export function cellLeftX(cell: number): number {
  return INTERIOR_RIGHT - (cell + 1) * CELL_W;
}

export function cellCenterX(cell: number): number {
  return INTERIOR_RIGHT - (cell + 0.5) * CELL_W;
}

/** A span of cells as a visual rect (x, width). */
export function spanRect(span: Span): { readonly x: number; readonly width: number } {
  return { x: cellLeftX(span.to), width: (span.to - span.from + 1) * CELL_W };
}

/** Nearest simulation cell for a visual x, clamped into the floor. Inverse of the mirror. */
export function cellAtX(x: number): number {
  const raw = Math.floor((INTERIOR_RIGHT - x) / CELL_W);
  return Math.max(0, Math.min(FLOOR_WIDTH - 1, raw));
}

/** Bay boundaries across the zonable strip, drawn as build-mode guides. */
export function bayGuideXs(): readonly number[] {
  const xs: number[] = [];
  for (let cell = CORRIDOR_FROM; cell <= CORRIDOR_TO + 1; cell += 1) {
    xs.push(INTERIOR_RIGHT - cell * CELL_W);
  }
  return xs;
}

/** The zonable strip (corridor span) as a visual rect. */
export const ZONABLE_RECT = {
  x: cellLeftX(CORRIDOR_TO),
  width: (CORRIDOR_TO - CORRIDOR_FROM + 1) * CELL_W,
} as const;

// --- vertical stack --------------------------------------------------------

export type StoryKind = 'office' | 'showroom' | 'dock' | 'basement';

/** Interior heights by story kind. The showroom is the tall hinge; the dock is industrial. */
const STORY_H: Readonly<Record<StoryKind, number>> = {
  office: 100,
  showroom: 148,
  dock: 112,
  basement: 100,
};

export function storyKind(level: number): StoryKind {
  if (level > 0) {
    return 'office';
  }
  if (level === 0) {
    return 'showroom';
  }
  return level === -1 ? 'dock' : 'basement';
}

/**
 * Canonical level names. The Loading Dock is the first below-ground story and is NOT B1;
 * B-numbering starts one story further down.
 */
export function canonicalLevelName(level: number): string {
  if (level > 0) {
    return `Office Level ${level}`;
  }
  if (level === 0) {
    return 'Showroom';
  }
  return level === -1 ? 'Loading Dock' : `B${-level - 1}`;
}

export interface Story {
  readonly level: number;
  readonly kind: StoryKind;
  readonly label: string;
  /** Top of the interior. The slab above spans [y - SLAB_T, y]. */
  readonly y: number;
  readonly h: number;
  /** The walk line — bottom of the interior. */
  readonly floorY: number;
}

export interface FacilityTowerLayout {
  readonly width: number;
  readonly height: number;
  /** Street grade — the bottom of the showroom interior. */
  readonly groundY: number;
  readonly stories: readonly Story[];
  /** Bottom of the deepest slab; earth is solid below. */
  readonly deepestY: number;
  /** Flat truck apron at dock-floor depth, outside the footprint. */
  readonly apron: { readonly left: number; readonly right: number; readonly y: number };
}

/**
 * Stacks the facility's levels top-down on the canonical pitch.
 *
 * `levels` comes straight from the simulation topology. Missing canonical stories are simply not
 * drawn — the facility decides what exists; the layout only decides where it sits.
 */
export function facilityTowerLayout(levels: readonly number[]): FacilityTowerLayout {
  const ordered = [...levels].sort((left, right) => right - left);
  const stories: Story[] = [];

  let y = SKY_H + ROOF_T;
  let groundY = y;
  for (const level of ordered) {
    const kind = storyKind(level);
    const h = STORY_H[kind];
    y += SLAB_T;
    stories.push({ level, kind, label: canonicalLevelName(level), y, h, floorY: y + h });
    y += h;
    if (level === 0) {
      groundY = y;
    }
  }
  const deepestY = y + SLAB_T;

  const dock = stories.find((story) => story.kind === 'dock');
  const apronY = dock !== undefined ? dock.floorY : groundY;

  return {
    width: CANVAS_W,
    height: deepestY + 64,
    groundY,
    stories,
    deepestY,
    apron: { left: RAMP_TOP_X + RAMP_RUN, right: BUILDING_LEFT, y: apronY },
  };
}

export function storyFor(layout: FacilityTowerLayout, level: number): Story | undefined {
  return layout.stories.find((story) => story.level === level);
}

// --- scene furniture -------------------------------------------------------

/** Backdrop city blocks. Deterministic variety from a fixed table — no randomness anywhere. */
export interface CityBlock {
  readonly x: number;
  readonly width: number;
  readonly height: number;
}

export function cityBlocks(layout: FacilityTowerLayout): readonly CityBlock[] {
  const silhouette: CityBlock[] = [];
  const pattern = [
    { width: 58, height: 150 },
    { width: 44, height: 96 },
    { width: 66, height: 188 },
    { width: 38, height: 122 },
    { width: 54, height: 84 },
    { width: 48, height: 164 },
    { width: 62, height: 108 },
    { width: 42, height: 140 },
  ];
  let x = 6;
  let index = 0;
  while (x < layout.width - 40) {
    const block = pattern[index % pattern.length];
    // Leave the tower's own footprint visually dominant: backdrop blocks are shorter there.
    const behindTower = x > BUILDING_LEFT - 30 && x < BUILDING_RIGHT + 10;
    silhouette.push({
      x,
      width: block.width,
      height: behindTower ? Math.min(block.height, 92) : block.height,
    });
    x += block.width + 10 + ((index * 7) % 12);
    index += 1;
  }
  return silhouette;
}

/** One stair flight per story, alternating direction so the core reads as a zigzag. */
export interface StairFlight {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  /** Steps drawn along the flight. */
  readonly steps: readonly { readonly x: number; readonly y: number }[];
}

export function stairFlight(story: Story, index: number): StairFlight {
  const inset = 6;
  const left = STAIR_CORE.left + inset;
  const right = STAIR_CORE.left + STAIR_CORE.width - inset;
  const bottom = story.floorY;
  const top = story.y + 6;
  const leftToRight = index % 2 === 0;
  const x1 = leftToRight ? left : right;
  const x2 = leftToRight ? right : left;
  const steps: { x: number; y: number }[] = [];
  const count = 6;
  for (let step = 1; step < count; step += 1) {
    steps.push({
      x: x1 + ((x2 - x1) * step) / count,
      y: bottom + ((top - bottom) * step) / count,
    });
  }
  return { x1, y1: bottom, x2, y2: top, steps };
}

/** Ceiling light positions for a story interior, skipping the two cores. */
export function ceilingLightXs(story: Story): readonly number[] {
  const xs: number[] = [];
  const from = FREIGHT_CORE.left + FREIGHT_CORE.width + 30;
  const to = STAIR_CORE.left - 30;
  const gap = story.kind === 'showroom' ? 150 : 190;
  for (let x = from; x <= to; x += gap) {
    xs.push(x);
  }
  return xs;
}

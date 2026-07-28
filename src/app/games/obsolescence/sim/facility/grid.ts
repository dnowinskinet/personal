/**
 * Integer cell geometry for the building.
 *
 * R10's spatial model: a fixed-width vertical section on an integer grid, with fixed structural
 * cores. Every position in the simulation is a whole-number cell — no floating point anywhere in
 * the spatial layer, because sub-cell positions are a rendering concern and would make replay
 * comparisons fragile (I-004).
 */

/** A cell on one floor. `level` is signed: 0 is street, positive above, negative below. */
export interface Cell {
  readonly level: number;
  readonly x: number;
}

/** Interior cells available on every floor, left to right. */
export const FLOOR_WIDTH = 24;

/**
 * Structural cores, given as cell ranges.
 *
 * The personnel core is how staff move between floors in this milestone. The freight core is
 * reserved and impassable — materials logistics is deferred, but the space it occupies is real, so
 * layouts built now stay valid when freight arrives.
 */
export const PERSONNEL_CORE_CELLS = { from: 0, to: 1 } as const;
export const FREIGHT_CORE_CELLS = { from: 22, to: 23 } as const;

/** The corridor runs the full usable width; rooms must touch it to have a door. */
export const CORRIDOR_FROM = 2;
export const CORRIDOR_TO = 21;

export function cellKey(cell: Cell): string {
  return `${cell.level}:${cell.x}`;
}

export function parseCellKey(key: string): Cell {
  const [level, x] = key.split(':');
  return { level: Number(level), x: Number(x) };
}

export function sameCell(left: Cell, right: Cell): boolean {
  return left.level === right.level && left.x === right.x;
}

export function isPersonnelCore(x: number): boolean {
  return x >= PERSONNEL_CORE_CELLS.from && x <= PERSONNEL_CORE_CELLS.to;
}

export function isFreightCore(x: number): boolean {
  return x >= FREIGHT_CORE_CELLS.from && x <= FREIGHT_CORE_CELLS.to;
}

/** Cells a room may occupy. Cores are structural and cannot be zoned over. */
export function isZonable(x: number): boolean {
  return x >= CORRIDOR_FROM && x <= CORRIDOR_TO;
}

/** Inclusive horizontal extent, used for rooms and for corridor spans. */
export interface Span {
  readonly from: number;
  readonly to: number;
}

export function spanWidth(span: Span): number {
  return span.to - span.from + 1;
}

export function spanContains(span: Span, x: number): boolean {
  return x >= span.from && x <= span.to;
}

export function spansOverlap(left: Span, right: Span): boolean {
  return left.from <= right.to && right.from <= left.to;
}

/** Every cell in a span, left to right. Deterministic order matters for stable IDs. */
export function spanCells(level: number, span: Span): readonly Cell[] {
  const cells: Cell[] = [];
  for (let x = span.from; x <= span.to; x += 1) {
    cells.push({ level, x });
  }
  return cells;
}

/** Horizontal distance in cells. Vertical cost is handled by the topology layer. */
export function horizontalDistance(left: Cell, right: Cell): number {
  return Math.abs(left.x - right.x);
}

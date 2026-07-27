/**
 * Building operations: ownership, staffing, and deriving the quarter's allocation from it.
 *
 * Pure. The quarter simulation never sees a building — it sees an `Allocation`, exactly as before.
 * That keeps the loop that already passed Gate A untouched while the building becomes the interface.
 */

import type { Allocation } from '../quarter/types';
import { FLOOR_SINK, type BuildingState, type FloorDefinition, type FloorView } from './types';

export function startBuilding(floors: readonly FloorDefinition[]): BuildingState {
  const owned: Record<string, boolean> = {};
  const staffing: Record<string, number> = {};
  for (const floor of floors) {
    owned[floor.id] = floor.initiallyOwned;
    staffing[floor.id] = 0;
  }
  return { owned, staffing };
}

export function isOwned(building: BuildingState, floorId: string): boolean {
  return building.owned[floorId] === true;
}

export function staffOn(building: BuildingState, floorId: string): number {
  return building.staffing[floorId] ?? 0;
}

export function totalStaffPlaced(building: BuildingState): number {
  return Object.values(building.staffing).reduce((sum, count) => sum + count, 0);
}

/**
 * Turns where people are standing into the allocation the quarter simulation consumes.
 *
 * Staff on a floor whose kind has no sink — the showroom, storage — contribute to nothing. That is
 * deliberate and honest: the showroom has no mechanical job yet, and pretending otherwise would
 * hide the fact.
 */
export function deriveAllocation(
  building: BuildingState,
  floors: readonly FloorDefinition[]
): Allocation {
  const allocation = { research: 0, production: 0, market: 0 };
  for (const floor of floors) {
    if (!isOwned(building, floor.id)) {
      continue;
    }
    const sink = FLOOR_SINK[floor.kind];
    if (sink !== null) {
      allocation[sink] += staffOn(building, floor.id);
    }
  }
  return allocation;
}

/** Staff standing somewhere that does nothing. Worth surfacing rather than hiding. */
export function idleStaff(
  building: BuildingState,
  floors: readonly FloorDefinition[]
): number {
  let idle = 0;
  for (const floor of floors) {
    if (isOwned(building, floor.id) && FLOOR_SINK[floor.kind] === null) {
      idle += staffOn(building, floor.id);
    }
  }
  return idle;
}

/**
 * Moves staff onto a floor, clamped by that floor's capacity and by how many people exist.
 *
 * Returns the same reference when nothing changes, so callers can cheaply detect a no-op.
 */
export function placeStaff(
  building: BuildingState,
  floors: readonly FloorDefinition[],
  floorId: string,
  next: number,
  totalStaff: number
): BuildingState {
  const floor = floors.find((candidate) => candidate.id === floorId);
  if (floor === undefined || !isOwned(building, floorId)) {
    return building;
  }

  const elsewhere = totalStaffPlaced(building) - staffOn(building, floorId);
  const ceiling = Math.min(floor.capacity, Math.max(0, totalStaff - elsewhere));
  const clamped = Math.max(0, Math.min(Math.round(next), ceiling));

  if (clamped === staffOn(building, floorId)) {
    return building;
  }

  return { ...building, staffing: { ...building.staffing, [floorId]: clamped } };
}

/** Why a floor cannot be bought right now, or null when it can. */
export function purchaseBlocker(
  floor: FloorDefinition,
  cash: number,
  standing: number
): string | null {
  if (floor.obstruction !== null && standing < floor.standingRequired) {
    return `${floor.obstruction} — needs standing ${floor.standingRequired}, you have ${standing}`;
  }
  if (standing < floor.standingRequired) {
    return `Needs standing ${floor.standingRequired}, you have ${standing}`;
  }
  if (cash < floor.cost) {
    return `Needs ${floor.cost.toLocaleString()} in cash`;
  }
  return null;
}

/** Buys a floor. Returns null when it cannot be bought, so callers must handle the refusal. */
export function buyFloor(
  building: BuildingState,
  floor: FloorDefinition,
  cash: number,
  standing: number
): { building: BuildingState; cash: number } | null {
  if (isOwned(building, floor.id) || purchaseBlocker(floor, cash, standing) !== null) {
    return null;
  }
  return {
    building: { ...building, owned: { ...building.owned, [floor.id]: true } },
    cash: cash - floor.cost,
  };
}

/** Everything needed to draw the tower, top floor first. */
export function floorViews(
  building: BuildingState,
  floors: readonly FloorDefinition[],
  cash: number,
  standing: number
): readonly FloorView[] {
  return [...floors]
    .sort((left, right) => right.level - left.level)
    .map((definition) => {
      const owned = isOwned(building, definition.id);
      return {
        definition,
        owned,
        staff: staffOn(building, definition.id),
        sink: FLOOR_SINK[definition.kind],
        blockedBy: owned ? null : purchaseBlocker(definition, cash, standing),
        affordable: !owned && purchaseBlocker(definition, cash, standing) === null,
      };
    });
}

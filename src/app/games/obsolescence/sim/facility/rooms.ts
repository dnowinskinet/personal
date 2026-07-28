/**
 * Room grammar — data-authored, per R10.
 *
 * Rooms are drag-zoned rectangles on one floor. A room must touch the corridor, fit its footprint
 * bounds, and contain its required objects to be valid. Invalidity is always reported as an explicit
 * checklist of reasons, never as a silent failure — R10's failure autopsies are unanimous that
 * unexplained invalid states are what makes these games feel broken.
 */

import {
  CORRIDOR_FROM,
  CORRIDOR_TO,
  isZonable,
  spanCells,
  spanWidth,
  spansOverlap,
  type Cell,
  type Span,
} from './grid';

/** What a placed object does. Stations are worked at; amenities recover needs. */
export type ObjectRole = 'station' | 'amenity' | 'support';

export type NeedKind = 'bladder' | 'hunger' | 'energy';

export interface ObjectDefinition {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly role: ObjectRole;
  /** Cells consumed inside the room. */
  readonly width: number;
  /** Professions permitted to operate this object. Empty means nobody works it. */
  readonly operatorProfessions: readonly string[];
  /** Specialization required on top of the profession, if any. */
  readonly requiredSpecialization: string | null;
  /** What kind of work this station publishes. */
  readonly jobKind: string | null;
  /** How many workers can use it at once. Exclusive stations use 1. */
  readonly slots: number;
  /** For amenities: which need it restores, and how much per tick of use. */
  readonly restoresNeed: NeedKind | null;
  readonly restorePerTick: number;
  /** Ticks a single use occupies, for amenities. */
  readonly useTicks: number;
  /** Quality contribution, capped per category by the room quality rule. */
  readonly qualityCategory: string | null;
  readonly qualityPoints: number;
}

export interface ObjectRequirement {
  readonly category: string;
  readonly count: number;
}

export interface RoomTypeDefinition {
  readonly id: string;
  readonly name: string;
  readonly minWidth: number;
  readonly maxWidth: number;
  readonly requiredObjects: readonly ObjectRequirement[];
  readonly optionalCategories: readonly string[];
  /** Professions allowed to be assigned to this room at all. Empty means any. */
  readonly validProfessions: readonly string[];
  /** Rooms below street level only, above only, or anywhere. */
  readonly placement: 'any' | 'above-ground' | 'below-ground';
  /** True for restrooms and break rooms — counted as support space in metrics. */
  readonly isSupport: boolean;
}

/** A room the player has zoned. */
export interface Room {
  readonly id: string;
  readonly typeId: string;
  readonly level: number;
  readonly span: Span;
  /** Object ids placed here, in placement order. */
  readonly objects: readonly string[];
}

export type RoomInvalidReason =
  | 'outside-zonable-area'
  | 'below-minimum-width'
  | 'above-maximum-width'
  | 'no-corridor-access'
  | 'overlaps-another-room'
  | 'floor-not-available'
  | 'wrong-placement-level'
  | 'missing-required-object';

export interface RoomValidity {
  readonly valid: boolean;
  readonly reasons: readonly RoomInvalidReason[];
  /** Human-readable, player-facing. One line per failed check. */
  readonly explanations: readonly string[];
}

export interface FacilityContent {
  readonly roomTypes: readonly RoomTypeDefinition[];
  readonly objects: readonly ObjectDefinition[];
}

export function roomType(content: FacilityContent, typeId: string): RoomTypeDefinition | undefined {
  return content.roomTypes.find((entry) => entry.id === typeId);
}

export function objectDefinition(content: FacilityContent, objectId: string): ObjectDefinition | undefined {
  return content.objects.find((entry) => entry.id === objectId);
}

/** Cells the room occupies. */
export function roomCells(room: Room): readonly Cell[] {
  return spanCells(room.level, room.span);
}

/** A room touches the corridor when any of its cells is inside the corridor span. */
export function hasCorridorAccess(span: Span): boolean {
  return span.from <= CORRIDOR_TO && span.to >= CORRIDOR_FROM;
}

/**
 * The door cell — where staff enter.
 *
 * Auto-selected as the leftmost corridor-facing cell, which is deterministic and always inside the
 * room. R10 allows a later manual override; the field exists but no override is implemented in M1.
 */
export function doorCell(room: Room): Cell {
  return { level: room.level, x: Math.max(room.span.from, CORRIDOR_FROM) };
}

/** Access cells for a station: the cells staff must stand on to work it. M1 uses the door cell. */
export function stationAccessCell(room: Room): Cell {
  return doorCell(room);
}

/**
 * Validates a room against its type and its surroundings.
 *
 * Every failure is both a machine-readable reason and a sentence a player can read.
 */
export function validateRoom(
  room: Room,
  content: FacilityContent,
  others: readonly Room[],
  availableLevels: readonly number[]
): RoomValidity {
  const reasons: RoomInvalidReason[] = [];
  const explanations: string[] = [];
  const definition = roomType(content, room.typeId);

  const add = (reason: RoomInvalidReason, text: string): void => {
    reasons.push(reason);
    explanations.push(text);
  };

  if (!availableLevels.includes(room.level)) {
    add('floor-not-available', 'That floor has not been built yet.');
  }

  if (!isZonable(room.span.from) || !isZonable(room.span.to)) {
    add('outside-zonable-area', 'Rooms cannot be zoned over the structural cores.');
  }

  if (!hasCorridorAccess(room.span)) {
    add('no-corridor-access', 'No corridor access — staff would have no way in.');
  }

  for (const other of others) {
    if (other.id !== room.id && other.level === room.level && spansOverlap(other.span, room.span)) {
      add('overlaps-another-room', 'Overlaps another room on this floor.');
      break;
    }
  }

  if (definition !== undefined) {
    const width = spanWidth(room.span);
    if (width < definition.minWidth) {
      add('below-minimum-width', `Too small — ${definition.name} needs at least ${definition.minWidth} cells.`);
    }
    if (width > definition.maxWidth) {
      add('above-maximum-width', `Too large — ${definition.name} allows at most ${definition.maxWidth} cells.`);
    }

    if (
      (definition.placement === 'above-ground' && room.level < 0) ||
      (definition.placement === 'below-ground' && room.level >= 0)
    ) {
      add(
        'wrong-placement-level',
        definition.placement === 'above-ground'
          ? `${definition.name} cannot go below street level.`
          : `${definition.name} must go below street level.`
      );
    }

    for (const requirement of definition.requiredObjects) {
      const placed = room.objects.filter((objectId) => {
        const object = objectDefinition(content, objectId);
        return object !== undefined && object.category === requirement.category;
      }).length;
      if (placed < requirement.count) {
        add(
          'missing-required-object',
          `Missing ${requirement.count - placed} × ${requirement.category} — the room cannot operate without it.`
        );
      }
    }
  }

  return { valid: reasons.length === 0, reasons, explanations };
}

/**
 * Room quality, capped per category with diminishing returns.
 *
 * R10 is explicit that uncapped quality produces Two Point-style item spam, where the optimal room
 * is a cheap stack of identical décor. The second item in a category is worth half, the third a
 * quarter, and nothing after that counts.
 */
export function roomQuality(room: Room, content: FacilityContent): number {
  const byCategory = new Map<string, number[]>();
  for (const objectId of room.objects) {
    const object = objectDefinition(content, objectId);
    if (object?.qualityCategory == null || object.qualityPoints <= 0) {
      continue;
    }
    const bucket = byCategory.get(object.qualityCategory) ?? [];
    bucket.push(object.qualityPoints);
    byCategory.set(object.qualityCategory, bucket);
  }

  let total = 0;
  for (const points of byCategory.values()) {
    const sorted = [...points].sort((left, right) => right - left);
    for (let index = 0; index < Math.min(sorted.length, 3); index += 1) {
      total += sorted[index] / Math.pow(2, index);
    }
  }
  // Mild diversity bonus, so a varied room beats a stacked one at equal cost.
  return Math.round(total + (byCategory.size > 1 ? byCategory.size * 2 : 0));
}

/** Stations in a room, as (objectId, index) pairs so repeated objects stay individually addressable. */
export function roomStations(
  room: Room,
  content: FacilityContent
): readonly { stationId: string; object: ObjectDefinition }[] {
  const stations: { stationId: string; object: ObjectDefinition }[] = [];
  room.objects.forEach((objectId, index) => {
    const object = objectDefinition(content, objectId);
    if (object !== undefined && object.role === 'station') {
      stations.push({ stationId: `${room.id}#${index}`, object });
    }
  });
  return stations;
}

/** Amenities in a room, addressed the same way. */
export function roomAmenities(
  room: Room,
  content: FacilityContent
): readonly { amenityId: string; object: ObjectDefinition }[] {
  const amenities: { amenityId: string; object: ObjectDefinition }[] = [];
  room.objects.forEach((objectId, index) => {
    const object = objectDefinition(content, objectId);
    if (object !== undefined && object.role === 'amenity') {
      amenities.push({ amenityId: `${room.id}#${index}`, object });
    }
  });
  return amenities;
}

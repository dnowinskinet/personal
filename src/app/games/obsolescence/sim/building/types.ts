/**
 * The building.
 *
 * Staff assignment becomes spatial: you do not set "research: 5", you put five people in the lab —
 * and you can only do that if you have built a lab. The quarter simulation is unchanged underneath;
 * the building simply derives the allocation it consumes.
 *
 * Levels are signed: 0 is street, positive is above, negative is basement. Floors are addressed by
 * stable id, never by position in an array (I-007).
 */

import type { Sink } from '../quarter/types';

export type FloorKind =
  | 'showroom'
  | 'office'
  | 'lab'
  | 'workshop'
  | 'assembly'
  | 'storage'
  | 'bedrock';

export interface FloorDefinition {
  readonly id: string;
  /** 0 = street level. Positive above, negative below. */
  readonly level: number;
  readonly kind: FloorKind;
  readonly name: string;
  /** Staff this floor can hold. */
  readonly capacity: number;
  /** Cost to build. Zero for floors you start with. */
  readonly cost: number;
  /** Standing required before it can be bought at all. */
  readonly standingRequired: number;
  /** Set when something physical is in the way. The reason is shown to the player. */
  readonly obstruction: string | null;
  /** Owned from the start. */
  readonly initiallyOwned: boolean;
}

/** Which sink a floor's staff contribute to. Showroom and storage contribute to none — yet. */
export const FLOOR_SINK: Readonly<Record<FloorKind, Sink | null>> = {
  showroom: null,
  office: 'market',
  lab: 'research',
  workshop: 'production',
  assembly: 'production',
  storage: null,
  bedrock: null,
};

export interface BuildingState {
  /** Floor id -> owned. */
  readonly owned: Readonly<Record<string, boolean>>;
  /** Floor id -> staff currently placed there. */
  readonly staffing: Readonly<Record<string, number>>;
}

export interface FloorView {
  readonly definition: FloorDefinition;
  readonly owned: boolean;
  readonly staff: number;
  readonly sink: Sink | null;
  /** Why this floor cannot be bought right now, or null when it can. */
  readonly blockedBy: string | null;
  readonly affordable: boolean;
}

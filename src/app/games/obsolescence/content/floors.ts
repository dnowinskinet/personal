/**
 * The floor catalogue.
 *
 * You start cramped: one floor doing everything. Expansion goes up for the office side and down for
 * manufacturing, and both directions pay (D-021). The subway under B3 is the canonical obstruction —
 * standing gets the permit, cash moves the pipe.
 *
 * Content supplies instances; `sim/` owns the schema.
 */

import type { FloorDefinition } from '../sim/index';

export const FLOORS: readonly FloorDefinition[] = [
  // ---- above street: the office side ------------------------------------
  {
    id: 'f3-legal',
    level: 3,
    kind: 'office',
    name: 'Legal & HR',
    capacity: 4,
    cost: 96000,
    standingRequired: 40,
    obstruction: null,
    initiallyOwned: false,
  },
  {
    id: 'f2-marketing',
    level: 2,
    kind: 'office',
    name: 'Marketing & Sales',
    capacity: 5,
    cost: 38000,
    standingRequired: 12,
    obstruction: null,
    initiallyOwned: false,
  },
  {
    id: 'f1-design',
    level: 1,
    kind: 'lab',
    name: 'Design & Research',
    capacity: 5,
    cost: 21000,
    standingRequired: 0,
    obstruction: null,
    initiallyOwned: false,
  },

  // ---- street: the hinge -------------------------------------------------
  {
    id: 'g0-showroom',
    level: 0,
    kind: 'showroom',
    name: 'Showroom',
    capacity: 3,
    cost: 0,
    standingRequired: 0,
    obstruction: null,
    initiallyOwned: true,
  },

  // ---- below street: manufacturing ---------------------------------------
  {
    id: 'b1-workshop',
    level: -1,
    kind: 'workshop',
    name: 'Workshop',
    capacity: 5,
    cost: 0,
    standingRequired: 0,
    obstruction: null,
    initiallyOwned: true,
  },
  {
    id: 'b2-assembly',
    level: -2,
    kind: 'assembly',
    name: 'Assembly Line',
    capacity: 6,
    cost: 26000,
    standingRequired: 6,
    obstruction: null,
    initiallyOwned: false,
  },
  {
    id: 'b3-deepworks',
    level: -3,
    kind: 'workshop',
    name: 'Deep Works',
    capacity: 8,
    cost: 240000,
    standingRequired: 60,
    // The canonical obstruction. You can see it from quarter one and you cannot have it for a while.
    obstruction: 'A subway tunnel runs under this level',
    initiallyOwned: false,
  },
  {
    id: 'b4-bedrock',
    level: -4,
    kind: 'bedrock',
    name: 'Bedrock',
    capacity: 0,
    cost: 0,
    standingRequired: 999,
    obstruction: 'Solid rock. Nothing goes below this',
    initiallyOwned: false,
  },
];

/** Starting position: cramped, nearly broke, unknown. */
export const CAMPAIGN_START = {
  seed: 4242,
  cash: 24000,
  standing: 4,
} as const;

/**
 * The M1 room and object catalogue.
 *
 * The directive narrows R10's nine-room first build to four rooms and three professions. The schema
 * carries R10's full breadth; this fixture ships only what the milestone needs to prove the grammar.
 *
 * Data only. Adding a room type or a station should be a change in this file and nowhere else —
 * that is the extensibility gate R10 sets for the room grammar.
 */

import type { FacilityContent, ObjectDefinition, ProfessionDefinition, RoomTypeDefinition } from '../../sim/index';

/**
 * Three professions for M1.
 *
 * Qualification is categorical. A scientist cannot run an assembly bench however proficient they
 * are, and no amount of rank makes a QA station open to an operator.
 */
export const PROFESSIONS: readonly ProfessionDefinition[] = [
  {
    id: 'scientist',
    name: 'Scientist',
    specializations: ['materials', 'optics'],
    baseSalary: 5200,
  },
  {
    id: 'operator',
    name: 'Production Operator',
    specializations: ['precision-assembly'],
    baseSalary: 3100,
  },
  {
    id: 'qa_technician',
    name: 'QA Technician',
    specializations: ['reliability'],
    baseSalary: 3800,
  },
];

export const PROFESSION_NAMES: ReadonlyMap<string, string> = new Map(
  PROFESSIONS.map((entry) => [entry.id, entry.name])
);

export const OBJECTS: readonly ObjectDefinition[] = [
  {
    id: 'lab-bench',
    name: 'Lab bench',
    category: 'research-station',
    role: 'station',
    width: 2,
    operatorProfessions: ['scientist'],
    requiredSpecialization: null,
    outputTag: null,
    jobKind: 'research',
    slots: 1,
    restoresNeed: null,
    restorePerTick: 0,
    useTicks: 0,
    qualityCategory: 'efficiency',
    qualityPoints: 6,
  },
  {
    id: 'optics-rig',
    name: 'Optics rig',
    category: 'research-station',
    role: 'station',
    width: 2,
    operatorProfessions: ['scientist'],
    // The scarce-specialist case R10 wants: only an optics scientist can run it.
    requiredSpecialization: 'optics',
    outputTag: 'research',
    jobKind: 'research',
    slots: 1,
    restoresNeed: null,
    restorePerTick: 0,
    useTicks: 0,
    qualityCategory: 'efficiency',
    qualityPoints: 9,
  },
  {
    id: 'assembly-bench',
    name: 'Assembly bench',
    category: 'production-station',
    role: 'station',
    width: 2,
    operatorProfessions: ['operator'],
    requiredSpecialization: null,
    outputTag: 'chassis',
    jobKind: 'assemble',
    slots: 1,
    restoresNeed: null,
    restorePerTick: 0,
    useTicks: 0,
    qualityCategory: 'efficiency',
    qualityPoints: 5,
  },
  {
    id: 'qa-station',
    name: 'QA station',
    category: 'qa-station',
    role: 'station',
    width: 2,
    operatorProfessions: ['qa_technician'],
    requiredSpecialization: null,
    // QA verifies work; it does not manufacture a part. Untagged output is ignored by the adapter.
    outputTag: null,
    jobKind: 'qa',
    slots: 1,
    restoresNeed: null,
    restorePerTick: 0,
    useTicks: 0,
    qualityCategory: 'efficiency',
    qualityPoints: 7,
  },
  {
    id: 'board-line',
    name: 'Board line',
    category: 'production-station',
    role: 'station',
    width: 2,
    operatorProfessions: ['operator'],
    requiredSpecialization: null,
    outputTag: 'board',
    jobKind: 'assemble',
    slots: 1,
    restoresNeed: null,
    restorePerTick: 0,
    useTicks: 0,
    qualityCategory: 'efficiency',
    qualityPoints: 5,
  },
  {
    id: 'cell-line',
    name: 'Cell line',
    category: 'production-station',
    role: 'station',
    width: 2,
    operatorProfessions: ['operator'],
    // The production-side scarce specialist, mirroring the optics rig upstairs.
    requiredSpecialization: 'precision-assembly',
    outputTag: 'cell',
    jobKind: 'assemble',
    slots: 1,
    restoresNeed: null,
    restorePerTick: 0,
    useTicks: 0,
    qualityCategory: 'efficiency',
    qualityPoints: 8,
  },
  {
    id: 'stall',
    name: 'Restroom stall',
    category: 'sanitary',
    role: 'amenity',
    width: 1,
    operatorProfessions: [],
    requiredSpecialization: null,
    outputTag: null,
    jobKind: null,
    slots: 1,
    restoresNeed: 'bladder',
    restorePerTick: 0.34,
    useTicks: 12,
    qualityCategory: 'cleanliness',
    qualityPoints: 4,
  },
  {
    id: 'canteen-counter',
    name: 'Canteen counter',
    category: 'catering',
    role: 'amenity',
    width: 2,
    operatorProfessions: [],
    requiredSpecialization: null,
    outputTag: null,
    jobKind: null,
    slots: 2,
    restoresNeed: 'hunger',
    restorePerTick: 0.22,
    useTicks: 30,
    qualityCategory: 'comfort',
    qualityPoints: 6,
  },
  {
    id: 'rest-couch',
    name: 'Rest couch',
    category: 'seating',
    role: 'amenity',
    width: 2,
    operatorProfessions: [],
    requiredSpecialization: null,
    outputTag: null,
    jobKind: null,
    slots: 2,
    restoresNeed: 'energy',
    restorePerTick: 0.18,
    useTicks: 34,
    qualityCategory: 'comfort',
    qualityPoints: 5,
  },
  {
    id: 'plant',
    name: 'Potted plant',
    category: 'decor',
    role: 'support',
    width: 1,
    operatorProfessions: [],
    requiredSpecialization: null,
    outputTag: null,
    jobKind: null,
    slots: 0,
    restoresNeed: null,
    restorePerTick: 0,
    useTicks: 0,
    qualityCategory: 'comfort',
    qualityPoints: 3,
  },
];

export const ROOM_TYPES: readonly RoomTypeDefinition[] = [
  {
    id: 'research-lab',
    name: 'Research Laboratory',
    minWidth: 4,
    maxWidth: 12,
    requiredObjects: [{ category: 'research-station', count: 1 }],
    optionalCategories: ['decor'],
    validProfessions: ['scientist'],
    placement: 'above-ground',
    isSupport: false,
  },
  {
    id: 'production-workshop',
    name: 'Production Workshop',
    minWidth: 4,
    maxWidth: 16,
    requiredObjects: [{ category: 'production-station', count: 1 }],
    // A workshop may hold a QA station, which puts two professions in one room — the cleanest
    // test that eligibility is per-station and not per-room.
    optionalCategories: ['qa-station', 'decor'],
    validProfessions: ['operator', 'qa_technician'],
    placement: 'below-ground',
    isSupport: false,
  },
  {
    id: 'restroom',
    name: 'Restroom',
    minWidth: 2,
    maxWidth: 5,
    requiredObjects: [{ category: 'sanitary', count: 1 }],
    optionalCategories: [],
    validProfessions: [],
    placement: 'any',
    isSupport: true,
  },
  {
    id: 'break-room',
    name: 'Break Room',
    minWidth: 4,
    maxWidth: 10,
    requiredObjects: [
      { category: 'catering', count: 1 },
      { category: 'seating', count: 1 },
    ],
    optionalCategories: ['decor'],
    validProfessions: [],
    placement: 'any',
    isSupport: true,
  },
];

export const FACILITY_CONTENT: FacilityContent = {
  roomTypes: ROOM_TYPES,
  objects: OBJECTS,
};

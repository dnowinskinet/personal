/**
 * Presentation model for the facility.
 *
 * Pure functions from simulation state to things a template can render. No simulation logic lives
 * here and nothing here mutates state — the renderer stays read-only (I-011).
 *
 * The nine questions the directive requires the interface to answer are each a named function
 * below, so it is checkable rather than a matter of opinion whether the UI answers them.
 */

import {
  blockerLine,
  checkEligibility,
  contendersFor,
  doorCell,
  estimateTravel,
  needsSummary,
  roomAmenities,
  roomQuality,
  roomQualityFactor,
  roomStations,
  roomType,
  spanWidth,
  validateRoom,
  CORRIDOR_FROM,
  CORRIDOR_TO,
  FLOOR_WIDTH,
  FREIGHT_CORE_CELLS,
  PERSONNEL_CORE_CELLS,
  type FacilityContent,
  type FacilityState,
  type NeedThresholds,
  type ObjectDefinition,
  type Room,
  type ScoredJob,
  type Staff,
} from '../sim/index';

export interface StationCell {
  readonly stationId: string;
  /** Which catalogue object this is — the tower picks its equipment drawing by this id. */
  readonly objectId: string;
  readonly name: string;
  readonly from: number;
  readonly width: number;
  readonly role: ObjectDefinition['role'];
  readonly occupiedBy: string | null;
  /** Blocker text when the station is idle for a stated reason. */
  readonly status: string;
}

export interface RoomBox {
  readonly id: string;
  readonly typeName: string;
  readonly level: number;
  readonly from: number;
  readonly width: number;
  readonly valid: boolean;
  readonly problems: readonly string[];
  readonly quality: number;
  readonly qualityFactor: number;
  readonly isSupport: boolean;
  readonly stations: readonly StationCell[];
  readonly occupants: number;
  readonly doorAt: number;
}

export interface FloorRow {
  readonly level: number;
  readonly label: string;
  readonly rooms: readonly RoomBox[];
  readonly staff: readonly StaffPin[];
  readonly freeCells: number;
}

export interface StaffPin {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
  readonly x: number;
  readonly profession: string;
  readonly state: Staff['state'];
  readonly blocked: boolean;
}

export const GRID = {
  width: FLOOR_WIDTH,
  corridorFrom: CORRIDOR_FROM,
  corridorTo: CORRIDOR_TO,
  personnelCore: PERSONNEL_CORE_CELLS,
  freightCore: FREIGHT_CORE_CELLS,
} as const;

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const last = parts[parts.length - 1] ?? '';
  return ((parts[0]?.[0] ?? '') + (last[0] ?? '')).toUpperCase();
}

/** Floors top to bottom, which is how a cutaway reads. */
export function floorRows(state: FacilityState, content: FacilityContent): readonly FloorRow[] {
  const levels = [...state.topology.levels].sort((left, right) => right - left);
  return levels.map((level) => {
    const rooms = state.rooms
      .filter((room) => room.level === level)
      .sort((left, right) => left.span.from - right.span.from)
      .map((room) => roomBox(room, state, content));
    const used = rooms.reduce((total, room) => total + room.width, 0);
    return {
      level,
      label: levelLabel(level),
      rooms,
      staff: state.staff
        .filter((worker) => worker.location.level === level)
        .map((worker) => ({
          id: worker.id,
          name: worker.name,
          initials: initialsOf(worker.name),
          x: worker.location.x,
          profession: worker.profession,
          state: worker.state,
          blocked: state.blockers[worker.id] != null,
        })),
      freeCells: CORRIDOR_TO - CORRIDOR_FROM + 1 - used,
    };
  });
}

/**
 * Why a published, unclaimed job at this station has no taker.
 *
 * The genre failure this prevents is a station that simply sits there. If nobody is qualified, say
 * so and name the profession; if everyone qualified is elsewhere, say that instead.
 */
function whyStationUnused(
  stationId: string,
  object: ObjectDefinition,
  room: Room,
  state: FacilityState,
  content: FacilityContent
): string {
  const qualified = state.staff.filter(
    (worker) => checkEligibility(worker, object, room.id, content.professionNames).eligible
  );
  if (qualified.length === 0) {
    const named = object.operatorProfessions
      .map((id) => content.professionNames.get(id) ?? id)
      .join(' or ');
    const need =
      object.requiredSpecialization === null
        ? named
        : `${named} certified in ${object.requiredSpecialization}`;
    return `Nobody on staff is a ${need}.`;
  }
  const free = qualified.filter((worker) => worker.reservation === null);
  if (free.length === 0) {
    return `All ${qualified.length} qualified staff are on other jobs.`;
  }
  const nearest = free.reduce(
    (best, worker) => {
      const travel = estimateTravel(state.topology, worker.location, doorCell(room));
      return travel < best.travel ? { worker, travel } : best;
    },
    { worker: free[0], travel: Number.POSITIVE_INFINITY }
  );
  return Number.isFinite(nearest.travel)
    ? `Free — ${nearest.worker.name} is ${Math.round(nearest.travel)} ticks away.`
    : 'Free, but no qualified worker can reach it.';
}

export function roomBox(room: Room, state: FacilityState, content: FacilityContent): RoomBox {
  const validity = validateRoom(room, content, state.rooms, state.topology.levels);
  const definition = roomType(content, room.typeId);
  const stations = roomStations(room, content);
  const amenities = roomAmenities(room, content);

  const cells: StationCell[] = [];
  let cursor = room.span.from;
  for (const { stationId, object } of stations) {
    const holder = state.staff.find(
      (worker) => worker.reservation?.stationId === stationId && worker.state === 'working'
    );
    const job = state.jobs.find((entry) => entry.stationId === stationId);
    cells.push({
      stationId,
      objectId: object.id,
      name: object.name,
      from: cursor,
      width: object.width,
      role: object.role,
      occupiedBy: holder?.name ?? null,
      status:
        holder !== undefined
          ? `${holder.name} working`
          : job === undefined
            ? 'No work published'
            : job.claimedBy !== null
              ? 'Claimed, worker en route'
              : whyStationUnused(stationId, object, room, state, content),
    });
    cursor += object.width;
  }
  for (const { amenityId, object } of amenities) {
    const queue = state.queues[amenityId] ?? [];
    cells.push({
      stationId: amenityId,
      objectId: object.id,
      name: object.name,
      from: cursor,
      width: object.width,
      role: object.role,
      occupiedBy: null,
      status: queue.length === 0 ? 'Free' : `${queue.length} waiting`,
    });
    cursor += object.width;
  }

  return {
    id: room.id,
    typeName: definition?.name ?? room.typeId,
    level: room.level,
    from: room.span.from,
    width: spanWidth(room.span),
    valid: validity.valid,
    problems: validity.explanations,
    quality: roomQuality(room, content),
    qualityFactor: roomQualityFactor(room, content),
    isSupport: definition?.isSupport === true,
    stations: cells,
    occupants: state.staff.filter(
      (worker) =>
        worker.location.level === room.level &&
        worker.location.x >= room.span.from &&
        worker.location.x <= room.span.to
    ).length,
    doorAt: doorCell(room).x,
  };
}

// ---------------------------------------------------------------------------
// The nine questions the directive requires the interface to answer.
// ---------------------------------------------------------------------------

/** 1. Why is this employee not working? */
export function whyNotWorking(worker: Staff, state: FacilityState): string {
  if (worker.state === 'working') {
    return `Working — ${Math.round(worker.progressTicks)} ticks in.`;
  }
  return blockerLine(state.blockers[worker.id] ?? null);
}

/** 2. What job are they trying to perform? */
export function whichJob(worker: Staff, state: FacilityState, content: FacilityContent): string {
  const reservation = worker.reservation;
  if (reservation === null) {
    return 'No job held.';
  }
  const job = state.jobs.find((entry) => entry.id === reservation.jobId);
  const room = state.rooms.find((entry) => entry.id === job?.roomId);
  const station = room === undefined ? undefined : roomStations(room, content).find((entry) => entry.stationId === reservation.stationId);
  const where = room === undefined ? reservation.stationId : `${roomType(content, room.typeId)?.name ?? room.typeId} (${room.id})`;
  return `${job?.kind ?? 'work'} at ${station?.object.name ?? 'a station'} in ${where}.`;
}

/** 3. What are they waiting for? */
export function whatWaitingFor(worker: Staff, state: FacilityState): string {
  if (worker.state === 'queue_for_amenity' && worker.amenityId !== null) {
    const queue = state.queues[worker.amenityId] ?? [];
    const place = queue.indexOf(worker.id);
    return place < 0
      ? 'Queueing.'
      : `Queueing for ${worker.amenityId} — position ${place + 1} of ${queue.length}.`;
  }
  if (worker.state === 'waiting_for_station' && worker.reservation !== null) {
    const rivals = contendersFor(state.staff, worker.reservation.stationId);
    return `Waiting for ${worker.reservation.stationId}; ${rivals} worker${rivals === 1 ? '' : 's'} contending.`;
  }
  const blocker = state.blockers[worker.id];
  return blocker == null ? 'Not waiting on anything.' : blockerLine(blocker);
}

/** 4. What qualification is missing? */
export function missingQualification(
  worker: Staff,
  state: FacilityState,
  content: FacilityContent,
  professionNames: ReadonlyMap<string, string>
): readonly string[] {
  const reasons: string[] = [];
  for (const room of state.rooms) {
    for (const { object } of roomStations(room, content)) {
      const result = checkEligibility(worker, object, room.id, professionNames);
      if (!result.eligible && result.reason !== null && !reasons.includes(result.reason)) {
        reasons.push(result.reason);
      }
    }
  }
  return reasons.length === 0 ? ['Qualified for every station currently built.'] : reasons;
}

/** 5. Why is this room invalid? */
export function whyRoomInvalid(room: Room, state: FacilityState, content: FacilityContent): readonly string[] {
  const validity = validateRoom(room, content, state.rooms, state.topology.levels);
  return validity.valid ? [] : validity.explanations;
}

/** 6. Why can this employee not use this station? */
export function whyNotThisStation(
  worker: Staff,
  stationId: string,
  state: FacilityState,
  content: FacilityContent,
  professionNames: ReadonlyMap<string, string>
): string {
  const room = state.rooms.find((entry) => roomStations(entry, content).some((s) => s.stationId === stationId));
  if (room === undefined) {
    return 'That station no longer exists.';
  }
  const station = roomStations(room, content).find((entry) => entry.stationId === stationId);
  if (station === undefined) {
    return 'That station no longer exists.';
  }
  const eligibility = checkEligibility(worker, station.object, room.id, professionNames);
  if (!eligibility.eligible) {
    return eligibility.reason ?? 'Not qualified.';
  }
  if (!validateRoom(room, content, state.rooms, state.topology.levels).valid) {
    return `${room.id} is not operational, so it publishes no work.`;
  }
  const holder = state.staff.find((entry) => entry.reservation?.stationId === stationId && entry.id !== worker.id);
  if (holder !== undefined) {
    return `${holder.name} is holding that station.`;
  }
  const travel = estimateTravel(state.topology, worker.location, doorCell(room));
  if (!Number.isFinite(travel)) {
    return `${room.id} cannot be reached from where ${worker.name} is standing.`;
  }
  return `${worker.name} can use this station — ${Math.round(travel)} ticks away.`;
}

/** 7. Which need interrupted the job? */
export function interruptingNeed(worker: Staff, thresholds: NeedThresholds): string {
  const summary = needsSummary(worker, thresholds);
  if (worker.resumeToken === null && summary === null) {
    return 'No need has interrupted this worker.';
  }
  return summary ?? 'Recovering.';
}

/** 8. Where is the employee going? */
export function whereGoing(worker: Staff, state: FacilityState, content: FacilityContent): string {
  if (worker.pathCells.length === 0) {
    return `Standing on ${levelLabel(worker.location.level)}, cell ${worker.location.x}.`;
  }
  const destination = worker.pathCells[worker.pathCells.length - 1];
  const room = state.rooms.find(
    (entry) =>
      entry.level === destination.level &&
      destination.x >= entry.span.from &&
      destination.x <= entry.span.to
  );
  const what = worker.state === 'travel_to_amenity' ? 'a break' : 'work';
  const where = room === undefined ? `cell ${destination.x}` : `${roomType(content, room.typeId)?.name ?? room.typeId} (${room.id})`;
  return `Heading to ${where} on ${levelLabel(destination.level)} for ${what}; ${Math.max(0, Math.round(worker.busyTicks))} ticks to go.`;
}

/** 9. Was their prior job reserved for resumption? */
export function resumptionStatus(worker: Staff, state: FacilityState): string {
  const token = worker.resumeToken;
  if (token === null) {
    return 'No job is being held for resumption.';
  }
  const stillThere = state.jobs.some((job) => job.id === token.jobId);
  const progress = Math.round(token.progressTicks);
  return stillThere
    ? `Held for resumption: ${token.jobId} at ${token.stationId}, ${progress} ticks of progress saved.`
    : `The held job (${token.jobId}) no longer exists — ${progress} ticks of progress will be lost.`;
}

/**
 * Canonical level names (VISUAL-CANON-NOTES.md). The Loading Dock is the first below-ground story
 * and is not B1 — B-numbering starts one story further down.
 */
export function levelLabel(level: number): string {
  if (level > 0) {
    return `Office Level ${level}`;
  }
  if (level === 0) {
    return 'Showroom';
  }
  return level === -1 ? 'Loading Dock' : `B${-level - 1}`;
}

// ---------------------------------------------------------------------------
// Dev overlay
// ---------------------------------------------------------------------------

export interface ScoreRow {
  readonly jobId: string;
  readonly stationId: string;
  readonly score: number;
  readonly chosen: boolean;
  readonly factors: readonly { label: string; value: number }[];
}

export function scoreRows(worker: Staff, state: FacilityState): readonly ScoreRow[] {
  const scored: readonly ScoredJob[] = state.lastScores[worker.id] ?? [];
  const top = scored.reduce<ScoredJob | null>(
    (best, entry) => (best === null || entry.score > best.score ? entry : best),
    null
  );
  return [...scored]
    .sort((left, right) => right.score - left.score)
    .map((entry) => ({
      jobId: entry.job.id,
      stationId: entry.job.stationId,
      score: Math.round(entry.score * 10) / 10,
      chosen: entry.job.id === top?.job.id,
      factors: entry.factors.map((factor) => ({
        label: factor.label,
        value: Math.round(factor.value * 10) / 10,
      })),
    }));
}

export interface UtilizationRow {
  readonly roomId: string;
  readonly typeName: string;
  readonly stations: number;
  readonly busy: number;
  readonly share: number;
}

export function utilizationRows(state: FacilityState, content: FacilityContent): readonly UtilizationRow[] {
  return state.rooms.map((room) => {
    const stations = roomStations(room, content);
    const busy = stations.filter((station) =>
      state.staff.some(
        (worker) => worker.reservation?.stationId === station.stationId && worker.state === 'working'
      )
    ).length;
    return {
      roomId: room.id,
      typeName: roomType(content, room.typeId)?.name ?? room.typeId,
      stations: stations.length,
      busy,
      share: stations.length === 0 ? 0 : busy / stations.length,
    };
  });
}

/** The four cells a room occupies at each end, for the bounds overlay. */
export function roomBounds(room: Room): { readonly from: number; readonly to: number; readonly door: number } {
  return { from: room.span.from, to: room.span.to, door: doorCell(room).x };
}

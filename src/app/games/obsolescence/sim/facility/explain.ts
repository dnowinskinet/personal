/**
 * The controlled blocker vocabulary.
 *
 * R10's logistics autopsy: every machine and room needs a visible status cause drawn from a short
 * controlled vocabulary. The failure mode being prevented is internally reasonable rules that are
 * externally illegible — the player sees nothing happening and cannot tell whose fault it is.
 *
 * The set is deliberately small. Terms for subsystems deferred past M1 are listed so the vocabulary
 * does not have to change when they arrive.
 */

export type BlockerCode =
  | 'no-qualified-staff'
  | 'no-open-station'
  | 'station-reserved-elsewhere'
  | 'room-invalid'
  | 'unreachable'
  | 'urgent-need'
  | 'waiting-for-amenity'
  | 'amenity-queue'
  | 'no-amenity-reachable'
  | 'not-assigned'
  | 'nothing-to-do'
  // Reserved for later milestones; never emitted in M1.
  | 'no-input'
  | 'output-full'
  | 'machine-broken'
  | 'waiting-freight'
  | 'waiting-elevator';

export const M1_BLOCKERS: readonly BlockerCode[] = [
  'no-qualified-staff',
  'no-open-station',
  'station-reserved-elsewhere',
  'room-invalid',
  'unreachable',
  'urgent-need',
  'waiting-for-amenity',
  'amenity-queue',
  'no-amenity-reachable',
  'not-assigned',
  'nothing-to-do',
];

const TEXT: Readonly<Record<BlockerCode, string>> = {
  'no-qualified-staff': 'No qualified staff available',
  'no-open-station': 'Every station here is busy',
  'station-reserved-elsewhere': 'Station reserved by another job',
  'room-invalid': 'Room is not operational',
  unreachable: 'Cannot get there from here',
  'urgent-need': 'Stopped for an urgent need',
  'waiting-for-amenity': 'Walking to a break',
  'amenity-queue': 'Queueing',
  'no-amenity-reachable': 'No reachable facility for this need',
  'not-assigned': 'Assigned to a different room',
  'nothing-to-do': 'No work available',
  'no-input': 'Waiting for materials',
  'output-full': 'Output buffer full',
  'machine-broken': 'Equipment broken',
  'waiting-freight': 'Waiting for freight',
  'waiting-elevator': 'Waiting for a lift',
};

export function blockerText(code: BlockerCode): string {
  return TEXT[code];
}

/** A blocker with the specific detail that makes it actionable rather than generic. */
export interface Blocker {
  readonly code: BlockerCode;
  readonly text: string;
  /** The exact reason — a missing qualification names it, an unreachable room names the room. */
  readonly detail: string | null;
}

export function blocker(code: BlockerCode, detail: string | null = null): Blocker {
  return { code, text: TEXT[code], detail };
}

/** One line combining the code and its detail, for compact display. */
export function blockerLine(value: Blocker | null): string {
  if (value === null) {
    return 'Working';
  }
  return value.detail === null ? value.text : `${value.text} — ${value.detail}`;
}

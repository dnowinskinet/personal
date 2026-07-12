export const EMPIRE_IDS = ['influence'] as const;

export type EmpireId = typeof EMPIRE_IDS[number];

export const DEFAULT_EMPIRE_ID: EmpireId = 'influence';

export function isEmpireId(value: unknown): value is EmpireId {
  return typeof value === 'string' && EMPIRE_IDS.includes(value as EmpireId);
}

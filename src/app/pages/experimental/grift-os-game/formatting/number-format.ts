export type MoneyFormatRole =
  | 'headline'
  | 'net-worth'
  | 'rate'
  | 'payout'
  | 'transaction'
  | 'exact';

interface MoneyFormatConfig {
  significantDigits: number;
  compactThreshold: number;
}

const MONEY_FORMAT_CONFIG: Readonly<Record<Exclude<MoneyFormatRole, 'exact'>, MoneyFormatConfig>> = {
  headline: { significantDigits: 6, compactThreshold: 1_000_000 },
  'net-worth': { significantDigits: 6, compactThreshold: 1_000_000 },
  rate: { significantDigits: 4, compactThreshold: 1_000 },
  payout: { significantDigits: 4, compactThreshold: 1_000 },
  transaction: { significantDigits: 4, compactThreshold: 1_000 },
};

const COMPACT_UNITS = [
  { value: 1_000_000_000_000_000, suffix: 'Q' },
  { value: 1_000_000_000_000, suffix: 'T' },
  { value: 1_000_000_000, suffix: 'B' },
  { value: 1_000_000, suffix: 'M' },
  { value: 1_000, suffix: 'K' },
] as const;

const MIN_CENTS_VALUE = 0.00001;

export function formatMoney(value: number, role: MoneyFormatRole): string {
  const safeValue = safeNonNegative(value);

  if (safeValue === 0) {
    return '$0';
  }

  if (role === 'exact') {
    return `$${formatSignificantNumber(safeValue, 12, true)}`;
  }

  const { significantDigits, compactThreshold } = MONEY_FORMAT_CONFIG[role];

  if (safeValue < 1) {
    return formatCents(safeValue, significantDigits);
  }

  if (roundToSignificant(safeValue, significantDigits) < compactThreshold) {
    return `$${formatSignificantNumber(safeValue, significantDigits, true)}`;
  }

  return `$${formatCompactValue(safeValue, significantDigits)}`;
}

export function formatMoneyRate(value: number): string {
  return `${formatMoney(value, 'rate')}/sec`;
}

export function formatMultiplier(value: number): string {
  return `x${formatSignificantNumber(safeNonNegative(value), 3, false)}`;
}

export function formatPercentage(value: number): string {
  return `${formatSignificantNumber(safeNonNegative(value), 3, false)}%`;
}

export function formatCount(value: number): string {
  return Math.max(0, Math.trunc(finiteOrZero(value))).toLocaleString('en-US');
}

function formatCents(value: number, significantDigits: number): string {
  if (value < MIN_CENTS_VALUE) {
    return '<0.001¢';
  }

  return `${formatSignificantNumber(value * 100, significantDigits, false)}¢`;
}

function formatCompactValue(value: number, significantDigits: number): string {
  let unitIndex = COMPACT_UNITS.findIndex((unit) => value >= unit.value);

  if (unitIndex === -1) {
    unitIndex = COMPACT_UNITS.length - 1;
  }

  let unit = COMPACT_UNITS[unitIndex];
  let scaled = roundToSignificant(value / unit.value, significantDigits);

  if (scaled >= 1_000 && unitIndex > 0) {
    unit = COMPACT_UNITS[unitIndex - 1];
    scaled = roundToSignificant(value / unit.value, significantDigits);
  }

  return `${formatSignificantNumber(scaled, significantDigits, false)}${unit.suffix}`;
}

function formatSignificantNumber(value: number, significantDigits: number, useGrouping: boolean): string {
  const rounded = roundToSignificant(value, significantDigits);
  const maximumFractionDigits = fractionDigitsForSignificantValue(rounded, significantDigits);

  return rounded.toLocaleString('en-US', {
    useGrouping,
    maximumFractionDigits,
  });
}

function roundToSignificant(value: number, significantDigits: number): number {
  if (value === 0) {
    return 0;
  }

  return Number(value.toPrecision(significantDigits));
}

function fractionDigitsForSignificantValue(value: number, significantDigits: number): number {
  if (value === 0) {
    return 0;
  }

  return Math.max(0, significantDigits - 1 - Math.floor(Math.log10(Math.abs(value))));
}

function safeNonNegative(value: number): number {
  return Math.max(0, finiteOrZero(value));
}

function finiteOrZero(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

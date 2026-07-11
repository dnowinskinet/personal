const COMPACT_UNITS = [
  { value: 1_000_000_000_000_000_000_000_000_000, suffix: 'Oc' },
  { value: 1_000_000_000_000_000_000_000_000, suffix: 'Sp' },
  { value: 1_000_000_000_000_000_000_000, suffix: 'Sx' },
  { value: 1_000_000_000_000_000_000, suffix: 'Qi' },
  { value: 1_000_000_000_000_000, suffix: 'Q' },
  { value: 1_000_000_000_000, suffix: 'T' },
  { value: 1_000_000_000, suffix: 'B' },
  { value: 1_000_000, suffix: 'M' },
  { value: 1_000, suffix: 'K' },
];

export function formatValuation(value: number): string {
  if (!Number.isFinite(value)) {
    return '$0';
  }

  const safeValue = Math.max(0, value);

  if (safeValue === 0) {
    return '$0';
  }

  if (safeValue < 0.01) {
    return `$${safeValue.toFixed(4)}`;
  }

  if (safeValue < 1_000) {
    return `$${safeValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  if (safeValue >= 1e30) {
    return `$${safeValue.toExponential(2)}`;
  }

  const unit = COMPACT_UNITS.find((entry) => safeValue >= entry.value);

  if (!unit) {
    return `$${Math.floor(safeValue).toLocaleString('en-US')}`;
  }

  const scaled = safeValue / unit.value;

  return `$${Math.floor(scaled).toLocaleString('en-US')}${unit.suffix}`;
}

export function formatValuationRate(value: number): string {
  return `${formatValuation(value)}/sec`;
}

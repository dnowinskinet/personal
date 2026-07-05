const COMPACT_UNITS = [
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

  if (safeValue >= 1e15) {
    return `$${safeValue.toExponential(2)}`;
  }

  const unit = COMPACT_UNITS.find((entry) => safeValue >= entry.value);

  if (!unit) {
    return `$${Math.floor(safeValue).toLocaleString('en-US')}`;
  }

  const scaled = safeValue / unit.value;
  const digits = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;

  return `$${scaled.toFixed(digits).replace(/\.0+$|(\.\d*[1-9])0+$/, '$1')}${unit.suffix}`;
}

export function formatValuationRate(value: number): string {
  return `${formatValuation(value)}/sec`;
}

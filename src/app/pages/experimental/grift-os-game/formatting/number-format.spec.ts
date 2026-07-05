import { formatValuation, formatValuationRate } from './number-format';

describe('GriftOS number formatting', () => {
  it('formats small valuations as whole dollars', () => {
    expect(formatValuation(999.9)).toBe('$999');
  });

  it('formats compact valuation units', () => {
    expect(formatValuation(1_240)).toBe('$1.24K');
    expect(formatValuation(18_400_000)).toBe('$18.4M');
    expect(formatValuation(1_040_000_000)).toBe('$1.04B');
    expect(formatValuation(82_600_000_000_000)).toBe('$82.6T');
  });

  it('falls back to scientific notation for very large values', () => {
    expect(formatValuation(4.12e18)).toBe('$4.12e+18');
  });

  it('formats valuation per second', () => {
    expect(formatValuationRate(48_200)).toBe('$48.2K/sec');
  });

  it('guards against invalid values', () => {
    expect(formatValuation(Number.NaN)).toBe('$0');
    expect(formatValuation(Number.POSITIVE_INFINITY)).toBe('$0');
    expect(formatValuation(-10)).toBe('$0');
  });
});

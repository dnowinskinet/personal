import {
  formatCount,
  formatMoney,
  formatMoneyRate,
  formatMultiplier,
  formatPercentage,
} from './number-format';

describe('GriftOS number formatting', () => {
  it('formats headline Valuation boundaries with six significant digits', () => {
    const cases: readonly (readonly [number, string])[] = [
      [0, '$0'],
      [0.000009, '<0.001¢'],
      [0.00001, '0.001¢'],
      [0.0025, '0.25¢'],
      [0.00999, '0.999¢'],
      [0.01, '1¢'],
      [0.083715, '8.3715¢'],
      [0.999, '99.9¢'],
      [1, '$1'],
      [9.999, '$9.999'],
      [10, '$10'],
      [99.99, '$99.99'],
      [100, '$100'],
      [999.9, '$999.9'],
      [1_000, '$1,000'],
      [9_999, '$9,999'],
      [999_500, '$999,500'],
      [999_999, '$999,999'],
      [1_000_000, '$1M'],
      [999_999_999, '$1B'],
      [1_000_000_000, '$1B'],
      [1_000_000_000_000, '$1T'],
      [1_000_000_000_000_000, '$1Q'],
    ];

    for (const [value, expected] of cases) {
      expect(formatMoney(value, 'headline')).withContext(String(value)).toBe(expected);
      expect(formatMoney(value, 'net-worth')).withContext(`Net Worth ${value}`).toBe(expected);
    }
  });

  it('uses four significant digits for rates, payouts, and transactions', () => {
    expect(formatMoneyRate(179)).toBe('$179/sec');
    expect(formatMoneyRate(87.5)).toBe('$87.5/sec');
    expect(formatMoney(1_750, 'payout')).toBe('$1.75K');
    expect(formatMoney(12_880_000, 'payout')).toBe('$12.88M');
    expect(formatMoney(136.713, 'transaction')).toBe('$136.7');
    expect(formatMoney(569.704, 'transaction')).toBe('$569.7');
    expect(formatMoney(5_947, 'transaction')).toBe('$5.947K');
    expect(formatMoney(25_000_000, 'transaction')).toBe('$25M');
  });

  it('does not abbreviate a $1,750 payout to $1K', () => {
    expect(formatMoney(1_750, 'payout')).toBe('$1.75K');
    expect(formatMoney(1_750, 'payout')).not.toBe('$1K');
  });

  it('rounds compact values to the nearest supported unit', () => {
    expect(formatMoney(999_500, 'payout')).toBe('$999.5K');
    expect(formatMoney(999_999, 'payout')).toBe('$1M');
    expect(formatMoney(1_284_730, 'headline')).toBe('$1.28473M');
    expect(formatMoney(22_047_300_000, 'headline')).toBe('$22.0473B');
    expect(formatMoney(1_382_640_000_000, 'headline')).toBe('$1.38264T');
  });

  it('strips insignificant zeroes from multipliers and percentages', () => {
    expect(formatMultiplier(10)).toBe('x10');
    expect(formatMultiplier(1.75)).toBe('x1.75');
    expect(formatMultiplier(1.1874)).toBe('x1.19');
    expect(formatPercentage(10)).toBe('10%');
    expect(formatPercentage(12.499)).toBe('12.5%');
  });

  it('keeps discrete quantities as exact locale-aware integers', () => {
    expect(formatCount(1_240)).toBe('1,240');
    expect(formatCount(125_600)).toBe('125,600');
  });

  it('guards against invalid and negative monetary values', () => {
    expect(formatMoney(Number.NaN, 'headline')).toBe('$0');
    expect(formatMoney(Number.POSITIVE_INFINITY, 'transaction')).toBe('$0');
    expect(formatMoney(-10, 'payout')).toBe('$0');
  });
});

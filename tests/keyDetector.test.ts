import { describe, expect, it } from 'vitest';
import { isReliableDetection, rankChromagram, relativeKeyFor } from '../src/music-theory/keyDetector';

describe('rankChromagram', () => {
  it('ranks a C major profile as C major', () => {
    const result = rankChromagram([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]);

    expect(result?.label).toBe('C maior');
    expect(result?.confidence).toBeGreaterThan(.54);
    expect(isReliableDetection(result, 12)).toBe(true);
  });

  it('does not call a single pitch class reliable', () => {
    const result = rankChromagram([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

    expect(result?.pitchClassCount).toBe(1);
    expect(isReliableDetection(result, 30)).toBe(false);
  });

  it('rejects invalid chromagram lengths', () => {
    expect(() => rankChromagram([1, 2])).toThrow('12 pitch classes');
  });

  it('shows the correct relative minor for a major result', () => {
    const result = rankChromagram([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]);

    expect(result && relativeKeyFor(result)).toEqual({ label: 'A menor', relation: 'RELATIVA MENOR' });
  });
});

import { describe, expect, it } from 'vitest';
import { ReadingQualityMeter } from '../src/audio/readingQuality';
import { rankChromagram } from '../src/music-theory/keyDetector';

const stableC = rankChromagram([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]);

describe('ReadingQualityMeter', () => {
  it('rewards audible, non-clipping and stable tonal evidence', () => {
    const meter = new ReadingQualityMeter();
    for (let index = 0; index < 15; index += 1) {
      meter.record({ rms: .12, peak: .32, decibels: -18, state: 'healthy' }, stableC);
    }

    expect(meter.result().score).toBeGreaterThan(.9);
    expect(meter.result().summary).toContain('estáveis');
  });

  it('lowers the reading score for silent or clipping frames', () => {
    const meter = new ReadingQualityMeter();
    for (let index = 0; index < 15; index += 1) {
      meter.record({ rms: 0, peak: index % 2 ? 1 : 0, decibels: -Infinity, state: index % 2 ? 'clipping' : 'silent' }, stableC);
    }

    expect(meter.result().score).toBeLessThan(.2);
  });
});

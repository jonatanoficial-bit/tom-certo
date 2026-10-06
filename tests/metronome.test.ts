import { describe, expect, it } from 'vitest';
import { clampTempo, tempoFromTaps } from '../src/audio/metronome';

describe('metronome tempo helpers', () => {
  it('clamps tempo to a musical working range', () => {
    expect(clampTempo(12)).toBe(35);
    expect(clampTempo(290)).toBe(240);
  });

  it('calculates tempo from recent valid taps', () => {
    expect(tempoFromTaps([0, 500, 1_000, 1_500])).toBe(120);
    expect(tempoFromTaps([0, 100])).toBeNull();
  });
});

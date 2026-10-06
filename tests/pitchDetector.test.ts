import { describe, expect, it } from 'vitest';
import { estimatePitch, tunerReadingFor, tuningDirection } from '../src/audio/pitchDetector';

function sineWave(frequency: number, sampleRate = 44_100, size = 2_048): Float32Array {
  return Float32Array.from({ length: size }, (_, index) => .35 * Math.sin((2 * Math.PI * frequency * index) / sampleRate));
}

describe('pitch detector', () => {
  it('finds a sustained A4 from a local time-domain signal', () => {
    const estimate = estimatePitch(sineWave(440), 44_100);

    expect(estimate?.frequency).toBeCloseTo(440, 0);
    expect(tunerReadingFor(estimate!).note).toBe('A');
    expect(tunerReadingFor(estimate!).octave).toBe(4);
  });

  it('does not invent a note from silence', () => {
    expect(estimatePitch(new Float32Array(2_048), 44_100)).toBeNull();
  });

  it('explains whether the reading needs to rise or fall', () => {
    expect(tuningDirection(-17)).toBe('flat');
    expect(tuningDirection(0)).toBe('in-tune');
    expect(tuningDirection(19)).toBe('sharp');
  });
});

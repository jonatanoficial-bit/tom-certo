import { describe, expect, it } from 'vitest';
import { estimatePitch, tunerReadingFor, tuningDirection } from '../src/audio/pitchDetector';

function sineWave(frequency: number, sampleRate = 44_100, size = 2_048): Float32Array {
  return Float32Array.from({ length: size }, (_, index) => .35 * Math.sin((2 * Math.PI * frequency * index) / sampleRate));
}

function chordWave(frequencies: number[], sampleRate = 44_100, size = 4_096): Float32Array {
  return Float32Array.from({ length: size }, (_, index) => frequencies.reduce(
    (sum, frequency) => sum + (.16 * Math.sin((2 * Math.PI * frequency * index) / sampleRate)),
    0,
  ));
}

describe('pitch detector', () => {
  it.each([
    [440, 'A', 4],
    [261.63, 'C', 4],
    [329.63, 'E', 4],
  ])('finds %s Hz as %s%s', (frequency, note, octave) => {
    const estimate = estimatePitch(sineWave(frequency), 44_100);

    expect(estimate?.frequency).toBeCloseTo(frequency, 0);
    expect(tunerReadingFor(estimate!).note).toBe(note);
    expect(tunerReadingFor(estimate!).octave).toBe(octave);
  });

  it('does not invent a note from silence', () => {
    expect(estimatePitch(new Float32Array(2_048), 44_100)).toBeNull();
  });

  it('does not treat a C major chord as a clean monophonic voice pitch', () => {
    const estimate = estimatePitch(chordWave([130.81, 164.81, 196]), 44_100);

    expect(estimate?.clarity ?? 0).toBeLessThan(.72);
  });

  it('explains whether the reading needs to rise or fall', () => {
    expect(tuningDirection(-17)).toBe('flat');
    expect(tuningDirection(0)).toBe('in-tune');
    expect(tuningDirection(19)).toBe('sharp');
  });
});

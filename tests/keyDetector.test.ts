import { describe, expect, it } from 'vitest';
import { isReliableDetection, LocalKeyDetector, rankChromagram, relativeKeyFor } from '../src/music-theory/keyDetector';

function spectrumForCMajorChord(sampleRate = 44_100, fftSize = 4_096, detuningCents = 0, backgroundDecibels = -96): Float32Array {
  const spectrum = new Float32Array(fftSize / 2).fill(backgroundDecibels);
  const binWidth = sampleRate / fftSize;

  for (const fundamental of [130.81, 164.81, 196]) {
    for (let harmonic = 1; harmonic <= 7; harmonic += 1) {
      const tunedFrequency = fundamental * (2 ** (detuningCents / 1_200));
      const bin = Math.round((tunedFrequency * harmonic) / binWidth);
      if (bin < spectrum.length) spectrum[bin] = -18 - (harmonic * 3.3);
    }
  }

  return spectrum;
}

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

  it('uses a piano-like harmonic series to retain a C major chord root', () => {
    const detector = new LocalKeyDetector();
    const spectrum = spectrumForCMajorChord();

    for (let frame = 0; frame < 15; frame += 1) detector.ingestSpectrum(spectrum, 44_100, 4_096);

    expect(detector.estimate()?.label).toBe('C maior');
  });

  it('retains C major when the instrument is slightly off concert tuning', () => {
    const detector = new LocalKeyDetector();
    const spectrum = spectrumForCMajorChord(44_100, 4_096, 18);

    for (let frame = 0; frame < 15; frame += 1) detector.ingestSpectrum(spectrum, 44_100, 4_096);

    expect(detector.estimate()?.label).toBe('C maior');
  });

  it('retains a C major root above a live-like spectral floor', () => {
    const detector = new LocalKeyDetector();
    const spectrum = spectrumForCMajorChord(44_100, 4_096, 0, -58);

    for (let frame = 0; frame < 15; frame += 1) detector.ingestSpectrum(spectrum, 44_100, 4_096);

    expect(detector.estimate()?.label).toBe('C maior');
  });

  it('does not turn a flat room-noise floor into a tonal reading', () => {
    const detector = new LocalKeyDetector();
    const spectrum = new Float32Array(2_048).fill(-54);

    for (let frame = 0; frame < 15; frame += 1) detector.ingestSpectrum(spectrum, 44_100, 4_096);

    expect(detector.frames).toBe(0);
    expect(detector.estimate()).toBeNull();
  });
});

export type KeyMode = 'major' | 'minor';

export interface KeyCandidate {
  tonic: number;
  tonicName: string;
  mode: KeyMode;
  label: string;
  score: number;
}

export interface KeyDetection extends KeyCandidate {
  confidence: number;
  pitchClassCount: number;
  alternatives: KeyCandidate[];
}

const TONIC_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'] as const;
const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88] as const;
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17] as const;
const MIN_FREQUENCY = 55;
const MAX_FREQUENCY = 3_500;
const SPECTRUM_FLOOR = -78;
const LOWEST_FUNDAMENTAL_MIDI = 36; // C2
const HIGHEST_FUNDAMENTAL_MIDI = 96; // C7
const MAX_HARMONICS = 7;

function clamp(value: number, lower = 0, upper = 1): number {
  return Math.min(upper, Math.max(lower, value));
}

function keyLabel(tonic: number, mode: KeyMode): string {
  return `${TONIC_NAMES[tonic]} ${mode === 'major' ? 'maior' : 'menor'}`;
}

function correlation(left: readonly number[], right: readonly number[]): number {
  const leftAverage = left.reduce((sum, value) => sum + value, 0) / left.length;
  const rightAverage = right.reduce((sum, value) => sum + value, 0) / right.length;
  let numerator = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < left.length; index += 1) {
    const leftDelta = left[index] - leftAverage;
    const rightDelta = right[index] - rightAverage;
    numerator += leftDelta * rightDelta;
    leftMagnitude += leftDelta * leftDelta;
    rightMagnitude += rightDelta * rightDelta;
  }

  if (leftMagnitude === 0 || rightMagnitude === 0) return 0;
  return numerator / Math.sqrt(leftMagnitude * rightMagnitude);
}

function rotatedProfile(profile: readonly number[], tonic: number): number[] {
  return Array.from({ length: 12 }, (_, pitchClass) => profile[(pitchClass - tonic + 12) % 12]);
}

function candidateFor(chromagram: readonly number[], tonic: number, mode: KeyMode): KeyCandidate {
  const profile = mode === 'major' ? MAJOR_PROFILE : MINOR_PROFILE;
  return {
    tonic,
    tonicName: TONIC_NAMES[tonic],
    mode,
    label: keyLabel(tonic, mode),
    score: correlation(chromagram, rotatedProfile(profile, tonic)),
  };
}

function estimateNoiseFloor(spectrum: Float32Array): number {
  const values = Array.from(spectrum).filter(Number.isFinite).sort((left, right) => left - right);
  if (values.length === 0) return SPECTRUM_FLOOR;

  // Use the quieter fifth of the spectrum as the room/microphone floor. This
  // prevents broadband PA/room noise from being mistaken for all twelve notes.
  const twentiethPercentile = values[Math.floor((values.length - 1) * .2)];
  return Math.max(SPECTRUM_FLOOR, Math.min(-24, twentiethPercentile));
}

function relativeLevel(decibels: number, noiseFloor: number): number {
  const ceiling = -12;
  return clamp((decibels - noiseFloor) / Math.max(1, ceiling - noiseFloor));
}

function estimateAverageDetuningCents(spectrum: Float32Array, sampleRate: number, fftSize: number, noiseFloor: number): number {
  const binWidth = sampleRate / fftSize;
  let weightedCents = 0;
  let totalWeight = 0;

  for (let bin = 2; bin < spectrum.length - 2; bin += 1) {
    const decibels = spectrum[bin];
    if (!Number.isFinite(decibels) || decibels < noiseFloor + 9 || decibels < spectrum[bin - 1] || decibels < spectrum[bin + 1]) continue;
    const frequency = bin * binWidth;
    if (frequency < MIN_FREQUENCY || frequency > MAX_FREQUENCY) continue;

    const semitonesFromA = 12 * Math.log2(frequency / 440);
    const cents = (semitonesFromA - Math.round(semitonesFromA)) * 100;
    const weight = relativeLevel(decibels, noiseFloor) ** 2;
    weightedCents += cents * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 0;
  return Math.max(-45, Math.min(45, weightedCents / totalWeight));
}

function normalizeChromagram(chromagram: Float64Array): Float64Array | null {
  const total = chromagram.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return null;
  return Float64Array.from(chromagram, (value) => value / total);
}

/**
 * A sparse peak chromagram complements the harmonic reconstruction below.
 * It keeps direct evidence from chords and dense live mixes while ignoring the
 * broad spectral floor produced by rooms and microphones.
 */
function spectralPeakChromagram(spectrum: Float32Array, sampleRate: number, fftSize: number, detuningCents: number, noiseFloor: number): Float64Array {
  const binWidth = sampleRate / fftSize;
  const peaks: Array<{ bin: number; decibels: number }> = [];

  for (let bin = 2; bin < spectrum.length - 2; bin += 1) {
    const decibels = spectrum[bin];
    if (!Number.isFinite(decibels) || decibels < noiseFloor + 5) continue;
    if (decibels < spectrum[bin - 1] || decibels < spectrum[bin + 1]) continue;
    const frequency = bin * binWidth;
    if (frequency < MIN_FREQUENCY || frequency > MAX_FREQUENCY) continue;
    peaks.push({ bin, decibels });
  }

  const chromagram = new Float64Array(12);
  const tuningRatio = 2 ** (detuningCents / 1_200);
  for (const peak of peaks.sort((left, right) => right.decibels - left.decibels).slice(0, 60)) {
    const frequency = (peak.bin * binWidth) / tuningRatio;
    const pitch = 69 + (12 * Math.log2(frequency / 440));
    const nearestMidi = Math.round(pitch);
    const distance = Math.abs(pitch - nearestMidi);
    const pitchClass = ((nearestMidi % 12) + 12) % 12;
    const level = relativeLevel(peak.decibels, noiseFloor);
    const tuningWeight = Math.max(0, Math.cos(Math.PI * distance));
    chromagram[pitchClass] += (level * level * tuningWeight) / Math.sqrt(frequency);
  }

  return chromagram;
}

/**
 * Ranks the 24 major/minor keys using a Krumhansl-style pitch-class profile.
 * It is deliberately evidence-first: consumers decide when enough frames and
 * pitch classes have accumulated to call the answer reliable.
 */
export function rankChromagram(chromagram: ArrayLike<number>): KeyDetection | null {
  if (chromagram.length !== 12) throw new Error('A chromagram must contain 12 pitch classes.');
  const source = Array.from(chromagram, (value) => Math.max(0, value));
  const total = source.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return null;

  const normalized = source.map((value) => value / total);
  const candidates = Array.from({ length: 12 }, (_, tonic) => [
    candidateFor(normalized, tonic, 'major'),
    candidateFor(normalized, tonic, 'minor'),
  ]).flat().sort((left, right) => right.score - left.score);
  const [best, second] = candidates;
  const pitchClassCount = normalized.filter((value) => value >= .045).length;
  const separation = Math.max(0, best.score - second.score);
  const confidence = clamp(((best.score + 1) / 2) * .47 + separation * 1.35 + Math.min(pitchClassCount / 7, 1) * .16);

  return {
    ...best,
    confidence,
    pitchClassCount,
    alternatives: candidates.slice(1, 4),
  };
}

export function relativeKeyFor(detection: Pick<KeyDetection, 'tonic' | 'mode'>): { label: string; relation: string } {
  const relativeIsMinor = detection.mode === 'major';
  const tonic = (detection.tonic + (relativeIsMinor ? 9 : 3)) % 12;
  const mode: KeyMode = relativeIsMinor ? 'minor' : 'major';
  return {
    label: keyLabel(tonic, mode),
    relation: relativeIsMinor ? 'RELATIVA MENOR' : 'RELATIVA MAIOR',
  };
}

/** Accumulates spectral evidence without sending audio or features to a server. */
export class LocalKeyDetector {
  private readonly chromagram = new Float64Array(12);
  private analyzedFrames = 0;

  get frames(): number {
    return this.analyzedFrames;
  }

  reset(): void {
    this.chromagram.fill(0);
    this.analyzedFrames = 0;
  }

  estimate(): KeyDetection | null {
    return rankChromagram(this.chromagram);
  }

  ingestSpectrum(spectrum: Float32Array, sampleRate: number, fftSize: number): KeyDetection | null {
    const binWidth = sampleRate / fftSize;
    const harmonicChroma = new Float64Array(12);
    const noiseFloor = estimateNoiseFloor(spectrum);
    const detuningCents = estimateAverageDetuningCents(spectrum, sampleRate, fftSize, noiseFloor);

    for (let midi = LOWEST_FUNDAMENTAL_MIDI; midi <= HIGHEST_FUNDAMENTAL_MIDI; midi += 1) {
      const fundamental = 440 * (2 ** ((midi - 69 + (detuningCents / 100)) / 12));
      let harmonicScore = 0;

      for (let harmonic = 1; harmonic <= MAX_HARMONICS; harmonic += 1) {
        const harmonicFrequency = fundamental * harmonic;
        if (harmonicFrequency < MIN_FREQUENCY || harmonicFrequency > MAX_FREQUENCY) break;

        const bin = Math.round(harmonicFrequency / binWidth);
        const nearbyDecibels = Math.max(
          spectrum[Math.max(0, bin - 1)] ?? -Infinity,
          spectrum[bin] ?? -Infinity,
          spectrum[Math.min(spectrum.length - 1, bin + 1)] ?? -Infinity,
        );
        if (!Number.isFinite(nearbyDecibels) || nearbyDecibels < noiseFloor + 2) continue;

        // Squaring the normalized level suppresses the spectral floor while
        // preserving peaks shared by a note's harmonic series.
        const level = relativeLevel(nearbyDecibels, noiseFloor);
        harmonicScore += (level * level) / (harmonic ** .72);
      }

      if (harmonicScore < .05) continue;
      const pitchClass = ((midi % 12) + 12) % 12;
      const weight = (harmonicScore ** 1.2) / Math.sqrt(fundamental);
      harmonicChroma[pitchClass] += weight;
    }

    const harmonicEvidence = normalizeChromagram(harmonicChroma);
    const peakEvidence = normalizeChromagram(spectralPeakChromagram(spectrum, sampleRate, fftSize, detuningCents, noiseFloor));
    if (harmonicEvidence || peakEvidence) {
      for (let index = 0; index < this.chromagram.length; index += 1) {
        this.chromagram[index] += harmonicEvidence && peakEvidence
          ? (harmonicEvidence[index] * .68) + (peakEvidence[index] * .32)
          : (harmonicEvidence?.[index] ?? peakEvidence?.[index] ?? 0);
      }
      this.analyzedFrames += 1;
    }
    return this.estimate();
  }
}

export function isReliableDetection(detection: KeyDetection | null, frames: number): detection is KeyDetection {
  return Boolean(detection && frames >= 12 && detection.pitchClassCount >= 3 && detection.confidence >= .54);
}

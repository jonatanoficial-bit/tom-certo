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
const MAX_FREQUENCY = 2_200;
const SPECTRUM_FLOOR = -78;

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
    let frameEnergy = 0;
    const binWidth = sampleRate / fftSize;

    for (let bin = 1; bin < spectrum.length; bin += 1) {
      const decibels = spectrum[bin];
      if (!Number.isFinite(decibels) || decibels < SPECTRUM_FLOOR) continue;
      const frequency = bin * binWidth;
      if (frequency < MIN_FREQUENCY || frequency > MAX_FREQUENCY) continue;

      const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
      const pitchClass = ((midi % 12) + 12) % 12;
      const amplitude = 10 ** (decibels / 20);
      const weight = amplitude / Math.sqrt(frequency);
      this.chromagram[pitchClass] += weight;
      frameEnergy += weight;
    }

    if (frameEnergy > .0001) this.analyzedFrames += 1;
    return this.estimate();
  }
}

export function isReliableDetection(detection: KeyDetection | null, frames: number): detection is KeyDetection {
  return Boolean(detection && frames >= 12 && detection.pitchClassCount >= 3 && detection.confidence >= .54);
}

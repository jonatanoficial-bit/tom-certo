export type KeyMode = 'major' | 'minor';

export interface KeyCandidate {
  tonic: number;
  tonicName: string;
  symbol: string;
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
const TONIC_SYMBOLS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'] as const;
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

/** Compact international spelling for the primary result, such as C, F# or Gm. */
export function keySymbolFor(detection: Pick<KeyCandidate, 'tonic' | 'mode'>): string {
  return `${TONIC_SYMBOLS[detection.tonic]}${detection.mode === 'minor' ? 'm' : ''}`;
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

function candidateFor(chromagram: readonly number[], tonic: number, mode: KeyMode, tonicHint = 0): KeyCandidate {
  const profile = mode === 'major' ? MAJOR_PROFILE : MINOR_PROFILE;
  return {
    tonic,
    tonicName: TONIC_NAMES[tonic],
    symbol: keySymbolFor({ tonic, mode }),
    mode,
    label: keyLabel(tonic, mode),
    // The profile remains the main score. A phrase-ending hint is deliberately
    // small: it helps a melodic cadence break relative-key ties without
    // allowing one final note to override the rest of the melody.
    score: correlation(chromagram, rotatedProfile(profile, tonic)) + (tonicHint * .14),
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
function rankChromagramWithTonicHints(chromagram: ArrayLike<number>, tonicHints?: ArrayLike<number>): KeyDetection | null {
  if (chromagram.length !== 12) throw new Error('A chromagram must contain 12 pitch classes.');
  const source = Array.from(chromagram, (value) => Math.max(0, value));
  const total = source.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return null;

  const normalized = source.map((value) => value / total);
  const hintTotal = tonicHints ? Array.from(tonicHints, (value) => Math.max(0, value)).reduce((sum, value) => sum + value, 0) : 0;
  const candidates = Array.from({ length: 12 }, (_, tonic) => [
    candidateFor(normalized, tonic, 'major', hintTotal > 0 ? Math.max(0, tonicHints?.[tonic] ?? 0) / hintTotal : 0),
    candidateFor(normalized, tonic, 'minor', hintTotal > 0 ? Math.max(0, tonicHints?.[tonic] ?? 0) / hintTotal : 0),
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

export function rankChromagram(chromagram: ArrayLike<number>): KeyDetection | null {
  return rankChromagramWithTonicHints(chromagram);
}

export function relativeKeyFor(detection: Pick<KeyDetection, 'tonic' | 'mode'>): { label: string; symbol: string; relation: string } {
  const relativeIsMinor = detection.mode === 'major';
  const tonic = (detection.tonic + (relativeIsMinor ? 9 : 3)) % 12;
  const mode: KeyMode = relativeIsMinor ? 'minor' : 'major';
  return {
    label: keyLabel(tonic, mode),
    symbol: keySymbolFor({ tonic, mode }),
    relation: relativeIsMinor ? 'RELATIVA MENOR' : 'RELATIVA MAIOR',
  };
}

/** Accumulates spectral evidence without sending audio or features to a server. */
export class LocalKeyDetector {
  private readonly spectralChromagram = new Float64Array(12);
  private readonly melodicChromagram = new Float64Array(12);
  private readonly melodicCadenceHints = new Float64Array(12);
  private readonly recentMelodicMidi: number[] = [];
  private analyzedFrames = 0;
  private melodicFrames = 0;
  private activeMelodicPitchClass: number | null = null;
  private precedingMelodicPitchClass: number | null = null;
  private activeMelodicStartedAt = 0;
  private lastMelodicObservedAt = 0;

  get frames(): number {
    return this.analyzedFrames;
  }

  reset(): void {
    this.spectralChromagram.fill(0);
    this.melodicChromagram.fill(0);
    this.melodicCadenceHints.fill(0);
    this.recentMelodicMidi.splice(0);
    this.analyzedFrames = 0;
    this.melodicFrames = 0;
    this.activeMelodicPitchClass = null;
    this.precedingMelodicPitchClass = null;
    this.activeMelodicStartedAt = 0;
    this.lastMelodicObservedAt = 0;
  }

  estimate(): KeyDetection | null {
    const spectralEvidence = normalizeChromagram(this.spectralChromagram);
    const melodicEvidence = normalizeChromagram(this.melodicChromagram);
    if (!spectralEvidence && !melodicEvidence) return null;

    // A clean fundamental is a more faithful representation of a sung melody
    // than its vocal formants and overtones. Chords still retain their richer
    // spectral path; once enough monophonic frames exist, voice pitch classes
    // receive the majority of the final profile.
    const melodicWeight = melodicEvidence && this.melodicFrames >= 6 ? .68 : 0;
    const combined = new Float64Array(12);
    for (let index = 0; index < combined.length; index += 1) {
      combined[index] = melodicEvidence && spectralEvidence
        ? (melodicEvidence[index] * melodicWeight) + (spectralEvidence[index] * (1 - melodicWeight))
        : (melodicEvidence?.[index] ?? spectralEvidence?.[index] ?? 0);
    }
    return rankChromagramWithTonicHints(combined, melodicWeight > 0 ? this.melodicCadenceHints : undefined);
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
      for (let index = 0; index < this.spectralChromagram.length; index += 1) {
        this.spectralChromagram[index] += harmonicEvidence && peakEvidence
          ? (harmonicEvidence[index] * .68) + (peakEvidence[index] * .32)
          : (harmonicEvidence?.[index] ?? peakEvidence?.[index] ?? 0);
      }
      this.analyzedFrames += 1;
    }
    return this.estimate();
  }

  /**
   * Adds fundamental pitch evidence for a voice or a single melodic line.
   * A five-reading median absorbs ordinary vibrato and brief consonant noise
   * before notes are quantized to pitch classes.
   */
  ingestMelodicPitch(frequency: number, clarity: number, timestamp: number): KeyDetection | null {
    if (!Number.isFinite(frequency) || frequency < 65 || frequency > 1_100 || clarity < .72) return this.estimate();

    const midi = 69 + (12 * Math.log2(frequency / 440));
    this.recentMelodicMidi.push(midi);
    if (this.recentMelodicMidi.length > 5) this.recentMelodicMidi.shift();
    const ordered = [...this.recentMelodicMidi].sort((left, right) => left - right);
    const stableMidi = ordered[Math.floor(ordered.length / 2)];
    const pitchClass = ((Math.round(stableMidi) % 12) + 12) % 12;

    if (this.activeMelodicPitchClass === null) {
      this.activeMelodicPitchClass = pitchClass;
      this.activeMelodicStartedAt = timestamp;
      this.precedingMelodicPitchClass = null;
    } else if (this.activeMelodicPitchClass !== pitchClass) {
      const previousPitchClass = this.activeMelodicPitchClass;
      this.closeMelodicEvent(false);
      this.precedingMelodicPitchClass = previousPitchClass;
      this.activeMelodicPitchClass = pitchClass;
      this.activeMelodicStartedAt = timestamp;
    }
    this.lastMelodicObservedAt = timestamp;

    // Clarity reflects periodicity, so breath, unpitched consonants and a
    // noisy room contribute substantially less than sustained sung notes.
    this.melodicChromagram[pitchClass] += clarity ** 1.4;
    this.melodicFrames += 1;
    this.analyzedFrames += 1;
    return this.estimate();
  }

  /** Marks a pause in a sung phrase without retaining waveform data. */
  ingestMelodicGap(timestamp: number): KeyDetection | null {
    if (this.activeMelodicPitchClass !== null && timestamp - this.lastMelodicObservedAt >= 360) {
      this.closeMelodicEvent(true);
    }
    return this.estimate();
  }

  /** Called once when the capture ends so its last held note can be considered. */
  finalizeMelodicPhrase(): KeyDetection | null {
    this.closeMelodicEvent(true);
    return this.estimate();
  }

  private closeMelodicEvent(isPhraseEnding: boolean): void {
    const pitchClass = this.activeMelodicPitchClass;
    if (pitchClass === null) return;

    const duration = Math.max(0, this.lastMelodicObservedAt - this.activeMelodicStartedAt);
    if (isPhraseEnding && duration >= 280) {
      const durationWeight = Math.min(1.25, .35 + (duration / 900));
      this.melodicCadenceHints[pitchClass] += durationWeight;

      // A leading tone rising to the final note, or a supertonic falling to
      // it, is a useful melodic resolution cue even without accompaniment.
      if (this.precedingMelodicPitchClass !== null) {
        const motion = (pitchClass - this.precedingMelodicPitchClass + 12) % 12;
        if (motion === 1 || motion === 10) this.melodicCadenceHints[pitchClass] += .55;
      }
    }
    this.activeMelodicPitchClass = null;
    this.precedingMelodicPitchClass = null;
  }
}

export function isReliableDetection(detection: KeyDetection | null, frames: number): detection is KeyDetection {
  return Boolean(detection && frames >= 12 && detection.pitchClassCount >= 3 && detection.confidence >= .54);
}

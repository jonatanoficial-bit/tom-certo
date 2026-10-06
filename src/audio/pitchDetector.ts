export interface PitchEstimate {
  frequency: number;
  clarity: number;
}

export interface TunerReading extends PitchEstimate {
  midi: number;
  note: string;
  octave: number;
  targetFrequency: number;
  cents: number;
}

const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

/**
 * Finds the most periodic lag in a mono time-domain buffer. The normalized
 * correlation keeps loudness from being confused with a musical pitch.
 */
export function estimatePitch(samples: Float32Array, sampleRate: number, minFrequency = 55, maxFrequency = 1_400): PitchEstimate | null {
  if (samples.length < 64 || sampleRate <= 0) return null;

  let energy = 0;
  for (const sample of samples) energy += sample * sample;
  const rms = Math.sqrt(energy / samples.length);
  if (rms < .008) return null;

  const minLag = Math.max(2, Math.floor(sampleRate / maxFrequency));
  const maxLag = Math.min(samples.length - 3, Math.floor(sampleRate / minFrequency));
  let bestLag = -1;
  let bestCorrelation = -1;
  const correlations = new Float32Array(maxLag + 1);

  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let numerator = 0;
    let leftEnergy = 0;
    let rightEnergy = 0;
    const limit = samples.length - lag;

    for (let index = 0; index < limit; index += 1) {
      const left = samples[index];
      const right = samples[index + lag];
      numerator += left * right;
      leftEnergy += left * left;
      rightEnergy += right * right;
    }

    const correlation = numerator / Math.sqrt(leftEnergy * rightEnergy || 1);
    correlations[lag] = correlation;
    if (correlation > bestCorrelation) bestCorrelation = correlation;
  }

  // The first strong local peak represents the fundamental period. Choosing
  // the absolute maximum can accidentally select an octave below it because
  // a pure wave also correlates at later multiples of the period.
  for (let lag = minLag + 1; lag < maxLag; lag += 1) {
    const current = correlations[lag];
    if (current >= .72 && current >= correlations[lag - 1] && current > correlations[lag + 1]) {
      bestLag = lag;
      bestCorrelation = current;
      break;
    }
  }

  if (bestLag < 0 || bestCorrelation < .72) return null;

  const previous = correlations[bestLag - 1] ?? bestCorrelation;
  const current = correlations[bestLag];
  const next = correlations[bestLag + 1] ?? bestCorrelation;
  const denominator = previous - (2 * current) + next;
  const adjustment = Math.abs(denominator) > .00001 ? .5 * (previous - next) / denominator : 0;
  const frequency = sampleRate / (bestLag + adjustment);

  if (!Number.isFinite(frequency) || frequency < minFrequency || frequency > maxFrequency) return null;
  return { frequency, clarity: Math.max(0, Math.min(1, bestCorrelation)) };
}

export function tunerReadingFor(pitch: PitchEstimate): TunerReading {
  const midi = Math.round(69 + (12 * Math.log2(pitch.frequency / 440)));
  const targetFrequency = 440 * (2 ** ((midi - 69) / 12));
  const cents = Math.round(1200 * Math.log2(pitch.frequency / targetFrequency));
  const noteIndex = ((midi % 12) + 12) % 12;

  return {
    ...pitch,
    midi,
    note: NOTE_NAMES[noteIndex],
    octave: Math.floor(midi / 12) - 1,
    targetFrequency,
    cents,
  };
}

export function tuningDirection(cents: number): 'flat' | 'in-tune' | 'sharp' {
  if (cents < -5) return 'flat';
  if (cents > 5) return 'sharp';
  return 'in-tune';
}

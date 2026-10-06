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
 * YIN-style period estimator for one sustained voice or instrument note.
 * It deliberately rejects ambiguous/polyphonic input instead of returning a
 * convincing but arbitrary pitch from a chord or noisy room.
 */
export function estimatePitch(samples: Float32Array, sampleRate: number, minFrequency = 55, maxFrequency = 1_400): PitchEstimate | null {
  if (samples.length < 64 || sampleRate <= 0) return null;

  let mean = 0;
  for (const sample of samples) mean += sample;
  mean /= samples.length;

  let energy = 0;
  for (const sample of samples) {
    const centered = sample - mean;
    energy += centered * centered;
  }
  const rms = Math.sqrt(energy / samples.length);
  if (rms < .008) return null;

  const minLag = Math.max(2, Math.floor(sampleRate / maxFrequency));
  const maxLag = Math.min(samples.length - 3, Math.floor(sampleRate / minFrequency));
  const difference = new Float32Array(maxLag + 1);
  const normalizedDifference = new Float32Array(maxLag + 1);
  let cumulativeDifference = 0;

  for (let lag = 1; lag <= maxLag; lag += 1) {
    let sum = 0;
    const limit = samples.length - lag;

    for (let index = 0; index < limit; index += 1) {
      const delta = samples[index] - samples[index + lag];
      sum += delta * delta;
    }

    difference[lag] = sum;
    cumulativeDifference += sum;
    normalizedDifference[lag] = cumulativeDifference > 0 ? (sum * lag) / cumulativeDifference : 1;
  }

  const threshold = .16;
  let bestLag = -1;
  for (let lag = minLag; lag < maxLag; lag += 1) {
    if (normalizedDifference[lag] < threshold) {
      bestLag = lag;
      while (bestLag + 1 < maxLag && normalizedDifference[bestLag + 1] < normalizedDifference[bestLag]) {
        bestLag += 1;
      }
      break;
    }
  }

  if (bestLag < 0) return null;

  const previous = normalizedDifference[bestLag - 1] ?? normalizedDifference[bestLag];
  const current = normalizedDifference[bestLag];
  const next = normalizedDifference[bestLag + 1] ?? normalizedDifference[bestLag];
  const denominator = previous - (2 * current) + next;
  const adjustment = Math.abs(denominator) > .00001 ? .5 * (previous - next) / denominator : 0;
  const frequency = sampleRate / (bestLag + adjustment);

  if (!Number.isFinite(frequency) || frequency < minFrequency || frequency > maxFrequency) return null;
  return { frequency, clarity: Math.max(0, Math.min(1, 1 - current)) };
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

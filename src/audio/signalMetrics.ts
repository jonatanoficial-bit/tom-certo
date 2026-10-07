import type { AudioSignalMetrics, SignalState } from './types';

// Browser microphones often expose conservative levels, particularly when
// automatic gain control is disabled to preserve live music dynamics.
// Keep a wide useful range: absence of spectral evidence still remains silent
// in the key detector, but a quiet real performance is allowed to be analysed.
const SILENCE_RMS = 0.004;
const WEAK_RMS = 0.016;
const CLIPPING_PEAK = 0.985;

export function classifySignal(rms: number, peak: number): SignalState {
  if (peak >= CLIPPING_PEAK) return 'clipping';
  if (rms < SILENCE_RMS) return 'silent';
  if (rms < WEAK_RMS) return 'weak';
  return 'healthy';
}

export function measureTimeDomainSignal(samples: Uint8Array): AudioSignalMetrics {
  if (samples.length === 0) {
    return { rms: 0, peak: 0, decibels: -Infinity, state: 'silent' };
  }

  let squaredTotal = 0;
  let peak = 0;

  for (const sample of samples) {
    const normalized = (sample - 128) / 128;
    const absolute = Math.abs(normalized);
    squaredTotal += normalized * normalized;
    peak = Math.max(peak, absolute);
  }

  const rms = Math.sqrt(squaredTotal / samples.length);
  const decibels = rms === 0 ? -Infinity : 20 * Math.log10(rms);

  return { rms, peak, decibels, state: classifySignal(rms, peak) };
}

export function formatDecibels(decibels: number): string {
  if (!Number.isFinite(decibels) || decibels < -60) return '−60 dB';
  return `${Math.round(decibels)} dB`;
}

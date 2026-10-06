export function clampTempo(value: number): number {
  return Math.min(240, Math.max(35, Math.round(value)));
}

/** Returns BPM from the latest valid taps, excluding accidental double taps and stale pauses. */
export function tempoFromTaps(taps: readonly number[]): number | null {
  const intervals: number[] = [];
  for (let index = 1; index < taps.length; index += 1) {
    const interval = taps[index] - taps[index - 1];
    if (interval >= 250 && interval <= 2_000) intervals.push(interval);
  }
  if (intervals.length === 0) return null;

  const recent = intervals.slice(-4);
  const average = recent.reduce((sum, interval) => sum + interval, 0) / recent.length;
  return clampTempo(60_000 / average);
}

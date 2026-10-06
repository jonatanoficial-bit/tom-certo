export const CAPTURE_WINDOW_MS = 15_000;
export const MIN_EVIDENCE_WINDOW_MS = 8_000;

export function captureProgressFor(elapsedMs: number): number {
  return Math.min(1, Math.max(0, elapsedMs / CAPTURE_WINDOW_MS));
}

export function hasEnoughCaptureTime(elapsedMs: number): boolean {
  return elapsedMs >= MIN_EVIDENCE_WINDOW_MS;
}

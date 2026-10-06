import { describe, expect, it } from 'vitest';
import { CAPTURE_WINDOW_MS, MIN_EVIDENCE_WINDOW_MS, captureProgressFor, hasEnoughCaptureTime } from '../src/audio/capturePolicy';

describe('capture policy', () => {
  it('uses a finite capture window before automatic tonal evaluation', () => {
    expect(CAPTURE_WINDOW_MS).toBe(15_000);
    expect(captureProgressFor(7_500)).toBe(.5);
    expect(captureProgressFor(30_000)).toBe(1);
  });

  it('does not accept a very short microphone excerpt as sufficient evidence', () => {
    expect(hasEnoughCaptureTime(MIN_EVIDENCE_WINDOW_MS - 1)).toBe(false);
    expect(hasEnoughCaptureTime(MIN_EVIDENCE_WINDOW_MS)).toBe(true);
  });
});

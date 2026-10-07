import { describe, expect, it } from 'vitest';
import { classifySignal, measureTimeDomainSignal } from '../src/audio/signalMetrics';

describe('signal metrics', () => {
  it('keeps a quiet but usable microphone level out of silence', () => {
    expect(classifySignal(.006, .012)).toBe('weak');
  });

  it('keeps digital silence silent', () => {
    expect(measureTimeDomainSignal(new Uint8Array(512).fill(128)).state).toBe('silent');
  });
});

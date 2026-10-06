import { describe, expect, it } from 'vitest';
import { experienceModeLabel, isExperienceMode } from '../src/app/experience';

describe('experience preferences', () => {
  it('accepts only supported interface modes', () => {
    expect(isExperienceMode('guided')).toBe(true);
    expect(isExperienceMode('focus')).toBe(true);
    expect(isExperienceMode('presentation')).toBe(false);
  });

  it('keeps the mode label clear for assistive controls', () => {
    expect(experienceModeLabel('guided')).toBe('Modo iniciante');
    expect(experienceModeLabel('focus')).toBe('Modo foco');
  });
});

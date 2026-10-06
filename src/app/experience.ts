export type ExperienceMode = 'guided' | 'focus';

export const EXPERIENCE_MODE_STORAGE_KEY = 'experience-mode';
export const HIGH_CONTRAST_STORAGE_KEY = 'high-contrast';

export function isExperienceMode(value: unknown): value is ExperienceMode {
  return value === 'guided' || value === 'focus';
}

export function experienceModeLabel(mode: ExperienceMode): string {
  return mode === 'guided' ? 'Modo iniciante' : 'Modo foco';
}

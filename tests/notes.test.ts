import { describe, expect, it } from 'vitest';
import { noteName } from '../src/music-theory/notes';

describe('noteName', () => {
  it('returns letter notation by default', () => {
    expect(noteName(4)).toBe('G');
  });

  it('supports solfège and cyclical values', () => {
    expect(noteName(4, 'solfege')).toBe('Sol');
    expect(noteName(-1)).toBe('B');
  });
});

import { describe, expect, it } from 'vitest';
import { capoShapeForKey, transposeChord, transposeProgression } from '../src/music-theory/transposition';

describe('transposition', () => {
  it('keeps chord quality and transposes slash bass', () => {
    expect(transposeChord('G/B', 2)).toBe('A/C♯');
    expect(transposeChord('Em7', -2)).toBe('Dm7');
  });

  it('transposes a whitespace-separated progression', () => {
    expect(transposeProgression('G D Em C', 2)).toBe('A E F♯m D');
  });

  it('returns the chord shape required by a capo', () => {
    expect(capoShapeForKey('G', 2)).toBe('F');
  });
});

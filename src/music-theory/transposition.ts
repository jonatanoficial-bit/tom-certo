const CHROMATIC_NOTES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'] as const;

const NOTE_INDEX: Record<string, number> = {
  C: 0, 'B♯': 0,
  'C♯': 1, 'D♭': 1, 'C#': 1, Db: 1,
  D: 2,
  'D♯': 3, 'E♭': 3, 'D#': 3, Eb: 3,
  E: 4, 'F♭': 4,
  F: 5, 'E♯': 5,
  'F♯': 6, 'G♭': 6, 'F#': 6, Gb: 6,
  G: 7,
  'G♯': 8, 'A♭': 8, 'G#': 8, Ab: 8,
  A: 9,
  'A♯': 10, 'B♭': 10, 'A#': 10, Bb: 10,
  B: 11, 'C♭': 11,
};

export type ChromaticNote = (typeof CHROMATIC_NOTES)[number];

function normalize(index: number): number {
  return ((index % 12) + 12) % 12;
}

export function chromaticNotes(): readonly ChromaticNote[] {
  return CHROMATIC_NOTES;
}

export function transposeNote(note: string, semitones: number): ChromaticNote | null {
  const index = NOTE_INDEX[note];
  return index === undefined ? null : CHROMATIC_NOTES[normalize(index + semitones)];
}

/** Transposes common chord symbols while keeping quality and slash-bass intact. */
export function transposeChord(chord: string, semitones: number): string {
  const match = chord.match(/^([A-G])([#b♯♭]?)(.*)$/);
  if (!match) return chord;

  const [, letter, accidental, suffix] = match;
  const root = transposeNote(`${letter}${accidental}`, semitones);
  if (!root) return chord;

  const transposedSuffix = suffix.replace(/\/([A-G])([#b♯♭]?)/, (_full, bassLetter: string, bassAccidental: string) => {
    const bass = transposeNote(`${bassLetter}${bassAccidental}`, semitones);
    return bass ? `/${bass}` : `/${bassLetter}${bassAccidental}`;
  });
  return `${root}${transposedSuffix}`;
}

export function transposeProgression(progression: string, semitones: number): string {
  return progression.split(/(\s+)/).map((segment) => segment.trim() ? transposeChord(segment, semitones) : segment).join('');
}

export function capoShapeForKey(targetKey: string, capo: number): ChromaticNote | null {
  return transposeNote(targetKey, -capo);
}

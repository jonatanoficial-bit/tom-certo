export type NoteLanguage = 'letter' | 'solfege';

const NOTE_NAMES = {
  letter: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  solfege: ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si'],
} as const;

export function noteName(index: number, language: NoteLanguage = 'letter'): string {
  const notes = NOTE_NAMES[language];
  const normalized = ((index % notes.length) + notes.length) % notes.length;
  return notes[normalized];
}

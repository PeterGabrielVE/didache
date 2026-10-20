// Letras con acordes en formato ChordPro simplificado: '[G]Ale[D]luya'.

export type ChordSegment = { chord: string | null; text: string };

const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLATS: Record<string, string> = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' };

// Separa una línea en tramos: cada acorde con el texto que va debajo hasta el siguiente acorde
export function parseChordLine(line: string): ChordSegment[] {
  const segments: ChordSegment[] = [];
  const pattern = /\[([^\]]*)\]/g;
  let last = 0;
  let chord: string | null = null;
  for (let match = pattern.exec(line); match; match = pattern.exec(line)) {
    if (match.index > last || chord !== null) {
      segments.push({ chord, text: line.slice(last, match.index) });
    }
    chord = match[1].trim() || null;
    last = pattern.lastIndex;
  }
  segments.push({ chord, text: line.slice(last) });
  return segments.filter((s) => s.chord !== null || s.text !== '');
}

export function hasChords(lyrics: string) {
  return /\[[^\]]+\]/.test(lyrics);
}

export function stripChords(lyrics: string) {
  return lyrics.replace(/\[[^\]]*\]/g, '');
}

function transposeNote(note: string, semitones: number) {
  const index = SHARPS.indexOf(FLATS[note] ?? note);
  if (index === -1) return note;
  return SHARPS[(((index + semitones) % 12) + 12) % 12];
}

// 'Am7' +2 -> 'Bm7'; 'D/F#' +1 -> 'D#/G'. Lo que no reconoce como acorde lo deja igual.
export function transposeChord(chord: string, semitones: number) {
  if (semitones === 0) return chord;
  return chord.replace(/([A-G][#b]?)/g, (note, _n, offset: number) => {
    // Solo la nota inicial y la del bajo (después de '/'); no letras sueltas como la 'b' de 'sus'
    const isRoot = offset === 0 || chord[offset - 1] === '/';
    return isRoot ? transposeNote(note, semitones) : note;
  });
}

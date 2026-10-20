// Interpretación de itinerarios de catequesis (cronograma de encuentros) importados de Excel:
// Fecha · Encuentro · Tiempo litúrgico · Tema · Objetivo · Estrategia / Actividad.

import type { NewActivity } from '../types/models';
import { parseFlexibleDate } from './date';
import { findHeaderRow, guessMapping, headerText, type Mapping } from './spreadsheetColumns';

export type ItineraryField = 'date' | 'number' | 'season' | 'theme' | 'objective' | 'activity';

export const ITINERARY_FIELDS: ItineraryField[] = [
  'date',
  'number',
  'season',
  'theme',
  'objective',
  'activity',
];

export const ITINERARY_FIELD_LABELS: Record<ItineraryField, string> = {
  date: 'Fecha',
  number: 'Encuentro',
  season: 'Tiempo litúrgico',
  theme: 'Tema',
  objective: 'Objetivo',
  activity: 'Actividad',
};

export type ItineraryMapping = Mapping<ItineraryField>;

export type EncounterDraft = {
  // Fecha tal como vino en la planilla ('YYYY-MM-DD'; null si falta o no se entiende)
  date: string | null;
  dateText: string;
  number: string | null;
  season: string | null;
  title: string;
  // Referencias al material que venían dentro del tema: 'tema#1 guía#1', 'pag 145'
  references: string[];
  objective: string | null;
  activity: string | null;
};

const PATTERNS: [ItineraryField, RegExp][] = [
  ['date', /^fecha|fecha$|^dia$/],
  ['number', /encuentro|sesion|^n(ro|°|o)?\.?$|^#$|^semana$/],
  ['season', /tiempo|liturgic/],
  ['theme', /tema|titulo/],
  ['objective', /objetivo|proposito/],
  ['activity', /estrategia|actividad|dinamica|recurso/],
];

function fieldFor(header: string): ItineraryField | null {
  const text = headerText(header);
  if (!text) return null;
  return PATTERNS.find(([, pattern]) => pattern.test(text))?.[0] ?? null;
}

export function findItineraryHeaderRow(rows: string[][]) {
  return findHeaderRow(rows, fieldFor);
}

export function guessItineraryMapping(headers: string[]) {
  return guessMapping(headers, ITINERARY_FIELDS, fieldFor);
}

// Referencias a material: 'tema#1 guía#2', 'Tema #9 guia #3', 'taller 5 y 6', 'pag 137', 'Conoce tema 2 pag 137'
const REFERENCE =
  /(conoce\s+)?\b(tema|gu[ií]a|taller)\s*#?\s*\d+(\s*(y|,)\s*\d+)*(\s*(p[aá]g\.?|p[aá]gina)\s*#?\s*\d+)?|\bp[aá]g(\.|ina)?\s*#?\s*\d+/gi;

// Separa el título del encuentro de las referencias al material de la guía
export function parseThemeCell(text: string) {
  const references = (text.match(REFERENCE) ?? []).map((r) => r.replace(/\s+/g, ' ').trim());
  const title = text
    .replace(REFERENCE, ' ')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => /\p{L}{2,}/u.test(line))
    .join(' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim();
  return { title, references };
}

export function rowToEncounter(row: string[], mapping: ItineraryMapping): EncounterDraft {
  const cell = (i: number | null) => (i === null ? '' : (row[i] ?? '').trim());
  const dateText = cell(mapping.date);
  const { title, references } = parseThemeCell(cell(mapping.theme));
  const one = (text: string) => text.replace(/\s*\n\s*/g, ' ') || null;
  return {
    date: dateText ? parseFlexibleDate(dateText) : null,
    dateText,
    number: cell(mapping.number) || null,
    season: one(cell(mapping.season)),
    title,
    references,
    objective: one(cell(mapping.objective)),
    activity: cell(mapping.activity) || null,
  };
}

// Filas que son encuentros: con fecha o con tema (descarta filas vacías y notas al pie)
export function isEncounter(draft: EncounterDraft) {
  return !!draft.dateText || !!draft.title;
}

// Detecta fechas fuera de orden por un año mal tipeado (18/10/2027 entre 11/10/2026 y
// 25/10/2026) y propone la corrección con el año que encaja. Las filas que comparten fecha
// (celdas combinadas) se comparan con la fecha anterior y la siguiente distintas.
export function suggestDateFixes(dates: (string | null)[]) {
  const fixes = new Map<number, string>();
  const neighbor = (from: number, step: 1 | -1) => {
    const own = dates[from];
    for (let i = from + step; i >= 0 && i < dates.length; i += step) {
      if (dates[i] && dates[i] !== own) return dates[i];
    }
    return null;
  };
  dates.forEach((date, i) => {
    if (!date) return;
    const prev = neighbor(i, -1);
    const next = neighbor(i, 1);
    if (!prev || !next || prev > next || (prev <= date && date <= next)) return;
    for (const year of new Set([prev.slice(0, 4), next.slice(0, 4)])) {
      const candidate = `${year}${date.slice(4)}`;
      if (prev <= candidate && candidate <= next) {
        fixes.set(i, candidate);
        return;
      }
    }
  });
  return fixes;
}

// Encuentro -> actividad de la agenda. El título es el tema; el resto va a la descripción.
export function encounterToActivity(
  draft: EncounterDraft,
  date: string,
  startTime: string | null,
): NewActivity {
  const header = [
    draft.number ? `Encuentro ${draft.number}` : null,
    draft.season ? `Tiempo ${draft.season.replace(/^tiempo\s+/i, '')}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const description = [
    header,
    draft.objective ? `Objetivo: ${draft.objective}` : null,
    draft.activity ? `Actividad: ${draft.activity}` : null,
    draft.references.length ? `Material: ${draft.references.join(', ')}` : null,
  ]
    .filter(Boolean)
    .join('\n');
  return {
    title: draft.title || (draft.number ? `Encuentro ${draft.number}` : 'Encuentro'),
    date,
    startTime,
    description: description || null,
  };
}

// Interpretación de planillas de inscripción (Excel, Google Sheets, CSV, Google Forms):
// encabezados, columnas, nombres y fechas escritas de distintas formas.

import { parseFlexibleDate } from './date';
import {
  findHeaderRow as findHeader,
  guessMapping as guessColumns,
  headerText,
  type Mapping,
} from './spreadsheetColumns';

export type Field = 'firstName' | 'lastName' | 'fullName' | 'birthDate' | 'phone' | 'notes';

// Índice de columna para cada dato (null = no se usa)
export type ColumnMapping = Mapping<Field>;

export const FIELD_LABELS: Record<Field, string> = {
  firstName: 'Nombre',
  lastName: 'Apellido',
  fullName: 'Nombre completo',
  birthDate: 'Fecha de nacimiento',
  phone: 'Teléfono',
  notes: 'Notas',
};

// Datos de una fila listos para el formulario de participante
export type ParticipantDraft = {
  firstName: string;
  lastName: string;
  birthDate: string | null;
  phone: string | null;
  notes: string | null;
};

export type DraftIssue = 'missingName' | 'invalidBirthDate';

// Palabras que identifican cada columna. Se prueban en orden: la primera que coincide gana.
const PATTERNS: [Field, RegExp][] = [
  [
    'fullName',
    /nombres? (y|completo|completos)|apellidos? y nombres?|^alumno$|^participante$|^catequizando$|^nino$/,
  ],
  ['lastName', /apellido/],
  ['firstName', /nombre/],
  ['birthDate', /nacimiento|f\.? ?nac|cumpleanos/],
  ['phone', /telefono|celular|movil|whats ?app|tlf|tel\b|contacto/],
  ['notes', /observacion|nota|alergia|comentario/],
];

// Columnas del representante, no del participante (no deben tomarse como su nombre o teléfono)
const GUARDIAN = /representante|padre|madre|tutor|encargado|acudiente/;

// Columnas que no aportan nada en las notas
const IGNORED = /marca temporal|timestamp|^n(ro|°|o)?\.?$|^#$|^item$/;

function fieldFor(header: string): Field | null {
  const text = headerText(header);
  if (!text) return null;
  for (const [field, pattern] of PATTERNS) {
    if (!pattern.test(text)) continue;
    // El teléfono del representante sí sirve (los chicos suelen no tener); su nombre no
    if (GUARDIAN.test(text) && field !== 'phone') return null;
    return field;
  }
  return null;
}

export const FIELDS: Field[] = ['firstName', 'lastName', 'fullName', 'birthDate', 'phone', 'notes'];

export function findHeaderRow(rows: string[][]) {
  return findHeader(rows, fieldFor);
}

export function guessMapping(headers: string[]): ColumnMapping {
  const mapping = guessColumns(headers, FIELDS, fieldFor);
  // Con nombre y apellido separados no hace falta el nombre completo
  if (mapping.firstName !== null && mapping.lastName !== null) mapping.fullName = null;
  return mapping;
}

const PARTICLES = new Set(['de', 'del', 'la', 'las', 'los', 'y']);

// 'MARÍA JOSÉ DE LA CRUZ' -> 'María José de la Cruz'
function titleCase(text: string) {
  return text
    .toLocaleLowerCase('es')
    .split(' ')
    .map((word, i) =>
      i > 0 && PARTICLES.has(word)
        ? word
        : word.replace(
            /(^|-)(\p{L})/gu,
            (_, sep: string, letter: string) => sep + letter.toLocaleUpperCase('es'),
          ),
    )
    .join(' ');
}

// Respeta mayúsculas si vienen mezcladas; si todo está en MAYÚSCULAS o minúsculas, lo normaliza
function cleanName(text: string) {
  const value = text.replace(/\s+/g, ' ').trim();
  const mixed = value !== value.toUpperCase() && value !== value.toLowerCase();
  return mixed ? value : titleCase(value);
}

// 'Pérez Gómez, Juan Carlos' -> apellido 'Pérez Gómez', nombre 'Juan Carlos'.
// Sin coma: con 4 palabras o más, dos nombres; con 3, un nombre y dos apellidos.
export function splitFullName(fullName: string) {
  const value = cleanName(fullName);
  if (value.includes(',')) {
    const [last, first] = value.split(',', 2).map((s) => s.trim());
    return { firstName: first ?? '', lastName: last ?? '' };
  }
  const words = value.split(' ').filter(Boolean);
  if (words.length <= 1) return { firstName: words[0] ?? '', lastName: '' };
  let firstCount = words.length >= 4 ? 2 : 1;
  // 'de', 'del', 'la'… van con el apellido: 'Ana de la Cruz'
  while (firstCount > 1 && PARTICLES.has(words[firstCount - 1].toLowerCase())) firstCount--;
  return {
    firstName: words.slice(0, firstCount).join(' '),
    lastName: words.slice(firstCount).join(' '),
  };
}

// Convierte una fila en datos de participante. Las columnas que no se usan para ningún campo
// van a las notas como 'Encabezado: valor' (p. ej. 'Representante: Ana López').
export function rowToDraft(
  row: string[],
  headers: string[],
  mapping: ColumnMapping,
  extraToNotes: boolean,
): { draft: ParticipantDraft; issues: DraftIssue[] } {
  const cell = (i: number | null) => (i === null ? '' : (row[i] ?? '').trim());

  let firstName = cleanName(cell(mapping.firstName));
  let lastName = cleanName(cell(mapping.lastName));
  if ((!firstName || !lastName) && mapping.fullName !== null) {
    const split = splitFullName(cell(mapping.fullName));
    firstName ||= split.firstName;
    lastName ||= split.lastName;
  }

  const birthText = cell(mapping.birthDate);
  const birthDate = birthText ? parseFlexibleDate(birthText) : null;

  const used = new Set(Object.values(mapping).filter((i): i is number => i !== null));
  // Una columna "Alergias" se guarda como 'Alergias: maní'; "Notas" u "Observaciones", tal cual
  const notesHeader = mapping.notes === null ? '' : (headers[mapping.notes] ?? '').trim();
  const notesValue = cell(mapping.notes);
  const notes = [
    notesValue && !/^(notas?|observaciones?)$/.test(headerText(notesHeader))
      ? `${notesHeader}: ${notesValue}`
      : notesValue,
  ];
  if (extraToNotes) {
    headers.forEach((header, i) => {
      const value = cell(i);
      if (used.has(i) || !value || IGNORED.test(headerText(header))) return;
      notes.push(header.trim() ? `${header.trim()}: ${value}` : value);
    });
  }

  const issues: DraftIssue[] = [];
  if (!firstName || !lastName) issues.push('missingName');
  if (birthText && !birthDate) issues.push('invalidBirthDate');

  return {
    draft: {
      firstName,
      lastName,
      birthDate,
      phone: cell(mapping.phone) || null,
      notes: notes.filter(Boolean).join('\n') || null,
    },
    issues,
  };
}

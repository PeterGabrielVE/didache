import { normalizeText } from './text';

// Reconocimiento de columnas en planillas importadas (inscripción, itinerario…).
// Cada importador define qué campo corresponde a cada título con su propia función `fieldFor`.

// Índice de columna para cada campo (null = no se usa)
export type Mapping<F extends string> = Record<F, number | null>;

// Título de columna comparable: minúsculas, sin acentos ni signos
export function headerText(cell: string) {
  return normalizeText(cell)
    .replace(/[^a-z0-9.# ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Fila de títulos entre las 15 primeras (puede haber logos y títulos arriba):
// la que más columnas reconoce
export function findHeaderRow<F extends string>(
  rows: string[][],
  fieldFor: (h: string) => F | null,
) {
  let best = 0;
  let bestScore = 0;
  rows.slice(0, 15).forEach((row, i) => {
    const score = new Set(row.map(fieldFor).filter(Boolean)).size;
    if (score > bestScore) {
      best = i;
      bestScore = score;
    }
  });
  return best;
}

export function guessMapping<F extends string>(
  headers: string[],
  fields: readonly F[],
  fieldFor: (h: string) => F | null,
) {
  const mapping = Object.fromEntries(fields.map((f) => [f, null])) as Mapping<F>;
  headers.forEach((header, i) => {
    const field = fieldFor(header);
    // Si dos columnas coinciden con el mismo campo, se queda con la primera
    if (field && mapping[field] === null) mapping[field] = i;
  });
  return mapping;
}

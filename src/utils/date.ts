// Fecha local (no UTC) en formato 'YYYY-MM-DD', el que usa la base de datos.
export function toISODate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function today() {
  return toISODate(new Date());
}

// 'YYYY-MM-DD' -> Date local (new Date('YYYY-MM-DD') la interpretaría en UTC y podría correrse un día)
export function parseISODate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, days: number) {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

// Primer y último día del mes de la fecha dada.
export function monthRange(date = new Date()) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { from: toISODate(first), to: toISODate(last) };
}

// 'Martes, 29 de septiembre' (solo la primera letra en mayúscula)
export function formatLongDate(date: Date | string = new Date()) {
  const value = typeof date === 'string' ? parseISODate(date) : date;
  const text = value.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// 'YYYY-MM-DD' -> '4 oct.'
export function formatShortDate(iso: string) {
  return parseISODate(iso).toLocaleDateString('es', { day: 'numeric', month: 'short' });
}

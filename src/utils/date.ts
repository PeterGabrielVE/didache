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
export function monthRange(date: Date | string = new Date()) {
  if (typeof date === 'string') date = parseISODate(date);
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

// Primer día del mes, desplazado n meses: addMonths('2026-10-19', -1) -> '2026-09-01'
export function addMonths(iso: string, months: number) {
  const date = parseISODate(iso);
  return toISODate(new Date(date.getFullYear(), date.getMonth() + months, 1));
}

// 'YYYY-MM-DD' -> 'Octubre 2026'
export function formatMonth(iso: string) {
  const text = parseISODate(iso).toLocaleDateString('es', { month: 'long', year: 'numeric' });
  return text.charAt(0).toUpperCase() + text.slice(1).replace(' de ', ' ');
}


// Semanas del mes para una grilla de calendario que empieza el lunes.
// Los huecos antes del día 1 y después del último día son null.
export function calendarWeeks(month: string) {
  const first = parseISODate(addMonths(month, 0));
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7;

  const cells: (string | null)[] = Array(offset).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toISODate(new Date(first.getFullYear(), first.getMonth(), day)));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

// '10:00' / '10:00 – 12:00' / null
export function formatTimeRange(start: string | null, end: string | null) {
  if (!start) return null;
  return end ? `${start} – ${end}` : start;
}

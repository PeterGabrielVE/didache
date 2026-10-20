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

// Días de a hasta b ('YYYY-MM-DD'); negativo si b es anterior
export function diffDays(a: string, b: string) {
  // Math.round: los cambios de horario de verano hacen que un día no dure siempre 24 h
  return Math.round((parseISODate(b).getTime() - parseISODate(a).getTime()) / 86_400_000);
}

// Primer y último día del mes de la fecha dada.
export function monthRange(date: Date | string = new Date()) {
  if (typeof date === 'string') date = parseISODate(date);
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { from: toISODate(first), to: toISODate(last) };
}

// 'Martes, 29 de septiembre' (solo la primera letra en mayúscula); con withYear agrega ' de 2026'
export function formatLongDate(date: Date | string = new Date(), withYear = false) {
  const value = typeof date === 'string' ? parseISODate(date) : date;
  const text = value.toLocaleDateString('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...(withYear && { year: 'numeric' }),
  });
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

// Máscara para escribir horas: '1030' -> '10:30'. Solo dígitos, como máximo 4.
export function maskTime(text: string) {
  const digits = text.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
}

// 'HH:mm' de 00:00 a 23:59
export function isValidTime(text: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(text);
}

// Máscara para escribir fechas: '15032014' -> '15/03/2014'
export function maskDate(text: string) {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('/');
}

// 'DD/MM/AAAA' -> 'YYYY-MM-DD', o null si no es una fecha real (p. ej. 31/02)
export function parseDisplayDate(text: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (!match) return null;
  const [, d, m, y] = match.map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return toISODate(date);
}

// 'YYYY-MM-DD' -> 'DD/MM/AAAA'
export function formatDisplayDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// Edad que cumple (o cumplió) en el año de `on`
export function ageTurning(birthDate: string, on = today()) {
  return Number(on.slice(0, 4)) - Number(birthDate.slice(0, 4));
}

// Fecha escrita de cualquiera de estas formas -> 'YYYY-MM-DD' (o null si no es una fecha real):
// 2014-03-15 · 15/03/2014 · 15-3-2014 · 15.03.14 · 15/03/2014 10:30:00 (Google Forms)
export function parseFlexibleDate(text: string) {
  const value = text.trim().split(/[ T]/)[0];
  let y: number;
  let m: number;
  let d: number;
  let match = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(value);
  if (match) {
    [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  } else {
    match = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2}|\d{4})$/.exec(value);
    if (!match) return null;
    [d, m, y] = [Number(match[1]), Number(match[2]), Number(match[3])];
    // Año de dos cifras: '14' -> 2014, '95' -> 1995
    if (y < 100) y += y <= new Date().getFullYear() % 100 ? 2000 : 1900;
  }
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return toISODate(date);
}

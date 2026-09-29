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

// Primer y último día del mes de la fecha dada.
export function monthRange(date = new Date()) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { from: toISODate(first), to: toISODate(last) };
}

// 'Martes, 29 de septiembre' (solo la primera letra en mayúscula)
export function formatLongDate(date = new Date()) {
  const text = date.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// 'YYYY-MM-DD' -> '4 oct.' (se arma con componentes locales para no correrse de día por UTC)
export function formatShortDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es', { day: 'numeric', month: 'short' });
}

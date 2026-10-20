import { COLORS } from '../constants/theme';

// Porcentaje entero de presentes sobre marcas; null si no hay marcas
export function attendanceRate(present: number, absent: number) {
  const total = present + absent;
  return total === 0 ? null : Math.round((present / total) * 100);
}

// Verde desde 75 %, naranja desde 50 %, rojo por debajo
export function rateColor(rate: number | null) {
  if (rate === null) return COLORS.MUTED;
  if (rate >= 75) return COLORS.SUCCESS;
  if (rate >= 50) return COLORS.WARNING;
  return COLORS.ERROR;
}

export function formatRate(rate: number | null) {
  return rate === null ? '–' : `${rate} %`;
}

// '3 presentes · 1 ausente'
export function formatCounts(present: number, absent: number) {
  return `${present} ${present === 1 ? 'presente' : 'presentes'} · ${absent} ${absent === 1 ? 'ausente' : 'ausentes'}`;
}

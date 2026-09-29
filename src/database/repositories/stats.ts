import type { SQLiteDatabase } from 'expo-sqlite';

export type DashboardStats = {
  activeParticipants: number;
  activitiesInRange: number;
  attendanceMarks: number;
};

// Totales para el dashboard en una sola consulta.
export async function getDashboardStats(db: SQLiteDatabase, from: string, to: string) {
  const row = await db.getFirstAsync<{
    active_participants: number;
    activities_in_range: number;
    attendance_marks: number;
  }>(
    `SELECT
       (SELECT COUNT(*) FROM participants WHERE active = 1)                AS active_participants,
       (SELECT COUNT(*) FROM activities WHERE date BETWEEN ? AND ?)        AS activities_in_range,
       (SELECT COUNT(*) FROM attendance WHERE date BETWEEN ? AND ?)        AS attendance_marks`,
    from,
    to,
    from,
    to,
  );
  return {
    activeParticipants: row?.active_participants ?? 0,
    activitiesInRange: row?.activities_in_range ?? 0,
    attendanceMarks: row?.attendance_marks ?? 0,
  } satisfies DashboardStats;
}

import type { SQLiteDatabase } from 'expo-sqlite';

import type { AttendanceRecord, AttendanceStatus } from '../../types/models';

type AttendanceRow = {
  id: number;
  participant_id: number;
  date: string;
  status: AttendanceStatus;
};

function toRecord(row: AttendanceRow): AttendanceRecord {
  return {
    id: row.id,
    participantId: row.participant_id,
    date: row.date,
    status: row.status,
  };
}

// Crea o reemplaza la marca del participante para ese día.
export async function setAttendance(
  db: SQLiteDatabase,
  participantId: number,
  date: string,
  status: AttendanceStatus,
) {
  await db.runAsync(
    `INSERT INTO attendance (participant_id, date, status) VALUES (?, ?, ?)
     ON CONFLICT (participant_id, date) DO UPDATE SET status = excluded.status`,
    participantId,
    date,
    status,
  );
}

// Misma marca para varios participantes en una sola transacción (p. ej. "todos presentes").
export async function setAttendanceBulk(
  db: SQLiteDatabase,
  participantIds: number[],
  date: string,
  status: AttendanceStatus,
) {
  if (participantIds.length === 0) return;
  await db.withTransactionAsync(async () => {
    for (const participantId of participantIds) {
      await setAttendance(db, participantId, date, status);
    }
  });
}

export async function clearAttendance(db: SQLiteDatabase, participantId: number, date: string) {
  await db.runAsync('DELETE FROM attendance WHERE participant_id = ? AND date = ?', participantId, date);
}

export async function getAttendanceByDate(db: SQLiteDatabase, date: string) {
  const rows = await db.getAllAsync<AttendanceRow>('SELECT * FROM attendance WHERE date = ?', date);
  return rows.map(toRecord);
}

export async function getAttendanceByParticipant(db: SQLiteDatabase, participantId: number) {
  const rows = await db.getAllAsync<AttendanceRow>(
    'SELECT * FROM attendance WHERE participant_id = ? ORDER BY date DESC',
    participantId,
  );
  return rows.map(toRecord);
}

export type AttendanceSummary = {
  participantId: number;
  present: number;
  absent: number;
};

// Totales por participante en un rango de fechas (inclusive), para reportes.
export async function getAttendanceSummary(db: SQLiteDatabase, from: string, to: string) {
  const rows = await db.getAllAsync<{ participant_id: number; present: number; absent: number }>(
    `SELECT participant_id,
            SUM(status = 'present') AS present,
            SUM(status = 'absent')  AS absent
     FROM attendance
     WHERE date BETWEEN ? AND ?
     GROUP BY participant_id`,
    from,
    to,
  );
  return rows.map<AttendanceSummary>((row) => ({
    participantId: row.participant_id,
    present: row.present,
    absent: row.absent,
  }));
}

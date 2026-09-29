import type { SQLiteDatabase } from 'expo-sqlite';

import type { Activity, NewActivity } from '../../types/models';

type ActivityRow = {
  id: number;
  title: string;
  description: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  created_at: string;
};

function toActivity(row: ActivityRow): Activity {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    location: row.location,
    createdAt: row.created_at,
  };
}

// Actividades entre dos fechas (inclusive), ordenadas cronológicamente.
export async function getActivitiesInRange(db: SQLiteDatabase, from: string, to: string) {
  const rows = await db.getAllAsync<ActivityRow>(
    `SELECT * FROM activities
     WHERE date BETWEEN ? AND ?
     ORDER BY date, start_time IS NULL, start_time`,
    from,
    to,
  );
  return rows.map(toActivity);
}

export async function getActivityById(db: SQLiteDatabase, id: number) {
  const row = await db.getFirstAsync<ActivityRow>('SELECT * FROM activities WHERE id = ?', id);
  return row ? toActivity(row) : null;
}

export async function createActivity(db: SQLiteDatabase, data: NewActivity) {
  const result = await db.runAsync(
    `INSERT INTO activities (title, description, date, start_time, end_time, location)
     VALUES (?, ?, ?, ?, ?, ?)`,
    data.title.trim(),
    data.description ?? null,
    data.date,
    data.startTime ?? null,
    data.endTime ?? null,
    data.location ?? null,
  );
  return result.lastInsertRowId;
}

export async function updateActivity(db: SQLiteDatabase, id: number, data: NewActivity) {
  await db.runAsync(
    `UPDATE activities
     SET title = ?, description = ?, date = ?, start_time = ?, end_time = ?, location = ?
     WHERE id = ?`,
    data.title.trim(),
    data.description ?? null,
    data.date,
    data.startTime ?? null,
    data.endTime ?? null,
    data.location ?? null,
    id,
  );
}

export async function deleteActivity(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM activities WHERE id = ?', id);
}

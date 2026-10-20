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
  reminder_minutes: number | null;
  notification_id: string | null;
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
    reminderMinutes: row.reminder_minutes,
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
    `INSERT INTO activities (title, description, date, start_time, end_time, location, reminder_minutes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    data.title.trim(),
    data.description ?? null,
    data.date,
    data.startTime ?? null,
    data.endTime ?? null,
    data.location ?? null,
    data.reminderMinutes ?? null,
  );
  return result.lastInsertRowId;
}

export async function updateActivity(db: SQLiteDatabase, id: number, data: NewActivity) {
  await db.runAsync(
    `UPDATE activities
     SET title = ?, description = ?, date = ?, start_time = ?, end_time = ?, location = ?,
         reminder_minutes = ?
     WHERE id = ?`,
    data.title.trim(),
    data.description ?? null,
    data.date,
    data.startTime ?? null,
    data.endTime ?? null,
    data.location ?? null,
    data.reminderMinutes ?? null,
    id,
  );
}

export async function deleteActivity(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM activities WHERE id = ?', id);
}

// Id de la notificación programada en el dispositivo (para poder cancelarla)
export async function getNotificationId(db: SQLiteDatabase, id: number) {
  const row = await db.getFirstAsync<{ notification_id: string | null }>(
    'SELECT notification_id FROM activities WHERE id = ?',
    id,
  );
  return row?.notification_id ?? null;
}

export async function setNotificationId(
  db: SQLiteDatabase,
  id: number,
  notificationId: string | null,
) {
  await db.runAsync('UPDATE activities SET notification_id = ? WHERE id = ?', notificationId, id);
}

// Alta de varias actividades en una sola transacción (importación de itinerarios)
export async function createActivities(db: SQLiteDatabase, list: NewActivity[]) {
  await db.withTransactionAsync(async () => {
    for (const data of list) await createActivity(db, data);
  });
}

export async function getAllActivities(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<ActivityRow>('SELECT * FROM activities ORDER BY date');
  return rows.map(toActivity);
}

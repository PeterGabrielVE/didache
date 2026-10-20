import type { SQLiteDatabase } from 'expo-sqlite';

import { DYNAMICS } from '../data/dynamics';
import { PRAYERS } from '../data/prayers';

// SQL a ejecutar, o una función cuando hace falta insertar datos desde JS
type Migration = string | ((db: SQLiteDatabase) => Promise<void>);

// Cada migración lleva la base de la versión i a la i+1.
// Para cambiar el esquema, agregá una nueva al final; nunca edites una ya publicada.
// (Editar src/data no cambia bases ya creadas: solo afecta instalaciones nuevas.)
const MIGRATIONS: Migration[] = [
  // v1: esquema inicial
  `
  CREATE TABLE participants (
    id          INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    first_name  TEXT NOT NULL,
    last_name   TEXT NOT NULL,
    phone       TEXT,
    notes       TEXT,
    active      INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE attendance (
    id              INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    participant_id  INTEGER NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    date            TEXT NOT NULL,
    status          TEXT NOT NULL CHECK (status IN ('present', 'absent')),
    UNIQUE (participant_id, date)
  );
  CREATE INDEX idx_attendance_date ON attendance(date);

  CREATE TABLE activities (
    id           INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    title        TEXT NOT NULL,
    description  TEXT,
    date         TEXT NOT NULL,
    start_time   TEXT,
    end_time     TEXT,
    location     TEXT,
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX idx_activities_date ON activities(date);
  `,
  // v2: fecha de nacimiento para el seguimiento de cumpleaños
  `
  ALTER TABLE participants ADD COLUMN birth_date TEXT;
  `,
  // v3: recordatorio de actividades. reminder_minutes = minutos antes del inicio
  // (NULL = sin recordatorio); notification_id = notificación programada en el dispositivo
  `
  ALTER TABLE activities ADD COLUMN reminder_minutes INTEGER;
  ALTER TABLE activities ADD COLUMN notification_id TEXT;
  `,
  // v4: cancionero propio del catequista (letra con acordes entre corchetes)
  `
  CREATE TABLE songs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    title       TEXT NOT NULL,
    author      TEXT,
    song_key    TEXT,
    lyrics      TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
  `,
  // v5: oraciones y dinámicas editables, precargadas con el contenido de src/data.
  // materials y steps se guardan como arreglos JSON.
  async (db) => {
    await db.execAsync(`
      CREATE TABLE prayers (
        id          INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        title       TEXT NOT NULL,
        category    TEXT NOT NULL,
        text        TEXT NOT NULL,
        created_at  TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE dynamics (
        id          INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        title       TEXT NOT NULL,
        category    TEXT NOT NULL,
        summary     TEXT NOT NULL,
        objective   TEXT NOT NULL,
        duration    TEXT NOT NULL,
        group_size  TEXT NOT NULL,
        materials   TEXT NOT NULL,
        steps       TEXT NOT NULL,
        reflection  TEXT NOT NULL,
        created_at  TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
    for (const p of PRAYERS) {
      await db.runAsync(
        'INSERT INTO prayers (title, category, text) VALUES (?, ?, ?)',
        p.title,
        p.category,
        p.text,
      );
    }
    for (const d of DYNAMICS) {
      await db.runAsync(
        `INSERT INTO dynamics
           (title, category, summary, objective, duration, group_size, materials, steps, reflection)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        d.title,
        d.category,
        d.summary,
        d.objective,
        d.duration,
        d.groupSize,
        JSON.stringify(d.materials),
        JSON.stringify(d.steps),
        d.reflection,
      );
    }
  },
];

export const DATABASE_VERSION = MIGRATIONS.length;

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  // Por conexión: SQLite no aplica claves foráneas si no se activa.
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;
  if (currentVersion >= DATABASE_VERSION) return;

  if (currentVersion === 0) {
    await db.execAsync("PRAGMA journal_mode = 'wal';");
  }

  for (let version = currentVersion; version < DATABASE_VERSION; version++) {
    await db.withTransactionAsync(async () => {
      const migration = MIGRATIONS[version];
      if (typeof migration === 'string') await db.execAsync(migration);
      else await migration(db);
      await db.execAsync(`PRAGMA user_version = ${version + 1}`);
    });
  }
}

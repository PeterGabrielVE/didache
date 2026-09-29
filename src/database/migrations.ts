import type { SQLiteDatabase } from 'expo-sqlite';

// Cada migración lleva la base de la versión i a la i+1.
// Para cambiar el esquema, agregá una nueva al final; nunca edites una ya publicada.
const MIGRATIONS: string[] = [
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
      await db.execAsync(MIGRATIONS[version]);
      await db.execAsync(`PRAGMA user_version = ${version + 1}`);
    });
  }
}

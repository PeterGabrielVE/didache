import type { SQLiteDatabase } from 'expo-sqlite';

import type { NewParticipant, Participant } from '../../types/models';

type ParticipantRow = {
  id: number;
  first_name: string;
  last_name: string;
  phone: string | null;
  notes: string | null;
  active: number;
  created_at: string;
};

function toParticipant(row: ParticipantRow): Participant {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    notes: row.notes,
    active: row.active === 1,
    createdAt: row.created_at,
  };
}

// SQLite no ordena bien acentos ni ñ ('Álvarez' quedaría después de 'Pérez').
const collator = new Intl.Collator('es', { sensitivity: 'base' });

export async function getParticipants(db: SQLiteDatabase, { includeInactive = false } = {}) {
  const rows = await db.getAllAsync<ParticipantRow>(
    `SELECT * FROM participants ${includeInactive ? '' : 'WHERE active = 1'}`,
  );
  return rows
    .map(toParticipant)
    .sort(
      (a, b) => collator.compare(a.lastName, b.lastName) || collator.compare(a.firstName, b.firstName),
    );
}

export async function getParticipantById(db: SQLiteDatabase, id: number) {
  const row = await db.getFirstAsync<ParticipantRow>('SELECT * FROM participants WHERE id = ?', id);
  return row ? toParticipant(row) : null;
}

export async function createParticipant(db: SQLiteDatabase, data: NewParticipant) {
  const result = await db.runAsync(
    'INSERT INTO participants (first_name, last_name, phone, notes) VALUES (?, ?, ?, ?)',
    data.firstName.trim(),
    data.lastName.trim(),
    data.phone ?? null,
    data.notes ?? null,
  );
  return result.lastInsertRowId;
}

export async function updateParticipant(
  db: SQLiteDatabase,
  id: number,
  data: NewParticipant & { active?: boolean },
) {
  await db.runAsync(
    `UPDATE participants
     SET first_name = ?, last_name = ?, phone = ?, notes = ?, active = COALESCE(?, active)
     WHERE id = ?`,
    data.firstName.trim(),
    data.lastName.trim(),
    data.phone ?? null,
    data.notes ?? null,
    data.active === undefined ? null : Number(data.active),
    id,
  );
}

// Borrado definitivo: también elimina su historial de asistencia (ON DELETE CASCADE).
// Para dar de baja conservando el historial, usar updateParticipant con active: false.
export async function deleteParticipant(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM participants WHERE id = ?', id);
}

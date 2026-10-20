import type { SQLiteDatabase } from 'expo-sqlite';

import type { NewPrayer, Prayer, PrayerCategory } from '../../types/resources';

type PrayerRow = {
  id: number;
  title: string;
  category: PrayerCategory;
  text: string;
};

function toPrayer(row: PrayerRow): Prayer {
  return { id: row.id, title: row.title, category: row.category, text: row.text };
}

const collator = new Intl.Collator('es', { sensitivity: 'base' });

export async function getPrayers(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<PrayerRow>('SELECT * FROM prayers');
  return rows.map(toPrayer).sort((a, b) => collator.compare(a.title, b.title));
}

export async function getPrayerById(db: SQLiteDatabase, id: number) {
  const row = await db.getFirstAsync<PrayerRow>('SELECT * FROM prayers WHERE id = ?', id);
  return row ? toPrayer(row) : null;
}

export async function createPrayer(db: SQLiteDatabase, data: NewPrayer) {
  const result = await db.runAsync(
    'INSERT INTO prayers (title, category, text) VALUES (?, ?, ?)',
    data.title.trim(),
    data.category,
    data.text.trim(),
  );
  return result.lastInsertRowId;
}

export async function updatePrayer(db: SQLiteDatabase, id: number, data: NewPrayer) {
  await db.runAsync(
    'UPDATE prayers SET title = ?, category = ?, text = ? WHERE id = ?',
    data.title.trim(),
    data.category,
    data.text.trim(),
    id,
  );
}

export async function deletePrayer(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM prayers WHERE id = ?', id);
}

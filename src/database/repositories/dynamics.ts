import type { SQLiteDatabase } from 'expo-sqlite';

import type { DynamicCategory, GroupDynamic, NewDynamic } from '../../types/resources';

type DynamicRow = {
  id: number;
  title: string;
  category: DynamicCategory;
  summary: string;
  objective: string;
  duration: string;
  group_size: string;
  // Arreglos JSON
  materials: string;
  steps: string;
  reflection: string;
};

function toDynamic(row: DynamicRow): GroupDynamic {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    summary: row.summary,
    objective: row.objective,
    duration: row.duration,
    groupSize: row.group_size,
    materials: JSON.parse(row.materials),
    steps: JSON.parse(row.steps),
    reflection: row.reflection,
  };
}

// Mismo orden de columnas en INSERT y UPDATE
function toParams(data: NewDynamic) {
  return [
    data.title.trim(),
    data.category,
    data.summary.trim(),
    data.objective.trim(),
    data.duration.trim(),
    data.groupSize.trim(),
    JSON.stringify(data.materials),
    JSON.stringify(data.steps),
    data.reflection.trim(),
  ];
}

const collator = new Intl.Collator('es', { sensitivity: 'base' });

export async function getDynamics(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<DynamicRow>('SELECT * FROM dynamics');
  return rows.map(toDynamic).sort((a, b) => collator.compare(a.title, b.title));
}

export async function getDynamicById(db: SQLiteDatabase, id: number) {
  const row = await db.getFirstAsync<DynamicRow>('SELECT * FROM dynamics WHERE id = ?', id);
  return row ? toDynamic(row) : null;
}

export async function createDynamic(db: SQLiteDatabase, data: NewDynamic) {
  const result = await db.runAsync(
    `INSERT INTO dynamics
       (title, category, summary, objective, duration, group_size, materials, steps, reflection)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    toParams(data),
  );
  return result.lastInsertRowId;
}

export async function updateDynamic(db: SQLiteDatabase, id: number, data: NewDynamic) {
  await db.runAsync(
    `UPDATE dynamics
     SET title = ?, category = ?, summary = ?, objective = ?, duration = ?, group_size = ?,
         materials = ?, steps = ?, reflection = ?
     WHERE id = ?`,
    [...toParams(data), id],
  );
}

export async function deleteDynamic(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM dynamics WHERE id = ?', id);
}

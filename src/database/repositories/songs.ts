import type { SQLiteDatabase } from 'expo-sqlite';

import type { NewSong, Song } from '../../types/resources';

type SongRow = {
  id: number;
  title: string;
  author: string | null;
  song_key: string | null;
  lyrics: string;
  created_at: string;
};

function toSong(row: SongRow): Song {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    songKey: row.song_key,
    lyrics: row.lyrics,
    createdAt: row.created_at,
  };
}

const collator = new Intl.Collator('es', { sensitivity: 'base' });

export async function getSongs(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<SongRow>('SELECT * FROM songs');
  return rows.map(toSong).sort((a, b) => collator.compare(a.title, b.title));
}

export async function getSongById(db: SQLiteDatabase, id: number) {
  const row = await db.getFirstAsync<SongRow>('SELECT * FROM songs WHERE id = ?', id);
  return row ? toSong(row) : null;
}

export async function createSong(db: SQLiteDatabase, data: NewSong) {
  const result = await db.runAsync(
    'INSERT INTO songs (title, author, song_key, lyrics) VALUES (?, ?, ?, ?)',
    data.title.trim(),
    data.author ?? null,
    data.songKey ?? null,
    data.lyrics,
  );
  return result.lastInsertRowId;
}

export async function updateSong(db: SQLiteDatabase, id: number, data: NewSong) {
  await db.runAsync(
    'UPDATE songs SET title = ?, author = ?, song_key = ?, lyrics = ? WHERE id = ?',
    data.title.trim(),
    data.author ?? null,
    data.songKey ?? null,
    data.lyrics,
    id,
  );
}

export async function deleteSong(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM songs WHERE id = ?', id);
}

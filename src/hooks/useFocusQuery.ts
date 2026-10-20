import { useFocusEffect } from '@react-navigation/native';
import type { SQLiteDatabase } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { useDatabase } from '../database';

// Ejecuta una consulta cada vez que la pantalla gana foco (p. ej. al volver de un formulario).
// `deps` son los valores que usa `query`, como en useCallback.
export function useFocusQuery<T>(query: (db: SQLiteDatabase) => Promise<T>, deps: unknown[]) {
  const db = useDatabase();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      query(db).then((result) => {
        if (cancelled) return;
        setData(result);
        setLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }, [db, ...deps]),
  );

  return { data, loading };
}

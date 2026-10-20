import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import { activitiesRepo, useDatabase } from '../database';
import type { Activity } from '../types/models';
import { monthRange } from '../utils/date';

// Actividades del mes que contiene `month`, agrupadas por día ('YYYY-MM-DD').
export function useMonthActivities(month: string) {
  const db = useDatabase();
  const [byDate, setByDate] = useState<ReadonlyMap<string, Activity[]>>(new Map());
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const { from, to } = monthRange(month);
      activitiesRepo.getActivitiesInRange(db, from, to).then((activities) => {
        if (cancelled) return;
        // Ya vienen en orden cronológico, así que cada día queda ordenado por hora
        const next = new Map<string, Activity[]>();
        for (const activity of activities) {
          const list = next.get(activity.date);
          if (list) list.push(activity);
          else next.set(activity.date, [activity]);
        }
        setByDate(next);
        setLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }, [db, month]),
  );

  return { byDate, loading };
}

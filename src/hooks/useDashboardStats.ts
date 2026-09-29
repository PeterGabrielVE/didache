import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import { activitiesRepo, statsRepo, useDatabase } from '../database';
import type { Activity } from '../types/models';
import { monthRange } from '../utils/date';
import type { DashboardStats } from '../database/repositories/stats';

// Estadísticas y actividades del mes; se recargan cada vez que la pantalla gana foco.
export function useDashboardStats() {
  const db = useDatabase();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const { from, to } = monthRange();
      Promise.all([
        statsRepo.getDashboardStats(db, from, to),
        activitiesRepo.getActivitiesInRange(db, from, to),
      ]).then(([nextStats, nextActivities]) => {
        if (cancelled) return;
        setStats(nextStats);
        setActivities(nextActivities);
      });
      return () => {
        cancelled = true;
      };
    }, [db]),
  );

  return { stats, activities };
}

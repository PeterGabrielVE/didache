import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import { activitiesRepo, participantsRepo, statsRepo, useDatabase } from '../database';
import type { Activity, Participant } from '../types/models';
import { monthRange } from '../utils/date';
import type { DashboardStats } from '../database/repositories/stats';

// Estadísticas, actividades y cumpleaños del mes; se recargan cada vez que la pantalla gana foco.
export function useDashboardStats() {
  const db = useDatabase();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [birthdays, setBirthdays] = useState<Participant[]>([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const { from, to } = monthRange();
      Promise.all([
        statsRepo.getDashboardStats(db, from, to),
        activitiesRepo.getActivitiesInRange(db, from, to),
        participantsRepo.getBirthdaysInMonth(db, new Date().getMonth() + 1),
      ]).then(([nextStats, nextActivities, nextBirthdays]) => {
        if (cancelled) return;
        setStats(nextStats);
        setActivities(nextActivities);
        setBirthdays(nextBirthdays);
      });
      return () => {
        cancelled = true;
      };
    }, [db]),
  );

  return { stats, activities, birthdays };
}

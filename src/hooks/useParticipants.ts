import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import { participantsRepo, useDatabase } from '../database';
import type { Participant } from '../types/models';

// Participantes activos; se recargan al volver a la pantalla (p. ej. después del formulario).
export function useParticipants() {
  const db = useDatabase();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      participantsRepo.getParticipants(db).then((rows) => {
        if (cancelled) return;
        setParticipants(rows);
        setLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }, [db]),
  );

  return { participants, loading };
}

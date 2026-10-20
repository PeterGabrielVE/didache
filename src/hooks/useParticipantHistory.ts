import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import { attendanceRepo, participantsRepo, useDatabase } from '../database';
import type { AttendanceRecord, Participant } from '../types/models';

// Datos del participante y todas sus marcas, más recientes primero.
export function useParticipantHistory(participantId: number) {
  const db = useDatabase();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      Promise.all([
        participantsRepo.getParticipantById(db, participantId),
        attendanceRepo.getAttendanceByParticipant(db, participantId),
      ]).then(([nextParticipant, nextRecords]) => {
        if (cancelled) return;
        setParticipant(nextParticipant);
        setRecords(nextRecords);
        setLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }, [db, participantId]),
  );

  return { participant, records, loading };
}

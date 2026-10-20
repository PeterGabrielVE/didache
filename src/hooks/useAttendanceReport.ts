import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import { attendanceRepo, participantsRepo, useDatabase } from '../database';
import type { SessionSummary } from '../database/repositories/attendance';
import type { Participant } from '../types/models';
import { attendanceRate } from '../utils/attendance';
import { monthRange } from '../utils/date';

export type ParticipantReportRow = {
  participant: Participant;
  present: number;
  absent: number;
  rate: number | null;
};

export type AttendanceReport = {
  participants: ParticipantReportRow[];
  sessions: SessionSummary[];
  present: number;
  absent: number;
  rate: number | null;
};

// Reporte del mes que contiene `month` ('YYYY-MM-DD'). Incluye a los dados de baja
// solo si tienen marcas en ese mes, para que el historial no pierda datos.
export function useAttendanceReport(month: string) {
  const db = useDatabase();
  const [report, setReport] = useState<AttendanceReport | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const { from, to } = monthRange(month);
      Promise.all([
        participantsRepo.getParticipants(db, { includeInactive: true }),
        attendanceRepo.getAttendanceSummary(db, from, to),
        attendanceRepo.getSessionSummaries(db, from, to),
      ]).then(([participants, summaries, sessions]) => {
        if (cancelled) return;
        const byParticipant = new Map(summaries.map((s) => [s.participantId, s]));
        const rows = participants
          .map<ParticipantReportRow>((participant) => {
            const present = byParticipant.get(participant.id)?.present ?? 0;
            const absent = byParticipant.get(participant.id)?.absent ?? 0;
            return { participant, present, absent, rate: attendanceRate(present, absent) };
          })
          .filter((row) => row.participant.active || row.present + row.absent > 0);

        const present = sessions.reduce((sum, s) => sum + s.present, 0);
        const absent = sessions.reduce((sum, s) => sum + s.absent, 0);
        setReport({
          participants: rows,
          sessions,
          present,
          absent,
          rate: attendanceRate(present, absent),
        });
      });
      return () => {
        cancelled = true;
      };
    }, [db, month]),
  );

  return report;
}

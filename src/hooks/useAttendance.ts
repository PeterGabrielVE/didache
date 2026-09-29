import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';

import { attendanceRepo, useDatabase } from '../database';
import type { AttendanceStatus } from '../types/models';

type Marks = ReadonlyMap<number, AttendanceStatus>;

// Marcas de asistencia de un día. Los cambios se muestran al instante y se guardan
// en segundo plano; si falla el guardado se revierte y se informa el error.
export function useAttendance(date: string) {
  const db = useDatabase();
  const [marks, setMarks] = useState<Marks>(new Map());
  const [error, setError] = useState<string | null>(null);
  // Fecha visible ahora: evita aplicar respuestas o reversiones de un día anterior
  const currentDate = useRef(date);
  currentDate.current = date;

  const load = useCallback(async () => {
    const rows = await attendanceRepo.getAttendanceByDate(db, date);
    if (currentDate.current !== date) return;
    setMarks(new Map(rows.map((r) => [r.participantId, r.status])));
  }, [db, date]);

  useFocusEffect(
    useCallback(() => {
      setError(null);
      load();
    }, [load]),
  );

  // Aplica un cambio solo si seguimos en el mismo día
  const update = (forDate: string, apply: (next: Map<number, AttendanceStatus>) => void) => {
    if (currentDate.current !== forDate) return;
    setMarks((prev) => {
      const next = new Map(prev);
      apply(next);
      return next;
    });
  };

  // status null = quitar la marca
  const mark = async (participantId: number, status: AttendanceStatus | null) => {
    const forDate = date;
    const previous = marks.get(participantId) ?? null;
    const set = (value: AttendanceStatus | null) => (next: Map<number, AttendanceStatus>) => {
      if (value) next.set(participantId, value);
      else next.delete(participantId);
    };

    update(forDate, set(status));
    try {
      if (status) await attendanceRepo.setAttendance(db, participantId, forDate, status);
      else await attendanceRepo.clearAttendance(db, participantId, forDate);
      setError(null);
    } catch {
      update(forDate, set(previous));
      setError('No se pudo guardar la asistencia. Intentá de nuevo.');
    }
  };

  const markAllPresent = async (participantIds: number[]) => {
    const forDate = date;
    update(forDate, (next) => participantIds.forEach((id) => next.set(id, 'present')));
    try {
      await attendanceRepo.setAttendanceBulk(db, participantIds, forDate, 'present');
      setError(null);
    } catch {
      setError('No se pudo guardar la asistencia. Intentá de nuevo.');
      // La transacción se revirtió entera: recargar lo que quedó guardado
      await load();
    }
  };

  return { marks, mark, markAllPresent, error };
}

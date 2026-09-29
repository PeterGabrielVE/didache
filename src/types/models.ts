// Fechas como texto ISO: 'YYYY-MM-DD' para días, 'HH:mm' para horas.
// SQLite no tiene tipo fecha y así se ordenan y comparan bien como texto.

export type Participant = {
  id: number;
  firstName: string;
  lastName: string;
  phone: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
};

export type NewParticipant = Pick<Participant, 'firstName' | 'lastName'> &
  Partial<Pick<Participant, 'phone' | 'notes'>>;

export type AttendanceStatus = 'present' | 'absent';

export type AttendanceRecord = {
  id: number;
  participantId: number;
  date: string;
  status: AttendanceStatus;
};

export type Activity = {
  id: number;
  title: string;
  description: string | null;
  date: string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  createdAt: string;
};

export type NewActivity = Pick<Activity, 'title' | 'date'> &
  Partial<Pick<Activity, 'description' | 'startTime' | 'endTime' | 'location'>>;

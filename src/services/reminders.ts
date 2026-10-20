import * as Notifications from './expoNotifications';
import { isRunningInExpoGo } from 'expo';
import type { SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';

import { activitiesRepo } from '../database';
import type { Activity } from '../types/models';
import { formatTimeRange, parseISODate } from '../utils/date';

// Web: expo-notifications no programa notificaciones locales.
// Expo Go en Android: el módulo de notificaciones viene sin inicializar (falla al crear
// el canal con NullPointerException); funcionan en un build instalable (APK / development build).
const UNAVAILABLE_REASON =
  Platform.OS === 'web'
    ? 'Los recordatorios llegan solo en la app del teléfono.'
    : Platform.OS === 'android' && isRunningInExpoGo()
      ? 'Los recordatorios no funcionan en Expo Go para Android; sí en la app instalada.'
      : null;
const SUPPORTED = UNAVAILABLE_REASON === null;

// Por qué no se pueden programar avisos en este entorno (null = sí se puede)
export function remindersUnavailableReason() {
  return UNAVAILABLE_REASON;
}
const CHANNEL_ID = 'activities';
// Hora que se toma como inicio de las actividades sin hora
const DEFAULT_HOUR = 9;

export const REMINDER_OPTIONS = [
  { value: null, label: 'Sin aviso' },
  { value: 0, label: 'Al empezar' },
  { value: 15, label: '15 min antes' },
  { value: 60, label: '1 hora antes' },
  { value: 1440, label: '1 día antes' },
] as const;

// Llamar una vez al arrancar la app: cómo mostrar avisos con la app abierta y canal de Android
export function setupNotifications() {
  if (!SUPPORTED) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Actividades',
      importance: Notifications.AndroidImportance.HIGH,
    }).catch((error) => console.warn('No se pudo crear el canal de notificaciones', error));
  }
}

async function ensurePermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

// Momento del aviso: inicio de la actividad menos los minutos elegidos
export function reminderDate(activity: Pick<Activity, 'date' | 'startTime' | 'reminderMinutes'>) {
  if (activity.reminderMinutes === null) return null;
  const start = parseISODate(activity.date);
  const [hours, minutes] = activity.startTime
    ? activity.startTime.split(':').map(Number)
    : [DEFAULT_HOUR, 0];
  start.setHours(hours, minutes - activity.reminderMinutes, 0, 0);
  return start;
}

function reminderBody(activity: Activity) {
  const when = activity.reminderMinutes === 1440 ? 'Mañana' : 'Hoy';
  const time = formatTimeRange(activity.startTime, activity.endTime);
  return [time ? `${when}, ${time}` : when, activity.location].filter(Boolean).join(' · ');
}

export type ReminderResult = 'scheduled' | 'none' | 'past' | 'denied' | 'unsupported';

// Reprograma el aviso de una actividad según lo guardado en la base: cancela el anterior
// (si había) y programa uno nuevo si corresponde. Llamar después de crear o editar.
export async function syncActivityReminder(
  db: SQLiteDatabase,
  activityId: number,
): Promise<ReminderResult> {
  if (!SUPPORTED) return 'unsupported';
  await cancelActivityReminder(db, activityId);

  const activity = await activitiesRepo.getActivityById(db, activityId);
  const date = activity && reminderDate(activity);
  if (!activity || !date) return 'none';
  if (date.getTime() <= Date.now()) return 'past';
  if (!(await ensurePermission())) return 'denied';

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: { title: activity.title, body: reminderBody(activity), data: { activityId } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId: CHANNEL_ID },
  });
  await activitiesRepo.setNotificationId(db, activityId, notificationId);
  return 'scheduled';
}

// Llamar antes de borrar la actividad
export async function cancelActivityReminder(db: SQLiteDatabase, activityId: number) {
  if (!SUPPORTED) return;
  const notificationId = await activitiesRepo.getNotificationId(db, activityId);
  if (!notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
  await activitiesRepo.setNotificationId(db, activityId, null);
}

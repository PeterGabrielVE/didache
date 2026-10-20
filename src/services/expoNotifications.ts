// Subconjunto de expo-notifications para notificaciones locales, importado por archivo.
// El índice del paquete ('expo-notifications') carga también la suscripción a temas push,
// que exige el módulo nativo ExpoTopicSubscriptionModule. Expo Go para Android no lo trae
// (no soporta push desde SDK 53) y la app falla al arrancar. Estos archivos no lo cargan.
export { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';
export { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';
export {
  getPermissionsAsync,
  requestPermissionsAsync,
} from 'expo-notifications/build/NotificationPermissions';
export { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
export { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
export { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
// Metro elige setNotificationChannelAsync.android.js en Android
export { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';

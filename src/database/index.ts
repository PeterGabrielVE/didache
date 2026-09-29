// Usar solo los métodos *Async (getAllAsync, runAsync...). Los *Sync en web
// requieren SharedArrayBuffer, que el servidor de desarrollo de Expo no habilita.
export { useSQLiteContext as useDatabase } from 'expo-sqlite';
export { DatabaseProvider } from './DatabaseProvider';
export * as activitiesRepo from './repositories/activities';
export * as attendanceRepo from './repositories/attendance';
export * as participantsRepo from './repositories/participants';
export * as statsRepo from './repositories/stats';

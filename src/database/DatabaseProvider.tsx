import { SQLiteProvider } from 'expo-sqlite';
import type { ReactNode } from 'react';

import { DATABASE_NAME } from '../constants/database';
import { migrateDbIfNeeded } from './migrations';

// Abre la base, corre las migraciones y recién ahí renderiza la app.
export function DatabaseProvider({ children }: { children: ReactNode }) {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDbIfNeeded}>
      {children}
    </SQLiteProvider>
  );
}

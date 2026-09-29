import { COLORS } from '../constants/theme';

// Header estilo Argon, compartido por tabs y stack
export const headerOptions = {
  headerTitleAlign: 'center',
  headerTintColor: COLORS.DEFAULT,
  headerTitleStyle: { fontSize: 16, fontWeight: '700', color: COLORS.DEFAULT },
  headerShadowVisible: true,
} as const;

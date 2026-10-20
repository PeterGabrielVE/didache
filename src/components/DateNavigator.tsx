import { Pressable, StyleSheet, View } from 'react-native';

import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { addDays, formatLongDate, today } from '../utils/date';
import { ArrowButton } from './ArrowButton';
import { Text } from './Text';

type Props = {
  date: string;
  onChange: (date: string) => void;
  // Último día permitido (inclusive); por defecto hoy
  maxDate?: string;
};

// Selector de día con flechas: ‹ Hoy · martes 29 de septiembre ›
export function DateNavigator({ date, onChange, maxDate = today() }: Props) {
  const todayIso = today();
  const relative = date === todayIso ? 'Hoy' : date === addDays(todayIso, -1) ? 'Ayer' : null;
  const canGoNext = date < maxDate;

  return (
    <View style={styles.container}>
      <ArrowButton
        icon="chevron-back"
        label="Día anterior"
        onPress={() => onChange(addDays(date, -1))}
      />
      <View style={styles.center}>
        <Text variant="caption" bold color={COLORS.PRIMARY}>
          {relative ? relative.toUpperCase() : ' '}
        </Text>
        <Text variant="body" bold color={COLORS.HEADING} numberOfLines={1}>
          {formatLongDate(date)}
        </Text>
        {date !== todayIso ? (
          <Pressable onPress={() => onChange(todayIso)} hitSlop={8}>
            <Text variant="caption" bold color={COLORS.PRIMARY}>
              Volver a hoy
            </Text>
          </Pressable>
        ) : null}
      </View>
      <ArrowButton
        icon="chevron-forward"
        label="Día siguiente"
        disabled={!canGoNext}
        onPress={() => onChange(addDays(date, 1))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: COLORS.WHITE,
    borderRadius: SIZES.CARD_RADIUS,
    ...SHADOWS.card,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
});

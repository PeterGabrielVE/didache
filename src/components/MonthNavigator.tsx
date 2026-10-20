import { StyleSheet, View } from 'react-native';

import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { addMonths, formatMonth, today } from '../utils/date';
import { ArrowButton } from './ArrowButton';
import { Text } from './Text';

type Props = {
  // Cualquier día del mes; se muestra solo mes y año
  month: string;
  onChange: (month: string) => void;
};

// Selector de mes con flechas: ‹ Octubre 2026 ›. No permite pasar del mes actual.
export function MonthNavigator({ month, onChange }: Props) {
  const current = addMonths(today(), 0);
  const value = addMonths(month, 0);

  return (
    <View style={styles.container}>
      <ArrowButton icon="chevron-back" label="Mes anterior" onPress={() => onChange(addMonths(value, -1))} />
      <View style={styles.center}>
        <Text variant="caption" bold color={COLORS.PRIMARY}>
          {value === current ? 'ESTE MES' : ' '}
        </Text>
        <Text variant="body" bold color={COLORS.HEADING}>
          {formatMonth(value)}
        </Text>
      </View>
      <ArrowButton
        icon="chevron-forward"
        label="Mes siguiente"
        disabled={value >= current}
        onPress={() => onChange(addMonths(value, 1))}
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

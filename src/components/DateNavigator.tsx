import { Pressable, StyleSheet, View } from 'react-native';

import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { addDays, formatLongDate, today } from '../utils/date';
import { Icon, type IoniconName } from './Icon';
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

function ArrowButton({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: IoniconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.arrow, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <Icon name={icon} size={20} color={COLORS.PRIMARY} />
    </Pressable>
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
  arrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.PRIMARY}14`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.3,
  },
});

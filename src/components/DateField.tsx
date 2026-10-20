import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { COLORS, SIZES } from '../constants/theme';
import { formatLongDate } from '../utils/date';
import { Icon } from './Icon';
import { MonthCalendar } from './MonthCalendar';
import { MonthNavigator } from './MonthNavigator';
import { Text } from './Text';

type Props = {
  label?: string;
  value: string;
  onChange: (date: string) => void;
};

// Campo de fecha con el mismo aspecto que Input; al tocarlo despliega un calendario
export function DateField({ label, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(value);

  const toggle = () => {
    // Al abrir, el calendario muestra el mes de la fecha elegida
    if (!open) setMonth(value);
    setOpen(!open);
  };

  return (
    <View>
      {label ? (
        <Text variant="small" bold style={styles.label}>
          {label}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label ?? 'Fecha'}: ${formatLongDate(value, true)}`}
        accessibilityState={{ expanded: open }}
        onPress={toggle}
        style={[styles.field, open && styles.focused]}
      >
        <Icon name="calendar-outline" size={16} color={COLORS.MUTED} />
        <Text variant="small" color={COLORS.HEADER} style={styles.value}>
          {formatLongDate(value, true)}
        </Text>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.MUTED} />
      </Pressable>
      {open ? (
        <View style={styles.picker}>
          <MonthNavigator month={month} onChange={setMonth} />
          <MonthCalendar
            month={month}
            selected={value}
            onSelect={(date) => {
              onChange(date);
              setOpen(false);
            }}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 6,
  },
  field: {
    height: SIZES.INPUT_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: SIZES.RADIUS,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.WHITE,
  },
  focused: {
    borderColor: COLORS.PRIMARY,
  },
  value: {
    flex: 1,
  },
  picker: {
    gap: 8,
    marginTop: 8,
  },
});

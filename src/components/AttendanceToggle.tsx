import { Pressable, StyleSheet, View } from 'react-native';

import { COLORS } from '../constants/theme';
import type { AttendanceStatus } from '../types/models';
import { Icon, type IoniconName } from './Icon';

type Props = {
  status: AttendanceStatus | null;
  // null = quitar la marca (tocar de nuevo el botón activo)
  onChange: (status: AttendanceStatus | null) => void;
  // Para lectores de pantalla: "Marcar presente a Ana Pérez"
  name: string;
};

const OPTIONS: { value: AttendanceStatus; icon: IoniconName; color: string; label: string }[] = [
  { value: 'present', icon: 'checkmark', color: COLORS.SUCCESS, label: 'presente' },
  { value: 'absent', icon: 'close', color: COLORS.ERROR, label: 'ausente' },
];

export function AttendanceToggle({ status, onChange, name }: Props) {
  return (
    <View style={styles.row}>
      {OPTIONS.map((option) => {
        const selected = status === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={
              selected ? `Quitar ${option.label} a ${name}` : `Marcar ${option.label} a ${name}`
            }
            hitSlop={4}
            onPress={() => onChange(selected ? null : option.value)}
            style={({ pressed }) => [
              styles.button,
              selected
                ? { backgroundColor: option.color, borderColor: option.color }
                : { borderColor: COLORS.BORDER },
              pressed && styles.pressed,
            ]}
          >
            <Icon name={option.icon} size={22} color={selected ? COLORS.WHITE : COLORS.MUTED} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.WHITE,
  },
  pressed: {
    opacity: 0.7,
  },
});

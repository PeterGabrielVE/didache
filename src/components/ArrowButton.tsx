import { Pressable, StyleSheet } from 'react-native';

import { COLORS } from '../constants/theme';
import { Icon, type IoniconName } from './Icon';

type Props = {
  icon: IoniconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

// Botón redondo con flecha para los navegadores de día y de mes
export function ArrowButton({ icon, label, onPress, disabled }: Props) {
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

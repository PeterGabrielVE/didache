import { Pressable, StyleSheet } from 'react-native';

import { COLORS } from '../constants/theme';
import { Icon, type IoniconName } from './Icon';

type Props = {
  icon: IoniconName;
  label: string;
  onPress: () => void;
};

// Ícono para headerRight / headerLeft de la navegación
export function HeaderButton({ icon, label, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Icon name={icon} size={22} color={COLORS.PRIMARY} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
  },
  pressed: {
    opacity: 0.6,
  },
});

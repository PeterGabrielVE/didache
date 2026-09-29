import { Pressable, StyleSheet } from 'react-native';

import { COLORS, SIZES } from '../constants/theme';
import { Icon, type IoniconName } from './Icon';

type Props = {
  icon?: IoniconName;
  onPress: () => void;
  accessibilityLabel: string;
};

// Botón de acción principal flotante (esquina inferior derecha)
export function FloatingButton({ icon = 'add', onPress, accessibilityLabel }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
    >
      <Icon name={icon} size={28} color={COLORS.WHITE} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: SIZES.BASE,
    bottom: SIZES.BASE,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 8px rgba(50, 50, 93, 0.25)',
  },
  pressed: {
    opacity: 0.85,
  },
});

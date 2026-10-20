import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, SIZES } from '../constants/theme';
import { Icon, type IoniconName } from './Icon';
import { Text } from './Text';

export type ActionSheetOption = {
  label: string;
  icon: IoniconName;
  onPress: () => void;
};

type Props = {
  visible: boolean;
  title?: string;
  options: ActionSheetOption[];
  onClose: () => void;
};

// Menú de opciones que sube desde abajo. Propio (no Alert) para que funcione igual en web.
export function ActionSheet({ visible, title, options, onClose }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar">
        {/* Pressable interno: tocar el panel no lo cierra */}
        <Pressable style={[styles.sheet, { paddingBottom: SIZES.BASE + insets.bottom }]}>
          {title ? (
            <Text variant="caption" bold muted center style={styles.title}>
              {title.toUpperCase()}
            </Text>
          ) : null}
          {options.map((option) => (
            <Pressable
              key={option.label}
              accessibilityRole="button"
              onPress={() => {
                onClose();
                option.onPress();
              }}
              style={({ pressed }) => [styles.option, pressed && styles.pressed]}
            >
              <View style={styles.iconCircle}>
                <Icon name={option.icon} size={18} color={COLORS.PRIMARY} />
              </View>
              <Text variant="body" color={COLORS.HEADING}>
                {option.label}
              </Text>
            </Pressable>
          ))}
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
          >
            <Text variant="body" bold muted>
              Cancelar
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(23, 43, 77, 0.4)',
  },
  sheet: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: SIZES.BASE,
    paddingHorizontal: SIZES.BASE,
    gap: 4,
  },
  title: {
    marginBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: SIZES.RADIUS,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.PRIMARY}14`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancel: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  pressed: {
    backgroundColor: COLORS.SECONDARY,
  },
});

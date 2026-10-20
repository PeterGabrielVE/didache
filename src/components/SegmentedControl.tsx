import { Pressable, StyleSheet, View } from 'react-native';

import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { Text } from './Text';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

// Pestañas compactas para alternar vistas dentro de una misma pantalla
export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.container} accessibilityRole="tablist">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.option, selected && styles.selected]}
          >
            <Text variant="small" bold color={selected ? COLORS.WHITE : COLORS.TEXT}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 4,
    gap: 4,
    backgroundColor: COLORS.WHITE,
    borderRadius: SIZES.CARD_RADIUS,
    ...SHADOWS.card,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: SIZES.RADIUS,
  },
  selected: {
    backgroundColor: COLORS.PRIMARY,
  },
});

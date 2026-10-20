import { Pressable, StyleSheet, View } from 'react-native';

import { COLORS } from '../constants/theme';
import { Text } from './Text';

type Option<T> = { value: T; label: string };

type Props<T> = {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

// Opciones excluyentes en forma de "pills" que se acomodan en varias líneas
export function OptionChips<T>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.container} accessibilityRole="radiogroup">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.label}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.chip, selected && styles.selected]}
          >
            <Text variant="caption" bold color={selected ? COLORS.WHITE : COLORS.TEXT}>
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
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.WHITE,
  },
  selected: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
});

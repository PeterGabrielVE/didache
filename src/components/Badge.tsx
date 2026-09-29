import { StyleSheet, Text, View } from 'react-native';

import { colorFor, type ColorName } from '../constants/theme';

type Props = {
  label: string;
  color?: ColorName;
};

// Etiqueta tipo "pill" de Argon: fondo claro del color y texto del color
export function Badge({ label, color = 'primary' }: Props) {
  const tint = colorFor(color);
  return (
    <View style={[styles.badge, { backgroundColor: `${tint}26` }]}>
      <Text style={[styles.text, { color: tint }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

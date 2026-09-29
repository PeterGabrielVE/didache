import { StyleSheet, View } from 'react-native';

import { COLORS } from '../constants/theme';
import { Text } from './Text';

const PALETTE = [COLORS.PRIMARY, COLORS.INFO, COLORS.SUCCESS, COLORS.WARNING, COLORS.LABEL, COLORS.DEFAULT];

type Props = {
  label: string;
  // Semilla para el color: el mismo participante siempre tiene el mismo color
  seed?: number;
  size?: number;
};

export function Avatar({ label, seed = 0, size = 44 }: Props) {
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
        { backgroundColor: PALETTE[Math.abs(seed) % PALETTE.length] },
      ]}
    >
      <Text bold color={COLORS.WHITE} style={{ fontSize: size * 0.36 }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

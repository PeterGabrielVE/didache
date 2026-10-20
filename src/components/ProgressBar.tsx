import { StyleSheet, View } from 'react-native';

import { COLORS } from '../constants/theme';

type Props = {
  // 0 a 100
  value: number;
  color?: string;
};

export function ProgressBar({ value, color = COLORS.PRIMARY }: Props) {
  const width = `${Math.min(100, Math.max(0, value))}%` as const;
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.BLOCK,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});

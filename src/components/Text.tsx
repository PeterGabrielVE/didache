import { Text as RNText, StyleSheet, type TextProps as RNTextProps } from 'react-native';

import { COLORS } from '../constants/theme';

type Variant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small' | 'caption';

export type TextProps = RNTextProps & {
  variant?: Variant;
  color?: string;
  bold?: boolean;
  muted?: boolean;
  center?: boolean;
};

export function Text({ variant = 'body', color, bold, muted, center, style, ...props }: TextProps) {
  return (
    <RNText
      style={[
        styles[variant],
        muted && { color: COLORS.MUTED },
        color !== undefined && { color },
        bold && styles.bold,
        center && styles.center,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 32, fontWeight: '700', color: COLORS.HEADING },
  h2: { fontSize: 28, fontWeight: '700', color: COLORS.HEADING },
  h3: { fontSize: 22, fontWeight: '600', color: COLORS.HEADING },
  h4: { fontSize: 18, fontWeight: '600', color: COLORS.HEADING },
  body: { fontSize: 16, color: COLORS.TEXT },
  small: { fontSize: 14, color: COLORS.TEXT },
  caption: { fontSize: 12, color: COLORS.TEXT },
  bold: { fontWeight: '700' },
  center: { textAlign: 'center' },
});

import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { COLORS, SHADOWS, SIZES, colorFor, type ColorName } from '../constants/theme';

export type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  children: ReactNode;
  color?: ColorName;
  // Sin fondo: botón tipo enlace
  transparent?: boolean;
  small?: boolean;
  shadowless?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function Button({
  children,
  color = 'primary',
  transparent,
  small,
  shadowless,
  icon,
  disabled,
  style,
  textStyle,
  ...props
}: ButtonProps) {
  const background = colorFor(color);
  // 'secondary' es casi blanco: necesita texto oscuro
  const foreground = transparent ? background : color === 'secondary' ? COLORS.DEFAULT : COLORS.WHITE;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        small && styles.small,
        transparent ? styles.transparent : { backgroundColor: background },
        !transparent && !shadowless && SHADOWS.md,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      <View style={styles.content}>
        {icon}
        {typeof children === 'string' ? (
          <Text style={[styles.text, small && styles.smallText, { color: foreground }, textStyle]}>
            {transparent ? children : children.toUpperCase()}
          </Text>
        ) : (
          children
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: SIZES.BUTTON_HEIGHT,
    paddingHorizontal: SIZES.BASE * 1.5,
    borderRadius: SIZES.RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    height: 28,
    paddingHorizontal: SIZES.BASE * 0.75,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  smallText: {
    fontSize: 11,
  },
});

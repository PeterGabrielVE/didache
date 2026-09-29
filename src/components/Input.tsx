import { useState, type ReactNode } from 'react';
import { StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';

import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { Text } from './Text';

export type InputProps = TextInputProps & {
  label?: string;
  icon?: ReactNode;
  success?: boolean;
  error?: boolean;
  // Mensaje de ayuda o de error debajo del campo
  helper?: string;
  shadowless?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export function Input({
  label,
  icon,
  success,
  error,
  helper,
  shadowless,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={containerStyle}>
      {label ? (
        <Text variant="small" bold style={styles.label}>
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.field,
          !shadowless && SHADOWS.sm,
          focused && styles.focused,
          success && styles.success,
          error && styles.error,
        ]}
      >
        {icon}
        <TextInput
          placeholderTextColor={COLORS.MUTED}
          style={[styles.input, style]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
      </View>
      {helper ? (
        <Text variant="caption" color={error ? COLORS.ERROR : COLORS.MUTED} style={styles.helper}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 6,
  },
  field: {
    height: SIZES.INPUT_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: SIZES.RADIUS,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.WHITE,
  },
  focused: {
    borderColor: COLORS.PRIMARY,
  },
  success: {
    borderColor: COLORS.INPUT_SUCCESS,
  },
  error: {
    borderColor: COLORS.INPUT_ERROR,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: COLORS.HEADER,
  },
  helper: {
    marginTop: 4,
  },
});

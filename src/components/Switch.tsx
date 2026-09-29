import { Switch as RNSwitch, type SwitchProps } from 'react-native';

import { COLORS } from '../constants/theme';

export function Switch({ value, ...props }: SwitchProps) {
  return (
    <RNSwitch
      value={value}
      thumbColor={COLORS.WHITE}
      ios_backgroundColor={COLORS.SWITCH_OFF}
      trackColor={{ false: COLORS.SWITCH_OFF, true: COLORS.SWITCH_ON }}
      {...props}
    />
  );
}

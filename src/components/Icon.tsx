import Ionicons from '@expo/vector-icons/Ionicons';
import createIconSetFromIcoMoon from '@expo/vector-icons/createIconSetFromIcoMoon';
import type { ComponentProps } from 'react';

import argonConfig from '../../assets/argon/fonts/argon.json';
import { COLORS } from '../constants/theme';

// Íconos propios de Argon (fuente IcoMoon). Se cargan solos la primera vez.
const ArgonIcons = createIconSetFromIcoMoon(
  argonConfig,
  'ArgonExtra',
  require('../../assets/argon/fonts/argon.ttf'),
);

export type ArgonIconName =
  | 'nav-left'
  | 'nav-right'
  | 'nav-down'
  | 'bag-17'
  | 'basket'
  | 'bell'
  | 'calendar-date'
  | 'chart-pie-35'
  | 'diamond'
  | 'engine-start'
  | 'g-check'
  | 'hat-3'
  | 'ic_mail_24px'
  | 'map-big'
  | 'menu-8'
  | 'padlock-unlocked'
  | 'palette'
  | 'search-zoom-in'
  | 'shop'
  | 'spaceship'
  | 'support'
  | 'switches'
  | 'ungroup';

export type IoniconName = ComponentProps<typeof Ionicons>['name'];

type BaseProps = { size?: number; color?: string };

export type IconProps =
  | (BaseProps & { family?: 'ionicons'; name: IoniconName })
  | (BaseProps & { family: 'argon'; name: ArgonIconName });

export function Icon({ size = 16, color = COLORS.ICON, ...props }: IconProps) {
  if (props.family === 'argon') {
    return <ArgonIcons name={props.name} size={size} color={color} />;
  }
  return <Ionicons name={props.name} size={size} color={color} />;
}

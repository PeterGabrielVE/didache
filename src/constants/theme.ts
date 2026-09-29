// Argon Design System (Creative Tim, MIT) — ver assets/argon/LICENSE.md
export const COLORS = {
  DEFAULT: '#172B4D',
  PRIMARY: '#5E72E4',
  SECONDARY: '#F7FAFC',
  LABEL: '#FE2472',
  INFO: '#11CDEF',
  ERROR: '#F5365C',
  SUCCESS: '#2DCE89',
  WARNING: '#FB6340',
  MUTED: '#ADB5BD',
  INPUT: '#DCDCDC',
  INPUT_SUCCESS: '#7BDEB2',
  INPUT_ERROR: '#FCB3A4',
  PLACEHOLDER: '#9FA5AA',
  SWITCH_ON: '#5E72E4',
  SWITCH_OFF: '#D4D9DD',
  GRADIENT_START: '#6B24AA',
  GRADIENT_END: '#AC2688',
  BORDER: '#CAD1D7',
  BLOCK: '#E7E7E7',
  ICON: '#172B4D',
  HEADER: '#525F7F',
  // Textos: cuerpo y títulos (usados en las pantallas de Argon)
  TEXT: '#525F7F',
  HEADING: '#32325D',
  BACKGROUND: '#F4F5F7',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
} as const;

// Colores con nombre que aceptan Button, Badge, etc.
export type ColorName = 'default' | 'primary' | 'secondary' | 'info' | 'error' | 'success' | 'warning';

export function colorFor(name: ColorName) {
  return COLORS[name.toUpperCase() as Uppercase<ColorName>];
}

export const SIZES = {
  BASE: 16,
  RADIUS: 4,
  CARD_RADIUS: 6,
  INPUT_HEIGHT: 44,
  BUTTON_HEIGHT: 44,
} as const;

export const SHADOWS = {
  sm: { boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' },
  md: { boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.1)' },
  card: { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' },
} as const;

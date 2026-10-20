import type { ReactNode, Ref } from 'react';
import { StyleSheet, View } from 'react-native';

import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { Text } from './Text';

type Props = {
  // Para capturarla como imagen (react-native-view-shot)
  ref?: Ref<View>;
  tag: string;
  title: string;
  children: ReactNode;
};

// Hoja de un recurso (oración, dinámica, canción). Es lo que se exporta como imagen,
// por eso lleva fondo blanco propio y el pie con el nombre de la app.
export function ResourceSheet({ ref, tag, title, children }: Props) {
  return (
    // collapsable={false}: en Android la vista tiene que existir de verdad para capturarla
    <View ref={ref} collapsable={false} style={styles.sheet}>
      <Text variant="caption" bold color={COLORS.PRIMARY}>
        {tag.toUpperCase()}
      </Text>
      <Text variant="h3" style={styles.title}>
        {title}
      </Text>
      {children}
      <Text variant="caption" muted center style={styles.footer}>
        Didaché · recursos para catequistas
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: COLORS.WHITE,
    borderRadius: SIZES.CARD_RADIUS,
    padding: SIZES.BASE * 1.25,
    ...SHADOWS.card,
  },
  title: {
    marginTop: 4,
    marginBottom: SIZES.BASE,
  },
  footer: {
    marginTop: SIZES.BASE * 1.5,
  },
});

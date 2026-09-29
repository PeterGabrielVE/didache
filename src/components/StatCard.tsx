import { StyleSheet, View } from 'react-native';

import { COLORS, colorFor, type ColorName } from '../constants/theme';
import { Card } from './Card';
import { Icon, type IoniconName } from './Icon';
import { Text } from './Text';

type Props = {
  label: string;
  value: number | string;
  icon: IoniconName;
  color?: ColorName;
};

// Tarjeta de estadística estilo dashboard de Argon: ícono en círculo + etiqueta + número.
// Ícono arriba para que la etiqueta tenga todo el ancho en tarjetas angostas.
export function StatCard({ label, value, icon, color = 'primary' }: Props) {
  return (
    <Card style={styles.card}>
      <View style={[styles.iconCircle, { backgroundColor: colorFor(color) }]}>
        <Icon name={icon} size={18} color={COLORS.WHITE} />
      </View>
      <Text variant="caption" bold muted numberOfLines={1} style={styles.label}>
        {label.toUpperCase()}
      </Text>
      <Text variant="h3">{value}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  label: {
    marginTop: 12,
    marginBottom: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

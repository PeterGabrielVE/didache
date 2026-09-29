import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { COLORS, SIZES } from '../constants/theme';
import { Card } from './Card';
import { Icon, type IconProps } from './Icon';
import { Text } from './Text';

type Props = {
  icon: IconProps;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <Card style={styles.card}>
      <View style={styles.iconCircle}>
        <Icon size={28} color={COLORS.PRIMARY} {...icon} />
      </View>
      <Text variant="h4" center>
        {title}
      </Text>
      {description ? (
        <Text variant="small" muted center>
          {description}
        </Text>
      ) : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: SIZES.BASE * 2,
    paddingHorizontal: SIZES.BASE * 1.5,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${COLORS.PRIMARY}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  action: {
    marginTop: 8,
  },
});

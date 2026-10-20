import { StyleSheet, View } from 'react-native';

import { COLORS } from '../constants/theme';
import type { Activity } from '../types/models';
import { formatShortDate, formatTimeRange } from '../utils/date';
import { Badge } from './Badge';
import { Card } from './Card';
import { Icon } from './Icon';
import { Text } from './Text';

type Props = {
  activity: Activity;
  // En la agenda el día ya está a la vista: no hace falta repetir la fecha
  showDate?: boolean;
  onPress?: () => void;
};

export function ActivityCard({ activity, showDate = true, onPress }: Props) {
  const time = formatTimeRange(activity.startTime, activity.endTime);
  return (
    <Card style={styles.card} onPress={onPress}>
      {showDate || time ? (
        <View style={styles.header}>
          {showDate ? <Badge label={formatShortDate(activity.date)} color="primary" /> : null}
          {time ? (
            <View style={styles.meta}>
              <Icon name="time-outline" size={12} color={COLORS.MUTED} />
              <Text variant="caption" muted>
                {time}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
      <Text variant="body" bold color={COLORS.HEADING}>
        {activity.title}
      </Text>
      {activity.location ? (
        <View style={styles.meta}>
          <Icon name="location-outline" size={12} color={COLORS.MUTED} />
          <Text variant="small" muted>
            {activity.location}
          </Text>
        </View>
      ) : null}
      {activity.description ? (
        <Text variant="small" numberOfLines={2}>
          {activity.description}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});

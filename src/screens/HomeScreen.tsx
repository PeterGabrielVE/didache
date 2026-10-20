import { ScrollView, StyleSheet, View } from 'react-native';

import { ActivityCard, Card, Icon, StatCard, Text } from '../components';
import { COLORS, SIZES } from '../constants/theme';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { formatLongDate } from '../utils/date';

export function HomeScreen() {
  const { stats, activities } = useDashboardStats();
  const todayLabel = formatLongDate();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.greeting}>
        <Text variant="h3">¡Hola, catequista!</Text>
        <Text variant="small" muted style={styles.date}>
          {todayLabel}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Participantes" value={stats?.activeParticipants ?? '–'} icon="people" />
        <StatCard
          label="Actividades"
          value={stats?.activitiesInRange ?? '–'}
          icon="calendar"
          color="info"
        />
      </View>
      <StatCard
        label="Asistencias registradas este mes"
        value={stats?.attendanceMarks ?? '–'}
        icon="checkmark-done"
        color="success"
      />

      <Text variant="h4" style={styles.sectionTitle}>
        Actividades de este mes
      </Text>
      {activities.length === 0 ? (
        <Card style={styles.empty}>
          <Icon family="argon" name="calendar-date" size={28} color={COLORS.MUTED} />
          <Text variant="small" muted center>
            Todavía no hay actividades este mes.
          </Text>
        </Card>
      ) : (
        activities.map((activity) => <ActivityCard key={activity.id} activity={activity} />)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    padding: SIZES.BASE,
    gap: SIZES.BASE,
  },
  greeting: {
    marginBottom: 4,
  },
  date: {
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SIZES.BASE,
  },
  sectionTitle: {
    marginTop: SIZES.BASE / 2,
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: SIZES.BASE * 2,
  },
});

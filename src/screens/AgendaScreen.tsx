import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ActivityCard, Card, Icon, MonthCalendar, MonthNavigator, Text } from '../components';
import { COLORS, SIZES } from '../constants/theme';
import { useMonthActivities } from '../hooks/useMonthActivities';
import { addMonths, formatLongDate, today } from '../utils/date';

// Calendario mensual y actividades del día seleccionado
export function AgendaScreen() {
  const [selected, setSelected] = useState(today);
  const month = addMonths(selected, 0);
  const { byDate, loading } = useMonthActivities(month);

  const counts = useMemo(
    () => new Map([...byDate].map(([date, list]) => [date, list.length])),
    [byDate],
  );
  const dayActivities = byDate.get(selected) ?? [];
  const todayIso = today();

  // Al cambiar de mes se selecciona hoy si es el mes actual; si no, el día 1
  const changeMonth = (next: string) =>
    setSelected(next === addMonths(todayIso, 0) ? todayIso : next);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <MonthNavigator month={month} onChange={changeMonth} />
      <MonthCalendar month={month} selected={selected} onSelect={setSelected} counts={counts} />

      <View style={styles.dayHeader}>
        <Text variant="h4" style={styles.flex}>
          {formatLongDate(selected)}
        </Text>
        {selected !== todayIso ? (
          <Pressable onPress={() => setSelected(todayIso)} hitSlop={8} accessibilityRole="button">
            <Text variant="caption" bold color={COLORS.PRIMARY}>
              IR A HOY
            </Text>
          </Pressable>
        ) : null}
      </View>

      {loading ? null : dayActivities.length === 0 ? (
        <Card style={styles.empty}>
          <Icon family="argon" name="calendar-date" size={28} color={COLORS.MUTED} />
          <Text variant="small" muted center>
            No hay actividades este día.
          </Text>
        </Card>
      ) : (
        dayActivities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} showDate={false} />
        ))
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
    gap: 12,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  flex: {
    flex: 1,
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: SIZES.BASE * 1.5,
  },
});

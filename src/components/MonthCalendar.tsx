import { Pressable, StyleSheet, View } from 'react-native';

import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { calendarWeeks, formatLongDate, today } from '../utils/date';
import { Text } from './Text';

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

type Props = {
  month: string;
  selected: string;
  onSelect: (date: string) => void;
  // Cantidad de eventos por día ('YYYY-MM-DD'); los días con eventos llevan un punto
  counts?: ReadonlyMap<string, number>;
};

// Grilla mensual (lunes a domingo) con hoy, el día seleccionado y los días con eventos
export function MonthCalendar({ month, selected, onSelect, counts }: Props) {
  const todayIso = today();

  return (
    <View style={styles.container}>
      <View style={styles.week}>
        {WEEKDAYS.map((day, i) => (
          <Text key={i} variant="caption" bold muted center style={styles.cell}>
            {day}
          </Text>
        ))}
      </View>
      {calendarWeeks(month).map((week, i) => (
        <View key={i} style={styles.week}>
          {week.map((date, j) =>
            date ? (
              <Day
                key={date}
                date={date}
                count={counts?.get(date) ?? 0}
                isToday={date === todayIso}
                isSelected={date === selected}
                onPress={() => onSelect(date)}
              />
            ) : (
              <View key={`empty-${j}`} style={styles.cell} />
            ),
          )}
        </View>
      ))}
    </View>
  );
}

function Day({
  date,
  count,
  isToday,
  isSelected,
  onPress,
}: {
  date: string;
  count: number;
  isToday: boolean;
  isSelected: boolean;
  onPress: () => void;
}) {
  const label = `${formatLongDate(date)}${
    count > 0 ? `, ${count} ${count === 1 ? 'actividad' : 'actividades'}` : ''
  }`;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={styles.cell}
    >
      <View style={[styles.day, isToday && styles.today, isSelected && styles.selected]}>
        <Text
          variant="small"
          bold={isToday || isSelected}
          color={isSelected ? COLORS.WHITE : isToday ? COLORS.PRIMARY : COLORS.HEADING}
        >
          {Number(date.slice(8))}
        </Text>
      </View>
      <View style={[styles.dot, count > 0 && styles.dotVisible]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
    padding: 12,
    backgroundColor: COLORS.WHITE,
    borderRadius: SIZES.CARD_RADIUS,
    ...SHADOWS.card,
  },
  week: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
  },
  day: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  today: {
    borderWidth: 1.5,
    borderColor: COLORS.PRIMARY,
  },
  selected: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 2,
  },
  dotVisible: {
    backgroundColor: COLORS.INFO,
  },
});

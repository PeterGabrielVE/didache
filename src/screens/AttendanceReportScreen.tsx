import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import {
  Avatar,
  Badge,
  EmptyState,
  Icon,
  MonthNavigator,
  ProgressBar,
  SegmentedControl,
  StatCard,
  Text,
} from '../components';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import type { SessionSummary } from '../database/repositories/attendance';
import { useAttendanceReport, type ParticipantReportRow } from '../hooks/useAttendanceReport';
import { attendanceRate, formatCounts, formatRate, rateColor } from '../utils/attendance';
import { formatLongDate, today } from '../utils/date';
import { initials } from '../utils/text';

type ReportView = 'participants' | 'sessions';

const VIEWS = [
  { value: 'participants', label: 'Por participante' },
  { value: 'sessions', label: 'Por encuentro' },
] as const;

// Reporte mensual: totales del mes y detalle por participante o por encuentro
export function AttendanceReportScreen() {
  const navigation = useNavigation();
  const [month, setMonth] = useState(today);
  const [view, setView] = useState<ReportView>('participants');
  const report = useAttendanceReport(month);

  const header = (
    <View style={styles.header}>
      <MonthNavigator month={month} onChange={setMonth} maxMonth={today()} />
      <View style={styles.statsRow}>
        <StatCard label="Encuentros" value={report?.sessions.length ?? '–'} icon="calendar" color="info" />
        <StatCard
          label="Asistencia"
          value={report ? formatRate(report.rate) : '–'}
          icon="stats-chart"
          color="success"
        />
      </View>
      <SegmentedControl options={VIEWS} value={view} onChange={setView} />
    </View>
  );

  const empty = report ? (
    <EmptyState
      icon={{ name: 'stats-chart-outline' }}
      title="Sin asistencia este mes"
      description="Cuando tomes asistencia en algún encuentro de este mes, vas a ver el reporte acá."
    />
  ) : null;

  const contentProps = {
    contentContainerStyle: styles.content,
    ListHeaderComponent: header,
    ListEmptyComponent: empty,
  };

  // Sin encuentros en el mes no hay nada que mostrar en ninguna de las dos vistas
  const hasData = (report?.sessions.length ?? 0) > 0;

  return view === 'participants' ? (
    <FlatList
      style={styles.screen}
      data={hasData ? report?.participants : []}
      keyExtractor={(item) => String(item.participant.id)}
      renderItem={({ item }) => (
        <ParticipantRow
          row={item}
          onPress={() => navigation.navigate('ParticipantHistory', { participantId: item.participant.id })}
        />
      )}
      {...contentProps}
    />
  ) : (
    <FlatList
      style={styles.screen}
      data={report?.sessions ?? []}
      keyExtractor={(item) => item.date}
      renderItem={({ item }) => <SessionRow session={item} />}
      {...contentProps}
    />
  );
}

function ParticipantRow({ row, onPress }: { row: ParticipantReportRow; onPress: () => void }) {
  const { participant, present, absent, rate } = row;
  const name = `${participant.firstName} ${participant.lastName}`;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ver historial de ${name}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Avatar label={initials(participant.firstName, participant.lastName)} seed={participant.id} size={40} />
      <View style={styles.rowText}>
        <View style={styles.rowTitle}>
          <Text variant="body" bold color={COLORS.HEADING} numberOfLines={1} style={styles.flex}>
            {name}
          </Text>
          {!participant.active ? <Badge label="De baja" color="default" /> : null}
          <Text variant="small" bold color={rateColor(rate)}>
            {formatRate(rate)}
          </Text>
        </View>
        <ProgressBar value={rate ?? 0} color={rateColor(rate)} />
        <Text variant="caption" muted>
          {formatCounts(present, absent)}
        </Text>
      </View>
      <Icon name="chevron-forward" size={16} color={COLORS.MUTED} />
    </Pressable>
  );
}

function SessionRow({ session }: { session: SessionSummary }) {
  const rate = attendanceRate(session.present, session.absent);
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <View style={styles.rowTitle}>
          <Text variant="body" bold color={COLORS.HEADING} numberOfLines={1} style={styles.flex}>
            {formatLongDate(session.date)}
          </Text>
          <Text variant="small" bold color={rateColor(rate)}>
            {formatRate(rate)}
          </Text>
        </View>
        <ProgressBar value={rate ?? 0} color={rateColor(rate)} />
        <Text variant="caption" muted>
          {formatCounts(session.present, session.absent)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    padding: SIZES.BASE,
    gap: 8,
  },
  header: {
    gap: 12,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: COLORS.WHITE,
    borderRadius: SIZES.CARD_RADIUS,
    ...SHADOWS.card,
  },
  pressed: {
    opacity: 0.7,
  },
  rowText: {
    flex: 1,
    gap: 6,
  },
  rowTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flex: {
    flex: 1,
  },
});

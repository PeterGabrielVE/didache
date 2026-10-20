import { useNavigation, type StaticScreenProps } from '@react-navigation/native';
import { useLayoutEffect, useMemo } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';

import { Avatar, Badge, Card, EmptyState, HeaderButton, ProgressBar, Text } from '../components';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useParticipantHistory } from '../hooks/useParticipantHistory';
import type { AttendanceRecord, AttendanceStatus } from '../types/models';
import { attendanceRate, formatCounts, formatRate, rateColor } from '../utils/attendance';
import { formatLongDate, formatMonth } from '../utils/date';
import { initials } from '../utils/text';

type Props = StaticScreenProps<{ participantId: number }>;

const STATUS_BADGE: Record<AttendanceStatus, { label: string; color: 'success' | 'error' }> = {
  present: { label: 'Presente', color: 'success' },
  absent: { label: 'Ausente', color: 'error' },
};

type MonthSection = {
  title: string;
  present: number;
  absent: number;
  data: AttendanceRecord[];
};

// Los registros llegan ordenados por fecha descendente: basta cortar cuando cambia el mes
function groupByMonth(records: AttendanceRecord[]) {
  const sections: MonthSection[] = [];
  for (const record of records) {
    const key = record.date.slice(0, 7);
    let section = sections[sections.length - 1];
    if (!section || section.data[0].date.slice(0, 7) !== key) {
      section = { title: formatMonth(record.date), present: 0, absent: 0, data: [] };
      sections.push(section);
    }
    section.data.push(record);
    section[record.status]++;
  }
  return sections;
}

// Historial completo de asistencia de un participante
export function ParticipantHistoryScreen({ route }: Props) {
  const { participantId } = route.params;
  const navigation = useNavigation();
  const { participant, records, loading } = useParticipantHistory(participantId);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderButton
          icon="create-outline"
          label="Editar participante"
          onPress={() => navigation.navigate('ParticipantForm', { participantId })}
        />
      ),
    });
  }, [navigation, participantId]);

  const sections = useMemo(() => groupByMonth(records), [records]);
  const present = records.filter((r) => r.status === 'present').length;
  const absent = records.length - present;
  const rate = attendanceRate(present, absent);

  if (loading) return <View style={styles.screen} />;

  if (!participant) {
    return (
      <View style={[styles.screen, styles.content]}>
        <EmptyState icon={{ name: 'alert-circle-outline' }} title="Participante no encontrado" />
      </View>
    );
  }

  return (
    <SectionList
      style={styles.screen}
      contentContainerStyle={styles.content}
      sections={sections}
      keyExtractor={(item) => String(item.id)}
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={
        <Card style={styles.summary}>
          <Avatar
            label={initials(participant.firstName, participant.lastName)}
            seed={participant.id}
            size={56}
          />
          <Text variant="h4" center>
            {participant.firstName} {participant.lastName}
          </Text>
          {!participant.active ? <Badge label="De baja" color="default" /> : null}
          <Text variant="h2" color={rateColor(rate)}>
            {formatRate(rate)}
          </Text>
          <View style={styles.summaryBar}>
            <ProgressBar value={rate ?? 0} color={rateColor(rate)} />
          </View>
          <Text variant="small" muted>
            {formatCounts(present, absent)}
          </Text>
        </Card>
      }
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text variant="small" bold color={COLORS.HEADING}>
            {section.title}
          </Text>
          <Text variant="caption" muted>
            Asistió a {section.present} de {section.present + section.absent}
          </Text>
        </View>
      )}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text variant="small" color={COLORS.HEADING} style={styles.rowDate}>
            {formatLongDate(item.date)}
          </Text>
          <Badge {...STATUS_BADGE[item.status]} />
        </View>
      )}
      ListEmptyComponent={
        <EmptyState
          icon={{ name: 'calendar-outline' }}
          title="Sin registros"
          description="Todavía no se tomó asistencia a este participante."
        />
      }
    />
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
  summary: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  summaryBar: {
    alignSelf: 'stretch',
    marginVertical: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 4,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: COLORS.WHITE,
    borderRadius: SIZES.CARD_RADIUS,
    ...SHADOWS.card,
  },
  rowDate: {
    flex: 1,
  },
});

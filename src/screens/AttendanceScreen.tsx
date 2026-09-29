import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import {
  AttendanceToggle,
  Avatar,
  Button,
  DateNavigator,
  EmptyState,
  FloatingButton,
  Icon,
  Input,
  Text,
} from '../components';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useAttendance } from '../hooks/useAttendance';
import { useParticipants } from '../hooks/useParticipants';
import type { AttendanceStatus, Participant } from '../types/models';
import { today } from '../utils/date';
import { initials, normalizeText } from '../utils/text';

const STATUS_LABEL: Record<AttendanceStatus, { text: string; color: string }> = {
  present: { text: 'Presente', color: COLORS.SUCCESS },
  absent: { text: 'Ausente', color: COLORS.ERROR },
};

export function AttendanceScreen() {
  const navigation = useNavigation();
  const { participants, loading } = useParticipants();
  const [date, setDate] = useState(today);
  const { marks, mark, markAllPresent, error } = useAttendance(date);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = normalizeText(query);
    if (!q) return participants;
    return participants.filter((p) => normalizeText(`${p.firstName} ${p.lastName}`).includes(q));
  }, [participants, query]);

  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;
    for (const p of participants) {
      const status = marks.get(p.id);
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
    }
    return { present, absent, unmarked: participants.length - present - absent };
  }, [participants, marks]);

  const openForm = (participantId?: number) =>
    navigation.navigate('ParticipantForm', participantId ? { participantId } : undefined);

  const markRemainingPresent = () =>
    markAllPresent(participants.filter((p) => !marks.has(p.id)).map((p) => p.id));

  const hasParticipants = participants.length > 0;

  return (
    <View style={styles.screen}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ParticipantRow
            participant={item}
            status={marks.get(item.id) ?? null}
            onMark={(status) => mark(item.id, status)}
            onOpen={() => openForm(item.id)}
          />
        )}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          hasParticipants ? (
            <View style={styles.header}>
              <DateNavigator date={date} onChange={setDate} />

              <View style={styles.summary}>
                <SummaryItem
                  color={COLORS.SUCCESS}
                  value={summary.present}
                  label={summary.present === 1 ? 'presente' : 'presentes'}
                />
                <SummaryItem
                  color={COLORS.ERROR}
                  value={summary.absent}
                  label={summary.absent === 1 ? 'ausente' : 'ausentes'}
                />
                <SummaryItem color={COLORS.MUTED} value={summary.unmarked} label="sin marcar" />
              </View>
              {summary.unmarked > 0 ? (
                <Button
                  small
                  color="success"
                  shadowless
                  style={styles.markAll}
                  icon={<Icon name="checkmark-done" size={14} color={COLORS.WHITE} />}
                  onPress={markRemainingPresent}
                >
                  {summary.unmarked === participants.length
                    ? 'Todos presentes'
                    : 'Resto presentes'}
                </Button>
              ) : null}

              {error ? (
                <Text variant="small" color={COLORS.ERROR} center>
                  {error}
                </Text>
              ) : null}

              <Input
                placeholder="Buscar participante"
                value={query}
                onChangeText={setQuery}
                autoCorrect={false}
                icon={<Icon name="search" size={16} color={COLORS.MUTED} />}
              />
            </View>
          ) : null
        }
        ListEmptyComponent={
          loading ? null : hasParticipants ? (
            <EmptyState
              icon={{ name: 'search' }}
              title="Sin resultados"
              description={`Nadie coincide con "${query}".`}
            />
          ) : (
            <EmptyState
              icon={{ name: 'people-outline' }}
              title="Todavía no hay participantes"
              description="Agregá a los chicos de tu grupo para empezar a tomar asistencia."
              action={<Button onPress={() => openForm()}>Agregar participante</Button>}
            />
          )
        }
      />
      {hasParticipants ? (
        <FloatingButton accessibilityLabel="Agregar participante" onPress={() => openForm()} />
      ) : null}
    </View>
  );
}

function SummaryItem({ color, value, label }: { color: string; value: number; label: string }) {
  return (
    <View style={styles.summaryItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text variant="small">
        <Text variant="small" bold color={COLORS.HEADING}>
          {value}
        </Text>{' '}
        {label}
      </Text>
    </View>
  );
}

function ParticipantRow({
  participant,
  status,
  onMark,
  onOpen,
}: {
  participant: Participant;
  status: AttendanceStatus | null;
  onMark: (status: AttendanceStatus | null) => void;
  onOpen: () => void;
}) {
  const name = `${participant.firstName} ${participant.lastName}`;
  return (
    <View style={styles.row}>
      {/* Tocar nombre o avatar abre la edición; los botones marcan asistencia */}
      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`Editar a ${name}`}
        style={({ pressed }) => [styles.rowMain, pressed && styles.pressed]}
      >
        <Avatar label={initials(participant.firstName, participant.lastName)} seed={participant.id} />
        <View style={styles.rowText}>
          <Text variant="body" bold color={COLORS.HEADING} numberOfLines={1}>
            {name}
          </Text>
          <Text
            variant="small"
            bold={!!status}
            color={status ? STATUS_LABEL[status].color : COLORS.MUTED}
            numberOfLines={1}
          >
            {status ? STATUS_LABEL[status].text : 'Sin marcar'}
          </Text>
        </View>
      </Pressable>
      <AttendanceToggle status={status} onChange={onMark} name={name} />
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
    // Espacio para que el botón flotante no tape el último participante
    paddingBottom: 96,
    gap: 8,
  },
  header: {
    gap: 12,
    marginBottom: 4,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 4,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  markAll: {
    alignSelf: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 10,
    backgroundColor: COLORS.WHITE,
    borderRadius: SIZES.CARD_RADIUS,
    ...SHADOWS.card,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
});

import { useNavigation } from '@react-navigation/native';
import { memo, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { Avatar, Button, EmptyState, FloatingButton, Icon, Input, Text } from '../components';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useParticipants } from '../hooks/useParticipants';
import type { Participant } from '../types/models';
import { initials, normalizeText } from '../utils/text';

export function ParticipantsScreen() {
  const navigation = useNavigation();
  const { participants, loading } = useParticipants();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = normalizeText(query);
    if (!q) return participants;
    return participants.filter((p) => normalizeText(`${p.firstName} ${p.lastName}`).includes(q));
  }, [participants, query]);

  const openForm = (participantId?: number) =>
    navigation.navigate('ParticipantForm', participantId ? { participantId } : undefined);

  const hasParticipants = participants.length > 0;

  return (
    <View style={styles.screen}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ParticipantRow participant={item} onPress={openForm} />}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          hasParticipants ? (
            <View style={styles.header}>
              <Input
                placeholder="Buscar participante"
                value={query}
                onChangeText={setQuery}
                autoCorrect={false}
                icon={<Icon name="search" size={16} color={COLORS.MUTED} />}
              />
              <Text variant="caption" bold muted style={styles.count}>
                {query
                  ? `${filtered.length} DE ${participants.length} PARTICIPANTES`
                  : `${participants.length} ${participants.length === 1 ? 'PARTICIPANTE' : 'PARTICIPANTES'}`}
              </Text>
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

const ParticipantRow = memo(function ParticipantRow({
  participant,
  onPress,
}: {
  participant: Participant;
  onPress: (id: number) => void;
}) {
  return (
    <Pressable
      onPress={() => onPress(participant.id)}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Avatar label={initials(participant.firstName, participant.lastName)} seed={participant.id} />
      <View style={styles.rowText}>
        <Text variant="body" bold color={COLORS.HEADING} numberOfLines={1}>
          {participant.firstName} {participant.lastName}
        </Text>
        <Text variant="small" muted numberOfLines={1}>
          {participant.phone || 'Sin teléfono'}
        </Text>
      </View>
      <Icon name="chevron-forward" size={18} color={COLORS.MUTED} />
    </Pressable>
  );
});

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
    marginBottom: 4,
  },
  count: {
    marginTop: SIZES.BASE,
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
  rowPressed: {
    opacity: 0.85,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
});

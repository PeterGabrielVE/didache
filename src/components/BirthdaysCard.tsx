import { StyleSheet, View } from 'react-native';

import { COLORS } from '../constants/theme';
import type { Participant } from '../types/models';
import { ageTurning, today } from '../utils/date';
import { initials } from '../utils/text';
import { Avatar } from './Avatar';
import { Card } from './Card';
import { Icon } from './Icon';
import { Text } from './Text';

type Props = {
  // Ya filtrados por el mes actual y ordenados por día
  participants: Participant[];
};

// Widget del Home: quién cumple años este mes, destacando a quien cumple hoy
export function BirthdaysCard({ participants }: Props) {
  const todayIso = today();
  const monthName = new Date().toLocaleDateString('es', { month: 'long' });

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Icon name="gift" size={18} color={COLORS.WHITE} />
        </View>
        <Text variant="body" bold color={COLORS.HEADING}>
          Cumpleaños de {monthName}
        </Text>
      </View>

      {participants.length === 0 ? (
        <Text variant="small" muted>
          Nadie cumple años este mes. Podés cargar la fecha de nacimiento al editar cada
          participante.
        </Text>
      ) : (
        participants.map((p) => {
          const birthDate = p.birthDate!;
          const thisYear = `${todayIso.slice(0, 4)}${birthDate.slice(4)}`;
          const isToday = thisYear === todayIso;
          const passed = thisYear < todayIso;
          const age = ageTurning(birthDate);
          return (
            <View key={p.id} style={[styles.row, isToday && styles.todayRow]}>
              <Avatar label={initials(p.firstName, p.lastName)} seed={p.id} size={36} />
              <View style={styles.rowText}>
                <Text
                  variant="small"
                  bold
                  color={passed ? COLORS.MUTED : COLORS.HEADING}
                  numberOfLines={1}
                >
                  {p.firstName} {p.lastName}
                </Text>
                <Text
                  variant="caption"
                  bold={isToday}
                  color={isToday ? COLORS.LABEL : COLORS.MUTED}
                >
                  {isToday
                    ? `¡Hoy cumple ${age}! 🎉`
                    : `${passed ? 'Cumplió' : 'Cumple'} ${age} ${age === 1 ? 'año' : 'años'}`}
                </Text>
              </View>
              <View style={[styles.day, isToday && styles.todayDay]}>
                <Text variant="small" bold color={isToday ? COLORS.WHITE : COLORS.HEADING}>
                  {Number(birthDate.slice(8))}
                </Text>
              </View>
            </View>
          );
        })
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.LABEL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 6,
    borderRadius: 8,
  },
  todayRow: {
    backgroundColor: `${COLORS.LABEL}14`,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  day: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.SECONDARY,
    borderWidth: 1,
    borderColor: COLORS.BLOCK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayDay: {
    backgroundColor: COLORS.LABEL,
    borderColor: COLORS.LABEL,
  },
});

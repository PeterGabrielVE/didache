import { useNavigation, type StaticScreenProps } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { Button, Card, Input, Text } from '../components';
import { COLORS, SIZES } from '../constants/theme';
import { participantsRepo, useDatabase } from '../database';

type Props = StaticScreenProps<{ participantId?: number } | undefined>;

type Errors = Partial<Record<'firstName' | 'lastName', string>>;

// Alta y edición de participante (sin participantId = alta)
export function ParticipantFormScreen({ route }: Props) {
  const participantId = route.params?.participantId;
  const db = useDatabase();
  const navigation = useNavigation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!participantId) return;
    participantsRepo.getParticipantById(db, participantId).then((p) => {
      if (!p) return;
      setFirstName(p.firstName);
      setLastName(p.lastName);
      setPhone(p.phone ?? '');
      setNotes(p.notes ?? '');
    });
  }, [db, participantId]);

  const validate = () => {
    const next: Errors = {};
    if (!firstName.trim()) next.firstName = 'Ingresá el nombre';
    if (!lastName.trim()) next.lastName = 'Ingresá el apellido';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    setSaveError(null);
    const data = {
      firstName,
      lastName,
      phone: phone.trim() || null,
      notes: notes.trim() || null,
    };
    try {
      if (participantId) {
        await participantsRepo.updateParticipant(db, participantId, data);
      } else {
        await participantsRepo.createParticipant(db, data);
      }
      navigation.goBack();
    } catch (e) {
      setSaveError('No se pudo guardar. Intentá de nuevo.');
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card style={styles.card}>
          <Input
            label="Nombre *"
            placeholder="Ej.: María"
            value={firstName}
            onChangeText={setFirstName}
            error={!!errors.firstName}
            helper={errors.firstName}
            autoCapitalize="words"
            autoFocus={!participantId}
            shadowless
          />
          <Input
            label="Apellido *"
            placeholder="Ej.: González"
            value={lastName}
            onChangeText={setLastName}
            error={!!errors.lastName}
            helper={errors.lastName}
            autoCapitalize="words"
            shadowless
          />
          <Input
            label="Teléfono"
            placeholder="Del participante o de su familia"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            shadowless
          />
          <Input
            label="Notas"
            placeholder="Alergias, sacramentos, observaciones…"
            value={notes}
            onChangeText={setNotes}
            multiline
            shadowless
          />
        </Card>

        {saveError ? (
          <Text variant="small" color={COLORS.ERROR} center>
            {saveError}
          </Text>
        ) : null}

        <Button onPress={save} disabled={saving}>
          {participantId ? 'Guardar cambios' : 'Agregar participante'}
        </Button>
        <Button transparent color="default" onPress={() => navigation.goBack()}>
          Cancelar
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
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
  card: {
    gap: SIZES.BASE,
  },
});

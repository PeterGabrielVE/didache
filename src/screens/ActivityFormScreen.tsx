import { useNavigation, type StaticScreenProps } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Button, Card, DateField, Icon, Input, OptionChips, Text } from '../components';
import { COLORS, SIZES } from '../constants/theme';
import { activitiesRepo, useDatabase } from '../database';
import {
  REMINDER_OPTIONS,
  cancelActivityReminder,
  syncActivityReminder,
  type ReminderResult,
} from '../services/reminders';
import { confirm, notify } from '../utils/dialogs';
import { isValidTime, maskTime, today } from '../utils/date';

// Sin activityId = alta; `date` propone el día (p. ej. el seleccionado en la agenda)
type Props = StaticScreenProps<{ activityId?: number; date?: string } | undefined>;

type Errors = Partial<Record<'title' | 'startTime' | 'endTime', string>>;

export function ActivityFormScreen({ route }: Props) {
  const activityId = route.params?.activityId;
  const db = useDatabase();
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(route.params?.date ?? today());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!activityId) return;
    activitiesRepo.getActivityById(db, activityId).then((a) => {
      if (!a) return;
      setTitle(a.title);
      setDate(a.date);
      setStartTime(a.startTime ?? '');
      setEndTime(a.endTime ?? '');
      setLocation(a.location ?? '');
      setDescription(a.description ?? '');
      setReminderMinutes(a.reminderMinutes);
    });
  }, [db, activityId]);

  const validate = () => {
    const next: Errors = {};
    if (!title.trim()) next.title = 'Ingresá un título';
    if (startTime && !isValidTime(startTime)) next.startTime = 'Formato HH:mm, p. ej. 10:30';
    if (endTime) {
      if (!isValidTime(endTime)) next.endTime = 'Formato HH:mm, p. ej. 12:00';
      else if (!startTime) next.endTime = 'Indicá también la hora de inicio';
      // Mismo formato de dos dígitos: la comparación de texto es cronológica
      else if (endTime <= startTime) next.endTime = 'Tiene que ser después del inicio';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    setSaveError(null);
    const data = {
      title,
      date,
      startTime: startTime || null,
      endTime: endTime || null,
      location: location.trim() || null,
      description: description.trim() || null,
      reminderMinutes,
    };
    let id: number;
    try {
      if (activityId) {
        await activitiesRepo.updateActivity(db, activityId, data);
        id = activityId;
      } else {
        id = await activitiesRepo.createActivity(db, data);
      }
    } catch {
      setSaveError('No se pudo guardar. Intentá de nuevo.');
      setSaving(false);
      return;
    }
    // La actividad ya está guardada: un problema con el aviso no debe impedir cerrar el formulario
    let reminder: ReminderResult;
    try {
      reminder = await syncActivityReminder(db, id);
    } catch {
      reminder = 'none';
    }
    navigation.goBack();
    if (reminder === 'denied') {
      notify(
        'Actividad guardada sin aviso',
        'Para recibir recordatorios, permití las notificaciones de la app en los ajustes del teléfono.',
      );
    } else if (reminder === 'past') {
      notify('Actividad guardada sin aviso', 'El momento del recordatorio ya pasó.');
    }
  };

  const remove = async () => {
    if (!activityId) return;
    const ok = await confirm({
      title: '¿Eliminar actividad?',
      message: `"${title.trim() || 'Sin título'}" se va a borrar de la agenda.`,
      confirmLabel: 'Eliminar',
      destructive: true,
    });
    if (!ok) return;
    setSaving(true);
    try {
      await cancelActivityReminder(db, activityId).catch(() => {});
      await activitiesRepo.deleteActivity(db, activityId);
      navigation.goBack();
    } catch {
      setSaveError('No se pudo eliminar. Intentá de nuevo.');
      setSaving(false);
    }
  };

  const reminderHelp =
    Platform.OS === 'web'
      ? 'Los recordatorios llegan solo en la app del teléfono.'
      : reminderMinutes !== null && !startTime
        ? 'Sin hora de inicio, el aviso se calcula desde las 9:00.'
        : null;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card style={styles.card}>
          <Input
            label="Título *"
            placeholder="Ej.: Encuentro de catequesis"
            value={title}
            onChangeText={setTitle}
            error={!!errors.title}
            helper={errors.title}
            autoFocus={!activityId}
            shadowless
          />
          <DateField label="Fecha *" value={date} onChange={setDate} />
          <View style={styles.timeRow}>
            <Input
              label="Inicio"
              placeholder="HH:mm"
              value={startTime}
              onChangeText={(text) => setStartTime(maskTime(text))}
              error={!!errors.startTime}
              helper={errors.startTime}
              keyboardType="number-pad"
              maxLength={5}
              icon={<Icon name="time-outline" size={16} color={COLORS.MUTED} />}
              containerStyle={styles.flex}
              shadowless
            />
            <Input
              label="Fin"
              placeholder="HH:mm"
              value={endTime}
              onChangeText={(text) => setEndTime(maskTime(text))}
              error={!!errors.endTime}
              helper={errors.endTime}
              keyboardType="number-pad"
              maxLength={5}
              icon={<Icon name="time-outline" size={16} color={COLORS.MUTED} />}
              containerStyle={styles.flex}
              shadowless
            />
          </View>
          <Input
            label="Lugar"
            placeholder="Ej.: Salón parroquial"
            value={location}
            onChangeText={setLocation}
            icon={<Icon name="location-outline" size={16} color={COLORS.MUTED} />}
            shadowless
          />
          <Input
            label="Descripción"
            placeholder="Tema, materiales, qué traer…"
            value={description}
            onChangeText={setDescription}
            multiline
            shadowless
          />
          <View style={styles.field}>
            <Text variant="small" bold>
              Recordatorio
            </Text>
            <OptionChips<number | null>
              options={REMINDER_OPTIONS}
              value={reminderMinutes}
              onChange={setReminderMinutes}
            />
            {reminderHelp ? (
              <Text variant="caption" muted>
                {reminderHelp}
              </Text>
            ) : null}
          </View>
        </Card>

        {saveError ? (
          <Text variant="small" color={COLORS.ERROR} center>
            {saveError}
          </Text>
        ) : null}

        <Button onPress={save} disabled={saving}>
          {activityId ? 'Guardar cambios' : 'Agregar actividad'}
        </Button>
        <Button transparent color="default" onPress={() => navigation.goBack()}>
          Cancelar
        </Button>
        {activityId ? (
          <Button
            transparent
            color="error"
            disabled={saving}
            icon={<Icon name="trash-outline" size={14} color={COLORS.ERROR} />}
            onPress={remove}
          >
            Eliminar actividad
          </Button>
        ) : null}
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
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  field: {
    gap: 8,
  },
});

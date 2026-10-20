import { StackActions, useNavigation, type StaticScreenProps } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Card, FormActions, Input, OptionChips, Text } from '../../components';
import { COLORS, SIZES } from '../../constants/theme';
import { PRAYER_CATEGORIES } from '../../data/prayers';
import { prayersRepo, useDatabase } from '../../database';
import type { PrayerCategory } from '../../types/resources';
import { confirmDelete } from '../../utils/dialogs';

type Props = StaticScreenProps<{ prayerId?: number } | undefined>;

type Errors = Partial<Record<'title' | 'text', string>>;

const CATEGORY_OPTIONS = Object.entries(PRAYER_CATEGORIES).map(([value, label]) => ({
  value: value as PrayerCategory,
  label,
}));

export function PrayerFormScreen({ route }: Props) {
  const prayerId = route.params?.prayerId;
  const db = useDatabase();
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PrayerCategory>('basicas');
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!prayerId) return;
    prayersRepo.getPrayerById(db, prayerId).then((p) => {
      if (!p) return;
      setTitle(p.title);
      setCategory(p.category);
      setText(p.text);
    });
  }, [db, prayerId]);

  const save = async () => {
    const next: Errors = {};
    if (!title.trim()) next.title = 'Ingresá un título';
    if (!text.trim()) next.text = 'Escribí el texto de la oración';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    setSaveError(null);
    try {
      const data = { title, category, text };
      if (prayerId) await prayersRepo.updatePrayer(db, prayerId, data);
      else await prayersRepo.createPrayer(db, data);
      navigation.goBack();
    } catch {
      setSaveError('No se pudo guardar. Intentá de nuevo.');
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!prayerId || !(await confirmDelete('la oración', title))) return;
    setSaving(true);
    try {
      await prayersRepo.deletePrayer(db, prayerId);
      // Vuelve a la lista: el detalle de la oración borrada ya no existe
      navigation.dispatch(StackActions.popTo('Tabs'));
    } catch {
      setSaveError('No se pudo eliminar. Intentá de nuevo.');
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
            label="Título *"
            placeholder="Ej.: Salve"
            value={title}
            onChangeText={setTitle}
            error={!!errors.title}
            helper={errors.title}
            autoFocus={!prayerId}
            shadowless
          />
          <View style={styles.field}>
            <Text variant="small" bold>
              Categoría
            </Text>
            <OptionChips options={CATEGORY_OPTIONS} value={category} onChange={setCategory} />
          </View>
          <Input
            label="Texto *"
            placeholder="Escribí la oración. Dejá una línea en blanco entre párrafos."
            value={text}
            onChangeText={setText}
            error={!!errors.text}
            helper={errors.text}
            multiline
            style={styles.longText}
            shadowless
          />
        </Card>
        <FormActions
          saveLabel={prayerId ? 'Guardar cambios' : 'Agregar oración'}
          saving={saving}
          error={saveError}
          onSave={save}
          onCancel={() => navigation.goBack()}
          deleteLabel="Eliminar oración"
          onDelete={prayerId ? remove : undefined}
        />
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
  field: {
    gap: 8,
  },
  longText: {
    minHeight: 200,
  },
});

import { StackActions, useNavigation, type StaticScreenProps } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Card, FormActions, Input, OptionChips, Text } from '../../components';
import { COLORS, SIZES } from '../../constants/theme';
import { DYNAMIC_CATEGORIES } from '../../data/dynamics';
import { dynamicsRepo, useDatabase } from '../../database';
import type { DynamicCategory } from '../../types/resources';
import { confirmDelete } from '../../utils/dialogs';

type Props = StaticScreenProps<{ dynamicId?: number } | undefined>;

type Errors = Partial<Record<'title' | 'summary' | 'steps', string>>;

const CATEGORY_OPTIONS = Object.entries(DYNAMIC_CATEGORIES).map(([value, label]) => ({
  value: value as DynamicCategory,
  label,
}));

// Materiales y pasos se editan como texto, un elemento por línea
const toLines = (items: string[]) => items.join('\n');
const fromLines = (text: string) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

export function DynamicFormScreen({ route }: Props) {
  const dynamicId = route.params?.dynamicId;
  const db = useDatabase();
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DynamicCategory>('rompehielos');
  const [summary, setSummary] = useState('');
  const [objective, setObjective] = useState('');
  const [duration, setDuration] = useState('');
  const [groupSize, setGroupSize] = useState('');
  const [materials, setMaterials] = useState('');
  const [steps, setSteps] = useState('');
  const [reflection, setReflection] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!dynamicId) return;
    dynamicsRepo.getDynamicById(db, dynamicId).then((d) => {
      if (!d) return;
      setTitle(d.title);
      setCategory(d.category);
      setSummary(d.summary);
      setObjective(d.objective);
      setDuration(d.duration);
      setGroupSize(d.groupSize);
      setMaterials(toLines(d.materials));
      setSteps(toLines(d.steps));
      setReflection(d.reflection);
    });
  }, [db, dynamicId]);

  const save = async () => {
    const next: Errors = {};
    if (!title.trim()) next.title = 'Ingresá un título';
    if (!summary.trim()) next.summary = 'Contá en una frase de qué se trata';
    if (fromLines(steps).length === 0) next.steps = 'Escribí al menos un paso';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    setSaveError(null);
    const data = {
      title,
      category,
      summary,
      objective,
      duration,
      groupSize,
      materials: fromLines(materials),
      steps: fromLines(steps),
      reflection,
    };
    try {
      if (dynamicId) await dynamicsRepo.updateDynamic(db, dynamicId, data);
      else await dynamicsRepo.createDynamic(db, data);
      navigation.goBack();
    } catch {
      setSaveError('No se pudo guardar. Intentá de nuevo.');
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!dynamicId || !(await confirmDelete('la dinámica', title))) return;
    setSaving(true);
    try {
      await dynamicsRepo.deleteDynamic(db, dynamicId);
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
            placeholder="Ej.: La telaraña"
            value={title}
            onChangeText={setTitle}
            error={!!errors.title}
            helper={errors.title}
            autoFocus={!dynamicId}
            shadowless
          />
          <View style={styles.field}>
            <Text variant="small" bold>
              Categoría
            </Text>
            <OptionChips options={CATEGORY_OPTIONS} value={category} onChange={setCategory} />
          </View>
          <Input
            label="Resumen *"
            placeholder="De qué se trata, en una frase"
            value={summary}
            onChangeText={setSummary}
            error={!!errors.summary}
            helper={errors.summary}
            shadowless
          />
          <Input
            label="Objetivo"
            placeholder="Qué se busca lograr con el grupo"
            value={objective}
            onChangeText={setObjective}
            multiline
            shadowless
          />
          <View style={styles.row}>
            <Input
              label="Duración"
              placeholder="Ej.: 15 min"
              value={duration}
              onChangeText={setDuration}
              containerStyle={styles.flex}
              shadowless
            />
            <Input
              label="Participantes"
              placeholder="Ej.: 8 a 20"
              value={groupSize}
              onChangeText={setGroupSize}
              containerStyle={styles.flex}
              shadowless
            />
          </View>
          <Input
            label="Materiales"
            placeholder="Uno por línea"
            value={materials}
            onChangeText={setMaterials}
            multiline
            shadowless
          />
          <Input
            label="Pasos *"
            placeholder="Un paso por línea, en orden"
            value={steps}
            onChangeText={setSteps}
            error={!!errors.steps}
            helper={errors.steps ?? 'Cada línea es un paso numerado'}
            multiline
            style={styles.longText}
            shadowless
          />
          <Input
            label="Para reflexionar"
            placeholder="Preguntas o una cita bíblica para cerrar"
            value={reflection}
            onChangeText={setReflection}
            multiline
            shadowless
          />
        </Card>
        <FormActions
          saveLabel={dynamicId ? 'Guardar cambios' : 'Agregar dinámica'}
          saving={saving}
          error={saveError}
          onSave={save}
          onCancel={() => navigation.goBack()}
          deleteLabel="Eliminar dinámica"
          onDelete={dynamicId ? remove : undefined}
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  longText: {
    minHeight: 140,
  },
});

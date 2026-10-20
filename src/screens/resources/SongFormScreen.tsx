import { StackActions, useNavigation, type StaticScreenProps } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Card, FormActions, Input, SongLyrics, Text } from '../../components';
import { COLORS, SIZES } from '../../constants/theme';
import { songsRepo, useDatabase } from '../../database';
import { hasChords } from '../../utils/chords';
import { confirmDelete } from '../../utils/dialogs';

type Props = StaticScreenProps<{ songId?: number } | undefined>;

type Errors = Partial<Record<'title' | 'lyrics', string>>;

export function SongFormScreen({ route }: Props) {
  const songId = route.params?.songId;
  const db = useDatabase();
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [songKey, setSongKey] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!songId) return;
    songsRepo.getSongById(db, songId).then((s) => {
      if (!s) return;
      setTitle(s.title);
      setAuthor(s.author ?? '');
      setSongKey(s.songKey ?? '');
      setLyrics(s.lyrics);
    });
  }, [db, songId]);

  const save = async () => {
    const next: Errors = {};
    if (!title.trim()) next.title = 'Ingresá el título';
    if (!lyrics.trim()) next.lyrics = 'Escribí la letra';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    setSaveError(null);
    const data = {
      title,
      author: author.trim() || null,
      songKey: songKey.trim() || null,
      // Sin espacios ni líneas vacías sobrantes al final, pero respetando los del medio
      lyrics: lyrics.replace(/\s+$/, ''),
    };
    try {
      if (songId) await songsRepo.updateSong(db, songId, data);
      else await songsRepo.createSong(db, data);
      navigation.goBack();
    } catch {
      setSaveError('No se pudo guardar. Intentá de nuevo.');
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!songId || !(await confirmDelete('la canción', title))) return;
    setSaving(true);
    try {
      await songsRepo.deleteSong(db, songId);
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
            value={title}
            onChangeText={setTitle}
            error={!!errors.title}
            helper={errors.title}
            autoFocus={!songId}
            shadowless
          />
          <View style={styles.row}>
            <Input
              label="Autor"
              value={author}
              onChangeText={setAuthor}
              containerStyle={styles.flex}
              shadowless
            />
            <Input
              label="Tono"
              placeholder="Ej.: G"
              value={songKey}
              onChangeText={setSongKey}
              autoCapitalize="none"
              autoCorrect={false}
              containerStyle={styles.keyField}
              shadowless
            />
          </View>
          <Input
            label="Letra *"
            placeholder={'[G]Primera línea con [D]acordes\nSegunda línea'}
            value={lyrics}
            onChangeText={setLyrics}
            error={!!errors.lyrics}
            helper={errors.lyrics}
            multiline
            autoCapitalize="sentences"
            autoCorrect={false}
            style={styles.lyrics}
            shadowless
          />
          <View style={styles.help}>
            <Text variant="caption" bold color={COLORS.HEADING}>
              Cómo escribir los acordes
            </Text>
            <Text variant="caption">
              Ponelos entre corchetes justo antes de la sílaba donde cambian: [G]Can-[D]to. Dejá una
              línea en blanco entre estrofas.
            </Text>
          </View>
        </Card>

        {hasChords(lyrics) ? (
          <Card style={styles.card}>
            <Text variant="small" bold>
              Vista previa
            </Text>
            <SongLyrics lyrics={lyrics} />
          </Card>
        ) : null}

        <FormActions
          saveLabel={songId ? 'Guardar cambios' : 'Agregar canción'}
          saving={saving}
          error={saveError}
          onSave={save}
          onCancel={() => navigation.goBack()}
          deleteLabel="Eliminar canción"
          onDelete={songId ? remove : undefined}
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  keyField: {
    width: 90,
  },
  lyrics: {
    minHeight: 240,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
  help: {
    gap: 2,
    padding: 10,
    borderRadius: SIZES.RADIUS,
    backgroundColor: COLORS.SECONDARY,
  },
});

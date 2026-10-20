import { useNavigation, type StaticScreenProps } from '@react-navigation/native';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  ArrowButton,
  Card,
  EmptyState,
  ResourceSheet,
  SongLyrics,
  Switch,
  Text,
} from '../../components';
import { COLORS, SIZES } from '../../constants/theme';
import { songsRepo } from '../../database';
import { useDetailHeader } from '../../hooks/useDetailHeader';
import { useFocusQuery } from '../../hooks/useFocusQuery';
import { useResourceExport } from '../../hooks/useResourceExport';
import { songHtml } from '../../services/exportTemplates';
import { hasChords, transposeChord } from '../../utils/chords';

type Props = StaticScreenProps<{ songId: number }>;

export function SongScreen({ route }: Props) {
  const { songId } = route.params;
  const navigation = useNavigation();
  const { data: song, loading } = useFocusQuery(
    (db) => songsRepo.getSongById(db, songId),
    [songId],
  );
  const [semitones, setSemitones] = useState(0);
  const [showChords, setShowChords] = useState(true);
  const { captureRef, openExport, exportSheet } = useResourceExport(song?.title ?? 'Canción', () =>
    songHtml(song!, semitones, showChords),
  );
  useDetailHeader(!!song, openExport, () => navigation.navigate('SongForm', { songId }));

  if (loading) return <View style={styles.screen} />;
  if (!song) {
    return (
      <View style={[styles.screen, styles.content]}>
        <EmptyState icon={{ name: 'alert-circle-outline' }} title="Canción no encontrada" />
      </View>
    );
  }

  const withChords = hasChords(song.lyrics);
  const key = song.songKey ? transposeChord(song.songKey, semitones) : null;
  const tag = [song.author, key && `Tono: ${key}`].filter(Boolean).join(' · ') || 'Cancionero';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {withChords ? (
        <Card style={styles.controls}>
          <View style={styles.control}>
            <ArrowButton
              icon="remove"
              label="Bajar medio tono"
              onPress={() => setSemitones(semitones - 1)}
            />
            <View style={styles.transposeLabel}>
              <Text variant="caption" muted>
                Tono
              </Text>
              <Text variant="small" bold color={COLORS.HEADING}>
                {semitones === 0 ? 'Original' : `${semitones > 0 ? '+' : ''}${semitones}`}
              </Text>
            </View>
            <ArrowButton
              icon="add"
              label="Subir medio tono"
              onPress={() => setSemitones(semitones + 1)}
            />
          </View>
          <View style={styles.control}>
            <Text variant="small" bold>
              Acordes
            </Text>
            <Switch value={showChords} onValueChange={setShowChords} />
          </View>
        </Card>
      ) : null}

      <ResourceSheet ref={captureRef} tag={tag} title={song.title}>
        <SongLyrics lyrics={song.lyrics} semitones={semitones} showChords={showChords} />
      </ResourceSheet>
      {exportSheet}
    </ScrollView>
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
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  transposeLabel: {
    alignItems: 'center',
    minWidth: 56,
  },
});

import { StyleSheet, View } from 'react-native';

import { COLORS } from '../constants/theme';
import { parseChordLine, transposeChord } from '../utils/chords';
import { Text } from './Text';

type Props = {
  lyrics: string;
  semitones?: number;
  showChords?: boolean;
};

// Letra con los acordes encima de la sílaba donde caen. Cada palabra es una unidad
// que puede pasar a la línea siguiente sin separar el acorde de su sílaba.
export function SongLyrics({ lyrics, semitones = 0, showChords = true }: Props) {
  return (
    <View>
      {lyrics.split('\n').map((line, i) => {
        if (!line.trim()) return <View key={i} style={styles.gap} />;
        const segments = parseChordLine(line);
        if (!showChords || segments.every((s) => s.chord === null)) {
          return (
            <Text key={i} variant="body" color={COLORS.HEADING} style={styles.lyric}>
              {segments.map((s) => s.text).join('')}
            </Text>
          );
        }
        return (
          <View key={i} style={styles.line}>
            {segments.flatMap((segment, j) =>
              words(segment.text).map((word, k) => (
                <View key={`${j}-${k}`} style={styles.unit}>
                  <Text variant="small" bold color={COLORS.PRIMARY} style={styles.chord}>
                    {k === 0 && segment.chord ? transposeChord(segment.chord, semitones) : ' '}
                  </Text>
                  <Text variant="body" color={COLORS.HEADING} style={styles.lyric}>
                    {word}
                  </Text>
                </View>
              )),
            )}
          </View>
        );
      })}
    </View>
  );
}

// 'Ale luya, ' -> ['Ale ', 'luya, ']; un tramo vacío (acorde al final) queda como un espacio
function words(text: string) {
  const parts = text.match(/\S*\s*/g)?.filter(Boolean) ?? [];
  return parts.length ? parts : [' '];
}

const styles = StyleSheet.create({
  line: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  unit: {
    flexDirection: 'column',
  },
  chord: {
    lineHeight: 18,
    paddingRight: 4,
  },
  lyric: {
    lineHeight: 24,
  },
  gap: {
    height: 16,
  },
});

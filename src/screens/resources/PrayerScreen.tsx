import { useNavigation, type StaticScreenProps } from '@react-navigation/native';
import { ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState, ResourceSheet, Text } from '../../components';
import { COLORS, SIZES } from '../../constants/theme';
import { PRAYER_CATEGORIES } from '../../data/prayers';
import { prayersRepo } from '../../database';
import { useDetailHeader } from '../../hooks/useDetailHeader';
import { useFocusQuery } from '../../hooks/useFocusQuery';
import { useResourceExport } from '../../hooks/useResourceExport';
import { prayerHtml } from '../../services/exportTemplates';

type Props = StaticScreenProps<{ prayerId: number }>;

export function PrayerScreen({ route }: Props) {
  const { prayerId } = route.params;
  const navigation = useNavigation();
  const { data: prayer, loading } = useFocusQuery(
    (db) => prayersRepo.getPrayerById(db, prayerId),
    [prayerId],
  );
  const { captureRef, openExport, exportSheet } = useResourceExport(
    prayer?.title ?? 'Oración',
    () => prayerHtml(prayer!),
  );
  useDetailHeader(!!prayer, openExport, () => navigation.navigate('PrayerForm', { prayerId }));

  if (loading) return <View style={styles.screen} />;
  if (!prayer) {
    return (
      <View style={[styles.screen, styles.content]}>
        <EmptyState icon={{ name: 'alert-circle-outline' }} title="Oración no encontrada" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ResourceSheet ref={captureRef} tag={PRAYER_CATEGORIES[prayer.category]} title={prayer.title}>
        <View style={styles.text}>
          {prayer.text.split(/\n\s*\n/).map((paragraph, i) => (
            <Text key={i} variant="body" color={COLORS.HEADING} style={styles.paragraph}>
              {paragraph.trim()}
            </Text>
          ))}
        </View>
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
  },
  text: {
    gap: SIZES.BASE,
  },
  paragraph: {
    fontSize: 18,
    lineHeight: 28,
  },
});

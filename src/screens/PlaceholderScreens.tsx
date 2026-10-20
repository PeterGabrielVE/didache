import { ScrollView, StyleSheet } from 'react-native';

import { EmptyState } from '../components';
import { COLORS, SIZES } from '../constants/theme';

// Tab de un sprint futuro: muestra qué va a haber ahí.

export function ResourcesScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <EmptyState
        icon={{ name: 'book-outline' }}
        title="Recursos"
        description="Oraciones, dinámicas grupales y cancionero con letras y acordes."
      />
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
});

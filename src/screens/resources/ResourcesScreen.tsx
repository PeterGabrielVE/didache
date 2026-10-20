import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';

import {
  Button,
  EmptyState,
  FloatingButton,
  Icon,
  Input,
  SegmentedControl,
  Text,
  type IoniconName,
} from '../../components';
import { COLORS, SHADOWS, SIZES } from '../../constants/theme';
import { DYNAMIC_CATEGORIES } from '../../data/dynamics';
import { PRAYER_CATEGORIES } from '../../data/prayers';
import { dynamicsRepo, prayersRepo, songsRepo } from '../../database';
import { useFocusQuery } from '../../hooks/useFocusQuery';
import type { GroupDynamic, Prayer, Song } from '../../types/resources';
import { stripChords } from '../../utils/chords';
import { normalizeText } from '../../utils/text';

type Tab = 'prayers' | 'dynamics' | 'songs';

const TABS = [
  { value: 'prayers', label: 'Oraciones' },
  { value: 'dynamics', label: 'Dinámicas' },
  { value: 'songs', label: 'Cancionero' },
] as const;

type Item =
  | { kind: 'prayer'; resource: Prayer }
  | { kind: 'dynamic'; resource: GroupDynamic }
  | { kind: 'song'; resource: Song };

type Section = { title: string | null; data: Item[] };

const KIND_ICON: Record<Item['kind'], IoniconName> = {
  prayer: 'book-outline',
  dynamic: 'people-outline',
  song: 'musical-notes-outline',
};

// Texto donde busca la barra: título y contenido, sin acentos ni acordes
function searchText(item: Item) {
  const r = item.resource;
  const body =
    item.kind === 'prayer'
      ? item.resource.text
      : item.kind === 'dynamic'
        ? `${item.resource.summary} ${item.resource.steps.join(' ')}`
        : `${item.resource.author ?? ''} ${stripChords(item.resource.lyrics)}`;
  return normalizeText(`${r.title} ${body}`);
}

function subtitle(item: Item) {
  switch (item.kind) {
    case 'prayer':
      return item.resource.text.split('\n')[0];
    case 'dynamic':
      return `${DYNAMIC_CATEGORIES[item.resource.category]} · ${item.resource.duration}`;
    case 'song':
      return item.resource.author ?? stripChords(item.resource.lyrics).split('\n')[0];
  }
}

// Agrupa en secciones según las categorías, en el orden en que están definidas
function byCategory<T extends Item>(
  items: T[],
  labels: Record<string, string>,
  key: (i: T) => string,
) {
  return Object.entries(labels)
    .map(([value, title]) => ({ title, data: items.filter((i) => key(i) === value) }))
    .filter((s) => s.data.length > 0);
}

export function ResourcesScreen() {
  const navigation = useNavigation();
  const [tab, setTab] = useState<Tab>('prayers');
  const [query, setQuery] = useState('');
  const { data, loading } = useFocusQuery(async (db) => {
    const [prayers, dynamics, songs] = await Promise.all([
      prayersRepo.getPrayers(db),
      dynamicsRepo.getDynamics(db),
      songsRepo.getSongs(db),
    ]);
    return {
      prayers: prayers.map((resource) => ({ kind: 'prayer' as const, resource })),
      dynamics: dynamics.map((resource) => ({ kind: 'dynamic' as const, resource })),
      songs: songs.map((resource) => ({ kind: 'song' as const, resource })),
    };
  }, []);

  const searching = normalizeText(query) !== '';

  const sections = useMemo<Section[]>(() => {
    if (!data) return [];
    if (searching) {
      const q = normalizeText(query);
      const match = (items: Item[]) => items.filter((i) => searchText(i).includes(q));
      return [
        { title: 'Oraciones', data: match(data.prayers) },
        { title: 'Dinámicas', data: match(data.dynamics) },
        { title: 'Canciones', data: match(data.songs) },
      ].filter((s) => s.data.length > 0);
    }
    if (tab === 'prayers') {
      return byCategory(data.prayers, PRAYER_CATEGORIES, (i) => i.resource.category);
    }
    if (tab === 'dynamics') {
      return byCategory(data.dynamics, DYNAMIC_CATEGORIES, (i) => i.resource.category);
    }
    return data.songs.length ? [{ title: null, data: data.songs }] : [];
  }, [data, tab, query, searching]);

  const open = (item: Item) => {
    if (item.kind === 'prayer') navigation.navigate('Prayer', { prayerId: item.resource.id });
    else if (item.kind === 'dynamic')
      navigation.navigate('Dynamic', { dynamicId: item.resource.id });
    else navigation.navigate('Song', { songId: item.resource.id });
  };

  const add = () => {
    if (tab === 'prayers') navigation.navigate('PrayerForm');
    else if (tab === 'dynamics') navigation.navigate('DynamicForm');
    else navigation.navigate('SongForm');
  };

  const emptyState = loading ? null : searching ? (
    <EmptyState
      icon={{ name: 'search' }}
      title="Sin resultados"
      description={`No encontramos oraciones, dinámicas ni canciones con "${query.trim()}".`}
    />
  ) : tab === 'songs' ? (
    <EmptyState
      icon={{ name: 'musical-notes-outline' }}
      title="Tu cancionero está vacío"
      description="Agregá los cantos que usás en tus encuentros, con la letra y los acordes entre corchetes: [G]Ale[D]luya."
      action={<Button onPress={add}>Agregar canción</Button>}
    />
  ) : (
    <EmptyState
      icon={{ name: 'book-outline' }}
      title="No hay nada acá todavía"
      action={<Button onPress={add}>Agregar</Button>}
    />
  );

  return (
    <View style={styles.screen}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => `${item.kind}-${item.resource.id}`}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Input
              placeholder="Buscar oraciones, dinámicas, canciones…"
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
              icon={<Icon name="search" size={16} color={COLORS.MUTED} />}
            />
            {searching ? null : <SegmentedControl options={TABS} value={tab} onChange={setTab} />}
          </View>
        }
        renderSectionHeader={({ section }) =>
          section.title ? (
            <Text variant="small" bold color={COLORS.HEADING} style={styles.sectionTitle}>
              {section.title}
            </Text>
          ) : null
        }
        renderItem={({ item }) => <ResourceRow item={item} onPress={() => open(item)} />}
        ListEmptyComponent={emptyState}
      />
      {searching ? null : (
        <FloatingButton
          accessibilityLabel={
            tab === 'prayers'
              ? 'Agregar oración'
              : tab === 'dynamics'
                ? 'Agregar dinámica'
                : 'Agregar canción'
          }
          onPress={add}
        />
      )}
    </View>
  );
}

function ResourceRow({ item, onPress }: { item: Item; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.iconCircle}>
        <Icon name={KIND_ICON[item.kind]} size={18} color={COLORS.PRIMARY} />
      </View>
      <View style={styles.rowText}>
        <Text variant="body" bold color={COLORS.HEADING} numberOfLines={1}>
          {item.resource.title}
        </Text>
        <Text variant="small" muted numberOfLines={1}>
          {subtitle(item)}
        </Text>
      </View>
      <Icon name="chevron-forward" size={16} color={COLORS.MUTED} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    padding: SIZES.BASE,
    // Espacio para que el botón flotante no tape el último elemento
    paddingBottom: 96,
    gap: 8,
  },
  header: {
    gap: 12,
    marginBottom: 4,
  },
  sectionTitle: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: COLORS.WHITE,
    borderRadius: SIZES.CARD_RADIUS,
    ...SHADOWS.card,
  },
  pressed: {
    opacity: 0.7,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.PRIMARY}14`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
});

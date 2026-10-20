import { useNavigation, type StaticScreenProps } from '@react-navigation/native';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState, Icon, ResourceSheet, Text, type IoniconName } from '../../components';
import { COLORS, SIZES } from '../../constants/theme';
import { DYNAMIC_CATEGORIES } from '../../data/dynamics';
import { dynamicsRepo } from '../../database';
import { useDetailHeader } from '../../hooks/useDetailHeader';
import { useFocusQuery } from '../../hooks/useFocusQuery';
import { useResourceExport } from '../../hooks/useResourceExport';
import { dynamicHtml } from '../../services/exportTemplates';

type Props = StaticScreenProps<{ dynamicId: number }>;

export function DynamicScreen({ route }: Props) {
  const { dynamicId } = route.params;
  const navigation = useNavigation();
  const { data: dynamic, loading } = useFocusQuery(
    (db) => dynamicsRepo.getDynamicById(db, dynamicId),
    [dynamicId],
  );
  const { captureRef, openExport, exportSheet } = useResourceExport(
    dynamic?.title ?? 'Dinámica',
    () => dynamicHtml(dynamic!),
  );
  useDetailHeader(!!dynamic, openExport, () => navigation.navigate('DynamicForm', { dynamicId }));

  if (loading) return <View style={styles.screen} />;
  if (!dynamic) {
    return (
      <View style={[styles.screen, styles.content]}>
        <EmptyState icon={{ name: 'alert-circle-outline' }} title="Dinámica no encontrada" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ResourceSheet
        ref={captureRef}
        tag={DYNAMIC_CATEGORIES[dynamic.category]}
        title={dynamic.title}
      >
        <Text variant="body">{dynamic.summary}</Text>

        <View style={styles.meta}>
          <Meta icon="time-outline" label="Duración" value={dynamic.duration} />
          <Meta icon="people-outline" label="Participantes" value={dynamic.groupSize} />
        </View>

        <Section title="Objetivo">
          <Text variant="body">{dynamic.objective}</Text>
        </Section>

        {dynamic.materials.length > 0 ? (
          <Section title="Materiales">
            {dynamic.materials.map((m, i) => (
              <Text key={i} variant="body">
                • {m}
              </Text>
            ))}
          </Section>
        ) : null}

        <Section title="Desarrollo">
          {dynamic.steps.map((step, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepNumber}>
                <Text variant="caption" bold color={COLORS.WHITE}>
                  {i + 1}
                </Text>
              </View>
              <Text variant="body" style={styles.flex}>
                {step}
              </Text>
            </View>
          ))}
        </Section>

        {dynamic.reflection ? (
          <Section title="Para reflexionar">
            <View style={styles.reflection}>
              <Text variant="body" color={COLORS.HEADING}>
                {dynamic.reflection}
              </Text>
            </View>
          </Section>
        ) : null}
      </ResourceSheet>
      {exportSheet}
    </ScrollView>
  );
}

function Meta({ icon, label, value }: { icon: IoniconName; label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Icon name={icon} size={16} color={COLORS.PRIMARY} />
      <View>
        <Text variant="caption" muted>
          {label}
        </Text>
        <Text variant="small" bold color={COLORS.HEADING}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="body" bold color={COLORS.HEADING}>
        {title}
      </Text>
      {children}
    </View>
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
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.BASE * 1.5,
    marginTop: SIZES.BASE,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  section: {
    gap: 6,
    marginTop: SIZES.BASE * 1.25,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginTop: 1,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
  reflection: {
    backgroundColor: COLORS.SECONDARY,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.PRIMARY,
    padding: 12,
    borderRadius: SIZES.RADIUS,
  },
});

import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Badge, Button, Card, Icon, Input, Switch, Text } from '../components';
import type { ArgonIconName } from '../components';
import { COLORS, SIZES } from '../constants/theme';

const ARGON_ICONS: ArgonIconName[] = ['calendar-date', 'bell', 'hat-3', 'g-check', 'support', 'palette'];

// Catálogo de componentes (equivalente a la pantalla "Elements" de Argon).
// Temporal: sirve de referencia visual hasta que esta tab sea "Recursos" (Sprint 4).
export function ExploreScreen() {
  const [notifications, setNotifications] = useState(true);
  const [name, setName] = useState('');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Section title="Botones">
        <View style={styles.wrap}>
          <Button>Primario</Button>
          <Button color="info">Info</Button>
          <Button color="success">Éxito</Button>
          <Button color="warning">Aviso</Button>
          <Button color="error">Error</Button>
          <Button color="default">Default</Button>
          <Button color="secondary">Secundario</Button>
        </View>
        <View style={styles.wrap}>
          <Button small icon={<Icon name="add" size={14} color={COLORS.WHITE} />}>
            Pequeño
          </Button>
          <Button transparent>Enlace</Button>
          <Button disabled>Deshabilitado</Button>
        </View>
      </Section>

      <Section title="Campos de texto">
        <Input
          label="Nombre"
          placeholder="Escribí un nombre"
          value={name}
          onChangeText={setName}
          icon={<Icon name="person-outline" size={16} color={COLORS.MUTED} />}
        />
        <Input placeholder="Correcto" success defaultValue="Ana Pérez" />
        <Input placeholder="Con error" error helper="Este campo es obligatorio" />
      </Section>

      <Section title="Etiquetas">
        <View style={styles.wrap}>
          <Badge label="Presente" color="success" />
          <Badge label="Ausente" color="error" />
          <Badge label="Pendiente" color="warning" />
          <Badge label="Info" color="info" />
        </View>
      </Section>

      <Section title="Interruptores">
        <View style={styles.switchRow}>
          <Text variant="small">Notificaciones</Text>
          <Switch value={notifications} onValueChange={setNotifications} />
        </View>
      </Section>

      <Section title="Íconos Argon">
        <View style={styles.wrap}>
          {ARGON_ICONS.map((name) => (
            <View key={name} style={styles.iconItem}>
              <Icon family="argon" name={name} size={22} color={COLORS.PRIMARY} />
              <Text variant="caption" muted>
                {name}
              </Text>
            </View>
          ))}
        </View>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="h4">{title}</Text>
      <Card style={styles.sectionCard}>{children}</Card>
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
    gap: SIZES.BASE * 1.5,
  },
  section: {
    gap: 8,
  },
  sectionCard: {
    gap: 12,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconItem: {
    width: 88,
    alignItems: 'center',
    gap: 4,
  },
});

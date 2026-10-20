import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { COLORS } from '../constants/theme';
import { Card } from './Card';
import { Icon } from './Icon';
import { OptionChips } from './OptionChips';
import { Text } from './Text';

// Piezas compartidas por las pantallas que importan planillas (inscripción, itinerario)

const columnLabel = (headers: string[], i: number) =>
  headers[i]?.replace(/\s+/g, ' ').trim() || `Columna ${i + 1}`;

// Archivo elegido, botón para cambiarlo y selector de hoja si hay más de una
export function SpreadsheetFileCard({
  fileName,
  sheetNames,
  sheetIndex,
  onChangeSheet,
  onChangeFile,
}: {
  fileName: string;
  sheetNames: string[];
  sheetIndex: number;
  onChangeSheet: (index: number) => void;
  onChangeFile: () => void;
}) {
  return (
    <Card style={styles.card}>
      <View style={styles.titleRow}>
        <Icon name="document-text-outline" size={20} color={COLORS.PRIMARY} />
        <Text variant="small" bold color={COLORS.HEADING} style={styles.flex} numberOfLines={1}>
          {fileName}
        </Text>
        <Pressable onPress={onChangeFile} hitSlop={8} accessibilityRole="button">
          <Text variant="caption" bold color={COLORS.PRIMARY}>
            CAMBIAR
          </Text>
        </Pressable>
      </View>
      {sheetNames.length > 1 ? (
        <OptionChips
          options={sheetNames.map((name, i) => ({ value: i, label: name }))}
          value={sheetIndex}
          onChange={onChangeSheet}
        />
      ) : null}
    </Card>
  );
}

// Qué columna de la planilla corresponde a cada dato. Muestra un resumen y, con "Ajustar",
// permite elegir otra columna para cada uno.
export function ColumnMappingCard<F extends string>({
  fields,
  labels,
  headers,
  mapping,
  onChange,
  children,
}: {
  fields: readonly F[];
  labels: Record<F, string>;
  headers: string[];
  mapping: Record<F, number | null>;
  onChange: (field: F, column: number | null) => void;
  // Opciones extra al pie de la tarjeta
  children?: ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const columnOptions = [
    { value: null, label: 'Ninguna' },
    ...headers.map((_, i) => ({ value: i, label: columnLabel(headers, i) })),
  ];

  return (
    <Card style={styles.card}>
      <View style={styles.titleRow}>
        <Text variant="body" bold color={COLORS.HEADING} style={styles.flex}>
          Columnas
        </Text>
        <Pressable onPress={() => setEditing(!editing)} hitSlop={8} accessibilityRole="button">
          <Text variant="caption" bold color={COLORS.PRIMARY}>
            {editing ? 'LISTO' : 'AJUSTAR'}
          </Text>
        </Pressable>
      </View>
      {fields.map((field) => {
        const column = mapping[field];
        if (editing) {
          return (
            <View key={field} style={styles.editor}>
              <Text variant="small" bold>
                {labels[field]}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <OptionChips<number | null>
                  options={columnOptions}
                  value={column}
                  onChange={(next) => onChange(field, next)}
                />
              </ScrollView>
            </View>
          );
        }
        return column !== null ? (
          <Text key={field} variant="small">
            <Text variant="small" bold color={COLORS.HEADING}>
              {labels[field]}
            </Text>
            {'  ←  '}
            {columnLabel(headers, column)}
          </Text>
        ) : null;
      })}
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flex: {
    flex: 1,
  },
  editor: {
    gap: 6,
  },
});

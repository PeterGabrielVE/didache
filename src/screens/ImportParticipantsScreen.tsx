import { StackActions, useNavigation, type StaticScreenProps } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Badge,
  Button,
  Card,
  ColumnMappingCard,
  Icon,
  SpreadsheetFileCard,
  Switch,
  Text,
  type IoniconName,
} from '../components';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { participantsRepo, useDatabase } from '../database';
import { useFocusQuery } from '../hooks/useFocusQuery';
import { pickSpreadsheet, type Workbook } from '../services/spreadsheet';
import { formatShortDate } from '../utils/date';
import { notify } from '../utils/dialogs';
import {
  FIELD_LABELS,
  FIELDS,
  findHeaderRow,
  guessMapping,
  rowToDraft,
  type ColumnMapping,
  type DraftIssue,
  type Field,
  type ParticipantDraft,
} from '../utils/registration';
import { normalizeText } from '../utils/text';

// import: alta de varios participantes. pick: elegir una fila para completar el formulario.
type Props = StaticScreenProps<{ mode?: 'import' | 'pick' } | undefined>;

type RowStatus = 'new' | 'duplicate' | 'error';

type DraftRow = {
  index: number;
  draft: ParticipantDraft;
  issues: DraftIssue[];
  status: RowStatus;
};

// La falta de nombre impide importar; una fecha no reconocida solo se avisa (queda sin fecha)
const ISSUE_TEXT: Record<DraftIssue, { text: string; color: string }> = {
  missingName: { text: 'Falta nombre o apellido', color: COLORS.ERROR },
  invalidBirthDate: {
    text: 'Fecha de nacimiento no reconocida: se guarda sin fecha',
    color: COLORS.WARNING,
  },
};

const nameKey = (firstName: string, lastName: string) => normalizeText(`${firstName} ${lastName}`);

export function ImportParticipantsScreen({ route }: Props) {
  const mode = route.params?.mode ?? 'import';
  const db = useDatabase();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [workbook, setWorkbook] = useState<Workbook | null>(null);
  const [sheetIndex, setSheetIndex] = useState(0);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [extraToNotes, setExtraToNotes] = useState(true);
  // Cambios de selección del usuario; sin cambio, se importan las filas nuevas y válidas
  const [overrides, setOverrides] = useState<ReadonlyMap<number, boolean>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Para marcar a quienes ya están cargados (por nombre y apellido)
  const { data: existing } = useFocusQuery(async (database) => {
    const all = await participantsRepo.getParticipants(database, { includeInactive: true });
    return new Set(all.map((p) => nameKey(p.firstName, p.lastName)));
  }, []);

  const sheet = workbook?.sheets[sheetIndex];
  const headerRow = sheet ? findHeaderRow(sheet.rows) : 0;
  const headers = sheet?.rows[headerRow] ?? [];

  const loadSheet = (book: Workbook, index: number) => {
    const rows = book.sheets[index].rows;
    setSheetIndex(index);
    setMapping(guessMapping(rows[findHeaderRow(rows)] ?? []));
    setOverrides(new Map());
  };

  const chooseFile = async () => {
    setError(null);
    setBusy(true);
    try {
      const book = await pickSpreadsheet();
      if (!book) return;
      if (book.sheets.length === 0) {
        setError('El archivo no tiene datos.');
        return;
      }
      setWorkbook(book);
      loadSheet(book, 0);
    } catch {
      setError('No se pudo leer el archivo. Probá con un Excel (.xlsx) o un CSV.');
    } finally {
      setBusy(false);
    }
  };

  const rows = useMemo<DraftRow[]>(() => {
    if (!sheet || !mapping) return [];
    const seen = new Set<string>();
    return sheet.rows.slice(headerRow + 1).map((row, index) => {
      const { draft, issues } = rowToDraft(row, headers, mapping, extraToNotes);
      const key = nameKey(draft.firstName, draft.lastName);
      // Repetido si ya estaba cargado o si aparece dos veces en la misma planilla
      const duplicate = !!existing?.has(key) || seen.has(key);
      seen.add(key);
      const status: RowStatus = issues.includes('missingName')
        ? 'error'
        : duplicate
          ? 'duplicate'
          : 'new';
      return { index, draft, issues, status };
    });
  }, [sheet, headerRow, headers, mapping, extraToNotes, existing]);

  const isSelected = (row: DraftRow) =>
    row.status !== 'error' && (overrides.get(row.index) ?? row.status === 'new');
  const selected = rows.filter(isSelected);

  const toggle = (row: DraftRow) => {
    if (row.status === 'error') return;
    setOverrides(new Map(overrides).set(row.index, !isSelected(row)));
  };

  const setColumn = (field: Field, column: number | null) => {
    if (!mapping) return;
    setMapping({ ...mapping, [field]: column });
    setOverrides(new Map());
  };

  const importSelected = async () => {
    setBusy(true);
    try {
      await participantsRepo.createParticipants(
        db,
        selected.map((row) => row.draft),
      );
      navigation.goBack();
      notify(
        'Importación terminada',
        `Se ${selected.length === 1 ? 'agregó 1 participante' : `agregaron ${selected.length} participantes`}.`,
      );
    } catch {
      setError('No se pudo importar. No se guardó ningún participante; intentá de nuevo.');
      setBusy(false);
    }
  };

  // Devuelve la fila al formulario que abrió esta pantalla
  const pick = (row: DraftRow) => {
    if (row.status === 'error') return;
    navigation.dispatch(
      StackActions.popTo('ParticipantForm', { prefill: row.draft }, { merge: true }),
    );
  };

  if (!workbook || !sheet || !mapping) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Card style={styles.intro}>
          <View style={styles.introIcon}>
            <Icon name="document-attach-outline" size={30} color={COLORS.PRIMARY} />
          </View>
          <Text variant="h4" center>
            {mode === 'pick' ? 'Completar desde una planilla' : 'Importar planilla de inscripción'}
          </Text>
          <Text variant="small" center>
            Elegí un archivo de Excel (.xlsx, .xls), una hoja de Google Sheets descargada, las
            respuestas de un Google Forms o un CSV.
          </Text>
          <Text variant="small" muted center>
            Las columnas se reconocen por sus títulos: Nombre, Apellido (o Nombre completo), Fecha
            de nacimiento, Teléfono, Observaciones. Antes de guardar vas a poder revisar todo.
          </Text>
          <Button onPress={chooseFile} disabled={busy} style={styles.introButton}>
            {busy ? 'Leyendo…' : 'Elegir archivo'}
          </Button>
          {error ? (
            <Text variant="small" color={COLORS.ERROR} center>
              {error}
            </Text>
          ) : null}
        </Card>
      </ScrollView>
    );
  }

  const counts = {
    new: rows.filter((r) => r.status === 'new').length,
    duplicate: rows.filter((r) => r.status === 'duplicate').length,
    error: rows.filter((r) => r.status === 'error').length,
  };

  return (
    <View style={styles.screen}>
      <FlatList
        data={rows}
        keyExtractor={(row) => String(row.index)}
        contentContainerStyle={[styles.content, mode === 'import' && styles.withFooter]}
        ListHeaderComponent={
          <View style={styles.header}>
            <SpreadsheetFileCard
              fileName={workbook.fileName}
              sheetNames={workbook.sheets.map((s) => s.name)}
              sheetIndex={sheetIndex}
              onChangeSheet={(i) => loadSheet(workbook, i)}
              onChangeFile={chooseFile}
            />

            <ColumnMappingCard
              fields={FIELDS}
              labels={FIELD_LABELS}
              headers={headers}
              mapping={mapping}
              onChange={setColumn}
            >
              <View style={styles.switchRow}>
                <Text variant="small" style={styles.flex}>
                  Guardar las demás columnas en Notas (representante, sacramentos…)
                </Text>
                <Switch value={extraToNotes} onValueChange={setExtraToNotes} />
              </View>
            </ColumnMappingCard>

            <View style={styles.counts}>
              <Count
                icon="person-add-outline"
                color={COLORS.SUCCESS}
                value={counts.new}
                label="nuevos"
              />
              <Count
                icon="copy-outline"
                color={COLORS.WARNING}
                value={counts.duplicate}
                label="ya cargados"
              />
              <Count
                icon="alert-circle-outline"
                color={COLORS.ERROR}
                value={counts.error}
                label="con errores"
              />
            </View>
            <Text variant="caption" muted>
              {mode === 'pick'
                ? 'Tocá una fila para completar el formulario con sus datos.'
                : 'Tocá una fila para incluirla o quitarla de la importación.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <DraftRowView
            row={item}
            mode={mode}
            selected={isSelected(item)}
            onPress={() => (mode === 'pick' ? pick(item) : toggle(item))}
          />
        )}
        ListEmptyComponent={
          <Text variant="small" muted center>
            No hay filas con datos debajo de los títulos.
          </Text>
        }
      />
      {mode === 'import' ? (
        <View style={[styles.footer, { paddingBottom: SIZES.BASE + insets.bottom }]}>
          {error ? (
            <Text variant="small" color={COLORS.ERROR} center>
              {error}
            </Text>
          ) : null}
          <Button onPress={importSelected} disabled={busy || selected.length === 0}>
            {selected.length === 0
              ? 'Nada para importar'
              : `Importar ${selected.length} ${selected.length === 1 ? 'participante' : 'participantes'}`}
          </Button>
        </View>
      ) : null}
    </View>
  );
}

function Count({
  icon,
  color,
  value,
  label,
}: {
  icon: IoniconName;
  color: string;
  value: number;
  label: string;
}) {
  return (
    <View style={styles.count}>
      <Icon name={icon} size={14} color={color} />
      <Text variant="small">
        <Text variant="small" bold color={COLORS.HEADING}>
          {value}
        </Text>{' '}
        {label}
      </Text>
    </View>
  );
}

function DraftRowView({
  row,
  mode,
  selected,
  onPress,
}: {
  row: DraftRow;
  mode: 'import' | 'pick';
  selected: boolean;
  onPress: () => void;
}) {
  const { draft, issues, status } = row;
  const name = `${draft.firstName} ${draft.lastName}`.trim() || 'Sin nombre';
  const details = [
    draft.birthDate
      ? `Nac. ${formatShortDate(draft.birthDate)} ${draft.birthDate.slice(0, 4)}`
      : null,
    draft.phone,
  ]
    .filter(Boolean)
    .join(' · ');
  const disabled = status === 'error';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={mode === 'pick' ? 'button' : 'checkbox'}
      accessibilityState={{ checked: mode === 'import' ? selected : undefined, disabled }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed, disabled && styles.disabled]}
    >
      {mode === 'import' ? (
        <Icon
          name={selected ? 'checkbox' : 'square-outline'}
          size={22}
          color={selected ? COLORS.PRIMARY : COLORS.MUTED}
        />
      ) : null}
      <View style={styles.rowText}>
        <Text variant="body" bold color={COLORS.HEADING} numberOfLines={1}>
          {name}
        </Text>
        {details ? (
          <Text variant="caption" muted numberOfLines={1}>
            {details}
          </Text>
        ) : null}
        {issues.map((issue) => (
          <Text key={issue} variant="caption" color={ISSUE_TEXT[issue].color}>
            {ISSUE_TEXT[issue].text}
          </Text>
        ))}
      </View>
      {status === 'duplicate' ? <Badge label="Ya cargado" color="warning" /> : null}
      {mode === 'pick' && !disabled ? (
        <Icon name="chevron-forward" size={16} color={COLORS.MUTED} />
      ) : null}
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
    gap: 8,
  },
  withFooter: {
    paddingBottom: 110,
  },
  intro: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: SIZES.BASE * 2,
  },
  introIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${COLORS.PRIMARY}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introButton: {
    marginTop: 8,
  },
  header: {
    gap: 12,
    marginBottom: 4,
  },
  flex: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  counts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingHorizontal: 4,
  },
  count: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  disabled: {
    opacity: 0.6,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    gap: 8,
    padding: SIZES.BASE,
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: COLORS.BLOCK,
  },
});

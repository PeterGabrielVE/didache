import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Badge,
  Button,
  Card,
  ColumnMappingCard,
  DateField,
  Icon,
  Input,
  SpreadsheetFileCard,
  Switch,
  Text,
} from '../components';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { activitiesRepo, useDatabase } from '../database';
import { useFocusQuery } from '../hooks/useFocusQuery';
import { pickSpreadsheet, type Workbook } from '../services/spreadsheet';
import {
  addDays,
  diffDays,
  formatDisplayDate,
  formatLongDate,
  isValidTime,
  maskTime,
  today,
} from '../utils/date';
import { notify } from '../utils/dialogs';
import {
  ITINERARY_FIELDS,
  ITINERARY_FIELD_LABELS,
  encounterToActivity,
  findItineraryHeaderRow,
  guessItineraryMapping,
  isEncounter,
  rowToEncounter,
  suggestDateFixes,
  type EncounterDraft,
  type ItineraryField,
  type ItineraryMapping,
} from '../utils/itinerary';
import { normalizeText } from '../utils/text';

type Encounter = {
  // Posición en la lista de encuentros (no en la planilla)
  index: number;
  draft: EncounterDraft;
  // Corrección automática de año, si la hubo (fecha original en draft.date)
  fixedFrom: string | null;
  date: string | null;
  duplicate: boolean;
};

const activityKey = (date: string, title: string) => `${date}|${normalizeText(title)}`;

const SHIFTS = [
  { days: -7, label: '−1 semana' },
  { days: -1, label: '−1 día' },
  { days: 1, label: '+1 día' },
  { days: 7, label: '+1 semana' },
];

// Importa un itinerario de catequesis (Excel/CSV) como actividades de la agenda,
// con la posibilidad de corregir y mover fechas antes de guardar
export function ImportItineraryScreen() {
  const db = useDatabase();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [workbook, setWorkbook] = useState<Workbook | null>(null);
  const [sheetIndex, setSheetIndex] = useState(0);
  const [mapping, setMapping] = useState<ItineraryMapping | null>(null);
  // Fechas cambiadas a mano (o por un desplazamiento), por encuentro
  const [dateOverrides, setDateOverrides] = useState<ReadonlyMap<number, string>>(new Map());
  // Correcciones automáticas de año que el usuario deshizo
  const [undoneFixes, setUndoneFixes] = useState<ReadonlySet<number>>(new Set());
  const [excluded, setExcluded] = useState<ReadonlySet<number>>(new Set());
  const [cascade, setCascade] = useState(true);
  const [startTime, setStartTime] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: existing } = useFocusQuery(async (database) => {
    const all = await activitiesRepo.getAllActivities(database);
    return new Set(all.map((a) => activityKey(a.date, a.title)));
  }, []);

  const sheet = workbook?.sheets[sheetIndex];
  const headerRow = sheet ? findItineraryHeaderRow(sheet.rows) : 0;
  const headers = useMemo(() => sheet?.rows[headerRow] ?? [], [sheet, headerRow]);

  const resetEdits = () => {
    setDateOverrides(new Map());
    setUndoneFixes(new Set());
    setExcluded(new Set());
    setExpanded(null);
  };

  const loadSheet = (book: Workbook, index: number) => {
    const rows = book.sheets[index].rows;
    setSheetIndex(index);
    setMapping(guessItineraryMapping(rows[findItineraryHeaderRow(rows)] ?? []));
    resetEdits();
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

  // Encuentros tal como vienen de la planilla, con las correcciones de año sugeridas
  const base = useMemo(() => {
    if (!sheet || !mapping) return [];
    const drafts = sheet.rows
      .slice(headerRow + 1)
      .map((row) => rowToEncounter(row, mapping))
      .filter(isEncounter);
    const fixes = suggestDateFixes(drafts.map((d) => d.date));
    return drafts.map((draft, index) => ({ draft, fix: fixes.get(index) ?? null }));
  }, [sheet, headerRow, mapping]);

  const baseDate = (index: number) => {
    const { draft, fix } = base[index];
    return fix && !undoneFixes.has(index) ? fix : draft.date;
  };
  const effectiveDate = (index: number) => dateOverrides.get(index) ?? baseDate(index);

  const encounters: Encounter[] = base.map(({ draft, fix }, index) => {
    const date = effectiveDate(index);
    return {
      index,
      draft,
      fixedFrom: fix && !undoneFixes.has(index) && !dateOverrides.has(index) ? draft.date : null,
      date,
      duplicate:
        !!date && !!existing?.has(activityKey(date, encounterToActivity(draft, date, null).title)),
    };
  });

  const isSelected = (e: Encounter) => !!e.date && !excluded.has(e.index) && !e.duplicate;
  const selected = encounters.filter(isSelected);

  // Cambia la fecha de un encuentro; con `cascade`, los siguientes se mueven lo mismo
  const setDate = (index: number, date: string) => {
    const previous = effectiveDate(index);
    const next = new Map(dateOverrides).set(index, date);
    if (cascade && previous) {
      const delta = diffDays(previous, date);
      for (let j = index + 1; j < base.length; j++) {
        const d = effectiveDate(j);
        if (d) next.set(j, addDays(d, delta));
      }
    }
    setDateOverrides(next);
  };

  const shiftAll = (days: number) => {
    const next = new Map(dateOverrides);
    base.forEach((_, i) => {
      const d = effectiveDate(i);
      if (d) next.set(i, addDays(d, days));
    });
    setDateOverrides(next);
  };

  const toggle = (index: number) => {
    const next = new Set(excluded);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setExcluded(next);
  };

  const undoFix = (index: number) => setUndoneFixes(new Set(undoneFixes).add(index));

  const setColumn = (field: ItineraryField, column: number | null) => {
    if (!mapping) return;
    setMapping({ ...mapping, [field]: column });
    resetEdits();
  };

  const timeError = startTime && !isValidTime(startTime) ? 'Formato HH:mm, p. ej. 10:00' : null;

  const importSelected = async () => {
    if (timeError) return;
    setBusy(true);
    setError(null);
    try {
      await activitiesRepo.createActivities(
        db,
        selected.map((e) => encounterToActivity(e.draft, e.date!, startTime || null)),
      );
      navigation.goBack();
      notify(
        'Cronograma importado',
        `Se ${selected.length === 1 ? 'agregó 1 encuentro' : `agregaron ${selected.length} encuentros`} a la agenda. Podés editar cada uno desde la Agenda.`,
      );
    } catch {
      setError('No se pudo importar. No se guardó ningún encuentro; intentá de nuevo.');
      setBusy(false);
    }
  };

  if (!workbook || !sheet || !mapping) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Card style={styles.intro}>
          <View style={styles.introIcon}>
            <Icon name="calendar-outline" size={30} color={COLORS.PRIMARY} />
          </View>
          <Text variant="h4" center>
            Importar itinerario de catequesis
          </Text>
          <Text variant="small" center>
            Elegí el Excel (.xlsx, .xls), la hoja de Google Sheets descargada o el CSV con el
            cronograma de encuentros.
          </Text>
          <Text variant="small" muted center>
            Se reconocen las columnas Fecha, Encuentro, Tiempo litúrgico, Tema, Objetivo y
            Estrategia / Actividad. Antes de guardar vas a poder revisar y cambiar las fechas.
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
        <Card style={styles.pdfNote}>
          <Icon name="information-circle-outline" size={18} color={COLORS.INFO} />
          <Text variant="caption" style={styles.flex}>
            ¿Solo tenés el PDF? Un PDF no guarda la tabla, solo el texto en la página, y no se puede
            leer de forma confiable. Usá el Excel original o convertí el PDF a Excel (por ejemplo,
            abriéndolo con Google Drive) y después importalo acá.
          </Text>
        </Card>
      </ScrollView>
    );
  }

  const fixedCount = encounters.filter((e) => e.fixedFrom).length;
  const duplicateCount = encounters.filter((e) => e.duplicate).length;

  return (
    <View style={styles.screen}>
      <FlatList
        data={encounters}
        keyExtractor={(e) => String(e.index)}
        contentContainerStyle={[styles.content, styles.withFooter]}
        keyboardShouldPersistTaps="handled"
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
              fields={ITINERARY_FIELDS}
              labels={ITINERARY_FIELD_LABELS}
              headers={headers}
              mapping={mapping}
              onChange={setColumn}
            />

            <Card style={styles.card}>
              <Text variant="body" bold color={COLORS.HEADING}>
                Fechas
              </Text>
              <Text variant="caption" muted>
                Mover todo el cronograma
              </Text>
              <View style={styles.shifts}>
                {SHIFTS.map((s) => (
                  <Button
                    key={s.days}
                    small
                    shadowless
                    color="secondary"
                    onPress={() => shiftAll(s.days)}
                    style={styles.shift}
                  >
                    {s.label}
                  </Button>
                ))}
              </View>
              <View style={styles.switchRow}>
                <Text variant="small" style={styles.flex}>
                  Al cambiar la fecha de un encuentro, mover también los siguientes
                </Text>
                <Switch value={cascade} onValueChange={setCascade} />
              </View>
              <Input
                label="Hora de los encuentros (opcional)"
                placeholder="HH:mm"
                value={startTime}
                onChangeText={(t) => setStartTime(maskTime(t))}
                keyboardType="number-pad"
                maxLength={5}
                error={!!timeError}
                helper={timeError ?? undefined}
                icon={<Icon name="time-outline" size={16} color={COLORS.MUTED} />}
                shadowless
              />
            </Card>

            {fixedCount > 0 ? (
              <View style={styles.notice}>
                <Icon name="build-outline" size={16} color={COLORS.WARNING} />
                <Text variant="caption" style={styles.flex}>
                  {fixedCount === 1
                    ? '1 fecha parecía tener el año mal escrito y se corrigió.'
                    : `${fixedCount} fechas parecían tener el año mal escrito y se corrigieron.`}{' '}
                  Revisalas abajo; podés deshacer cada corrección.
                </Text>
              </View>
            ) : null}
            <Text variant="caption" muted>
              {encounters.length} encuentros
              {duplicateCount ? ` · ${duplicateCount} ya están en la agenda` : ''}. Tocá un
              encuentro para cambiar su fecha.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <EncounterRow
            encounter={item}
            selected={isSelected(item)}
            expanded={expanded === item.index}
            onToggle={() => toggle(item.index)}
            onExpand={() => setExpanded(expanded === item.index ? null : item.index)}
            onChangeDate={(d) => setDate(item.index, d)}
            onUndoFix={() => undoFix(item.index)}
          />
        )}
        ListEmptyComponent={
          <Text variant="small" muted center>
            No se encontraron encuentros debajo de los títulos. Revisá las columnas.
          </Text>
        }
      />
      <View style={[styles.footer, { paddingBottom: SIZES.BASE + insets.bottom }]}>
        {error ? (
          <Text variant="small" color={COLORS.ERROR} center>
            {error}
          </Text>
        ) : null}
        <Button onPress={importSelected} disabled={busy || selected.length === 0 || !!timeError}>
          {selected.length === 0
            ? 'Nada para importar'
            : `Agregar ${selected.length} ${selected.length === 1 ? 'encuentro' : 'encuentros'} a la agenda`}
        </Button>
      </View>
    </View>
  );
}

function EncounterRow({
  encounter,
  selected,
  expanded,
  onToggle,
  onExpand,
  onChangeDate,
  onUndoFix,
}: {
  encounter: Encounter;
  selected: boolean;
  expanded: boolean;
  onToggle: () => void;
  onExpand: () => void;
  onChangeDate: (date: string) => void;
  onUndoFix: () => void;
}) {
  const { draft, date, fixedFrom, duplicate } = encounter;
  const canSelect = !!date && !duplicate;

  return (
    <View style={styles.row}>
      <View style={styles.rowMain}>
        <Pressable
          onPress={onToggle}
          disabled={!canSelect}
          hitSlop={8}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: selected, disabled: !canSelect }}
          accessibilityLabel={`Incluir ${draft.title || 'encuentro'}`}
        >
          <Icon
            name={selected ? 'checkbox' : 'square-outline'}
            size={22}
            color={selected ? COLORS.PRIMARY : COLORS.MUTED}
          />
        </Pressable>
        <Pressable
          onPress={onExpand}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          style={({ pressed }) => [styles.rowText, pressed && styles.pressed]}
        >
          <View style={styles.rowTitle}>
            {draft.number ? (
              <View style={styles.number}>
                <Text variant="caption" bold color={COLORS.WHITE}>
                  {draft.number}
                </Text>
              </View>
            ) : null}
            <Text
              variant="small"
              bold
              color={date ? COLORS.PRIMARY : COLORS.ERROR}
              style={styles.flex}
              numberOfLines={1}
            >
              {date
                ? formatLongDate(date, true)
                : `Sin fecha${draft.dateText ? ` ("${draft.dateText}")` : ''}`}
            </Text>
            {draft.season ? <Badge label={draft.season} color="info" /> : null}
          </View>
          <Text variant="body" bold color={COLORS.HEADING}>
            {draft.title || 'Sin tema'}
          </Text>
          {draft.objective ? (
            <Text variant="caption" muted numberOfLines={expanded ? undefined : 2}>
              {draft.objective}
            </Text>
          ) : null}
          {fixedFrom ? (
            <View style={styles.fix}>
              <Text variant="caption" color={COLORS.WARNING} style={styles.flex}>
                Año corregido: decía {formatDisplayDate(fixedFrom)}
              </Text>
              <Pressable onPress={onUndoFix} hitSlop={8} accessibilityRole="button">
                <Text variant="caption" bold color={COLORS.PRIMARY}>
                  DESHACER
                </Text>
              </Pressable>
            </View>
          ) : null}
          {duplicate ? <Badge label="Ya está en la agenda" color="warning" /> : null}
        </Pressable>
      </View>
      {expanded ? (
        <View style={styles.expanded}>
          <DateField label="Fecha del encuentro" value={date ?? today()} onChange={onChangeDate} />
          {draft.activity ? (
            <Text variant="caption">
              <Text variant="caption" bold>
                Actividad:{' '}
              </Text>
              {draft.activity}
            </Text>
          ) : null}
          {draft.references.length ? (
            <Text variant="caption">
              <Text variant="caption" bold>
                Material:{' '}
              </Text>
              {draft.references.join(', ')}
            </Text>
          ) : null}
        </View>
      ) : null}
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
  pdfNote: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  header: {
    gap: 12,
    marginBottom: 4,
  },
  card: {
    gap: 10,
  },
  shifts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  shift: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notice: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    borderRadius: SIZES.RADIUS,
    backgroundColor: `${COLORS.WARNING}14`,
  },
  flex: {
    flex: 1,
  },
  row: {
    padding: 12,
    gap: 10,
    backgroundColor: COLORS.WHITE,
    borderRadius: SIZES.CARD_RADIUS,
    ...SHADOWS.card,
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  number: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pressed: {
    opacity: 0.7,
  },
  expanded: {
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.BLOCK,
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

import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { Platform } from 'react-native';
import * as XLSX from 'xlsx';

export type Sheet = { name: string; rows: string[][] };
export type Workbook = { fileName: string; sheets: Sheet[] };

const SPREADSHEET_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'application/vnd.oasis.opendocument.spreadsheet', // .ods
  'text/csv',
  'text/comma-separated-values',
  // Algunos Android informan los CSV como texto genérico
  'text/*',
];

function isPlainText(asset: DocumentPicker.DocumentPickerAsset) {
  return /\.(csv|txt|tsv)$/i.test(asset.name) || !!asset.mimeType?.startsWith('text/');
}

async function readAsset(asset: DocumentPicker.DocumentPickerAsset, asText: boolean) {
  // Web: el archivo viene como File del navegador; nativo: se lee desde la copia en caché
  const source = Platform.OS === 'web' && asset.file ? asset.file : new File(asset.uri);
  return asText ? source.text() : source.arrayBuffer();
}

// Una celda combinada (p. ej. una fecha que abarca dos encuentros) solo guarda el valor en
// la primera celda; se copia a todas las del rango para que cada fila tenga su dato.
function fillMergedCells(sheet: XLSX.WorkSheet) {
  for (const range of sheet['!merges'] ?? []) {
    const first = sheet[XLSX.utils.encode_cell(range.s)];
    if (!first) continue;
    for (let r = range.s.r; r <= range.e.r; r++) {
      for (let c = range.s.c; c <= range.e.c; c++) {
        if (r !== range.s.r || c !== range.s.c)
          sheet[XLSX.utils.encode_cell({ r, c })] = { ...first };
      }
    }
  }
}

function toRows(sheet: XLSX.WorkSheet) {
  fillMergedCells(sheet);
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    // Texto tal como se ve en la celda (teléfonos con ceros adelante, fechas formateadas)
    raw: false,
    defval: '',
    blankrows: false,
  });
  return rows.map((row) => row.map((cell) => String(cell ?? '').trim()));
}

// Abre el selector de archivos y devuelve las hojas como filas de texto. null = cancelado.
export async function pickSpreadsheet(): Promise<Workbook | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: SPREADSHEET_TYPES,
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];

  const asText = isPlainText(asset);
  const content = await readAsset(asset, asText);
  const workbook = asText
    ? // raw: el CSV queda como texto; si no, '05/11/2015' se leería como 11 de mayo
      XLSX.read(content as string, { type: 'string', raw: true })
    : // dateNF: el formato de fecha corta de Excel (m/d/yy) se reemplaza por uno sin ambigüedad
      XLSX.read(new Uint8Array(content as ArrayBuffer), { type: 'array', dateNF: 'yyyy-mm-dd' });

  const sheets = workbook.SheetNames.map((name) => ({
    name,
    rows: toRows(workbook.Sheets[name]),
  })).filter((sheet) => sheet.rows.length > 0);
  return { fileName: asset.name, sheets };
}

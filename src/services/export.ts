import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { RefObject } from 'react';
import { Platform, type View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

// 'Ven, Espíritu Santo' -> 'ven-espiritu-santo'
function fileName(title: string) {
  return (
    title
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'didache'
  );
}

// PDF a partir de HTML. En el teléfono abre el menú de compartir (WhatsApp, Drive, imprimir…);
// en web abre el diálogo de impresión, desde donde se puede guardar como PDF.
export async function exportPdf(html: string, title: string) {
  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return;
  }
  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: title,
  });
}

// PNG de una vista tal como se ve en pantalla. En web se descarga el archivo.
export async function exportImage(ref: RefObject<View | null>, title: string) {
  if (Platform.OS === 'web') {
    const dataUri = await captureRef(ref, { format: 'png', result: 'data-uri' });
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = `${fileName(title)}.png`;
    link.click();
    return;
  }
  const uri = await captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile' });
  await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png', dialogTitle: title });
}

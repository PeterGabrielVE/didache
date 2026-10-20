import { useRef, useState } from 'react';
import type { View } from 'react-native';

import { ActionSheet } from '../components';
import { exportImage, exportPdf } from '../services/export';
import { notify } from '../utils/dialogs';

// Menú "Exportar como imagen / PDF" para una pantalla de detalle.
// captureRef va en la vista que se convierte en imagen; getHtml arma el PDF.
export function useResourceExport(title: string, getHtml: () => string) {
  const captureRef = useRef<View>(null);
  const [visible, setVisible] = useState(false);

  const run = async (action: () => Promise<void>) => {
    try {
      await action();
    } catch {
      notify('No se pudo exportar', 'Intentá de nuevo en unos segundos.');
    }
  };

  const sheet = (
    <ActionSheet
      visible={visible}
      title="Exportar"
      onClose={() => setVisible(false)}
      options={[
        {
          label: 'Como imagen',
          icon: 'image-outline',
          onPress: () => run(() => exportImage(captureRef, title)),
        },
        {
          label: 'Como PDF',
          icon: 'document-text-outline',
          onPress: () => run(() => exportPdf(getHtml(), title)),
        },
      ]}
    />
  );

  return { captureRef, openExport: () => setVisible(true), exportSheet: sheet };
}

import { Alert, Platform } from 'react-native';

type Options = {
  title: string;
  message?: string;
  confirmLabel: string;
  destructive?: boolean;
};

// Diálogo de confirmación. En web, Alert de react-native-web no muestra botones: se usa window.confirm.
export function confirm({ title, message, confirmLabel, destructive }: Options) {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(message ? `${title}\n\n${message}` : title));
  }
  return new Promise<boolean>((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        {
          text: confirmLabel,
          style: destructive ? 'destructive' : 'default',
          onPress: () => resolve(true),
        },
      ],
      // Android: tocar fuera del diálogo equivale a cancelar
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

// Aviso informativo con un solo botón
export function notify(title: string, message?: string) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}

// Pide confirmación para borrar un recurso. Devuelve true si el usuario aceptó.
export function confirmDelete(kind: string, title: string) {
  return confirm({
    title: `¿Eliminar ${kind}?`,
    message: `"${title.trim() || 'Sin título'}" se va a borrar definitivamente.`,
    confirmLabel: 'Eliminar',
    destructive: true,
  });
}

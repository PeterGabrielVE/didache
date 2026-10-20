import { StyleSheet, View } from 'react-native';

import { COLORS } from '../constants/theme';
import { Button } from './Button';
import { Icon } from './Icon';
import { Text } from './Text';

type Props = {
  saveLabel: string;
  saving: boolean;
  error: string | null;
  onSave: () => void;
  onCancel: () => void;
  // Solo al editar
  deleteLabel?: string;
  onDelete?: () => void;
};

// Pie de los formularios: error, guardar, cancelar y (al editar) eliminar
export function FormActions({
  saveLabel,
  saving,
  error,
  onSave,
  onCancel,
  deleteLabel,
  onDelete,
}: Props) {
  return (
    <View style={styles.container}>
      {error ? (
        <Text variant="small" color={COLORS.ERROR} center>
          {error}
        </Text>
      ) : null}
      <Button onPress={onSave} disabled={saving}>
        {saveLabel}
      </Button>
      <Button transparent color="default" onPress={onCancel}>
        Cancelar
      </Button>
      {onDelete && deleteLabel ? (
        <Button
          transparent
          color="error"
          disabled={saving}
          icon={<Icon name="trash-outline" size={14} color={COLORS.ERROR} />}
          onPress={onDelete}
        >
          {deleteLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
});

import { useNavigation } from '@react-navigation/native';
import { useLayoutEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { HeaderButton } from '../components';

// Botones "Exportar" y "Editar" en el header de las pantallas de detalle de recursos.
// Sin `ready` (todavía cargando o no encontrado) no se muestran.
export function useDetailHeader(ready: boolean, onExport: () => void, onEdit: () => void) {
  const navigation = useNavigation();
  // Las funciones cambian en cada render; el header usa siempre la última sin volver a configurarse
  const actions = useRef({ onExport, onEdit });
  actions.current = { onExport, onEdit };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: ready
        ? () => (
            <View style={styles.row}>
              <HeaderButton
                icon="share-outline"
                label="Exportar"
                onPress={() => actions.current.onExport()}
              />
              <HeaderButton
                icon="create-outline"
                label="Editar"
                onPress={() => actions.current.onEdit()}
              />
            </View>
          )
        : undefined,
    });
  }, [navigation, ready]);
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
});

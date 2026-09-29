import {
  DefaultTheme,
  createStaticNavigation,
  type StaticParamList,
  type Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { COLORS } from '../constants/theme';
import { ParticipantFormScreen } from '../screens/ParticipantFormScreen';
import { headerOptions } from './headerOptions';
import { RootTabs } from './RootTabs';

// Stack raíz: las tabs y, encima, las pantallas que se abren desde ellas (formularios, detalles).
const RootStack = createNativeStackNavigator({
  screenOptions: headerOptions,
  screens: {
    Tabs: {
      screen: RootTabs,
      options: { headerShown: false },
    },
    ParticipantForm: {
      screen: ParticipantFormScreen,
      // En la config estática route.params no se infiere: se tipa a mano
      options: ({ route }: { route: { params?: { participantId?: number } } }) => ({
        title: route.params?.participantId ? 'Editar participante' : 'Nuevo participante',
        presentation: 'modal',
      }),
    },
  },
});

const theme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.PRIMARY,
    background: COLORS.BACKGROUND,
    card: COLORS.WHITE,
    text: COLORS.DEFAULT,
    border: COLORS.BLOCK,
    notification: COLORS.LABEL,
  },
};

const StaticNavigation = createStaticNavigation(RootStack);

export function Navigation() {
  return <StaticNavigation theme={theme} />;
}

type RootStackParamList = StaticParamList<typeof RootStack>;

// Tipado global para useNavigation(), Link, etc.
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

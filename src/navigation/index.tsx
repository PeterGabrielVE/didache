import {
  DefaultTheme,
  createStaticNavigation,
  type StaticParamList,
  type Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { COLORS } from '../constants/theme';
import { ActivityFormScreen } from '../screens/ActivityFormScreen';
import { AttendanceReportScreen } from '../screens/AttendanceReportScreen';
import { ImportItineraryScreen } from '../screens/ImportItineraryScreen';
import { ImportParticipantsScreen } from '../screens/ImportParticipantsScreen';
import { ParticipantFormScreen } from '../screens/ParticipantFormScreen';
import { ParticipantHistoryScreen } from '../screens/ParticipantHistoryScreen';
import { DynamicFormScreen } from '../screens/resources/DynamicFormScreen';
import { DynamicScreen } from '../screens/resources/DynamicScreen';
import { PrayerFormScreen } from '../screens/resources/PrayerFormScreen';
import { PrayerScreen } from '../screens/resources/PrayerScreen';
import { SongFormScreen } from '../screens/resources/SongFormScreen';
import { SongScreen } from '../screens/resources/SongScreen';
import { headerOptions } from './headerOptions';
import { RootTabs } from './RootTabs';

// Opciones de un formulario modal: título según haya id (edición) o no (alta)
function formOptions(idParam: string, editTitle: string, newTitle: string) {
  return ({ route }: { route: { params?: object } }) => ({
    title: (route.params as Record<string, unknown> | undefined)?.[idParam] ? editTitle : newTitle,
    presentation: 'modal' as const,
  });
}

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
    ActivityForm: {
      screen: ActivityFormScreen,
      options: ({ route }: { route: { params?: { activityId?: number } } }) => ({
        title: route.params?.activityId ? 'Editar actividad' : 'Nueva actividad',
        presentation: 'modal',
      }),
    },
    ImportParticipants: {
      screen: ImportParticipantsScreen,
      options: ({ route }: { route: { params?: { mode?: string } } }) => ({
        title: route.params?.mode === 'pick' ? 'Elegir de la planilla' : 'Importar planilla',
        presentation: 'modal' as const,
      }),
    },
    ImportItinerary: {
      screen: ImportItineraryScreen,
      options: { title: 'Importar itinerario', presentation: 'modal' },
    },
    AttendanceReport: {
      screen: AttendanceReportScreen,
      options: { title: 'Reporte de asistencia' },
    },
    ParticipantHistory: {
      screen: ParticipantHistoryScreen,
      options: { title: 'Historial' },
    },
    Prayer: {
      screen: PrayerScreen,
      options: { title: 'Oración' },
    },
    PrayerForm: {
      screen: PrayerFormScreen,
      options: formOptions('prayerId', 'Editar oración', 'Nueva oración'),
    },
    Dynamic: {
      screen: DynamicScreen,
      options: { title: 'Dinámica' },
    },
    DynamicForm: {
      screen: DynamicFormScreen,
      options: formOptions('dynamicId', 'Editar dinámica', 'Nueva dinámica'),
    },
    Song: {
      screen: SongScreen,
      options: { title: 'Canción' },
    },
    SongForm: {
      screen: SongFormScreen,
      options: formOptions('songId', 'Editar canción', 'Nueva canción'),
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

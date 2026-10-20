import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, View } from 'react-native';

import { HeaderButton, Icon, type IoniconName } from '../components';
import { COLORS } from '../constants/theme';
import { HomeScreen } from '../screens/HomeScreen';
import { AttendanceScreen } from '../screens/AttendanceScreen';
import { AgendaScreen } from '../screens/AgendaScreen';
import { ResourcesScreen } from '../screens/resources/ResourcesScreen';
import { headerOptions } from './headerOptions';

// Ícono relleno cuando la tab está activa, contorno cuando no
function tabIcon(active: IoniconName, inactive: IoniconName) {
  return ({ focused, color, size }: { focused: boolean; color: string; size: number }) => (
    <Icon name={focused ? active : inactive} color={color} size={size} />
  );
}

export const RootTabs = createBottomTabNavigator({
  screenOptions: {
    ...headerOptions,
    tabBarActiveTintColor: COLORS.PRIMARY,
    tabBarInactiveTintColor: COLORS.MUTED,
    tabBarLabelStyle: { fontSize: 11, lineHeight: 14, fontWeight: '600' },
    // Web: la altura por defecto (49) recorta la etiqueta bajo el ícono. En nativo
    // no se toca, porque ahí la altura incluye el área segura del dispositivo.
    tabBarStyle: [{ borderTopColor: COLORS.BLOCK }, Platform.OS === 'web' && { height: 58 }],
  },
  screens: {
    Home: {
      screen: HomeScreen,
      options: {
        title: 'Inicio',
        tabBarIcon: tabIcon('home', 'home-outline'),
      },
    },
    Attendance: {
      screen: AttendanceScreen,
      options: ({ navigation }) => ({
        title: 'Asistencia',
        tabBarIcon: tabIcon('people', 'people-outline'),
        headerRight: () => (
          <View style={{ flexDirection: 'row' }}>
            <HeaderButton
              icon="document-attach-outline"
              label="Importar planilla de inscripción"
              onPress={() => navigation.navigate('ImportParticipants')}
            />
            <HeaderButton
              icon="stats-chart-outline"
              label="Ver reporte de asistencia"
              onPress={() => navigation.navigate('AttendanceReport')}
            />
          </View>
        ),
      }),
    },
    Agenda: {
      screen: AgendaScreen,
      options: ({ navigation }) => ({
        title: 'Agenda',
        tabBarIcon: tabIcon('calendar', 'calendar-outline'),
        headerRight: () => (
          <HeaderButton
            icon="document-attach-outline"
            label="Importar itinerario"
            onPress={() => navigation.navigate('ImportItinerary')}
          />
        ),
      }),
    },
    Resources: {
      screen: ResourcesScreen,
      options: {
        title: 'Recursos',
        tabBarIcon: tabIcon('book', 'book-outline'),
      },
    },
  },
});

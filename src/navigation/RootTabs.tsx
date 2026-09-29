import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';

import { Icon, type IoniconName } from '../components';
import { COLORS } from '../constants/theme';
import { HomeScreen } from '../screens/HomeScreen';
import { AttendanceScreen } from '../screens/AttendanceScreen';
import { AgendaScreen, ResourcesScreen } from '../screens/PlaceholderScreens';
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
      options: {
        title: 'Asistencia',
        tabBarIcon: tabIcon('people', 'people-outline'),
      },
    },
    Agenda: {
      screen: AgendaScreen,
      options: {
        title: 'Agenda',
        tabBarIcon: tabIcon('calendar', 'calendar-outline'),
      },
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

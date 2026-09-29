import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  DefaultTheme,
  createStaticNavigation,
  type StaticParamList,
  type Theme,
} from '@react-navigation/native';

import { Icon, type IoniconName } from '../components';
import { COLORS } from '../constants/theme';
import { ExploreScreen } from '../screens/ExploreScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

// Ícono relleno cuando la tab está activa, contorno cuando no
function tabIcon(active: IoniconName, inactive: IoniconName) {
  return ({ focused, color, size }: { focused: boolean; color: string; size: number }) => (
    <Icon name={focused ? active : inactive} color={color} size={size} />
  );
}

const RootTabs = createBottomTabNavigator({
  screenOptions: {
    tabBarActiveTintColor: COLORS.PRIMARY,
    tabBarInactiveTintColor: COLORS.MUTED,
    tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    tabBarStyle: { borderTopColor: COLORS.BLOCK },
    headerTitleAlign: 'center',
    headerTintColor: COLORS.DEFAULT,
    headerTitleStyle: { fontSize: 16, fontWeight: '700', color: COLORS.DEFAULT },
    headerShadowVisible: true,
  },
  screens: {
    Home: {
      screen: HomeScreen,
      options: {
        title: 'Inicio',
        tabBarIcon: tabIcon('home', 'home-outline'),
      },
    },
    Explore: {
      screen: ExploreScreen,
      options: {
        title: 'Explorar',
        tabBarIcon: tabIcon('compass', 'compass-outline'),
      },
    },
    Profile: {
      screen: ProfileScreen,
      options: {
        title: 'Perfil',
        tabBarIcon: tabIcon('person', 'person-outline'),
        // Header sobre el fondo degradado, como en Argon
        headerTransparent: true,
        headerTitleStyle: { fontSize: 16, fontWeight: '700', color: COLORS.WHITE },
      },
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

const StaticNavigation = createStaticNavigation(RootTabs);

export function Navigation() {
  return <StaticNavigation theme={theme} />;
}

type RootTabParamList = StaticParamList<typeof RootTabs>;

// Tipado global para useNavigation(), Link, etc.
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}

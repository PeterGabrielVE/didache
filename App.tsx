import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DatabaseProvider } from './src/database';
import { Navigation } from './src/navigation/RootTabs';

export default function App() {
  return (
    <SafeAreaProvider>
      <DatabaseProvider>
        <Navigation />
      </DatabaseProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { useEffect } from 'react';
import { PowerSyncContext } from '@powersync/react-native';
import { db, setupPowerSync } from '../../database/setup';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';

SplashScreen.preventAutoHideAsync();


export default function RootLayout() {
  const colorScheme = useColorScheme();

  //boot up the offline database when the app first launches
  useEffect(() => {
    setupPowerSync().catch(console.error);
  }, []);


  return (
    <PowerSyncContext.Provider value={db}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <AppTabs />
      </ThemeProvider>
   </PowerSyncContext.Provider>
  );
}
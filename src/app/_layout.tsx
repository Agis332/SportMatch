import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { router, Stack, useSegments } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuthContext } from '@/context/AuthContext';
import { BookingProvider } from '@/context/BookingContext';
import { TrainerStatsProvider } from '@/context/TrainerStatsContext';
import { WalletProvider } from '@/context/WalletContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { LocationProvider } from '@/context/LocationContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { TrainerProfileProvider } from '@/context/TrainerProfileContext';

function AppShell() {
  const { isDarkMode } = useTheme();
  const { currentUser, loading } = useAuthContext();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === 'auth';
    if (!currentUser && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (currentUser && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [currentUser, loading, segments]);

  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider>
          <LocationProvider>
            <NotificationsProvider>
              <TrainerProfileProvider>
                <BookingProvider>
                  <WalletProvider>
                    <TrainerStatsProvider>
                      <AppShell />
                    </TrainerStatsProvider>
                  </WalletProvider>
                </BookingProvider>
              </TrainerProfileProvider>
            </NotificationsProvider>
          </LocationProvider>
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

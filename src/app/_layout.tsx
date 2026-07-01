import { StatusBar } from 'react-native';
import { Stack } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider } from '@/context/AuthContext';
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

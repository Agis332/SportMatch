import { Stack } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { BookingProvider } from '@/context/BookingContext';
import { TrainerStatsProvider } from '@/context/TrainerStatsContext';
import { WalletProvider } from '@/context/WalletContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { LocationProvider } from '@/context/LocationContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { TrainerProfileProvider } from '@/context/TrainerProfileContext';

export default function RootLayout() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <LocationProvider>
          <NotificationsProvider>
            <TrainerProfileProvider>
              <BookingProvider>
                <WalletProvider>
                  <TrainerStatsProvider>
                    <AnimatedSplashOverlay />
                    <Stack screenOptions={{ headerShown: false }} />
                  </TrainerStatsProvider>
                </WalletProvider>
              </BookingProvider>
            </TrainerProfileProvider>
          </NotificationsProvider>
        </LocationProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

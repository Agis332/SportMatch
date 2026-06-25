import { Stack } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
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
              <AnimatedSplashOverlay />
              <Stack screenOptions={{ headerShown: false }} />
            </TrainerProfileProvider>
          </NotificationsProvider>
        </LocationProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

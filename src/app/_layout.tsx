import { Stack } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { LanguageProvider } from '@/context/LanguageContext';
import { LocationProvider } from '@/context/LocationContext';
import { ThemeProvider } from '@/context/ThemeContext';

export default function RootLayout() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <LocationProvider>
          <AnimatedSplashOverlay />
          <Stack screenOptions={{ headerShown: false }} />
        </LocationProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

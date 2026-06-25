import { Tabs } from 'expo-router';
import { Calendar, MapPin, Menu, MessageCircle, Users } from 'lucide-react-native';
import { Platform, StyleSheet } from 'react-native';

import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

export default function AppTabs() {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();

  const tabBarStyle = {
    ...styles.tabBar,
    backgroundColor: isDarkMode ? '#1F2937' : '#F8F8F8',
    borderTopColor: isDarkMode ? '#374151' : '#E5E5E5',
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#208AEF',
        tabBarInactiveTintColor: isDarkMode ? '#FFFFFF' : '#9CA3AF',
        tabBarStyle,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabs.trainers,
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: t.tabs.map,
          tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: t.tabs.chats,
          tabBarIcon: ({ color, size }) => (
            <MessageCircle color={color} size={size} strokeWidth={1.75} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: t.tabs.bookings,
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.tabs.settings,
          tabBarIcon: ({ color, size }) => (
            <Menu color={color} size={size} strokeWidth={1.75} />
          ),
        }}
      />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    height: Platform.select({ ios: 80, android: 64, default: 64 }),
    paddingBottom: 0,
    paddingTop: 0,
    marginTop: -8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  tabItem: {
    paddingTop: 0,
    paddingBottom: 0,
  },
});

import { Tabs } from 'expo-router';
import { MapPin, Menu, MessageCircle, Users } from 'lucide-react-native';
import { Platform, StyleSheet } from 'react-native';

import { useTheme } from '@/context/ThemeContext';

export default function AppTabs() {
  const { isDarkMode } = useTheme();

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
          title: 'Trainers',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, size }) => (
            <MessageCircle color={color} size={size} strokeWidth={1.75} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
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

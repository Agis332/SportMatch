import { Tabs } from 'expo-router';
import { CalendarDays, House, MessageCircle, User } from 'lucide-react-native';
import { Platform, StyleSheet } from 'react-native';

import { useTheme } from '@/context/ThemeContext';

const BLUE = '#208AEF';

export default function TrainerModeLayout() {
  const { isDarkMode } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: BLUE,
        tabBarInactiveTintColor: isDarkMode ? '#9CA3AF' : '#9CA3AF',
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#1F2937' : '#F8F8F8',
          borderTopColor: isDarkMode ? '#374151' : '#E5E5E5',
          borderTopWidth: 1,
          height: Platform.select({ ios: 80, android: 64, default: 64 }),
          paddingBottom: 0,
          paddingTop: 0,
          marginTop: -8,
        },
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <House color={color} size={size} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'Sessions',
          tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="session-detail"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  tabItem: {
    paddingTop: 0,
    paddingBottom: 0,
  },
});

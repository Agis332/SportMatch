import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';

const BLUE = '#208AEF';

interface NotifItem {
  key: string;
  title: string;
  description: string;
}

const NOTIFICATIONS: NotifItem[] = [
  {
    key: 'booking',
    title: 'New Booking Request',
    description: 'Get notified when a client requests a session with you.',
  },
  {
    key: 'reminders',
    title: 'Session Reminders',
    description: 'Receive reminders before your upcoming sessions start.',
  },
  {
    key: 'payment',
    title: 'Payment Received',
    description: 'Get notified when a client completes a payment.',
  },
  {
    key: 'review',
    title: 'New Review',
    description: 'Know when a client leaves a review on your profile.',
  },
  {
    key: 'messages',
    title: 'Client Messages',
    description: 'Get notified when a client sends you a message.',
  },
  {
    key: 'cancellation',
    title: 'Cancellations',
    description: 'Get notified when a client cancels a booked session.',
  },
];

export default function NotificationSettingsScreen() {
  const insets         = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  const [values, setValues] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATIONS.map(n => [n.key, true])),
  );

  const bg          = isDarkMode ? '#111827' : '#F3F4F6';
  const headerBg    = isDarkMode ? '#1F2937' : '#FFFFFF';
  const cardBg      = isDarkMode ? '#1F2937' : '#FFFFFF';
  const borderColor = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const divColor    = isDarkMode ? '#374151' : '#F3F4F6';
  const trackOff    = isDarkMode ? '#374151' : '#E5E7EB';

  function toggle(key: string) {
    setValues(prev => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: headerBg, borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={24} color={textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>

        <Text style={[styles.hint, { color: textSub }]}>
          Choose which notifications you want to receive.
        </Text>

        <View style={[styles.card, { backgroundColor: cardBg }]}>
          {NOTIFICATIONS.map((item, i) => (
            <View key={item.key}>
              {i > 0 && <View style={[styles.divider, { backgroundColor: divColor }]} />}
              <TouchableOpacity
                style={styles.row}
                onPress={() => toggle(item.key)}
                activeOpacity={0.7}>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: textPrimary }]}>{item.title}</Text>
                  <Text style={[styles.rowDesc, { color: textSub }]}>{item.description}</Text>
                </View>
                <Switch
                  value={values[item.key]}
                  onValueChange={() => toggle(item.key)}
                  trackColor={{ false: trackOff, true: BLUE }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={trackOff}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginRight: 8,
  },
  headerSpacer: {
    width: 24,
  },

  scroll: {
    padding: 16,
    gap: 16,
  },

  hint: {
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 4,
  },

  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  rowText: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  rowDesc: {
    fontSize: 13,
    lineHeight: 18,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
});

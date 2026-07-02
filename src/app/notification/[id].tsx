import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNotifications } from '@/context/NotificationsContext';
import { useTheme } from '@/context/ThemeContext';

const BLUE = '#208AEF';

function notifTypeLabel(action: string): string {
  switch (action) {
    case 'View Booking': return 'Booking';
    case 'Reply':        return 'Message';
    case 'Write Review': return 'Review';
    case 'View Receipt': return 'Payment';
    default:             return 'Notification';
  }
}

export default function NotificationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notifications, markAsRead } = useNotifications();
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  const notif = notifications.find(n => n.id === id);

  useEffect(() => {
    if (id) markAsRead(id);
  }, [id]);

  const bg           = isDarkMode ? '#111827' : '#FFFFFF';
  const headerBorder = isDarkMode ? '#1F2937' : '#F3F4F6';
  const textPrimary  = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub      = isDarkMode ? '#9CA3AF' : '#6B7280';
  const divider      = isDarkMode ? '#1F2937' : '#F3F4F6';
  const outlinedBorder = isDarkMode ? '#374151' : '#E5E7EB';

  if (!notif) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: bg }]}>
        <TouchableOpacity
          style={[styles.backBtn, { marginTop: 8, marginLeft: 16 }]}
          onPress={() => router.back()}>
          <ChevronLeft size={24} color={textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: textSub }]}>Notification not found.</Text>
        </View>
      </View>
    );
  }

  const Icon   = notif.icon;
  const iconBg = isDarkMode ? notif.iconBgDark : notif.iconBg;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>

      {/* Header */}
      <View style={[styles.header, {
        paddingTop: insets.top + 8,
        backgroundColor: bg,
        borderBottomColor: headerBorder,
      }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={24} color={textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>
          {notifTypeLabel(notif.action)}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Icon */}
        <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
          <Icon size={34} color={notif.iconColor} strokeWidth={2} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: textPrimary }]}>{notif.title}</Text>

        {/* Datetime */}
        <Text style={[styles.datetime, { color: textSub }]}>{notif.datetime}</Text>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: divider }]} />

        {/* Body */}
        <Text style={[styles.body, { color: textPrimary }]}>{notif.body}</Text>

      </ScrollView>

      {/* Sticky bottom bar */}
      <View style={[styles.bottomBar, {
        paddingBottom: insets.bottom + 16,
        backgroundColor: bg,
        borderTopColor: headerBorder,
      }]}>
        {notif.action === 'View Booking' && (
          <>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.outlinedBtn, { borderColor: '#EF4444', flex: 1 }]}
                onPress={() => router.back()}
                activeOpacity={0.8}>
                <Text style={[styles.outlinedBtnText, { color: '#EF4444' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.outlinedBtn, { borderColor: BLUE, flex: 1 }]}
                onPress={() => router.back()}
                activeOpacity={0.8}>
                <Text style={[styles.outlinedBtnText, { color: BLUE }]}>Reschedule</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.back()} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>View Booking</Text>
            </TouchableOpacity>
          </>
        )}

        {notif.action === 'Reply' && notif.trainerId && (
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push(`/chat/${notif.trainerId}` as never)} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Reply</Text>
          </TouchableOpacity>
        )}

        {notif.action === 'Write Review' && (
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.back()} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Leave Review</Text>
          </TouchableOpacity>
        )}

        {notif.action === 'View Receipt' && (
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.back()} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>View Receipt</Text>
          </TouchableOpacity>
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 36,
  },

  // Not found
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 15,
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 24,
    alignItems: 'center',
  },

  // Icon
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  // Title & datetime
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  datetime: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 28,
  },

  // Divider
  divider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    marginBottom: 28,
  },

  // Body
  body: {
    fontSize: 15,
    lineHeight: 24,
    width: '100%',
  },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  outlinedBtn: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  outlinedBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

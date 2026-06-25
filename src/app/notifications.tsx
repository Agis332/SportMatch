import { router } from 'expo-router';
import { ChevronLeft, Settings, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNotifications, Notification } from '@/context/NotificationsContext';
import { useTheme } from '@/context/ThemeContext';

interface Pref {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

const INITIAL_PREFS: Pref[] = [
  { id: 'bookings',  title: 'Booking Confirmations', description: 'When a booking is confirmed or cancelled',    enabled: true  },
  { id: 'reminders', title: 'Session Reminders',      description: 'Reminders before upcoming training sessions', enabled: true  },
  { id: 'messages',  title: 'New Messages',            description: 'When a trainer sends you a message',         enabled: true  },
  { id: 'promos',    title: 'Promotions & Offers',    description: 'Special deals and discounts from trainers',   enabled: false },
  { id: 'payments',  title: 'Payment Updates',         description: 'Receipts and payment status updates',        enabled: true  },
  { id: 'tips',      title: 'Training Tips',           description: 'Weekly training tips and fitness insights',  enabled: false },
];


// ─── Preferences modal ────────────────────────────────────────────────────────

function PrefsModal({ isDarkMode, prefs, onToggle, onClose }: {
  isDarkMode: boolean;
  prefs: Pref[];
  onToggle: (id: string) => void;
  onClose: () => void;
}) {
  const sheetBg     = isDarkMode ? '#1F2937' : '#FFFFFF';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const divider     = isDarkMode ? '#374151' : '#F3F4F6';
  const switchOff   = isDarkMode ? '#374151' : '#E5E7EB';

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.prefsSheet, { backgroundColor: sheetBg }]} onPress={() => {}}>
          <View style={styles.sheetHandle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: textPrimary }]}>Notification Settings</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color={textSub} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Toggles */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.prefsList}>
            {prefs.map((pref, i) => (
              <View key={pref.id}>
                <View style={styles.prefRow}>
                  <View style={styles.prefText}>
                    <Text style={[styles.prefTitle, { color: textPrimary }]}>{pref.title}</Text>
                    <Text style={[styles.prefDesc, { color: textSub }]}>{pref.description}</Text>
                  </View>
                  <Switch
                    value={pref.enabled}
                    onValueChange={() => onToggle(pref.id)}
                    trackColor={{ false: switchOff, true: '#208AEF' }}
                    thumbColor="#FFFFFF"
                    ios_backgroundColor={switchOff}
                  />
                </View>
                {i < prefs.length - 1 && (
                  <View style={[styles.prefDivider, { backgroundColor: divider }]} />
                )}
              </View>
            ))}
          </ScrollView>

          {/* Save */}
          <TouchableOpacity style={styles.saveBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>Save Preferences</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState<Pref[]>(INITIAL_PREFS);

  function togglePref(id: string) {
    setPrefs(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  }

  const bg          = isDarkMode ? '#111827' : '#F3F4F6';
  const headerBg    = isDarkMode ? '#111827' : '#FFFFFF';
  const cardBg      = isDarkMode ? '#1F2937' : '#FFFFFF';
  const cardBorder  = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const borderColor = isDarkMode ? '#1F2937' : '#F3F4F6';
  const groupLabel  = isDarkMode ? '#6B7280' : '#9CA3AF';
  const unreadBg    = isDarkMode ? '#1E3A5F18' : '#EFF6FF';

  const today   = notifications.filter(n => n.group === 'today');
  const earlier = notifications.filter(n => n.group === 'earlier');

  function NotifCard({ notif }: { notif: Notification }) {
    const Icon = notif.icon;
    const iconBg = isDarkMode ? notif.iconBgDark : notif.iconBg;

    return (
      <TouchableOpacity
        style={[
          styles.notifCard,
          {
            backgroundColor: notif.read ? cardBg : unreadBg,
            shadowColor: isDarkMode ? '#000' : '#9CA3AF',
          },
        ]}
        onPress={() => { markAsRead(notif.id); router.push(`/notification/${notif.id}`); }}
        activeOpacity={0.7}>
        {/* Icon */}
        <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
          <Icon size={18} color={notif.iconColor} strokeWidth={2} />
        </View>

        {/* Content */}
        <View style={styles.notifBody}>
          <View style={styles.notifTitleRow}>
            <Text style={[styles.notifTitle, { color: textPrimary }, !notif.read && styles.notifTitleUnread]} numberOfLines={1}>
              {notif.title}
            </Text>
            <Text style={[styles.notifTime, { color: textSub }]}>{notif.time}</Text>
          </View>
          <Text style={[styles.notifDesc, { color: textSub }]} numberOfLines={2}>
            {notif.description}
          </Text>
        </View>

        {/* Unread dot */}
        {!notif.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: headerBg, borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={24} color={textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Notifications</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={markAllAsRead}
            disabled={unreadCount === 0}
            activeOpacity={0.7}>
            <Text style={[styles.markAllText, { color: unreadCount > 0 ? '#208AEF' : textSub }]}>
              Mark all
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowPrefs(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}>
            <Settings size={20} color={textSub} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}>

        {/* Today */}
        {today.length > 0 && (
          <View style={styles.group}>
            <Text style={[styles.groupLabel, { color: groupLabel }]}>Today</Text>
            {today.map(notif => <NotifCard key={notif.id} notif={notif} />)}
          </View>
        )}

        {/* Earlier */}
        {earlier.length > 0 && (
          <View style={styles.group}>
            <Text style={[styles.groupLabel, { color: groupLabel }]}>Earlier</Text>
            {earlier.map(notif => <NotifCard key={notif.id} notif={notif} />)}
          </View>
        )}

      </ScrollView>

      {showPrefs && (
        <PrefsModal
          isDarkMode={isDarkMode}
          prefs={prefs}
          onToggle={togglePref}
          onClose={() => setShowPrefs(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

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
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: 90,
    justifyContent: 'flex-end',
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Scroll
  scroll: {
    padding: 16,
    gap: 24,
  },

  // Group
  group: {
    gap: 10,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    paddingHorizontal: 4,
    marginBottom: 2,
  },

  // Notification card
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 12,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 6,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  notifBody: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  notifTitleUnread: {
    fontWeight: '700',
  },
  notifTime: {
    fontSize: 12,
    flexShrink: 0,
  },
  notifDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#208AEF',
    flexShrink: 0,
    marginTop: 6,
  },

  // Prefs modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  prefsSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    maxHeight: '85%',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  prefsList: {
    flexGrow: 0,
    marginBottom: 20,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 16,
  },
  prefText: {
    flex: 1,
    gap: 3,
  },
  prefTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  prefDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  prefDivider: {
    height: StyleSheet.hairlineWidth,
  },
  saveBtn: {
    backgroundColor: '#208AEF',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

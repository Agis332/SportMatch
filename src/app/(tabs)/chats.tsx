import { router, useFocusEffect } from 'expo-router';
import {
  BadgeCheck, Search, Settings, X,
} from 'lucide-react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { isConversationRead } from '@/store/read-conversations';
import { useNotifications, Notification } from '@/context/NotificationsContext';
import { useTheme } from '@/context/ThemeContext';
import {
  FlatList,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BLUE = '#208AEF';
const GRAY = '#6B7280';

// ── Conversation types & data ─────────────────────────────────────────────────

interface Conversation {
  id: string;
  name: string;
  initials: string;
  sport: string;
  lastMessage: string;
  timestamp: string;
  sortTime: number;
  unread: number;
  online: boolean;
  verified: boolean;
}

const CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'Rūta Kazlauskaitė',
    initials: 'RK',
    sport: 'Yoga',
    lastMessage: 'See you Thursday at 9am! Don\'t forget your mat 🧘',
    timestamp: '9:41 AM',
    sortTime: Date.parse('2026-06-23T09:41:00'),
    unread: 2,
    online: true,
    verified: true,
  },
  {
    id: '2',
    name: 'Mantas Petrauskas',
    initials: 'MP',
    sport: 'Football',
    lastMessage: 'Great session today. We\'ll work on passing drills next time.',
    timestamp: 'Yesterday',
    sortTime: Date.parse('2026-06-22T18:30:00'),
    unread: 0,
    online: false,
    verified: true,
  },
  {
    id: '3',
    name: 'Darius Paulauskas',
    initials: 'DP',
    sport: 'Boxing',
    lastMessage: 'Can you move Tuesday\'s session to 6pm instead?',
    timestamp: 'Yesterday',
    sortTime: Date.parse('2026-06-22T14:15:00'),
    unread: 1,
    online: true,
    verified: true,
  },
  {
    id: '4',
    name: 'Ingrida Vaitkutė',
    initials: 'IV',
    sport: 'Swimming',
    lastMessage: 'Your technique has improved a lot — keep it up!',
    timestamp: 'Sun',
    sortTime: Date.parse('2026-06-21T20:45:00'),
    unread: 0,
    online: false,
    verified: true,
  },
  {
    id: '5',
    name: 'Aistė Mikalauskaitė',
    initials: 'AM',
    sport: 'Tennis',
    lastMessage: 'Booking confirmed for Saturday 10am at Lazdynai courts.',
    timestamp: 'Sat',
    sortTime: Date.parse('2026-06-20T10:00:00'),
    unread: 0,
    online: false,
    verified: false,
  },
  {
    id: '6',
    name: 'Erikas Butkus',
    initials: 'EB',
    sport: 'Running',
    lastMessage: 'New training plan uploaded to your profile. Check it out!',
    timestamp: 'Sun',
    sortTime: Date.parse('2026-06-21T11:20:00'),
    unread: 3,
    online: false,
    verified: false,
  },
  {
    id: '7',
    name: 'Laura Stankevičiūtė',
    initials: 'LS',
    sport: 'CrossFit',
    lastMessage: 'Remember — rest day tomorrow. Don\'t skip it 💪',
    timestamp: 'Fri',
    sortTime: Date.parse('2026-06-19T16:50:00'),
    unread: 0,
    online: true,
    verified: false,
  },
  {
    id: '8',
    name: 'Tomas Žukauskas',
    initials: 'TŽ',
    sport: 'Basketball',
    lastMessage: 'Are you joining the group session on Friday?',
    timestamp: 'Thu',
    sortTime: Date.parse('2026-06-18T10:05:00'),
    unread: 0,
    online: false,
    verified: false,
  },
];

const AVATAR_COLORS = [
  '#B5C9E4', '#C8DDB5', '#E4CDB5', '#D4B5E4', '#B5E4D4',
  '#E4B5C8', '#C8B5E4', '#E4E4B5',
];

function avatarColor(id: string) {
  return AVATAR_COLORS[parseInt(id, 10) % AVATAR_COLORS.length];
}

const SPORT_EMOJI: Record<string, string> = {
  Yoga: '🧘',
  Football: '⚽',
  Boxing: '🥊',
  Swimming: '🏊',
  Tennis: '🎾',
  Running: '🏃',
  CrossFit: '💪',
  Basketball: '🏀',
};

// ── Notification prefs (local to this screen's settings modal) ────────────────

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

// ── ChatRow ───────────────────────────────────────────────────────────────────

function ChatRow({ item, unread, onPress }: { item: Conversation; unread: number; onPress: () => void }) {
  const { isDarkMode } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const ringColor = isDarkMode ? '#111827' : '#FFFFFF';
  const nameColor = isDarkMode ? '#FFFFFF' : '#111827';
  const previewColor = unread > 0
    ? (isDarkMode ? '#E5E7EB' : '#374151')
    : (isDarkMode ? '#6B7280' : '#9CA3AF');

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={styles.row}
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.98, { damping: 35, stiffness: 500 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 30, stiffness: 450 }); }}>
        <View style={styles.avatarWrap}>
          <View style={[styles.avatar, { backgroundColor: avatarColor(item.id) }]}>
            <Text style={styles.initials}>{item.initials}</Text>
          </View>
          {item.online && <View style={[styles.onlineDot, { borderColor: ringColor }]} />}
          {SPORT_EMOJI[item.sport] && (
            <View style={[styles.sportBadge, {
              backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
              borderColor: isDarkMode ? '#4B5563' : '#E0E0E0',
            }]}>
              <Text style={styles.sportEmoji}>{SPORT_EMOJI[item.sport]}</Text>
            </View>
          )}
        </View>

        <View style={styles.rowBody}>
          <View style={styles.rowTop}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: nameColor }]} numberOfLines={1}>{item.name}</Text>
              {item.verified && (
                <View style={[styles.verifiedWrap, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
                  <BadgeCheck size={16} color="#FFFFFF" fill="#22C55E" strokeWidth={2.5} />
                </View>
              )}
            </View>
            <Text style={[styles.timestamp, unread > 0 && styles.timestampUnread]}>
              {item.timestamp}
            </Text>
          </View>
          <View style={styles.rowBottom}>
            <Text style={[styles.preview, { color: previewColor }]} numberOfLines={1}>
              {item.lastMessage}
            </Text>
            {unread > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ── PrefsModal ────────────────────────────────────────────────────────────────

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

          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: textPrimary }]}>Notification Settings</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color={textSub} strokeWidth={2} />
            </TouchableOpacity>
          </View>

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
                    trackColor={{ false: switchOff, true: BLUE }}
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

          <TouchableOpacity style={styles.saveBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>Save Preferences</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ChatsScreen() {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const { width: screenWidth } = useWindowDimensions();

  const { notifications, markAsRead, unreadCount: notifUnreadCount } = useNotifications();

  const [query, setQuery] = useState('');
  const [, setReadTick] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState<Pref[]>(INITIAL_PREFS);

  const pageRef = useRef<ScrollView>(null);
  const underlineX = useSharedValue(0);
  const tabWidth = screenWidth / 2;

  useFocusEffect(
    useCallback(() => {
      setReadTick(n => n + 1);
    }, []),
  );

  const underlineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: underlineX.value }],
  }));

  function switchTab(index: number) {
    setActiveTab(index);
    underlineX.value = withTiming(index * tabWidth, { duration: 200 });
    pageRef.current?.scrollTo({ x: index * screenWidth, animated: true });
  }

  function handlePageScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const page = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    if (page !== activeTab) {
      setActiveTab(page);
      underlineX.value = withTiming(page * tabWidth, { duration: 150 });
    }
  }

  const conversations = useMemo(() => {
    const filtered = query.trim()
      ? CONVERSATIONS.filter(
          c =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.sport.toLowerCase().includes(query.toLowerCase()),
        )
      : CONVERSATIONS;
    return [...filtered].sort((a, b) => b.sortTime - a.sortTime);
  }, [query]);

  const totalUnread = CONVERSATIONS.reduce(
    (sum, c) => sum + (isConversationRead(c.id) ? 0 : c.unread),
    0,
  );

  function togglePref(id: string) {
    setPrefs(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  }

  const today   = notifications.filter(n => n.group === 'today');
  const earlier = notifications.filter(n => n.group === 'earlier');

  // Colors
  const bg             = isDarkMode ? '#111827' : '#FFFFFF';
  const textPrimary    = isDarkMode ? '#FFFFFF' : '#111827';
  const searchBg       = isDarkMode ? '#1F2937' : '#F3F4F6';
  const placeholderColor = isDarkMode ? '#6B7280' : '#9CA3AF';
  const tabBorderColor = isDarkMode ? '#1F2937' : '#F0F0F0';
  const tabInactiveColor = isDarkMode ? '#6B7280' : '#9CA3AF';
  const notifBg        = isDarkMode ? '#111827' : '#F3F4F6';
  const cardBg         = isDarkMode ? '#1F2937' : '#FFFFFF';
  const cardBorder     = isDarkMode ? '#374151' : '#F3F4F6';
  const textSub        = isDarkMode ? '#9CA3AF' : '#6B7280';
  const groupLabel     = isDarkMode ? '#6B7280' : '#9CA3AF';
  const unreadBg       = isDarkMode ? '#1E3A5F18' : '#EFF6FF';

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
        onPress={() => {
          markAsRead(notif.id);
          if (notif.action === 'Reply') {
            router.push('/chat/1');
          } else {
            router.push(`/notification/${notif.id}`);
          }
        }}
        activeOpacity={0.7}>
        <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
          <Icon size={18} color={notif.iconColor} strokeWidth={2} />
        </View>
        <View style={styles.notifBody}>
          <View style={styles.notifTitleRow}>
            <Text
              style={[styles.notifTitle, { color: textPrimary }, !notif.read && styles.notifTitleUnread]}
              numberOfLines={1}>
              {notif.title}
            </Text>
            <Text style={[styles.notifTime, { color: textSub }]}>{notif.time}</Text>
          </View>
          <Text style={[styles.notifDesc, { color: textSub }]} numberOfLines={2}>
            {notif.description}
          </Text>
        </View>
        {!notif.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[styles.container, { paddingTop: insets.top, backgroundColor: bg }]}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: textPrimary }]}>Inbox</Text>
          {activeTab === 0 && totalUnread > 0 && (
            <View style={styles.totalBadge}>
              <Text style={styles.totalBadgeText}>{totalUnread}</Text>
            </View>
          )}
          {activeTab === 1 && notifUnreadCount > 0 && (
            <View style={styles.totalBadge}>
              <Text style={styles.totalBadgeText}>{notifUnreadCount}</Text>
            </View>
          )}
        </View>
        {activeTab === 1 && (
          <TouchableOpacity
            onPress={() => setShowPrefs(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}>
            <Settings size={20} color={textSub} strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tab bar */}
      <View style={[styles.tabBar, { borderBottomColor: tabBorderColor }]}>
        <Pressable style={[styles.tabItem, { width: tabWidth }]} onPress={() => switchTab(0)}>
          <Text style={[styles.tabLabel, { color: activeTab === 0 ? BLUE : tabInactiveColor }]}>
            Chats
          </Text>
        </Pressable>
        <Pressable style={[styles.tabItem, { width: tabWidth }]} onPress={() => switchTab(1)}>
          <Text style={[styles.tabLabel, { color: activeTab === 1 ? BLUE : tabInactiveColor }]}>
            Notifications
          </Text>
        </Pressable>
        <Animated.View style={[styles.tabUnderline, { width: tabWidth }, underlineStyle]} />
      </View>

      {/* Paged content */}
      <ScrollView
        ref={pageRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handlePageScroll}
        style={styles.pager}>

        {/* Chats page */}
        <View style={{ width: screenWidth, flex: 1 }}>
          <View style={[styles.searchWrap, { backgroundColor: searchBg }]}>
            <Search size={15} color={placeholderColor} strokeWidth={2} />
            <TextInput
              style={[styles.searchInput, { color: textPrimary }]}
              placeholder="Search messages"
              placeholderTextColor={placeholderColor}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
          <FlatList
            data={conversations}
            keyExtractor={item => item.id}
            contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 16 }]}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No conversations found</Text>
              </View>
            }
            renderItem={({ item }) => (
              <ChatRow
                item={item}
                unread={isConversationRead(item.id) ? 0 : item.unread}
                onPress={() => router.push(`/chat/${item.id}`)}
              />
            )}
          />
        </View>

        {/* Notifications page */}
        <View style={{ width: screenWidth, flex: 1, backgroundColor: notifBg }}>
          <ScrollView
            contentContainerStyle={[styles.notifScroll, { paddingBottom: insets.bottom + 24 }]}
            showsVerticalScrollIndicator={false}>

            {today.length > 0 && (
              <View style={styles.group}>
                <Text style={[styles.groupLabel, { color: groupLabel }]}>Today</Text>
                {today.map(notif => <NotifCard key={notif.id} notif={notif} />)}
              </View>
            )}

            {earlier.length > 0 && (
              <View style={styles.group}>
                <Text style={[styles.groupLabel, { color: groupLabel }]}>Earlier</Text>
                {earlier.map(notif => <NotifCard key={notif.id} notif={notif} />)}
              </View>
            )}
          </ScrollView>
        </View>
      </ScrollView>

      {showPrefs && (
        <PrefsModal
          isDarkMode={isDarkMode}
          prefs={prefs}
          onToggle={togglePref}
          onClose={() => setShowPrefs(false)}
        />
      )}
    </Animated.View>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
  },
  totalBadge: {
    backgroundColor: BLUE,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  totalBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  notifHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    position: 'relative',
  },
  tabItem: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2,
    backgroundColor: BLUE,
    borderRadius: 1,
  },

  // Pager
  pager: {
    flex: 1,
  },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },

  // Chats list
  list: {
    paddingTop: 8,
  },

  // Chat row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  avatarWrap: {
    position: 'relative',
    flexShrink: 0,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },
  onlineDot: {
    position: 'absolute',
    top: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  sportBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sportEmoji: {
    fontSize: 11,
    lineHeight: 14,
  },
  rowBody: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  verifiedWrap: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    flexShrink: 1,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '400',
    flexShrink: 0,
  },
  timestampUnread: {
    color: BLUE,
    fontWeight: '600',
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  preview: {
    fontSize: 14,
    fontWeight: '400',
    flex: 1,
  },
  badge: {
    backgroundColor: BLUE,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Empty state
  empty: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: GRAY,
  },

  // Notifications
  notifScroll: {
    padding: 16,
    gap: 24,
  },
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
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 2,
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
    backgroundColor: BLUE,
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
    backgroundColor: BLUE,
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

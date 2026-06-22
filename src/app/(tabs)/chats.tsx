import { router, useFocusEffect } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { isConversationRead } from '@/store/read-conversations';
import { useTheme } from '@/context/ThemeContext';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BLUE = '#208AEF';
const GRAY = '#6B7280';
const LIGHT_BG = '#F3F4F6';

interface Conversation {
  id: string;
  name: string;
  initials: string;
  sport: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

const CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'Rūta Kazlauskaitė',
    initials: 'RK',
    sport: 'Yoga',
    lastMessage: 'See you Thursday at 9am! Don\'t forget your mat 🧘',
    timestamp: '9:41 AM',
    unread: 2,
    online: true,
  },
  {
    id: '2',
    name: 'Mantas Petrauskas',
    initials: 'MP',
    sport: 'Football',
    lastMessage: 'Great session today. We\'ll work on passing drills next time.',
    timestamp: 'Yesterday',
    unread: 0,
    online: false,
  },
  {
    id: '3',
    name: 'Darius Paulauskas',
    initials: 'DP',
    sport: 'Boxing',
    lastMessage: 'Can you move Tuesday\'s session to 6pm instead?',
    timestamp: 'Yesterday',
    unread: 1,
    online: true,
  },
  {
    id: '4',
    name: 'Ingrida Vaitkutė',
    initials: 'IV',
    sport: 'Swimming',
    lastMessage: 'Your technique has improved a lot — keep it up!',
    timestamp: 'Mon',
    unread: 0,
    online: false,
  },
  {
    id: '5',
    name: 'Aistė Mikalauskaitė',
    initials: 'AM',
    sport: 'Tennis',
    lastMessage: 'Booking confirmed for Saturday 10am at Lazdynai courts.',
    timestamp: 'Mon',
    unread: 0,
    online: false,
  },
  {
    id: '6',
    name: 'Erikas Butkus',
    initials: 'EB',
    sport: 'Running',
    lastMessage: 'New training plan uploaded to your profile. Check it out!',
    timestamp: 'Sun',
    unread: 3,
    online: false,
  },
  {
    id: '7',
    name: 'Laura Stankevičiūtė',
    initials: 'LS',
    sport: 'CrossFit',
    lastMessage: 'Remember — rest day tomorrow. Don\'t skip it 💪',
    timestamp: 'Sat',
    unread: 0,
    online: true,
  },
  {
    id: '8',
    name: 'Tomas Žukauskas',
    initials: 'TŽ',
    sport: 'Basketball',
    lastMessage: 'Are you joining the group session on Friday?',
    timestamp: 'Fri',
    unread: 0,
    online: false,
  },
];

const AVATAR_COLORS = [
  '#B5C9E4', '#C8DDB5', '#E4CDB5', '#D4B5E4', '#B5E4D4',
  '#E4B5C8', '#C8B5E4', '#E4E4B5',
];

function avatarColor(id: string) {
  return AVATAR_COLORS[parseInt(id, 10) % AVATAR_COLORS.length];
}

function ChatRow({ item, unread, onPress }: { item: Conversation; unread: number; onPress: () => void }) {
  const { isDarkMode } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

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
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={[styles.avatar, { backgroundColor: avatarColor(item.id) }]}>
            <Text style={styles.initials}>{item.initials}</Text>
          </View>
          {item.online && <View style={styles.onlineDot} />}
        </View>

        {/* Content */}
        <View style={styles.rowBody}>
          <View style={styles.rowTop}>
            <Text style={[styles.name, { color: nameColor }]} numberOfLines={1}>{item.name}</Text>
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

export default function ChatsScreen() {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const [query, setQuery] = useState('');
  const [, setReadTick] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setReadTick(n => n + 1);
    }, []),
  );

  const conversations = useMemo(
    () =>
      query.trim()
        ? CONVERSATIONS.filter(
            c =>
              c.name.toLowerCase().includes(query.toLowerCase()) ||
              c.sport.toLowerCase().includes(query.toLowerCase()),
          )
        : CONVERSATIONS,
    [query],
  );

  const totalUnread = CONVERSATIONS.reduce(
    (sum, c) => sum + (isConversationRead(c.id) ? 0 : c.unread),
    0,
  );

  const bg = isDarkMode ? '#111827' : '#FFFFFF';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const searchBg = isDarkMode ? '#1F2937' : '#F3F4F6';
  const placeholderColor = isDarkMode ? '#6B7280' : '#9CA3AF';

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[styles.container, { paddingTop: insets.top, backgroundColor: bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: textPrimary }]}>Messages</Text>
          {totalUnread > 0 && (
            <View style={styles.totalBadge}>
              <Text style={styles.totalBadgeText}>{totalUnread}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Search */}
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

      {/* List */}
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
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

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    padding: 0,
  },

  // List
  list: {
    paddingTop: 8,
  },

  // Row
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
    bottom: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
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
    color: '#9CA3AF',
    fontWeight: '400',
    flex: 1,
  },
  previewUnread: {
    color: '#374151',
    fontWeight: '500',
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

  // Empty
  empty: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: GRAY,
  },
});

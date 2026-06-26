import { router } from 'expo-router';
import { BadgeCheck, MessageSquare, Search } from 'lucide-react-native';
import { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';

const BLUE = '#208AEF';

interface Conversation {
  id: string;
  client: string;
  initials: string;
  color: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
  verified: boolean;
}

const CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    client: 'Jonas Kazlauskas',
    initials: 'JK',
    color: '#B5C9E4',
    lastMessage: "See you tomorrow at 10am! I'll be at the main gate.",
    timestamp: '10:14',
    unread: 1,
    online: true,
    verified: false,
  },
  {
    id: '2',
    client: 'Marta Petraitytė',
    initials: 'MP',
    color: '#C8DDB5',
    lastMessage: 'Thanks for the great session today! Really felt the difference.',
    timestamp: '09:30',
    unread: 0,
    online: true,
    verified: false,
  },
  {
    id: '3',
    client: 'Tomas Butkus',
    initials: 'TB',
    color: '#D4B5E4',
    lastMessage: 'Can we move tomorrow\'s session to 10am instead of 9?',
    timestamp: 'Yesterday',
    unread: 2,
    online: false,
    verified: false,
  },
  {
    id: '4',
    client: 'Rasa Mockutė',
    initials: 'RM',
    color: '#B5E4D4',
    lastMessage: 'Looking forward to Sunday! What should I bring?',
    timestamp: 'Yesterday',
    unread: 0,
    online: false,
    verified: false,
  },
  {
    id: '5',
    client: 'Viktorija Paulė',
    initials: 'VP',
    color: '#C8B5E4',
    lastMessage: "I've been doing the exercises you recommended every day.",
    timestamp: 'Jun 24',
    unread: 0,
    online: false,
    verified: false,
  },
  {
    id: '6',
    client: 'Eglė Jankutė',
    initials: 'EJ',
    color: '#E4CDB5',
    lastMessage: 'How many sessions do you recommend per week?',
    timestamp: 'Jun 22',
    unread: 0,
    online: true,
    verified: false,
  },
  {
    id: '7',
    client: 'Laurynas Grigas',
    initials: 'LG',
    color: '#E4E4B5',
    lastMessage: 'Confirmed for next Monday at 7:30am.',
    timestamp: 'Jun 20',
    unread: 0,
    online: false,
    verified: false,
  },
  {
    id: '8',
    client: 'Kristina Vaitkutė',
    initials: 'KV',
    color: '#B5D4E4',
    lastMessage: 'Just booked a session for July 2nd!',
    timestamp: 'Jun 18',
    unread: 0,
    online: false,
    verified: false,
  },
];

export default function TrainerMessagesScreen() {
  const insets         = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  const [query, setQuery] = useState('');

  const bg          = isDarkMode ? '#111827' : '#F3F4F6';
  const headerBg    = isDarkMode ? '#111827' : '#FFFFFF';
  const cardBg      = isDarkMode ? '#1F2937' : '#FFFFFF';
  const borderColor = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const inputBg     = isDarkMode ? '#1F2937' : '#F3F4F6';
  const inputBorder = isDarkMode ? '#374151' : 'transparent';

  const totalUnread = CONVERSATIONS.reduce((n, c) => n + c.unread, 0);

  const filtered = CONVERSATIONS.filter(c =>
    c.client.toLowerCase().includes(query.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: headerBg, borderBottomColor: borderColor }]}>
        <MessageSquare size={18} color={BLUE} strokeWidth={2} />
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Messages</Text>
        {totalUnread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{totalUnread}</Text>
          </View>
        )}
      </View>

      {/* Search */}
      <View style={[styles.searchWrapper, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
        <View style={[styles.searchBar, { backgroundColor: inputBg, borderColor: inputBorder }]}>
          <Search size={15} color={textSub} strokeWidth={2} />
          <TextInput
            style={[styles.searchInput, { color: textPrimary }]}
            value={query}
            onChangeText={setQuery}
            placeholder="Search messages…"
            placeholderTextColor={textSub}
            returnKeyType="search"
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 32 }]}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: borderColor, marginLeft: 72 + 16 }]} />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: textSub }]}>No conversations found</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, { backgroundColor: cardBg }]}
            onPress={() => router.push(`/chats/${item.id}` as never)}
            activeOpacity={0.75}>

            {/* Avatar */}
            <View style={styles.avatarWrap}>
              <View style={[styles.avatar, { backgroundColor: item.color }]}>
                <Text style={styles.avatarText}>{item.initials}</Text>
              </View>
              {item.online && <View style={styles.onlineDot} />}
            </View>

            {/* Content */}
            <View style={styles.content}>
              <View style={styles.topRow}>
                <View style={styles.nameRow}>
                  <Text style={[styles.clientName, { color: textPrimary }, item.unread > 0 && styles.clientNameBold]}>
                    {item.client}
                  </Text>
                  {item.verified && (
                    <BadgeCheck size={13} color={BLUE} strokeWidth={2} />
                  )}
                </View>
                <Text style={[styles.timestamp, { color: textSub }]}>{item.timestamp}</Text>
              </View>
              <View style={styles.bottomRow}>
                <Text
                  style={[styles.lastMessage, { color: item.unread > 0 ? textPrimary : textSub }, item.unread > 0 && styles.lastMessageBold]}
                  numberOfLines={1}>
                  {item.lastMessage}
                </Text>
                {item.unread > 0 && (
                  <View style={styles.unreadDot}>
                    <Text style={styles.unreadDotText}>{item.unread}</Text>
                  </View>
                )}
              </View>
            </View>

          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: BLUE,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },

  list: {
    paddingTop: 8,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '500',
  },
  clientNameBold: {
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
  },
  lastMessageBold: {
    fontWeight: '500',
  },
  unreadDot: {
    backgroundColor: BLUE,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  unreadDotText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  emptyState: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});

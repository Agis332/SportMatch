import { CalendarDays, Clock, MapPin } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';

const BLUE  = '#208AEF';
const AMBER = '#F59E0B';

type Filter = 'upcoming' | 'past';

interface Session {
  id: string;
  client: string;
  initials: string;
  color: string;
  sport: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  type: 'Individual' | 'Group';
}

const SESSIONS: Session[] = [
  {
    id: '1',
    client: 'Jonas Kazlauskas',
    initials: 'JK',
    color: '#B5C9E4',
    sport: '⚽ Football',
    date: 'Today',
    time: '10:00',
    duration: '60 min',
    location: 'Vingis Park, Vilnius',
    status: 'confirmed',
    type: 'Individual',
  },
  {
    id: '2',
    client: 'Marta Petraitytė',
    initials: 'MP',
    color: '#C8DDB5',
    sport: '🏃 Running',
    date: 'Today',
    time: '14:00',
    duration: '45 min',
    location: 'Sereikiškių Park, Vilnius',
    status: 'confirmed',
    type: 'Individual',
  },
  {
    id: '3',
    client: 'Tomas Butkus',
    initials: 'TB',
    color: '#D4B5E4',
    sport: '⚽ Football',
    date: 'Tomorrow',
    time: '09:00',
    duration: '60 min',
    location: 'Vingis Park, Vilnius',
    status: 'pending',
    type: 'Individual',
  },
  {
    id: '4',
    client: 'Rasa Mockutė',
    initials: 'RM',
    color: '#B5E4D4',
    sport: '🏃 Running',
    date: 'Jun 28',
    time: '11:00',
    duration: '45 min',
    location: 'Sereikiškių Park, Vilnius',
    status: 'confirmed',
    type: 'Individual',
  },
  {
    id: '5',
    client: 'Viktorija Paulė',
    initials: 'VP',
    color: '#C8B5E4',
    sport: '💪 CrossFit',
    date: 'Jun 29',
    time: '08:30',
    duration: '60 min',
    location: 'FitSpace Gym, Vilnius',
    status: 'confirmed',
    type: 'Group',
  },
  {
    id: '6',
    client: 'Kristina Vaitkutė',
    initials: 'KV',
    color: '#B5D4E4',
    sport: '⚽ Football',
    date: 'Jul 2',
    time: '10:00',
    duration: '60 min',
    location: 'Vingis Park, Vilnius',
    status: 'pending',
    type: 'Individual',
  },
  {
    id: '7',
    client: 'Eglė Jankutė',
    initials: 'EJ',
    color: '#E4CDB5',
    sport: '💪 CrossFit',
    date: 'Jun 24',
    time: '08:00',
    duration: '60 min',
    location: 'FitSpace Gym, Vilnius',
    status: 'completed',
    type: 'Group',
  },
  {
    id: '8',
    client: 'Andrius Stankus',
    initials: 'AS',
    color: '#E4B5C8',
    sport: '⚽ Football',
    date: 'Jun 22',
    time: '16:00',
    duration: '60 min',
    location: 'Vingis Park, Vilnius',
    status: 'completed',
    type: 'Group',
  },
  {
    id: '9',
    client: 'Laurynas Grigas',
    initials: 'LG',
    color: '#E4E4B5',
    sport: '🏃 Running',
    date: 'Jun 20',
    time: '07:30',
    duration: '45 min',
    location: 'Sereikiškių Park, Vilnius',
    status: 'completed',
    type: 'Individual',
  },
  {
    id: '10',
    client: 'Darius Paulauskas',
    initials: 'DP',
    color: '#E4B5B5',
    sport: '💪 CrossFit',
    date: 'Jun 18',
    time: '10:00',
    duration: '60 min',
    location: 'FitSpace Gym, Vilnius',
    status: 'cancelled',
    type: 'Group',
  },
];

const STATUS_META = {
  confirmed: { label: 'Confirmed', color: '#16A34A', bg: '#DCFCE7' },
  pending:   { label: 'Pending',   color: '#D97706', bg: '#FEF9C3' },
  completed: { label: 'Completed', color: '#2563EB', bg: '#DBEAFE' },
  cancelled: { label: 'Cancelled', color: '#DC2626', bg: '#FEE2E2' },
};

export default function SessionsScreen() {
  const insets         = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  const [filter, setFilter] = useState<Filter>('upcoming');

  const bg          = isDarkMode ? '#111827' : '#F3F4F6';
  const headerBg    = isDarkMode ? '#111827' : '#FFFFFF';
  const cardBg      = isDarkMode ? '#1F2937' : '#FFFFFF';
  const borderColor = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const divColor    = isDarkMode ? '#374151' : '#F3F4F6';

  const upcoming = SESSIONS.filter(s => s.status === 'confirmed' || s.status === 'pending');
  const past     = SESSIONS.filter(s => s.status === 'completed' || s.status === 'cancelled');
  const list     = filter === 'upcoming' ? upcoming : past;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: headerBg, borderBottomColor: borderColor }]}>
        <CalendarDays size={18} color={BLUE} strokeWidth={2} />
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Sessions</Text>
        <View style={[styles.countBadge, { backgroundColor: isDarkMode ? '#1E3A5F' : '#EFF6FF' }]}>
          <Text style={[styles.countText, { color: BLUE }]}>{upcoming.length}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>

        {/* Filter tabs */}
        <View style={[styles.tabs, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}>
          {(['upcoming', 'past'] as Filter[]).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.tab, filter === f && { backgroundColor: cardBg }]}
              onPress={() => setFilter(f)}
              activeOpacity={0.7}>
              <Text style={[
                styles.tabText,
                { color: filter === f ? textPrimary : textSub },
                filter === f && styles.tabTextActive,
              ]}>
                {f === 'upcoming' ? `Upcoming (${upcoming.length})` : `Past (${past.length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sessions list */}
        {list.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor }]}>
            <Text style={[styles.emptyText, { color: textSub }]}>No {filter} sessions</Text>
          </View>
        ) : (
          list.map(session => {
            const meta = STATUS_META[session.status];
            return (
              <TouchableOpacity
                key={session.id}
                style={[styles.sessionCard, { backgroundColor: cardBg, borderColor }]}
                activeOpacity={0.75}>

                {/* Date + status row */}
                <View style={styles.sessionTop}>
                  <View style={styles.dateRow}>
                    <Clock size={13} color={session.status === 'pending' ? AMBER : BLUE} strokeWidth={2} />
                    <Text style={[styles.sessionDate, { color: textSub }]}>{session.date}</Text>
                    <Text style={[styles.sessionTime, { color: textPrimary }]}>{session.time}</Text>
                    <Text style={[styles.sessionDuration, { color: textSub }]}>· {session.duration}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
                    <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: divColor }]} />

                {/* Client info */}
                <View style={styles.sessionBody}>
                  <View style={[styles.avatar, { backgroundColor: session.color }]}>
                    <Text style={styles.avatarText}>{session.initials}</Text>
                  </View>
                  <View style={styles.clientInfo}>
                    <View style={styles.clientNameRow}>
                      <Text style={[styles.clientName, { color: textPrimary }]}>{session.client}</Text>
                      <View style={[styles.typeBadge, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}>
                        <Text style={[styles.typeText, { color: textSub }]}>{session.type}</Text>
                      </View>
                    </View>
                    <Text style={[styles.sport, { color: textSub }]}>{session.sport}</Text>
                    <View style={styles.locationRow}>
                      <MapPin size={12} color={textSub} strokeWidth={2} />
                      <Text style={[styles.location, { color: textSub }]} numberOfLines={1}>
                        {session.location}
                      </Text>
                    </View>
                  </View>
                </View>

              </TouchableOpacity>
            );
          })
        )}

      </ScrollView>
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
  countBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  countText: {
    fontSize: 13,
    fontWeight: '700',
  },

  scroll: {
    padding: 16,
    gap: 10,
  },

  tabs: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    gap: 2,
    marginBottom: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
  },
  tabTextActive: {
    fontWeight: '600',
  },

  sessionCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sessionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sessionDate: {
    fontSize: 13,
  },
  sessionTime: {
    fontSize: 14,
    fontWeight: '700',
  },
  sessionDuration: {
    fontSize: 13,
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 14,
  },
  sessionBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  clientInfo: {
    flex: 1,
    gap: 3,
  },
  clientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '600',
  },
  typeBadge: {
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  sport: {
    fontSize: 13,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  location: {
    fontSize: 12,
    flex: 1,
  },

  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 36,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});

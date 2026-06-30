import { router, useLocalSearchParams } from 'expo-router';
import { CalendarDays, Clock, MapPin } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

import { useTheme } from '@/context/ThemeContext';
import { Session, STATUS_META, useTrainerProfile } from '@/context/TrainerProfileContext';

const BLUE  = '#208AEF';
const AMBER = '#F59E0B';

type Filter = 'new' | 'upcoming' | 'past';

export default function SessionsScreen() {
  const insets         = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const { sessions, setSessions } = useTrainerProfile();

  const { tab } = useLocalSearchParams<{ tab?: string }>();

  const [filter, setFilter] = useState<Filter>(
    tab === 'past' ? 'past' : tab === 'upcoming' ? 'upcoming' : 'new',
  );

  useEffect(() => {
    if (tab === 'past')     setFilter('past');
    if (tab === 'upcoming') setFilter('upcoming');
  }, [tab]);

  const bg          = isDarkMode ? '#111827' : '#F3F4F6';
  const headerBg    = isDarkMode ? '#111827' : '#FFFFFF';
  const cardBg      = isDarkMode ? '#1F2937' : '#FFFFFF';
  const borderColor = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const divColor    = isDarkMode ? '#374151' : '#F3F4F6';

  const todayStr = new Date().toISOString().slice(0, 10);

  const newOrders      = sessions.filter(s => s.status === 'pending');
  const upcoming       = sessions
    .filter(s => s.status === 'confirmed' && s.sortDate >= todayStr)
    .sort((a, b) =>
      new Date(`${a.sortDate}T${a.time}`).getTime() -
      new Date(`${b.sortDate}T${b.time}`).getTime()
    );
  const todaySessions  = upcoming.filter(s => s.sortDate === todayStr);
  const futureSessions = upcoming.filter(s => s.sortDate >  todayStr);
  const past           = sessions.filter(s => s.status === 'completed' || s.status === 'cancelled');
  const flatList       = filter === 'new' ? newOrders : past;

  function handleConfirm(id: string) {
    setSessions(prev =>
      prev.map(s => s.id === id ? { ...s, status: 'confirmed' } : s),
    );
  }

  function handleDecline(id: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSessions(prev => prev.filter(s => s.id !== id));
  }

  const emptyLabel = filter === 'new' ? 'new requests' : 'past sessions';

  const renderCard = (session: Session) => {
    const isPending = session.status === 'pending';
    const meta      = STATUS_META[session.status];
    return (
      <TouchableOpacity
        key={session.id}
        style={[
          styles.sessionCard,
          { backgroundColor: cardBg, borderColor },
          isPending && { borderColor: '#F59E0B', borderWidth: 1.5 },
        ]}
        onPress={() => router.push({
          pathname: '/trainer-mode/session-detail',
          params: {
            id: session.id,
            client: session.client,
            initials: session.initials,
            status: session.status,
            sport: session.sport,
            date: session.date,
            time: session.time,
            duration: session.duration,
            location: session.location,
            type: session.type,
            price: session.price,
            color: session.color,
          },
        })}
        activeOpacity={0.75}>

        <View style={styles.sessionTop}>
          <View style={styles.dateRow}>
            <Clock size={13} color={isPending ? AMBER : BLUE} strokeWidth={2} />
            <Text style={[styles.sessionDate, { color: textSub }]}>{session.date}</Text>
            <Text style={[styles.sessionTime, { color: isPending ? '#D97706' : textPrimary }]}>{session.time}</Text>
            <Text style={[styles.sessionDuration, { color: textSub }]}>· {session.duration}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
            <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: isPending ? '#FEF3C7' : divColor }]} />

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

        {isPending && (
          <>
            <View style={[styles.divider, { backgroundColor: '#FEF3C7' }]} />
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.cardDeclineBtn}
                onPress={() => handleDecline(session.id)}
                activeOpacity={0.7}>
                <Text style={styles.cardDeclineBtnText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cardConfirmBtn}
                onPress={() => handleConfirm(session.id)}
                activeOpacity={0.85}>
                <Text style={styles.cardConfirmBtnText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: headerBg, borderBottomColor: borderColor }]}>
        <CalendarDays size={18} color={BLUE} strokeWidth={2} />
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Sessions</Text>
        <View style={[styles.headerCountPill, {
          backgroundColor: filter === 'new' ? '#FFF3E0' : filter === 'upcoming' ? '#F0FDF4' : '#EBF5FF',
        }]}>
          <Text style={[styles.headerCountText, {
            color: filter === 'new' ? AMBER : filter === 'upcoming' ? '#22C55E' : BLUE,
          }]}>
            {filter === 'new'
              ? `${newOrders.length} new requests`
              : filter === 'upcoming'
              ? `${upcoming.length} clients awaiting`
              : `${past.length} clients trained`}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>

        {/* Filter tabs */}
        <View style={[styles.tabs, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}>

          <TouchableOpacity
            style={[styles.tab, filter === 'new' && { backgroundColor: cardBg }]}
            onPress={() => setFilter('new')}
            activeOpacity={0.7}>
            <View style={styles.tabInner}>
              <Text style={[
                styles.tabText,
                { color: filter === 'new' ? textPrimary : textSub },
                filter === 'new' && styles.tabTextActive,
              ]}>
                New
              </Text>
              {newOrders.length > 0 && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>{newOrders.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, filter === 'upcoming' && { backgroundColor: cardBg }]}
            onPress={() => setFilter('upcoming')}
            activeOpacity={0.7}>
            <View style={styles.tabInner}>
              <Text style={[
                styles.tabText,
                { color: filter === 'upcoming' ? textPrimary : textSub },
                filter === 'upcoming' && styles.tabTextActive,
              ]}>
                Upcoming
              </Text>
              {upcoming.length > 0 && (
                <View style={styles.upcomingBadge}>
                  <Text style={styles.upcomingBadgeText}>{upcoming.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, filter === 'past' && { backgroundColor: cardBg }]}
            onPress={() => setFilter('past')}
            activeOpacity={0.7}>
            <Text style={[
              styles.tabText,
              { color: filter === 'past' ? textPrimary : textSub },
              filter === 'past' && styles.tabTextActive,
            ]}>
              Past
            </Text>
          </TouchableOpacity>

        </View>

        {/* Sessions list */}
        {filter === 'upcoming' ? (
          todaySessions.length === 0 && futureSessions.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor }]}>
              <Text style={[styles.emptyText, { color: textSub }]}>No upcoming sessions</Text>
            </View>
          ) : (
            <>
              {todaySessions.length > 0 && (
                <>
                  <Text style={styles.todayLabel}>Today's Sessions</Text>
                  <View style={styles.todayContainer}>
                    {todaySessions.map(renderCard)}
                  </View>
                </>
              )}
              {futureSessions.length > 0 && (
                <>
                  <Text style={[styles.sectionHeader, { color: textPrimary }]}>Upcoming</Text>
                  {futureSessions.map(renderCard)}
                </>
              )}
            </>
          )
        ) : filter === 'past' ? (
          flatList.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor }]}>
              <Text style={[styles.emptyText, { color: textSub }]}>No past sessions</Text>
            </View>
          ) : (
            <>
              {flatList.map(renderCard)}
            </>
          )
        ) : (
          flatList.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor }]}>
              <Text style={[styles.emptyText, { color: textSub }]}>No {emptyLabel}</Text>
            </View>
          ) : (
            flatList.map(renderCard)
          )
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
  headerCountPill: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  headerCountText: {
    fontSize: 13,
    fontWeight: '600',
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
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  tabText: {
    fontSize: 13,
  },
  tabTextActive: {
    fontWeight: '600',
  },
  newBadge: {
    backgroundColor: AMBER,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  upcomingBadge: {
    backgroundColor: '#22C55E',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  upcomingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  sessionCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  todayLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#22C55E',
    letterSpacing: 0.2,
  },
  todayContainer: {
    borderWidth: 2,
    borderColor: '#22C55E',
    borderRadius: 16,
    overflow: 'hidden',
    gap: 6,
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

  cardActions: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  cardDeclineBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#DC2626',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cardDeclineBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
  cardConfirmBtn: {
    flex: 2,
    backgroundColor: BLUE,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cardConfirmBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
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


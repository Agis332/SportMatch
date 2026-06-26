import { router } from 'expo-router';
import { Calendar, ChevronLeft, ChevronRight, Clock, DollarSign, Dumbbell, MapPin, Star, Users } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';

const BLUE = '#208AEF';

const STATS = [
  { label: "Today's sessions", value: '2',    unit: '',    icon: Calendar,     color: BLUE,      bg: '#EFF6FF', darkBg: '#1E3A5F', route: null                  },
  { label: 'Week earnings',    value: '€140', unit: '',    icon: DollarSign,   color: '#22C55E', bg: '#F0FDF4', darkBg: '#052E16', route: '/trainer/earnings'   },
  { label: 'Total clients',    value: '8',    unit: '',    icon: Users,        color: '#8B5CF6', bg: '#EDE9FE', darkBg: '#2E1065', route: null                  },
  { label: 'Rating',           value: '4.8',  unit: '★',   icon: Star,         color: '#F59E0B', bg: '#FFFBEB', darkBg: '#451A03', route: '/trainer/reviews'    },
];

const ACTIONS = [
  { label: 'Set Availability', emoji: '📅', route: '/trainer/availability' },
  { label: 'View Bookings',    emoji: '📋', route: '/bookings'             },
  { label: 'Manage Profile',   emoji: '✏️',  route: '/trainer/manage-profile' },
  { label: 'View Earnings',    emoji: '💰', route: '/trainer/earnings'    },
  { label: 'My Reviews',      emoji: '⭐', route: '/trainer/reviews'     },
];

const TODAY_SESSIONS = [
  {
    id: '1',
    client: 'Jonas Kazlauskas',
    sport: '⚽ Football',
    time: '10:00',
    duration: '60 min',
    location: 'Vingis Park, Vilnius',
    status: 'confirmed',
  },
  {
    id: '2',
    client: 'Marta Petraitytė',
    sport: '🏃 Running',
    time: '14:00',
    duration: '45 min',
    location: 'Sereikiškių Park, Vilnius',
    status: 'confirmed',
  },
];

export default function TrainerDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  const bg          = isDarkMode ? '#111827' : '#F3F4F6';
  const headerBg    = isDarkMode ? '#111827' : '#FFFFFF';
  const cardBg      = isDarkMode ? '#1F2937' : '#FFFFFF';
  const borderColor = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const divColor    = isDarkMode ? '#374151' : '#F3F4F6';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: headerBg, borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={24} color={textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Dumbbell size={16} color={BLUE} strokeWidth={2} />
          <Text style={[styles.headerTitle, { color: textPrimary }]}>Trainer Dashboard</Text>
        </View>
        <View style={styles.navBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}>

        {/* Greeting */}
        <View style={[styles.greetCard, { backgroundColor: BLUE }]}>
          <View>
            <Text style={styles.greetTitle}>Good morning! 👋</Text>
            <Text style={styles.greetSub}>You have 2 sessions today</Text>
          </View>
          <TouchableOpacity
            style={styles.availBtn}
            onPress={() => router.push('/trainer/availability')}
            activeOpacity={0.85}>
            <Text style={styles.availBtnText}>Availability</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {STATS.map(stat => {
            const Icon = stat.icon;
            const card = (
              <>
                <View style={[styles.statIcon, { backgroundColor: isDarkMode ? stat.darkBg : stat.bg }]}>
                  <Icon size={16} color={stat.color} strokeWidth={2} />
                </View>
                <Text style={[styles.statValue, { color: textPrimary }]}>
                  {stat.unit}{stat.value}
                </Text>
                <Text style={[styles.statLabel, { color: textSub }]}>{stat.label}</Text>
              </>
            );
            return stat.route ? (
              <TouchableOpacity
                key={stat.label}
                style={[styles.statCard, { backgroundColor: cardBg, borderColor }]}
                onPress={() => router.push(stat.route as never)}
                activeOpacity={0.75}>
                {card}
              </TouchableOpacity>
            ) : (
              <View key={stat.label} style={[styles.statCard, { backgroundColor: cardBg, borderColor }]}>
                {card}
              </View>
            );
          })}
        </View>

        {/* Quick actions */}
        <Text style={[styles.sectionLabel, { color: textSub }]}>QUICK ACTIONS</Text>
        <View style={[styles.actionsCard, { backgroundColor: cardBg, borderColor }]}>
          {ACTIONS.map((action, i) => (
            <View key={action.label}>
              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => action.route && router.push(action.route as never)}
                activeOpacity={0.7}>
                <Text style={styles.actionEmoji}>{action.emoji}</Text>
                <Text style={[styles.actionLabel, { color: textPrimary }]}>{action.label}</Text>
                <ChevronRight size={16} color={textSub} strokeWidth={2} />
              </TouchableOpacity>
              {i < ACTIONS.length - 1 && (
                <View style={[styles.divider, { backgroundColor: divColor, marginHorizontal: 16 }]} />
              )}
            </View>
          ))}
        </View>

        {/* Today's sessions */}
        <Text style={[styles.sectionLabel, { color: textSub }]}>TODAY'S SESSIONS</Text>
        {TODAY_SESSIONS.map((session, i) => (
          <View
            key={session.id}
            style={[styles.sessionCard, { backgroundColor: cardBg, borderColor }]}>
            {/* Time + status */}
            <View style={styles.sessionHeader}>
              <View style={styles.sessionTimeRow}>
                <Clock size={14} color={BLUE} strokeWidth={2} />
                <Text style={[styles.sessionTime, { color: BLUE }]}>{session.time}</Text>
                <Text style={[styles.sessionDuration, { color: textSub }]}>· {session.duration}</Text>
              </View>
              <View style={styles.confirmedBadge}>
                <Text style={styles.confirmedText}>Confirmed</Text>
              </View>
            </View>

            <View style={[styles.sessionDivider, { backgroundColor: divColor }]} />

            {/* Client + sport */}
            <View style={styles.sessionBody}>
              <View style={[styles.clientAvatar, { backgroundColor: i === 0 ? '#B5C9E4' : '#C8DDB5' }]}>
                <Text style={styles.clientInitials}>
                  {session.client.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              <View style={styles.clientInfo}>
                <Text style={[styles.clientName, { color: textPrimary }]}>{session.client}</Text>
                <Text style={[styles.sessionSport, { color: textSub }]}>{session.sport}</Text>
                <View style={styles.locationRow}>
                  <MapPin size={12} color={textSub} strokeWidth={2} />
                  <Text style={[styles.locationText, { color: textSub }]} numberOfLines={1}>
                    {session.location}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}

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
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navBtn: {
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },

  scroll: {
    padding: 16,
    gap: 12,
  },

  // Greeting
  greetCard: {
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  greetSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  availBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  availBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '47.5%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 7,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.7,
    paddingHorizontal: 4,
    marginBottom: -2,
  },

  // Actions
  actionsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  actionEmoji: {
    fontSize: 19,
    width: 26,
    textAlign: 'center',
  },
  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },

  // Session cards
  sessionCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  sessionTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sessionTime: {
    fontSize: 14,
    fontWeight: '700',
  },
  sessionDuration: {
    fontSize: 13,
  },
  confirmedBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  confirmedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16A34A',
  },
  sessionDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 14,
  },
  sessionBody: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  clientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  clientInitials: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  clientInfo: {
    flex: 1,
    gap: 3,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '600',
  },
  sessionSport: {
    fontSize: 13,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  locationText: {
    fontSize: 12,
    flex: 1,
  },
});

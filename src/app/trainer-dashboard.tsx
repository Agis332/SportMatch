import { router } from 'expo-router';
import { Calendar, ChevronLeft, ChevronRight, DollarSign, Dumbbell, Star, Users } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';

const BLUE = '#208AEF';

const STATS = [
  { label: 'Sessions', value: '0',    icon: Calendar,    color: BLUE,      bg: '#EFF6FF',  darkBg: '#1E3A5F' },
  { label: 'Clients',  value: '0',    icon: Users,       color: '#22C55E', bg: '#F0FDF4',  darkBg: '#052E16' },
  { label: 'Rating',   value: '—',    icon: Star,        color: '#F59E0B', bg: '#FFFBEB',  darkBg: '#451A03' },
  { label: 'Earnings', value: '€0',   icon: DollarSign,  color: '#8B5CF6', bg: '#EDE9FE',  darkBg: '#2E1065' },
];

const QUICK_ACTIONS = [
  { label: 'Set Availability',   emoji: '📅' },
  { label: 'View Bookings',      emoji: '📋' },
  { label: 'Manage Clients',     emoji: '👥' },
  { label: 'Edit Profile',       emoji: '✏️'  },
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
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Trainer Dashboard</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}>

        {/* Welcome banner */}
        <View style={[styles.banner, { backgroundColor: BLUE }]}>
          <View style={styles.bannerIcon}>
            <Dumbbell size={24} color="#FFFFFF" strokeWidth={2} />
          </View>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Welcome, Trainer!</Text>
            <Text style={styles.bannerSub}>Your dashboard is ready. Start by setting up your profile.</Text>
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {STATS.map(stat => {
            const Icon = stat.icon;
            return (
              <View key={stat.label} style={[styles.statCard, { backgroundColor: cardBg, borderColor }]}>
                <View style={[styles.statIcon, { backgroundColor: isDarkMode ? stat.darkBg : stat.bg }]}>
                  <Icon size={18} color={stat.color} strokeWidth={2} />
                </View>
                <Text style={[styles.statValue, { color: textPrimary }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: textSub }]}>{stat.label}</Text>
              </View>
            );
          })}
        </View>

        {/* Quick actions */}
        <Text style={[styles.sectionTitle, { color: textSub }]}>QUICK ACTIONS</Text>
        <View style={[styles.actionsCard, { backgroundColor: cardBg, borderColor }]}>
          {QUICK_ACTIONS.map((action, i) => (
            <View key={action.label}>
              <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
                <Text style={styles.actionEmoji}>{action.emoji}</Text>
                <Text style={[styles.actionLabel, { color: textPrimary }]}>{action.label}</Text>
                <ChevronRight size={16} color={textSub} strokeWidth={2} />
              </TouchableOpacity>
              {i < QUICK_ACTIONS.length - 1 && (
                <View style={[styles.divider, { backgroundColor: borderColor }]} />
              )}
            </View>
          ))}
        </View>

        {/* Setup prompt */}
        <View style={[styles.setupCard, { backgroundColor: isDarkMode ? '#1E3A5F' : '#EFF6FF', borderColor: isDarkMode ? '#1E3A5F' : '#BFDBFE' }]}>
          <Text style={[styles.setupTitle, { color: BLUE }]}>Complete your trainer profile</Text>
          <Text style={[styles.setupSub, { color: isDarkMode ? '#93C5FD' : '#3B82F6' }]}>
            Add your bio, certifications, and photos to start attracting clients.
          </Text>
          <TouchableOpacity
            style={styles.setupBtn}
            onPress={() => router.push('/edit-profile')}
            activeOpacity={0.85}>
            <Text style={styles.setupBtnText}>Set Up Profile</Text>
          </TouchableOpacity>
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

  scroll: {
    padding: 16,
    gap: 16,
  },

  // Banner
  banner: {
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  bannerText: {
    flex: 1,
    gap: 4,
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bannerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
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
    padding: 16,
    gap: 8,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Quick actions
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.7,
    paddingHorizontal: 4,
    marginBottom: -4,
  },
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
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },

  // Setup card
  setupCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 8,
  },
  setupTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  setupSub: {
    fontSize: 13,
    lineHeight: 19,
  },
  setupBtn: {
    marginTop: 6,
    backgroundColor: BLUE,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  setupBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

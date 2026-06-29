import { router } from 'expo-router';
import {
  Bell,
  BookOpen,
  ChevronRight,
  CreditCard,
  DollarSign,
  Dumbbell,
  Edit3,
  LogOut,
  Star,
  Users,
} from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';

const BLUE = '#208AEF';

export default function TrainerProfileScreen() {
  const insets         = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  const [notifications, setNotifications] = useState(true);

  const bg          = isDarkMode ? '#111827' : '#F3F4F6';
  const headerBg    = isDarkMode ? '#111827' : '#FFFFFF';
  const cardBg      = isDarkMode ? '#1F2937' : '#FFFFFF';
  const borderColor = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const divColor    = isDarkMode ? '#374151' : '#F3F4F6';
  const switchTrackOff = isDarkMode ? '#374151' : '#E5E7EB';

  function Row({
    icon: Icon,
    iconColor,
    iconBg,
    label,
    sublabel,
    onPress,
    right,
  }: {
    icon: typeof Edit3;
    iconColor: string;
    iconBg: string;
    label: string;
    sublabel?: string;
    onPress?: () => void;
    right?: React.ReactNode;
  }) {
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        disabled={!onPress}>
        <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
          <Icon size={16} color={iconColor} strokeWidth={2} />
        </View>
        <View style={styles.rowLabels}>
          <Text style={[styles.rowLabel, { color: textPrimary }]}>{label}</Text>
          {sublabel && <Text style={[styles.rowSublabel, { color: textSub }]}>{sublabel}</Text>}
        </View>
        {right ?? (onPress && <ChevronRight size={16} color={textSub} strokeWidth={2} />)}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: headerBg, borderBottomColor: borderColor }]}>
        <Dumbbell size={18} color={BLUE} strokeWidth={2} />
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Profile</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>

        {/* Profile card */}
        <View style={[styles.profileCard, { backgroundColor: BLUE }]}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitials}>MP</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Mantas Petrauskas</Text>
            <Text style={styles.profileSport}>⚽ Football · 🏃 Running · 💪 CrossFit</Text>
            <Text style={styles.profileLocation}>📍 Vilnius, Lithuania</Text>
          </View>
          <TouchableOpacity
            style={styles.editAvatarBtn}
            onPress={() => router.push('/trainer/manage-profile' as never)}
            activeOpacity={0.85}>
            <Edit3 size={14} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Stats strip */}
        <View style={[styles.statsStrip, { backgroundColor: cardBg, borderColor }]}>
          {[
            { value: '8',   label: 'Clients'  },
            { value: '4.8', label: 'Rating'   },
            { value: '28',  label: 'Sessions' },
          ].map((s, i, arr) => (
            <View key={s.label} style={[styles.statItem, i < arr.length - 1 && { borderRightWidth: 1, borderRightColor: divColor }]}>
              <Text style={[styles.statValue, { color: textPrimary }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: textSub }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Professional section */}
        <Text style={[styles.sectionLabel, { color: textSub }]}>PROFESSIONAL</Text>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Row
            icon={Edit3}
            iconColor={BLUE}
            iconBg={isDarkMode ? '#1E3A5F' : '#EFF6FF'}
            label="Edit Profile"
            sublabel="Update bio, sports, photos"
            onPress={() => router.push('/trainer/manage-profile' as never)}
          />
          <View style={[styles.divider, { backgroundColor: divColor }]} />
          <Row
            icon={BookOpen}
            iconColor="#8B5CF6"
            iconBg={isDarkMode ? '#2E1065' : '#EDE9FE'}
            label="Set Availability"
            sublabel="Manage your schedule"
            onPress={() => router.push('/trainer/availability' as never)}
          />
          <View style={[styles.divider, { backgroundColor: divColor }]} />
          <Row
            icon={DollarSign}
            iconColor="#22C55E"
            iconBg={isDarkMode ? '#052E16' : '#F0FDF4'}
            label="Earnings"
            sublabel="View balance & transactions"
            onPress={() => router.push('/trainer/earnings' as never)}
          />
          <View style={[styles.divider, { backgroundColor: divColor }]} />
          <Row
            icon={CreditCard}
            iconColor={BLUE}
            iconBg={isDarkMode ? '#1E3A5F' : '#EFF6FF'}
            label="Wallet"
            sublabel="Cards, bank accounts & payouts"
            onPress={() => router.push('/trainer-mode/wallet' as never)}
          />
          <View style={[styles.divider, { backgroundColor: divColor }]} />
          <Row
            icon={Star}
            iconColor="#F59E0B"
            iconBg={isDarkMode ? '#451A03' : '#FFFBEB'}
            label="My Reviews"
            sublabel="4.8 · 24 reviews"
            onPress={() => router.push('/trainer/reviews' as never)}
          />
          <View style={[styles.divider, { backgroundColor: divColor }]} />
          <Row
            icon={Users}
            iconColor="#EC4899"
            iconBg={isDarkMode ? '#500724' : '#FDF2F8'}
            label="Client Sessions"
            sublabel="6 upcoming sessions"
            onPress={() => router.push('/trainer-mode/sessions' as never)}
          />
        </View>

        {/* Settings section */}
        <Text style={[styles.sectionLabel, { color: textSub }]}>SETTINGS</Text>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Row
            icon={Bell}
            iconColor="#F59E0B"
            iconBg={isDarkMode ? '#451A03' : '#FFFBEB'}
            label="Notifications"
            right={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: switchTrackOff, true: BLUE }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={switchTrackOff}
              />
            }
          />
        </View>

        {/* Account section */}
        <Text style={[styles.sectionLabel, { color: textSub }]}>ACCOUNT</Text>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <TouchableOpacity
            style={styles.switchBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}>
            <View style={[styles.rowIcon, { backgroundColor: isDarkMode ? '#1E3A5F' : '#EFF6FF' }]}>
              <Dumbbell size={16} color={BLUE} strokeWidth={2} />
            </View>
            <Text style={[styles.rowLabel, { color: BLUE, flex: 1 }]}>Switch to Client Mode</Text>
            <ChevronRight size={16} color={BLUE} strokeWidth={2} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: divColor }]} />
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.replace('/(tabs)' as never)}
            activeOpacity={0.7}>
            <View style={[styles.rowIcon, { backgroundColor: isDarkMode ? '#450A0A' : '#FEF2F2' }]}>
              <LogOut size={16} color="#DC2626" strokeWidth={2} />
            </View>
            <Text style={[styles.rowLabel, { color: '#DC2626', flex: 1 }]}>Log Out</Text>
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
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },

  scroll: {
    padding: 16,
    gap: 12,
  },

  // Profile card
  profileCard: {
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  profileInitials: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    gap: 3,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileSport: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },
  profileLocation: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
  },
  editAvatarBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },

  // Stats strip
  statsStrip: {
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.7,
    paddingHorizontal: 4,
    marginBottom: -2,
  },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  rowLabels: {
    flex: 1,
    gap: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  rowSublabel: {
    fontSize: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
});

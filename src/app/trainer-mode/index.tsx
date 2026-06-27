import { router } from 'expo-router';
import {
  BadgeCheck,
  Calendar,
  CalendarClock,
  ChevronRight,
  Clock,
  DollarSign,
  Heart,
  MapPin,
  Plus,
  Star,
  Tag,
  UserCircle,
  Users,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const BLUE = '#208AEF';

const TRAINER_NAME     = 'Mantas Petrauskas';
const TRAINER_VERIFIED = true;

const STATS = [
  { label: "Today's sessions", value: '2',    icon: Calendar,   color: BLUE,      bg: '#EFF6FF', darkBg: '#1E3A5F', route: '/trainer-mode/sessions?tab=upcoming' },
  { label: 'Week earnings',    value: '€140', icon: DollarSign, color: '#22C55E', bg: '#F0FDF4', darkBg: '#052E16', route: '/trainer/earnings'       },
  { label: 'Total clients',    value: '4',    icon: Users,      color: '#8B5CF6', bg: '#EDE9FE', darkBg: '#2E1065', route: '/trainer-mode/sessions?tab=past' },
  { label: 'Rating',           value: '4.8',  icon: Star,       color: '#F59E0B', bg: '#FFFBEB', darkBg: '#451A03', route: '/trainer/reviews'        },
];

const ACTIONS = [
  { label: 'Manage Profile',   icon: UserCircle,    color: '#8B5CF6', route: '/trainer/manage-profile' as const, modal: false },
  { label: 'Set Availability', icon: CalendarClock, color: BLUE,      route: '/trainer/availability'   as const, modal: false },
  { label: 'Saved by Clients', icon: Heart,         color: '#F43F5E', route: '/trainer-mode/saved-by-clients' as const, modal: false },
  { label: 'My Reviews',       icon: Star,          color: '#F59E0B', route: '/trainer/reviews'        as const, modal: false },
];


type SessionStatus = 'confirmed' | 'pending';

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
  status: SessionStatus;
  type: 'Individual' | 'Group';
  price: string;
}

const INITIAL_SESSIONS: Session[] = [
  {
    id: '1',
    client: 'Jonas Kazlauskas',
    initials: 'JK',
    color: '#B5C9E4',
    sport: '⚽ Football',
    date: 'Today, Jun 27',
    time: '10:00',
    duration: '60 min',
    location: 'Vingis Park, Vilnius',
    status: 'confirmed',
    type: 'Individual',
    price: '€45',
  },
  {
    id: '2',
    client: 'Marta Petraitytė',
    initials: 'MP',
    color: '#C8DDB5',
    sport: '🏃 Running',
    date: 'Today, Jun 27',
    time: '14:00',
    duration: '45 min',
    location: 'Sereikiškių Park, Vilnius',
    status: 'confirmed',
    type: 'Individual',
    price: '€35',
  },
  {
    id: '3',
    client: 'Tomas Butkus',
    initials: 'TB',
    color: '#D4B5E4',
    sport: '⚽ Football',
    date: 'Today, Jun 27',
    time: '16:00',
    duration: '60 min',
    location: 'Vingis Park, Vilnius',
    status: 'pending',
    type: 'Individual',
    price: '€45',
  },
];

export default function TrainerHomeScreen() {
  const insets         = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);
  const [selected, setSelected] = useState<Session | null>(null);

  const bg          = isDarkMode ? '#111827' : '#F3F4F6';
  const headerBg    = isDarkMode ? '#111827' : '#FFFFFF';
  const cardBg      = isDarkMode ? '#1F2937' : '#FFFFFF';
  const borderColor = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const divColor    = isDarkMode ? '#374151' : '#F3F4F6';
  const sheetBg     = isDarkMode ? '#1F2937' : '#FFFFFF';
  const detailBg    = isDarkMode ? '#111827' : '#F9FAFB';

  function handleConfirm() {
    if (!selected) return;
    setSessions(prev =>
      prev.map(s => s.id === selected.id ? { ...s, status: 'confirmed' } : s),
    );
    setSelected(null);
  }

  function handleDecline() {
    if (!selected) return;
    const id = selected.id;
    setSelected(null);
    setTimeout(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setSessions(prev => prev.filter(s => s.id !== id));
    }, 300);
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 4, backgroundColor: headerBg, borderBottomColor: borderColor }]}>
        <View style={styles.headerNameRow}>
          <Text style={styles.headerLabel}>Trainer: </Text>
          <Text style={styles.headerName}>{TRAINER_NAME}</Text>
          {TRAINER_VERIFIED && (
            <BadgeCheck size={20} color="#FFFFFF" fill="#22C55E" strokeWidth={2.5} />
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}>

        {/* Greeting */}
        <View style={[styles.greetCard, { backgroundColor: BLUE }]}>
          <View>
            <Text style={styles.greetTitle}>Welcome back! 👋</Text>
            <Text style={styles.greetSub}>You have {sessions.length} sessions today</Text>
          </View>
          <TouchableOpacity
            style={styles.availBtn}
            onPress={() => router.push('/trainer/availability')}
            activeOpacity={0.85}>
            <Plus size={14} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.availBtnText}>New Session</Text>
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
                <Text style={[styles.statValue, { color: textPrimary }]}>{stat.value}</Text>
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
          {ACTIONS.map((action, i) => {
            const Icon = action.icon;
            return (
              <View key={action.label}>
                <TouchableOpacity
                  style={styles.actionRow}
                  onPress={() => router.push(action.route as never)}
                  activeOpacity={0.7}>
                  <Icon size={20} color={action.color} strokeWidth={2} />
                  <Text style={[styles.actionLabel, { color: textPrimary }]}>{action.label}</Text>
                  <ChevronRight size={16} color={textSub} strokeWidth={2} />
                </TouchableOpacity>
                {i < ACTIONS.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: divColor }]} />
                )}
              </View>
            );
          })}
        </View>

        {/* Today's sessions */}
        <Text style={[styles.sectionLabel, { color: textSub }]}>TODAY'S SESSIONS</Text>
        {sessions.map(session => {
          const isPending = session.status === 'pending';
          return (
            <TouchableOpacity
              key={session.id}
              style={[
                styles.sessionCard,
                { backgroundColor: cardBg, borderColor },
                isPending && { borderColor: '#F59E0B', borderWidth: 1.5 },
              ]}
              onPress={() => isPending
                ? setSelected(session)
                : router.push('/trainer-mode/sessions' as never)
              }
              activeOpacity={0.75}>

              <View style={styles.sessionHeader}>
                <View style={styles.sessionTimeRow}>
                  <Clock size={14} color={isPending ? '#F59E0B' : BLUE} strokeWidth={2} />
                  <Text style={[styles.sessionTime, { color: isPending ? '#D97706' : BLUE }]}>
                    {session.time}
                  </Text>
                  <Text style={[styles.sessionDuration, { color: textSub }]}>· {session.duration}</Text>
                </View>
                {isPending ? (
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingText}>Pending</Text>
                  </View>
                ) : (
                  <View style={styles.confirmedBadge}>
                    <Text style={styles.confirmedText}>Confirmed</Text>
                  </View>
                )}
              </View>

              <View style={[styles.sessionDivider, { backgroundColor: isPending ? '#FEF3C7' : divColor }]} />

              <View style={styles.sessionBody}>
                <View style={[styles.clientAvatar, { backgroundColor: session.color }]}>
                  <Text style={styles.clientInitials}>{session.initials}</Text>
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
                {isPending && (
                  <View style={styles.tapHint}>
                    <Text style={styles.tapHintText}>Tap to review</Text>
                  </View>
                )}
              </View>

            </TouchableOpacity>
          );
        })}

      </ScrollView>

      {/* Booking request modal */}
      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.overlay} onPress={() => setSelected(null)}>
          <Pressable style={[styles.sheet, { backgroundColor: sheetBg }]} onPress={() => {}}>
            <View style={styles.sheetHandle} />

            {/* Title */}
            <View style={styles.modalTitleRow}>
              <View style={styles.pendingDot} />
              <Text style={[styles.modalTitle, { color: textPrimary }]}>New Booking Request</Text>
            </View>

            {/* Client */}
            {selected && (
              <>
                <View style={styles.modalClient}>
                  <View style={[styles.modalAvatar, { backgroundColor: selected.color }]}>
                    <Text style={styles.modalInitials}>{selected.initials}</Text>
                  </View>
                  <View style={styles.modalClientInfo}>
                    <Text style={[styles.modalClientName, { color: textPrimary }]}>{selected.client}</Text>
                    <Text style={[styles.modalSport, { color: textSub }]}>{selected.sport}</Text>
                  </View>
                </View>

                {/* Details card */}
                <View style={[styles.detailCard, { backgroundColor: detailBg, borderColor }]}>
                  {[
                    { icon: Calendar, label: 'Date',     value: selected.date     },
                    { icon: Clock,    label: 'Time',     value: `${selected.time} · ${selected.duration}` },
                    { icon: MapPin,   label: 'Location', value: selected.location  },
                    { icon: Users,    label: 'Type',     value: selected.type      },
                    { icon: Tag,      label: 'Price',    value: selected.price     },
                  ].map(({ icon: Icon, label, value }, i, arr) => (
                    <View key={label}>
                      <View style={styles.detailRow}>
                        <Icon size={14} color={textSub} strokeWidth={2} />
                        <Text style={[styles.detailLabel, { color: textSub }]}>{label}</Text>
                        <Text style={[styles.detailValue, { color: textPrimary }]}>{value}</Text>
                      </View>
                      {i < arr.length - 1 && (
                        <View style={[styles.detailDivider, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]} />
                      )}
                    </View>
                  ))}
                </View>

                {/* Buttons */}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.declineBtn, { borderColor: '#DC2626' }]}
                    onPress={handleDecline}
                    activeOpacity={0.7}>
                    <Text style={styles.declineBtnText}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmBtn}
                    onPress={handleConfirm}
                    activeOpacity={0.85}>
                    <Text style={styles.confirmBtnText}>Confirm Session</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B7280',
  },
  headerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginRight: 4,
  },

  scroll: {
    padding: 16,
    gap: 12,
  },

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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  availBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

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

  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.7,
    paddingHorizontal: 4,
    marginBottom: -2,
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
  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
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
  pendingBadge: {
    backgroundColor: '#FEF9C3',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pendingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
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
  tapHint: {
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexShrink: 0,
  },
  tapHintText: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '500',
  },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 20,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 4,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalClient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  modalAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  modalInitials: {
    fontSize: 18,
    fontWeight: '800',
    color: '#374151',
  },
  modalClientInfo: {
    gap: 4,
  },
  modalClientName: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalSport: {
    fontSize: 14,
  },
  detailCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  detailLabel: {
    fontSize: 14,
    width: 62,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  detailDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  declineBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  declineBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#DC2626',
  },
  confirmBtn: {
    flex: 2,
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

});

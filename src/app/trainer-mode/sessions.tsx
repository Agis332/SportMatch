import { Calendar, CalendarDays, Clock, MapPin, Tag, Users } from 'lucide-react-native';
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

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

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
  price: string;
}

const INITIAL_SESSIONS: Session[] = [
  {
    id: '1',
    client: 'Jonas Kazlauskas',
    initials: 'JK',
    color: '#B5C9E4',
    sport: '⚽ Football',
    date: 'Today, Jun 26',
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
    date: 'Today, Jun 26',
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
    date: 'Tomorrow, Jun 27',
    time: '09:00',
    duration: '60 min',
    location: 'Vingis Park, Vilnius',
    status: 'pending',
    type: 'Individual',
    price: '€45',
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
    price: '€35',
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
    price: '€30',
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
    price: '€45',
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
    price: '€30',
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
    price: '€30',
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
    price: '€35',
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
    price: '€30',
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

  const [sessions,  setSessions]  = useState<Session[]>(INITIAL_SESSIONS);
  const [filter,    setFilter]    = useState<Filter>('upcoming');
  const [selected,  setSelected]  = useState<Session | null>(null);

  const bg          = isDarkMode ? '#111827' : '#F3F4F6';
  const headerBg    = isDarkMode ? '#111827' : '#FFFFFF';
  const cardBg      = isDarkMode ? '#1F2937' : '#FFFFFF';
  const borderColor = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const divColor    = isDarkMode ? '#374151' : '#F3F4F6';
  const sheetBg     = isDarkMode ? '#1F2937' : '#FFFFFF';
  const detailBg    = isDarkMode ? '#111827' : '#F9FAFB';

  const upcoming = sessions.filter(s => s.status === 'confirmed' || s.status === 'pending');
  const past     = sessions.filter(s => s.status === 'completed' || s.status === 'cancelled');
  const list     = filter === 'upcoming' ? upcoming : past;

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
                onPress={() => isPending ? setSelected(session) : undefined}
                activeOpacity={isPending ? 0.75 : 1}>

                {/* Date + status row */}
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
                  {isPending && (
                    <View style={styles.tapHint}>
                      <Text style={styles.tapHintText}>Tap to review</Text>
                    </View>
                  )}
                </View>

              </TouchableOpacity>
            );
          })
        )}

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

            <View style={styles.modalTitleRow}>
              <View style={styles.pendingDot} />
              <Text style={[styles.modalTitle, { color: textPrimary }]}>New Booking Request</Text>
            </View>

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

                <View style={[styles.detailCard, { backgroundColor: detailBg, borderColor }]}>
                  {([
                    { icon: Calendar, label: 'Date',     value: selected.date                         },
                    { icon: Clock,    label: 'Time',     value: `${selected.time} · ${selected.duration}` },
                    { icon: MapPin,   label: 'Location', value: selected.location                      },
                    { icon: Users,    label: 'Type',     value: selected.type                          },
                    { icon: Tag,      label: 'Price',    value: selected.price                         },
                  ] as const).map(({ icon: Icon, label, value }, i, arr) => (
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

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.declineBtn}
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

  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 36,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
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
    borderColor: '#DC2626',
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

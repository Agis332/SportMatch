import { router, useLocalSearchParams } from 'expo-router';
import {
  Activity,
  Calendar,
  ChevronLeft,
  Clock,
  Mail,
  MapPin,
  Phone,
  Tag,
  UserCheck,
  Users,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';
import { useTrainerProfile } from '@/context/TrainerProfileContext';

const BLUE  = '#208AEF';
const GREEN = '#22C55E';
const RED   = '#DC2626';

type Status = 'confirmed' | 'pending' | 'completed' | 'cancelled';

const CLIENT_INFO: Record<string, { phone: string; email: string; memberSince: string }> = {
  '1':  { phone: '+370 600 11 111', email: 'jonas.k@gmail.com',     memberSince: 'Jan 2024' },
  '2':  { phone: '+370 600 22 222', email: 'marta.p@gmail.com',     memberSince: 'Mar 2024' },
  '3':  { phone: '+370 600 33 333', email: 'tomas.b@gmail.com',     memberSince: 'Feb 2025' },
  '4':  { phone: '+370 600 44 444', email: 'rasa.m@gmail.com',      memberSince: 'Nov 2023' },
  '5':  { phone: '+370 600 55 555', email: 'viktorija.p@gmail.com', memberSince: 'Jun 2024' },
  '6':  { phone: '+370 600 66 666', email: 'kristina.v@gmail.com',  memberSince: 'Aug 2024' },
  '7':  { phone: '+370 600 77 777', email: 'egle.j@gmail.com',      memberSince: 'Apr 2023' },
  '8':  { phone: '+370 600 88 888', email: 'andrius.s@gmail.com',   memberSince: 'Dec 2023' },
  '9':  { phone: '+370 600 99 999', email: 'laurynas.g@gmail.com',  memberSince: 'May 2024' },
  '10': { phone: '+370 601 01 010', email: 'darius.p@gmail.com',    memberSince: 'Oct 2022' },
};

const SESSIONS_WITH_REVIEW = new Set(['7', '8']);

const STATUS_META: Record<Status, { label: string; color: string; bg: string }> = {
  confirmed: { label: 'Confirmed', color: '#16A34A', bg: '#DCFCE7' },
  pending:   { label: 'Pending',   color: '#D97706', bg: '#FEF9C3' },
  completed: { label: 'Completed', color: '#2563EB', bg: '#DBEAFE' },
  cancelled: { label: 'Cancelled', color: '#DC2626', bg: '#FEE2E2' },
};

const JS_DAY_TO_KEY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_SHORT     = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT   = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function generateDates(count: number): Date[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

function generateSlots(windowStart: string, windowEnd: string, dur: number): { start: string; end: string }[] {
  const toMins = (t: string) => { const [h, m = 0] = t.split(':').map(Number); return h * 60 + (m || 0); };
  const fmt    = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  const startM = toMins(windowStart);
  const endM   = toMins(windowEnd);
  const slots: { start: string; end: string }[] = [];
  for (let t = startM; t + dur <= endM; t += dur) {
    slots.push({ start: fmt(t), end: fmt(t + dur) });
  }
  return slots;
}

// Mock already-booked slots for this trainer, keyed 'YYYY-MM-DD:HH:MM'
const MOCK_BOOKED = new Set([
  '2026-06-27:09:00', '2026-06-27:10:00',
  '2026-06-30:11:00', '2026-07-01:14:00',
  '2026-07-02:09:00', '2026-07-03:10:00',
  '2026-07-07:09:00', '2026-07-08:15:00',
]);

function isSlotBooked(date: Date, slotStart: string): boolean {
  return MOCK_BOOKED.has(`${date.toISOString().slice(0, 10)}:${slotStart}`);
}

export default function SessionDetailScreen() {
  const insets         = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const params = useLocalSearchParams<{
    id: string; client: string; initials: string; color: string; sport: string;
    date: string; time: string; duration: string; location: string;
    status: string; type: string; price: string;
  }>();

  const [status,            setStatus]            = useState<Status>((params.status as Status) ?? 'confirmed');
  const [showDeclineModal,  setShowDeclineModal]  = useState(false);
  const [showCancelModal,   setShowCancelModal]   = useState(false);
  const [showSuggestModal,  setShowSuggestModal]  = useState(false);

  const [showNoReviewModal, setShowNoReviewModal] = useState(false);
  const [reminderSent,      setReminderSent]      = useState(false);

  const [suggestDate, setSuggestDate] = useState<Date | null>(null);
  const [suggestSlot, setSuggestSlot] = useState<{ start: string; end: string } | null>(null);
  const [note,        setNote]        = useState('');

  const client = CLIENT_INFO[params.id] ?? { phone: '—', email: '—', memberSince: '—' };
  const meta   = STATUS_META[status];

  const bg          = isDarkMode ? '#111827' : '#F3F4F6';
  const headerBg    = isDarkMode ? '#111827' : '#FFFFFF';
  const cardBg      = isDarkMode ? '#1F2937' : '#FFFFFF';
  const borderColor = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const divColor    = isDarkMode ? '#374151' : '#F3F4F6';
  const sheetBg     = isDarkMode ? '#1F2937' : '#FFFFFF';
  const inputBg     = isDarkMode ? '#111827' : '#F9FAFB';
  const dimColor    = isDarkMode ? '#4B5563' : '#CBD5E1';

  const { schedule, sessionDuration } = useTrainerProfile();
  const { width } = useWindowDimensions();
  const slotChipWidth = Math.floor((width - 48) / 2);

  const allDates = useMemo(() => generateDates(30), []);
  const daySlots = useMemo(() => {
    if (!suggestDate) return [];
    const dayKey = JS_DAY_TO_KEY[suggestDate.getDay()];
    const cfg = schedule[dayKey];
    if (!cfg?.enabled) return [];
    return cfg.slots.flatMap(w => generateSlots(w.start, w.end, sessionDuration));
  }, [suggestDate, schedule, sessionDuration]);

  const detailRows = [
    { icon: Calendar, label: 'Date',     value: params.date },
    { icon: Clock,    label: 'Time',     value: `${params.time} · ${params.duration}` },
    { icon: MapPin,   label: 'Location', value: params.location },
    { icon: Users,    label: 'Type',     value: params.type },
    { icon: Activity, label: 'Sport',    value: params.sport },
    { icon: Tag,      label: 'Price',    value: params.price },
  ] as const;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>

      {/* Header */}
      <View style={[styles.header, {
        paddingTop: insets.top + 8,
        backgroundColor: headerBg,
        borderBottomColor: borderColor,
      }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ChevronLeft size={22} color={BLUE} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Session Details</Text>
        <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
          <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 148 }]}>

        {/* Client card */}
        <View style={[styles.clientCard, { backgroundColor: cardBg, borderColor }]}>
          <View style={[styles.clientAvatar, { backgroundColor: params.color ?? '#B5C9E4' }]}>
            <Text style={styles.clientInitials}>{params.initials}</Text>
          </View>
          <View style={styles.clientInfo}>
            <Text style={[styles.clientName, { color: textPrimary }]}>{params.client}</Text>
            <View style={styles.clientRow}>
              <Phone size={13} color={textSub} strokeWidth={2} />
              <Text style={[styles.clientMeta, { color: textSub }]}>{client.phone}</Text>
            </View>
            <View style={styles.clientRow}>
              <Mail size={13} color={textSub} strokeWidth={2} />
              <Text style={[styles.clientMeta, { color: textSub }]}>{client.email}</Text>
            </View>
            <View style={styles.clientRow}>
              <UserCheck size={13} color={textSub} strokeWidth={2} />
              <Text style={[styles.clientMeta, { color: textSub }]}>Member since {client.memberSince}</Text>
            </View>
          </View>
        </View>

        {/* Session details */}
        <Text style={[styles.sectionLabel, { color: textSub }]}>Session Details</Text>
        <View style={[styles.detailCard, { backgroundColor: cardBg, borderColor }]}>
          {detailRows.map(({ icon: Icon, label, value }, i) => (
            <View key={label}>
              <View style={styles.detailRow}>
                <Icon size={15} color={textSub} strokeWidth={2} />
                <Text style={[styles.detailLabel, { color: textSub }]}>{label}</Text>
                <Text style={[styles.detailValue, { color: textPrimary }]}>{value}</Text>
              </View>
              {i < detailRows.length - 1 && (
                <View style={[styles.detailDivider, { backgroundColor: divColor }]} />
              )}
            </View>
          ))}
        </View>

      </ScrollView>

      {/* ── Fixed action bar ─────────────────────────────────────────── */}
      <View style={[styles.actionBar, {
        paddingBottom: insets.bottom + 16,
        backgroundColor: headerBg,
        borderTopColor: borderColor,
      }]}>

        {status === 'pending' && (
          <>
            <TouchableOpacity style={styles.confirmBtn} onPress={() => setStatus('confirmed')} activeOpacity={0.85}>
              <Text style={styles.confirmBtnText}>Confirm Session</Text>
            </TouchableOpacity>
            <View style={styles.rowBtns}>
              <TouchableOpacity style={styles.redOutlineBtn} onPress={() => setShowDeclineModal(true)} activeOpacity={0.7}>
                <Text style={styles.redOutlineBtnText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.blueOutlineBtn} onPress={() => setShowSuggestModal(true)} activeOpacity={0.7}>
                <Text style={styles.blueOutlineBtnText}>Suggest New Time</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {status === 'confirmed' && (
          <View style={styles.rowBtns}>
            <TouchableOpacity style={styles.blueOutlineBtn} onPress={() => setShowSuggestModal(true)} activeOpacity={0.7}>
              <Text style={styles.blueOutlineBtnText}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.redOutlineBtn} onPress={() => setShowCancelModal(true)} activeOpacity={0.7}>
              <Text style={styles.redOutlineBtnText}>Cancel Session</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'completed' && (
          <TouchableOpacity
            style={styles.blueOutlineBtn}
            onPress={() => {
              if (SESSIONS_WITH_REVIEW.has(params.id)) {
                router.push(`/trainer/reviews?clientId=${params.id}`);
              } else {
                setShowNoReviewModal(true);
              }
            }}
            activeOpacity={0.7}>
            <Text style={styles.blueOutlineBtnText}>View Review</Text>
          </TouchableOpacity>
        )}

      </View>

      {/* ── Decline confirmation ─────────────────────────────────────── */}
      <Modal visible={showDeclineModal} transparent animationType="fade" onRequestClose={() => setShowDeclineModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowDeclineModal(false)}>
          <Pressable style={[styles.alertSheet, { backgroundColor: sheetBg }]} onPress={() => {}}>
            <Text style={[styles.alertTitle, { color: textPrimary }]}>Decline booking?</Text>
            <Text style={[styles.alertBody, { color: textSub }]}>
              {params.client} will be notified that their booking request was declined.
            </Text>
            <View style={styles.rowBtns}>
              <TouchableOpacity
                style={[styles.blueOutlineBtn, { flex: 1 }]}
                onPress={() => setShowDeclineModal(false)}
                activeOpacity={0.7}>
                <Text style={styles.blueOutlineBtnText}>Keep</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.redOutlineBtn, { flex: 1 }]}
                onPress={() => { setShowDeclineModal(false); setStatus('cancelled'); }}
                activeOpacity={0.7}>
                <Text style={styles.redOutlineBtnText}>Decline</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Cancel confirmation ──────────────────────────────────────── */}
      <Modal visible={showCancelModal} transparent animationType="fade" onRequestClose={() => setShowCancelModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowCancelModal(false)}>
          <Pressable style={[styles.alertSheet, { backgroundColor: sheetBg }]} onPress={() => {}}>
            <Text style={[styles.alertTitle, { color: textPrimary }]}>Cancel session?</Text>
            <Text style={[styles.alertBody, { color: textSub }]}>
              {params.client} will be notified. Depending on your cancellation policy they may be eligible for a refund.
            </Text>
            <View style={styles.rowBtns}>
              <TouchableOpacity
                style={[styles.blueOutlineBtn, { flex: 1 }]}
                onPress={() => setShowCancelModal(false)}
                activeOpacity={0.7}>
                <Text style={styles.blueOutlineBtnText}>Keep</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.redOutlineBtn, { flex: 1 }]}
                onPress={() => { setShowCancelModal(false); setStatus('cancelled'); }}
                activeOpacity={0.7}>
                <Text style={styles.redOutlineBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Suggest new time ─────────────────────────────────────────── */}
      <Modal visible={showSuggestModal} transparent animationType="slide" onRequestClose={() => setShowSuggestModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowSuggestModal(false)}>
          <Pressable style={[styles.suggestSheet, { backgroundColor: sheetBg }]} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={[styles.sheetTitle, { color: textPrimary, paddingHorizontal: 20 }]}>Suggest New Time</Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              contentContainerStyle={styles.suggestBody}>

              {/* ── Date picker ── */}
              <Text style={[styles.pickerLabel, { color: textSub }]}>Select a date</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.datesRow}>
                {allDates.map((date, i) => {
                  const dayKey  = JS_DAY_TO_KEY[date.getDay()];
                  const cfg     = schedule[dayKey];
                  const isAvail = cfg?.enabled && cfg.slots.length > 0;
                  const isSel   = suggestDate?.toDateString() === date.toDateString();
                  const isToday = i === 0;
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.dateCard,
                        isSel   ? { backgroundColor: BLUE, borderColor: BLUE } :
                        isAvail ? { backgroundColor: cardBg, borderColor } :
                                  [styles.dateCardUnavail, { borderColor }],
                      ]}
                      onPress={() => { setSuggestDate(date); setSuggestSlot(null); }}
                      disabled={!isAvail}
                      activeOpacity={0.75}>
                      <Text style={[styles.dateCardDay, {
                        color: isSel ? 'rgba(255,255,255,0.8)' : isAvail ? textSub : dimColor,
                      }]}>
                        {DAY_SHORT[date.getDay()]}
                      </Text>
                      <Text style={[styles.dateCardNum, {
                        color: isSel ? '#FFFFFF' : isAvail ? textPrimary : dimColor,
                      }]}>
                        {date.getDate()}
                      </Text>
                      <Text style={[styles.dateCardMonth, {
                        color: isSel ? 'rgba(255,255,255,0.7)' : isAvail ? textSub : dimColor,
                      }]}>
                        {MONTH_SHORT[date.getMonth()]}
                      </Text>
                      {isToday && (
                        <View style={[styles.todayDot, { backgroundColor: isSel ? '#FFFFFF' : isAvail ? BLUE : dimColor }]} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* ── Time slots ── */}
              {suggestDate && (
                <>
                  <Text style={[styles.pickerLabel, { color: textSub }]}>
                    {'Available slots · '}
                    {DAY_SHORT[suggestDate.getDay()]} {suggestDate.getDate()} {MONTH_SHORT[suggestDate.getMonth()]}
                  </Text>
                  {daySlots.length === 0 ? (
                    <View style={[styles.slotsEmpty, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}>
                      <Text style={[styles.slotsEmptyText, { color: textSub }]}>No available slots on this day</Text>
                    </View>
                  ) : (
                    <View style={styles.slotsGrid}>
                      {daySlots.map(slot => {
                        const booked = isSlotBooked(suggestDate, slot.start);
                        const sel    = suggestSlot?.start === slot.start;
                        return (
                          <TouchableOpacity
                            key={slot.start}
                            style={[
                              styles.slotChip,
                              { width: slotChipWidth },
                              sel    ? { backgroundColor: BLUE, borderColor: BLUE } :
                              booked ? { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6', borderColor, opacity: 0.55 } :
                                       { backgroundColor: cardBg, borderColor },
                            ]}
                            onPress={() => setSuggestSlot(slot)}
                            disabled={booked}
                            activeOpacity={0.75}>
                            <Text style={[styles.slotChipTime, {
                              color: sel ? '#FFFFFF' : booked ? dimColor : textPrimary,
                            }]}>
                              {slot.start}
                            </Text>
                            <Text style={[styles.slotChipEnd, {
                              color: sel ? 'rgba(255,255,255,0.75)' : booked ? dimColor : textSub,
                            }]}>
                              {booked ? 'Booked' : `– ${slot.end}`}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </>
              )}

              {/* ── Selection summary ── */}
              {suggestDate && suggestSlot && (
                <View style={[styles.selectionBadge, { backgroundColor: isDarkMode ? '#1E3A5F' : '#EFF6FF' }]}>
                  <Text style={[styles.selectionBadgeText, { color: BLUE }]}>
                    {DAY_SHORT[suggestDate.getDay()]} {suggestDate.getDate()} {MONTH_SHORT[suggestDate.getMonth()]}{'  ·  '}{suggestSlot.start} – {suggestSlot.end}
                  </Text>
                </View>
              )}

              {/* ── Note ── */}
              <Text style={[styles.pickerLabel, { color: textSub }]}>Note (optional)</Text>
              <TextInput
                style={[styles.noteInput, { backgroundColor: inputBg, borderColor, color: textPrimary }]}
                placeholder="Add a note for the client…"
                placeholderTextColor={textSub}
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={2}
              />

            </ScrollView>

            {/* ── Fixed buttons ── */}
            <View style={[styles.suggestFooter, { borderTopColor: borderColor }]}>
              <TouchableOpacity
                style={[styles.blueOutlineBtn, { flex: 1 }]}
                onPress={() => setShowSuggestModal(false)}
                activeOpacity={0.7}>
                <Text style={styles.blueOutlineBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sendBtn, { flex: 2, opacity: suggestDate && suggestSlot ? 1 : 0.4 }]}
                onPress={() => suggestDate && suggestSlot && setShowSuggestModal(false)}
                activeOpacity={0.85}>
                <Text style={styles.sendBtnText}>Send Suggestion</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── No review yet ───────────────────────────────────────────── */}
      <Modal visible={showNoReviewModal} transparent animationType="fade" onRequestClose={() => setShowNoReviewModal(false)}>
        <Pressable style={styles.overlay} onPress={() => { setShowNoReviewModal(false); setReminderSent(false); }}>
          <Pressable style={[styles.alertSheet, { backgroundColor: sheetBg }]} onPress={() => {}}>
            <Text style={[styles.alertTitle, { color: textPrimary }]}>No review yet</Text>
            <Text style={[styles.alertBody, { color: textSub }]}>
              {params.client} hasn't left a review for this session yet.
            </Text>
            {reminderSent ? (
              <View style={[styles.reminderSentBox, { backgroundColor: isDarkMode ? '#1E3A5F' : '#EFF6FF' }]}>
                <Text style={[styles.reminderSentText, { color: BLUE }]}>Reminder sent to {params.client}</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.reminderBtn}
                onPress={() => setReminderSent(true)}
                activeOpacity={0.85}>
                <Text style={styles.reminderBtnText}>Send Reminder</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.blueOutlineBtn, { flex: 0 }]}
              onPress={() => { setShowNoReviewModal(false); setReminderSent(false); }}
              activeOpacity={0.7}>
              <Text style={styles.blueOutlineBtnText}>Close</Text>
            </TouchableOpacity>
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
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  scroll: {
    padding: 16,
    gap: 12,
  },

  clientCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  clientAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  clientInitials: {
    fontSize: 18,
    fontWeight: '800',
    color: '#374151',
  },
  clientInfo: {
    flex: 1,
    gap: 6,
  },
  clientName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  clientMeta: {
    fontSize: 13,
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 4,
    marginLeft: 2,
  },
  detailCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  detailLabel: {
    fontSize: 14,
    width: 68,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  detailDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },

  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  rowBtns: {
    flexDirection: 'row',
    gap: 10,
  },
  confirmBtn: {
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  redOutlineBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: RED,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  redOutlineBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: RED,
  },
  blueOutlineBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: BLUE,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  blueOutlineBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: BLUE,
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  alertSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 16,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  alertBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 16,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 4,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },

  suggestSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    maxHeight: '88%',
  },
  suggestBody: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 14,
  },
  suggestFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
  },

  pickerLabel: {
    fontSize: 13,
    fontWeight: '600',
  },

  datesRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  dateCard: {
    width: 58,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 2,
  },
  dateCardUnavail: {
    opacity: 0.4,
  },
  dateCardDay: {
    fontSize: 11,
    fontWeight: '500',
  },
  dateCardNum: {
    fontSize: 20,
    fontWeight: '700',
  },
  dateCardMonth: {
    fontSize: 11,
    fontWeight: '500',
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 2,
  },

  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotChip: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 2,
  },
  slotChipTime: {
    fontSize: 14,
    fontWeight: '700',
  },
  slotChipEnd: {
    fontSize: 11,
    fontWeight: '500',
  },
  slotsEmpty: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  slotsEmptyText: {
    fontSize: 14,
  },

  selectionBadge: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  selectionBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },

  noteInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    minHeight: 72,
    textAlignVertical: 'top',
  },

  sendBtn: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  sendBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  reminderBtn: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  reminderBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reminderSentBox: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  reminderSentText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

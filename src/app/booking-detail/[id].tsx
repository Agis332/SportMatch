import { router, useLocalSearchParams } from 'expo-router';
import { BadgeCheck, Calendar, CheckCircle, ChevronLeft, ChevronRight, Clock, CreditCard, Info, MapPin, Timer, User, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';

const BLUE = '#208AEF';

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = 'confirmed' | 'pending' | 'completed' | 'cancelled';

interface BookingDetail {
  id: string;
  trainerId: string;
  trainerName: string;
  initials: string;
  sport: string;
  emoji: string;
  date: string;
  time: string;
  location: string;
  status: Status;
  price: number;
  verified: boolean;
  rating: number;
}

interface BookingRow {
  id: string;
  trainer_id: string;
  date: string;
  time_slot: string;
  status: string;
  price: number;
  notes: string | null;
  trainers: {
    full_name: string;
    city: string | null;
    rating: number | null;
    is_verified: boolean | null;
    sports: { name: string; emoji: string } | { name: string; emoji: string }[] | null;
  } | null;
}

const DAY_SHORT   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(d: Date): string {
  return `${DAY_SHORT[d.getDay()]}, ${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

function mapBooking(row: BookingRow): BookingDetail {
  const trainer  = row.trainers;
  const rawSport = trainer?.sports ?? null;
  const sport    = rawSport
    ? (Array.isArray(rawSport) ? (rawSport[0] ?? { name: '', emoji: '' }) : rawSport)
    : { name: '', emoji: '' };
  const nameWords = (trainer?.full_name ?? '').split(' ').filter(Boolean);
  const initials  = nameWords.map(w => w[0].toUpperCase()).slice(0, 2).join('');
  const [year, month, day] = row.date.split('-').map(Number);
  return {
    id:          row.id,
    trainerId:   row.trainer_id,
    trainerName: trainer?.full_name ?? '',
    initials,
    sport:       sport.name,
    emoji:       sport.emoji,
    date:        formatDate(new Date(year, month - 1, day)),
    time:        row.time_slot,
    location:    trainer?.city ?? '',
    status:      row.status as Status,
    price:       row.price,
    verified:    trainer?.is_verified ?? false,
    rating:      trainer?.rating ?? 0,
  };
}

const AVATAR_COLORS = [
  '#B5C9E4', '#C8DDB5', '#E4CDB5', '#D4B5E4', '#B5E4D4',
  '#E4B5C8', '#C8B5E4', '#E4E4B5',
];
function avatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; darkBg: string }> = {
  confirmed: { label: 'Confirmed', color: '#16A34A', bg: '#DCFCE7', darkBg: '#052E16' },
  pending:   { label: 'Pending',   color: '#D97706', bg: '#FEF3C7', darkBg: '#2D1A00' },
  completed: { label: 'Completed', color: '#6B7280', bg: '#F3F4F6', darkBg: '#1F2937' },
  cancelled: { label: 'Cancelled', color: '#EF4444', bg: '#FEF2F2', darkBg: '#450A0A' },
};

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
];

function generateDates(count = 14): Date[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });
}

// ─── Cancel modal ─────────────────────────────────────────────────────────────

function CancelModal({ booking, isDarkMode, onConfirm, onClose, confirming }: {
  booking: BookingDetail;
  isDarkMode: boolean;
  onConfirm: () => void;
  onClose: () => void;
  confirming?: boolean;
}) {
  const [step, setStep] = useState<1 | 2>(1);

  const sheetBg   = isDarkMode ? '#1F2937' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub   = isDarkMode ? '#9CA3AF' : '#6B7280';
  const detailBg  = isDarkMode ? '#374151' : '#F9FAFB';
  const divider   = isDarkMode ? '#374151' : '#F3F4F6';

  if (step === 1) return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: sheetBg }]} onPress={() => {}}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: textColor }]}>Cancel Booking?</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color={textSub} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <View style={[styles.cancelDetailsCard, { backgroundColor: detailBg, borderColor: divider }]}>
            <Text style={[styles.cancelTrainer, { color: textColor }]}>{booking.emoji}  {booking.trainerName}</Text>
            <Text style={[styles.cancelDetailLine, { color: textSub }]}>📅  {booking.date}</Text>
            <Text style={[styles.cancelDetailLine, { color: textSub }]}>🕐  {booking.time}</Text>
            <Text style={[styles.cancelDetailLine, { color: textSub }]}>📍  {booking.location}</Text>
          </View>
          <View style={[styles.cancelRefundBox, {
            backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB',
            borderColor:     isDarkMode ? '#374151' : '#E5E7EB',
          }]}>
            <View style={styles.cancelRefundHeader}>
              <Info size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} strokeWidth={2} />
              <Text style={[styles.cancelRefundTitle, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>Refund Policy</Text>
            </View>
            <Text style={[styles.cancelRefundText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
              Full refund will be processed within 3–5 business days. If cancelled within 2 hours of session start time, only 50% refund will be issued.
            </Text>
          </View>
          <TouchableOpacity style={styles.cancelConfirmBtn} onPress={() => setStep(2)} activeOpacity={0.85}>
            <Text style={styles.modalBtnText}>Cancel Booking</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.keepBookingBtn, { borderColor: divider }]} onPress={onClose} activeOpacity={0.7}>
            <Text style={[styles.keepBookingBtnText, { color: textColor }]}>Keep Booking</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );

  return (
    <Modal visible transparent animationType="slide" onRequestClose={() => setStep(1)}>
      <Pressable style={styles.overlay} onPress={() => setStep(1)}>
        <Pressable style={[styles.sheet, { backgroundColor: sheetBg }]} onPress={() => {}}>
          <View style={styles.sheetHandle} />
          <Text style={[styles.sheetTitle, { color: textColor, textAlign: 'center' }]}>Are you sure?</Text>
          <Text style={[styles.cancelFinalSub, { color: textSub }]}>This cannot be undone.</Text>
          <Text style={[styles.cancelRefundReminder, { color: textSub }]}>
            Refund will be processed within 3–5 business days.
          </Text>
          <TouchableOpacity
            style={[styles.cancelConfirmBtn, confirming && { opacity: 0.6 }]}
            onPress={onConfirm}
            activeOpacity={0.85}
            disabled={confirming}>
            {confirming
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Text style={styles.modalBtnText}>Yes, Cancel</Text>
            }
          </TouchableOpacity>
          <TouchableOpacity style={[styles.keepBookingBtn, { borderColor: divider }]} onPress={() => setStep(1)} activeOpacity={0.7}>
            <Text style={[styles.keepBookingBtnText, { color: textColor }]}>Go Back</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Reschedule modal ─────────────────────────────────────────────────────────

function RescheduleModal({ booking, isDarkMode, onConfirm, onClose }: {
  booking: BookingDetail;
  isDarkMode: boolean;
  onConfirm: (date: string, time: string) => void;
  onClose: () => void;
}) {
  const dates = generateDates(14);
  const [selectedDate, setSelectedDate] = useState<Date>(dates[0]);
  const [selectedTime, setSelectedTime] = useState<string>(TIME_SLOTS[2]);

  const sheetBg   = isDarkMode ? '#1F2937' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub   = isDarkMode ? '#9CA3AF' : '#6B7280';
  const chipBg    = isDarkMode ? '#374151' : '#F3F4F6';
  const divider   = isDarkMode ? '#374151' : '#F3F4F6';

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, styles.rescheduleSheet, { backgroundColor: sheetBg }]} onPress={() => {}}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: textColor }]}>Reschedule Session</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color={textSub} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.sheetSub, { color: textSub }]}>
            {booking.emoji} {booking.trainerName} · {booking.sport}
          </Text>

          <View style={[styles.modalDivider, { backgroundColor: divider }]} />

          <Text style={[styles.pickerLabel, { color: textColor }]}>Select Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.datesRow}>
            {dates.map((d, i) => {
              const isSelected = d.toDateString() === selectedDate.toDateString();
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.dateChip, { backgroundColor: isSelected ? BLUE : chipBg }]}
                  onPress={() => setSelectedDate(d)}
                  activeOpacity={0.75}>
                  <Text style={[styles.dateChipDay,   { color: isSelected ? 'rgba(255,255,255,0.8)' : textSub }]}>{DAY_SHORT[d.getDay()]}</Text>
                  <Text style={[styles.dateChipNum,   { color: isSelected ? '#FFFFFF' : textColor }]}>{d.getDate()}</Text>
                  <Text style={[styles.dateChipMonth, { color: isSelected ? 'rgba(255,255,255,0.7)' : textSub }]}>{MONTH_SHORT[d.getMonth()]}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={[styles.modalDivider, { backgroundColor: divider }]} />

          <Text style={[styles.pickerLabel, { color: textColor }]}>Select Time</Text>
          <View style={styles.timeGrid}>
            {TIME_SLOTS.map(slot => {
              const isSelected = selectedTime === slot;
              return (
                <TouchableOpacity
                  key={slot}
                  style={[styles.timeChip, { backgroundColor: isSelected ? BLUE : chipBg }]}
                  onPress={() => setSelectedTime(slot)}
                  activeOpacity={0.75}>
                  <Text style={[styles.timeChipText, { color: isSelected ? '#FFFFFF' : textColor }]}>{slot}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.rescheduleConfirmBtn}
            onPress={() => onConfirm(formatDate(selectedDate), selectedTime)}
            activeOpacity={0.85}>
            <Text style={styles.modalBtnText}>Confirm Reschedule</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function BookingDetailScreen() {
  const { id }   = useLocalSearchParams<{ id: string }>();
  const insets   = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  const [booking, setBooking]                     = useState<BookingDetail | null>(null);
  const [loading, setLoading]                     = useState(true);
  const [error, setError]                         = useState<string | null>(null);
  const [showCancel, setShowCancel]               = useState(false);
  const [showReschedule, setShowReschedule]       = useState(false);
  const [rescheduleSuccess, setRescheduleSuccess] = useState(false);
  const [cancelling, setCancelling]               = useState(false);

  useEffect(() => {
    if (!id) return;
    async function fetchBooking() {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('bookings')
        .select('id, trainer_id, date, time_slot, status, price, notes, trainers(full_name, city, rating, is_verified, sports(name, emoji))')
        .eq('id', id)
        .single();
      if (err) {
        setError(err.message);
      } else if (data) {
        setBooking(mapBooking(data as unknown as BookingRow));
      }
      setLoading(false);
    }
    fetchBooking();
  }, [id]);

  useEffect(() => {
    if (rescheduleSuccess) {
      const t = setTimeout(() => setRescheduleSuccess(false), 3000);
      return () => clearTimeout(t);
    }
  }, [rescheduleSuccess]);

  const bg          = isDarkMode ? '#111827' : '#F3F4F6';
  const headerBg    = isDarkMode ? '#111827' : '#FFFFFF';
  const cardBg      = isDarkMode ? '#1F2937' : '#FFFFFF';
  const borderColor = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const divColor    = isDarkMode ? '#374151' : '#F3F4F6';

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: headerBg, borderBottomColor: borderColor }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <ChevronLeft size={24} color={textPrimary} strokeWidth={2} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: textPrimary }]}>Booking Details</Text>
      <View style={styles.backBtn} />
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: bg }]}>
        {header}
        <View style={styles.notFound}>
          <ActivityIndicator size="large" color={BLUE} />
        </View>
      </View>
    );
  }

  if (error || !booking) {
    return (
      <View style={[styles.container, { backgroundColor: bg }]}>
        {header}
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: textSub }]}>{error ?? 'Booking not found.'}</Text>
        </View>
      </View>
    );
  }

  const status     = STATUS_CONFIG[booking.status];
  const isUpcoming = booking.status === 'confirmed' || booking.status === 'pending';
  const isPast     = booking.status === 'completed';
  const serviceFee = Math.round(booking.price * 0.1 * 100) / 100;
  const total      = booking.price + serviceFee;

  async function handleCancel() {
    setCancelling(true);
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id);
    setCancelling(false);
    setBooking(prev => prev ? { ...prev, status: 'cancelled' } : prev);
    setShowCancel(false);
  }

  function handleReschedule(newDate: string, newTime: string) {
    setBooking(prev => prev ? { ...prev, date: newDate, time: newTime } : prev);
    setShowReschedule(false);
    setRescheduleSuccess(true);
  }

  function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
      <View style={styles.detailRow}>
        <View style={styles.detailIcon}>{icon}</View>
        <Text style={[styles.detailLabel, { color: textSub }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: textPrimary }]}>{value}</Text>
      </View>
    );
  }

  function PaymentRow({ label, value, isTotal }: { label: string; value: string; isTotal?: boolean }) {
    return (
      <View style={styles.payRow}>
        <Text style={[styles.payLabel, isTotal ? { color: textPrimary, fontWeight: '700' } : { color: textSub }]}>
          {label}
        </Text>
        <Text style={[styles.payValue, isTotal ? { color: BLUE, fontWeight: '700', fontSize: 16 } : { color: textPrimary }]}>
          {value}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {header}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>

        {/* Trainer card */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: cardBg, borderColor }]}
          onPress={() => router.push(`/trainer/${booking.trainerId}`)}
          activeOpacity={0.7}>
          <View style={[styles.avatar, { backgroundColor: avatarColor(booking.trainerId) }]}>
            <Text style={styles.avatarText}>{booking.initials}</Text>
          </View>
          <View style={styles.trainerInfo}>
            <View style={styles.trainerNameRow}>
              <Text style={[styles.trainerName, { color: textPrimary }]}>{booking.trainerName}</Text>
              {booking.verified && (
                <BadgeCheck size={16} color="#FFFFFF" fill="#22C55E" strokeWidth={2.5} />
              )}
            </View>
            <Text style={[styles.trainerSport, { color: textSub }]}>{booking.emoji} {booking.sport}</Text>
            {booking.rating > 0 && (
              <Text style={[styles.trainerRating, { color: BLUE }]}>★ {booking.rating}</Text>
            )}
          </View>
          <ChevronRight size={18} color={textSub} strokeWidth={2} />
        </TouchableOpacity>

        {/* Status badge */}
        {booking.status !== 'pending' && (
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: isDarkMode ? status.darkBg : status.bg }]}>
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
        )}

        {/* Pending bar */}
        {booking.status === 'pending' && (
          <View style={[styles.pendingBar, { backgroundColor: isDarkMode ? '#2D1A00' : '#FFF8E7' }]}>
            <View style={styles.pendingBarBadge}>
              <Text style={[styles.pendingBarBadgeText, { color: isDarkMode ? '#FCD34D' : '#D97706' }]}>Pending</Text>
            </View>
            <Text style={[styles.pendingBarText, { color: isDarkMode ? '#FCD34D' : '#D97706' }]}>
              Awaiting trainer confirmation
            </Text>
          </View>
        )}

        {/* Reschedule success banner */}
        {rescheduleSuccess && (
          <View style={styles.successBanner}>
            <CheckCircle size={16} color="#16A34A" strokeWidth={2} />
            <Text style={styles.successBannerText}>
              Session rescheduled to {booking.date} at {booking.time}
            </Text>
          </View>
        )}

        {/* Session details */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Session Details</Text>
          <View style={[styles.sectionDivider, { backgroundColor: divColor }]} />
          <DetailRow icon={<Calendar size={15} color={textSub} strokeWidth={2} />} label="Date"         value={booking.date} />
          <View style={[styles.rowDivider, { backgroundColor: divColor }]} />
          <DetailRow icon={<Clock size={15} color={textSub} strokeWidth={2} />}    label="Time"         value={booking.time} />
          <View style={[styles.rowDivider, { backgroundColor: divColor }]} />
          <DetailRow icon={<Timer size={15} color={textSub} strokeWidth={2} />}    label="Duration"     value="60 min" />
          <View style={[styles.rowDivider, { backgroundColor: divColor }]} />
          <DetailRow icon={<User size={15} color={textSub} strokeWidth={2} />}     label="Session type" value="Individual" />
          <View style={[styles.rowDivider, { backgroundColor: divColor }]} />
          <DetailRow icon={<MapPin size={15} color={textSub} strokeWidth={2} />}   label="Location"     value={booking.location} />
        </View>

        {/* Payment */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Payment</Text>
          <View style={[styles.sectionDivider, { backgroundColor: divColor }]} />
          <PaymentRow label="Session price" value={`€${booking.price.toFixed(2)}`} />
          <View style={[styles.rowDivider, { backgroundColor: divColor }]} />
          <PaymentRow label="Service fee"   value={`€${serviceFee.toFixed(2)}`} />
          <View style={[styles.payTotalDivider, { backgroundColor: divColor }]} />
          <View style={styles.payRow}>
            <Text style={[styles.payLabel, { color: textPrimary, fontWeight: '700' }]}>Total paid</Text>
            <View style={styles.payTotalRight}>
              <Text style={[styles.payValue, { color: BLUE, fontWeight: '700', fontSize: 16 }]}>{`€${total.toFixed(2)}`}</Text>
              <Text style={styles.paySuccessLabel}>✓ Payment successful</Text>
            </View>
          </View>
          <View style={[styles.rowDivider, { backgroundColor: divColor }]} />
          <View style={styles.payRow}>
            <Text style={[styles.payLabel, { color: textSub }]}>Payment method</Text>
            <View style={styles.payMethodRow}>
              <CreditCard size={14} color={textSub} strokeWidth={2} />
              <Text style={[styles.payValue, { color: textPrimary }]}>Card</Text>
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Location</Text>
          <View style={[styles.sectionDivider, { backgroundColor: divColor }]} />
          <View style={styles.locationRow}>
            <MapPin size={16} color={BLUE} strokeWidth={2} />
            <Text style={[styles.locationText, { color: textPrimary }]}>{booking.location}</Text>
          </View>
        </View>

      </ScrollView>

      {/* Bottom action bar */}
      {(isUpcoming || isPast) && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12, backgroundColor: headerBg, borderTopColor: borderColor }]}>
          {isUpcoming ? (
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.outlineBtn, { borderColor: isDarkMode ? '#4B5563' : '#E5E7EB', flex: 1 }]}
                onPress={() => setShowCancel(true)}
                activeOpacity={0.8}>
                <Text style={[styles.outlineBtnText, { color: textSub }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, { flex: 1 }]}
                onPress={() => setShowReschedule(true)}
                activeOpacity={0.85}>
                <Text style={styles.primaryBtnText}>Reschedule</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.outlineBtn, { borderColor: BLUE + '40', flex: 1 }]}
                onPress={() => router.back()}
                activeOpacity={0.8}>
                <Text style={[styles.outlineBtnText, { color: BLUE }]}>Leave Review</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, { flex: 1 }]}
                onPress={() => router.push(`/booking/${booking.trainerId}`)}
                activeOpacity={0.85}>
                <Text style={styles.primaryBtnText}>Book Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {showCancel && (
        <CancelModal
          booking={booking}
          isDarkMode={isDarkMode}
          onConfirm={handleCancel}
          onClose={() => setShowCancel(false)}
          confirming={cancelling}
        />
      )}

      {showReschedule && (
        <RescheduleModal
          booking={booking}
          isDarkMode={isDarkMode}
          onConfirm={handleReschedule}
          onClose={() => setShowReschedule(false)}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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

  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 15,
  },

  scroll: {
    padding: 16,
    gap: 12,
  },

  // Status
  statusRow: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Pending bar
  pendingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  pendingBarBadge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: 'rgba(217,119,6,0.12)',
    flexShrink: 0,
  },
  pendingBarBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pendingBarText: {
    fontSize: 13,
    flex: 1,
  },

  // Success banner
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  successBannerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#16A34A',
    flex: 1,
  },

  // Trainer card
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  trainerInfo: {
    flex: 1,
    gap: 3,
  },
  trainerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trainerName: {
    fontSize: 16,
    fontWeight: '700',
  },
  trainerSport: {
    fontSize: 14,
  },
  trainerRating: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Section cards
  section: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },

  // Detail rows
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  detailIcon: {
    width: 20,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    maxWidth: '55%',
    textAlign: 'right',
  },

  // Payment rows
  payRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  payLabel: {
    fontSize: 14,
  },
  payValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  payTotalDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
    marginVertical: 2,
  },
  payTotalRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  paySuccessLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#22C55E',
  },
  payMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  // Location
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  locationText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  outlineBtn: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  outlineBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Modal shared
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
    gap: 16,
  },
  rescheduleSheet: {
    gap: 14,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sheetSub: {
    fontSize: 14,
    marginTop: -8,
  },
  modalDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 2,
  },

  // Cancel modal
  cancelDetailsCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  cancelTrainer: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  cancelDetailLine: {
    fontSize: 14,
  },
  cancelRefundBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  cancelRefundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cancelRefundTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  cancelRefundText: {
    fontSize: 13,
    lineHeight: 19,
  },
  cancelFinalSub: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: -8,
  },
  cancelRefundReminder: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: -4,
  },
  cancelConfirmBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  keepBookingBtn: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  keepBookingBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Reschedule modal
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: -4,
  },
  datesRow: {
    gap: 8,
    paddingVertical: 4,
  },
  dateChip: {
    width: 58,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    gap: 2,
  },
  dateChipDay: {
    fontSize: 11,
    fontWeight: '500',
  },
  dateChipNum: {
    fontSize: 20,
    fontWeight: '700',
  },
  dateChipMonth: {
    fontSize: 10,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  timeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  timeChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rescheduleConfirmBtn: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
});

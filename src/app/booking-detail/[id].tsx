import { router, useLocalSearchParams } from 'expo-router';
import { BadgeCheck, Calendar, CheckCircle, ChevronLeft, ChevronRight, Clock, CreditCard, MapPin, Timer, User, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';

const BLUE = '#208AEF';

// ─── Types & data ─────────────────────────────────────────────────────────────

type Status = 'confirmed' | 'pending' | 'completed' | 'cancelled';

interface Booking {
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
}

const DAY_SHORT   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function relativeDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${DAY_SHORT[d.getDay()]}, ${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDate(d: Date): string {
  return `${DAY_SHORT[d.getDay()]}, ${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

function generateDates(count = 14): Date[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });
}

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
];

const AVATAR_COLORS = [
  '#B5C9E4', '#C8DDB5', '#E4CDB5', '#D4B5E4', '#B5E4D4',
  '#E4B5C8', '#C8B5E4', '#E4E4B5',
];
function avatarColor(id: string) {
  return AVATAR_COLORS[parseInt(id, 10) % AVATAR_COLORS.length];
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; darkBg: string }> = {
  confirmed: { label: 'Confirmed', color: '#16A34A', bg: '#DCFCE7', darkBg: '#052E16' },
  pending:   { label: 'Pending',   color: '#D97706', bg: '#FEF3C7', darkBg: '#2D1A00' },
  completed: { label: 'Completed', color: '#6B7280', bg: '#F3F4F6', darkBg: '#1F2937' },
  cancelled: { label: 'Cancelled', color: '#EF4444', bg: '#FEF2F2', darkBg: '#450A0A' },
};

const ALL_BOOKINGS: Booking[] = [
  { id: '1', trainerId: '1', trainerName: 'Mantas Petrauskas',   initials: 'MP', sport: 'Football', emoji: '⚽', date: relativeDate(3),   time: '10:00', location: 'Vingis Park, Vilnius',            status: 'confirmed', price: 35 },
  { id: '2', trainerId: '2', trainerName: 'Rūta Kazlauskaitė',   initials: 'RK', sport: 'Yoga',     emoji: '🧘', date: relativeDate(7),   time: '09:00', location: 'Studio Zen, Vilnius',              status: 'confirmed', price: 45 },
  { id: '3', trainerId: '5', trainerName: 'Darius Paulauskas',   initials: 'DP', sport: 'Boxing',   emoji: '🥊', date: relativeDate(14),  time: '18:00', location: 'Fight Club Gym, Klaipėda',         status: 'pending',   price: 40 },
  { id: '4', trainerId: '2', trainerName: 'Rūta Kazlauskaitė',   initials: 'RK', sport: 'Yoga',     emoji: '🧘', date: relativeDate(-3),  time: '09:00', location: 'Studio Zen, Vilnius',              status: 'completed', price: 45 },
  { id: '5', trainerId: '1', trainerName: 'Mantas Petrauskas',   initials: 'MP', sport: 'Football', emoji: '⚽', date: relativeDate(-7),  time: '10:00', location: 'Vingis Park, Vilnius',              status: 'completed', price: 35 },
  { id: '6', trainerId: '4', trainerName: 'Aistė Mikalauskaitė', initials: 'AM', sport: 'Tennis',   emoji: '🎾', date: relativeDate(-14), time: '11:00', location: 'Lazdynai Tennis Courts, Vilnius',   status: 'completed', price: 50 },
];

const BOOKING_EXTRAS: Record<string, {
  sessionType: string;
  duration: string;
  address: string;
  paymentMethod: string;
  verified: boolean;
  rating: number;
}> = {
  '1': { sessionType: 'Individual', duration: '60 min', address: 'Čiurlionio g. 29, Vilnius',  paymentMethod: 'Visa •••• 4242',       verified: true,  rating: 4.9 },
  '2': { sessionType: 'Individual', duration: '60 min', address: 'Gedimino pr. 14, Vilnius',   paymentMethod: 'Visa •••• 4242',       verified: true,  rating: 4.8 },
  '3': { sessionType: 'Individual', duration: '60 min', address: 'Taikos pr. 3, Klaipėda',     paymentMethod: 'Mastercard •••• 8881', verified: true,  rating: 4.7 },
  '4': { sessionType: 'Individual', duration: '60 min', address: 'Gedimino pr. 14, Vilnius',   paymentMethod: 'Visa •••• 4242',       verified: true,  rating: 4.8 },
  '5': { sessionType: 'Individual', duration: '60 min', address: 'Čiurlionio g. 29, Vilnius',  paymentMethod: 'Visa •••• 4242',       verified: true,  rating: 4.9 },
  '6': { sessionType: 'Individual', duration: '60 min', address: 'Lazdynų g. 5, Vilnius',      paymentMethod: 'Apple Pay',            verified: false, rating: 4.7 },
};

// ─── Cancel modal ─────────────────────────────────────────────────────────────

function CancelModal({ booking, isDarkMode, onConfirm, onClose }: {
  booking: Booking;
  isDarkMode: boolean;
  onConfirm: () => void;
  onClose: () => void;
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
          <View style={[styles.cancelPolicyBox, {
            backgroundColor: isDarkMode ? '#2D1A00' : '#FFFBEB',
            borderColor: '#D97706',
          }]}>
            <Text style={[styles.cancelPolicyText, { color: isDarkMode ? '#FCD34D' : '#92400E' }]}>
              ⚠️  Cancellations within 24 hours may incur a fee of up to 50% of the session price.
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
          <TouchableOpacity style={styles.cancelConfirmBtn} onPress={onConfirm} activeOpacity={0.85}>
            <Text style={styles.modalBtnText}>Yes, Cancel</Text>
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
  booking: Booking;
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.datesRow}>
            {dates.map((d, i) => {
              const isSelected = d.toDateString() === selectedDate.toDateString();
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.dateChip, { backgroundColor: isSelected ? BLUE : chipBg }]}
                  onPress={() => setSelectedDate(d)}
                  activeOpacity={0.75}>
                  <Text style={[styles.dateChipDay, { color: isSelected ? 'rgba(255,255,255,0.8)' : textSub }]}>
                    {DAY_SHORT[d.getDay()]}
                  </Text>
                  <Text style={[styles.dateChipNum, { color: isSelected ? '#FFFFFF' : textColor }]}>
                    {d.getDate()}
                  </Text>
                  <Text style={[styles.dateChipMonth, { color: isSelected ? 'rgba(255,255,255,0.7)' : textSub }]}>
                    {MONTH_SHORT[d.getMonth()]}
                  </Text>
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
                  <Text style={[styles.timeChipText, { color: isSelected ? '#FFFFFF' : textColor }]}>
                    {slot}
                  </Text>
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

  const [booking, setBooking]                     = useState<Booking | undefined>(() => ALL_BOOKINGS.find(b => b.id === id));
  const [showCancel, setShowCancel]               = useState(false);
  const [showReschedule, setShowReschedule]       = useState(false);
  const [rescheduleSuccess, setRescheduleSuccess] = useState(false);

  useEffect(() => {
    if (rescheduleSuccess) {
      const t = setTimeout(() => setRescheduleSuccess(false), 3000);
      return () => clearTimeout(t);
    }
  }, [rescheduleSuccess]);

  const extras = booking ? (BOOKING_EXTRAS[booking.id] ?? null) : null;

  const bg          = isDarkMode ? '#111827' : '#F3F4F6';
  const headerBg    = isDarkMode ? '#111827' : '#FFFFFF';
  const cardBg      = isDarkMode ? '#1F2937' : '#FFFFFF';
  const borderColor = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const divColor    = isDarkMode ? '#374151' : '#F3F4F6';

  if (!booking) {
    return (
      <View style={[styles.container, { backgroundColor: bg }]}>
        <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: headerBg, borderBottomColor: borderColor }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ChevronLeft size={24} color={textPrimary} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textPrimary }]}>Booking Details</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: textSub }]}>Booking not found.</Text>
        </View>
      </View>
    );
  }

  const status     = STATUS_CONFIG[booking.status];
  const isUpcoming = booking.status === 'confirmed' || booking.status === 'pending';
  const isPast     = booking.status === 'completed';
  const serviceFee = Math.round(booking.price * 0.1 * 100) / 100;
  const total      = booking.price + serviceFee;

  function handleCancel() {
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

  function PaymentRow({ label, value, total: isTotal }: { label: string; value: string; total?: boolean }) {
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
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: headerBg, borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={24} color={textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Booking Details</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>

        {/* Status badge */}
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: isDarkMode ? status.darkBg : status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        {/* Reschedule success banner */}
        {rescheduleSuccess && (
          <View style={styles.successBanner}>
            <CheckCircle size={16} color="#16A34A" strokeWidth={2} />
            <Text style={styles.successBannerText}>
              Session rescheduled to {booking.date} at {booking.time}
            </Text>
          </View>
        )}

        {/* Trainer */}
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
              {extras?.verified && (
                <BadgeCheck size={16} color="#FFFFFF" fill="#22C55E" strokeWidth={2.5} />
              )}
            </View>
            <Text style={[styles.trainerSport, { color: textSub }]}>
              {booking.emoji} {booking.sport}
            </Text>
            {extras && (
              <Text style={[styles.trainerRating, { color: BLUE }]}>★ {extras.rating}</Text>
            )}
          </View>
          <ChevronRight size={18} color={textSub} strokeWidth={2} />
        </TouchableOpacity>

        {/* Session details */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Session Details</Text>
          <View style={[styles.sectionDivider, { backgroundColor: divColor }]} />
          <DetailRow
            icon={<Calendar size={15} color={textSub} strokeWidth={2} />}
            label="Date"
            value={booking.date}
          />
          <View style={[styles.rowDivider, { backgroundColor: divColor }]} />
          <DetailRow
            icon={<Clock size={15} color={textSub} strokeWidth={2} />}
            label="Time"
            value={booking.time}
          />
          <View style={[styles.rowDivider, { backgroundColor: divColor }]} />
          <DetailRow
            icon={<Timer size={15} color={textSub} strokeWidth={2} />}
            label="Duration"
            value={extras?.duration ?? '60 min'}
          />
          <View style={[styles.rowDivider, { backgroundColor: divColor }]} />
          <DetailRow
            icon={<User size={15} color={textSub} strokeWidth={2} />}
            label="Session type"
            value={extras?.sessionType ?? 'Individual'}
          />
          <View style={[styles.rowDivider, { backgroundColor: divColor }]} />
          <DetailRow
            icon={<MapPin size={15} color={textSub} strokeWidth={2} />}
            label="Location"
            value={booking.location}
          />
        </View>

        {/* Payment */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Payment</Text>
          <View style={[styles.sectionDivider, { backgroundColor: divColor }]} />
          <PaymentRow label="Session price" value={`€${booking.price.toFixed(2)}`} />
          <View style={[styles.rowDivider, { backgroundColor: divColor }]} />
          <PaymentRow label="Service fee" value={`€${serviceFee.toFixed(2)}`} />
          <View style={[styles.payTotalDivider, { backgroundColor: divColor }]} />
          <PaymentRow label="Total paid" value={`€${total.toFixed(2)}`} total />
          <View style={[styles.rowDivider, { backgroundColor: divColor }]} />
          <View style={styles.payRow}>
            <Text style={[styles.payLabel, { color: textSub }]}>Payment method</Text>
            <View style={styles.payMethodRow}>
              <CreditCard size={14} color={textSub} strokeWidth={2} />
              <Text style={[styles.payValue, { color: textPrimary }]}>{extras?.paymentMethod ?? 'Card'}</Text>
            </View>
          </View>
        </View>

        {/* Location */}
        {extras && (
          <View style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Location</Text>
            <View style={[styles.sectionDivider, { backgroundColor: divColor }]} />
            <View style={styles.locationRow}>
              <MapPin size={16} color={BLUE} strokeWidth={2} />
              <Text style={[styles.locationText, { color: textPrimary }]}>{extras.address}</Text>
            </View>
          </View>
        )}

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
  cancelPolicyBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  cancelPolicyText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  cancelFinalSub: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: -8,
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

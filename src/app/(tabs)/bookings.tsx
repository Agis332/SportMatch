import { router } from 'expo-router';
import { Calendar, ChevronLeft, ChevronRight, Clock, Info, MapPin, Star, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthContext } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';

const BLUE = '#208AEF';

const AVATAR_COLORS = [
  '#B5C9E4', '#C8DDB5', '#E4CDB5', '#D4B5E4', '#B5E4D4',
  '#E4B5C8', '#C8B5E4', '#E4E4B5',
];
function avatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
const DAY_SHORT   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const CAL_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTH_MAP: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

function parseBookingDate(dateStr: string): Date | null {
  const match = dateStr.match(/\w+,\s+(\d+)\s+(\w+)\s+(\d+)/);
  if (!match) return null;
  const month = MONTH_MAP[match[2]];
  if (month === undefined) return null;
  return new Date(parseInt(match[3]), month, parseInt(match[1]));
}

function generateDates(count = 14): Date[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });
}

function formatDate(d: Date): string {
  return `${DAY_SHORT[d.getDay()]}, ${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

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

interface BookingRow {
  id: string;
  trainer_id: string;
  date: string;
  time_slot: string;
  status: string;
  price: number;
  trainers: {
    full_name: string;
    city: string | null;
    sports: { name: string; emoji: string } | { name: string; emoji: string }[] | null;
  } | null;
}

function mapBooking(row: BookingRow): Booking {
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
  };
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; darkBg: string }> = {
  confirmed: { label: 'Confirmed', color: '#16A34A', bg: '#DCFCE7', darkBg: '#052E16' },
  pending:   { label: 'Pending',   color: '#D97706', bg: '#FEF3C7', darkBg: '#2D1A00' },
  completed: { label: 'Completed', color: '#6B7280', bg: '#F3F4F6', darkBg: '#1F2937' },
  cancelled: { label: 'Cancelled', color: '#EF4444', bg: '#FEF2F2', darkBg: '#450A0A' },
};

// ─── Booking card ─────────────────────────────────────────────────────────────

function BookingCard({ booking, isDarkMode, onLeaveReview, onReschedule, onCancel, onPress }: {
  booking: Booking;
  isDarkMode: boolean;
  onLeaveReview: () => void;
  onReschedule: () => void;
  onCancel: () => void;
  onPress: () => void;
}) {
  const cardBg      = isDarkMode ? '#1F2937' : '#FFFFFF';
  const cardBorder  = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const divider     = isDarkMode ? '#374151' : '#F3F4F6';
  const cancelBorder = isDarkMode ? '#4B5563' : '#E5E7EB';

  const status = STATUS_CONFIG[booking.status];
  const isUpcoming = booking.status === 'confirmed' || booking.status === 'pending';

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}
      onPress={onPress}
      activeOpacity={0.97}>
      {/* Trainer row */}
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, { backgroundColor: avatarColor(booking.trainerId) }]}>
          <Text style={styles.avatarText}>{booking.initials}</Text>
        </View>
        <View style={styles.cardHeaderInfo}>
          <Text style={[styles.trainerName, { color: textPrimary }]}>{booking.trainerName}</Text>
          <Text style={[styles.sport, { color: textSub }]}>{booking.emoji} {booking.sport}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: isDarkMode ? status.darkBg : status.bg }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: divider }]} />

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Calendar size={14} color={textSub} strokeWidth={2} />
          <Text style={[styles.detailText, { color: textSub }]}>{booking.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Clock size={14} color={textSub} strokeWidth={2} />
          <Text style={[styles.detailText, { color: textSub }]}>{booking.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={14} color={textSub} strokeWidth={2} />
          <Text style={[styles.detailText, { color: textSub }]} numberOfLines={1}>{booking.location}</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: divider }]} />

      {/* Footer */}
      <View style={styles.cardFooter}>
        <Text style={[styles.price, { color: textPrimary }]}>
          €{booking.price}<Text style={[styles.priceSub, { color: textSub }]}>/hr</Text>
        </Text>
        {isUpcoming ? (
          <View style={styles.footerBtns}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: cancelBorder }]}
              onPress={onCancel}
              activeOpacity={0.75}>
              <Text style={[styles.cancelBtnText, { color: textSub }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rescheduleBtn, { borderColor: BLUE }]}
              onPress={onReschedule}
              activeOpacity={0.75}>
              <Text style={styles.rescheduleBtnText}>Reschedule</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.reviewBtn} onPress={onLeaveReview} activeOpacity={0.85}>
            <Text style={styles.reviewBtnText}>Leave Review</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Review modal ─────────────────────────────────────────────────────────────

function ReviewModal({ booking, isDarkMode, onClose }: {
  booking: Booking;
  isDarkMode: boolean;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const sheetBg   = isDarkMode ? '#1F2937' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub   = isDarkMode ? '#9CA3AF' : '#6B7280';
  const inputBg   = isDarkMode ? '#374151' : '#F9FAFB';
  const inputBorder = isDarkMode ? '#4B5563' : '#E5E7EB';

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: sheetBg }]} onPress={() => {}}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: textColor }]}>Leave a Review</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color={textSub} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.sheetSub, { color: textSub }]}>
            {booking.emoji} {booking.trainerName} · {booking.sport}
          </Text>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(n => (
              <TouchableOpacity key={n} onPress={() => setRating(n)} activeOpacity={0.7}>
                <Star
                  size={36}
                  color="#F59E0B"
                  fill={n <= rating ? '#F59E0B' : 'transparent'}
                  strokeWidth={n <= rating ? 0 : 1.5}
                />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={[styles.ratingLabel, { color: textSub }]}>
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
            </Text>
          )}

          <TextInput
            style={[styles.commentInput, { backgroundColor: inputBg, borderColor: inputBorder, color: textColor }]}
            value={comment}
            onChangeText={setComment}
            placeholder="Share your experience with this trainer…"
            placeholderTextColor="#AAAAAA"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.submitBtn, rating === 0 && styles.submitBtnDisabled]}
            onPress={onClose}
            disabled={rating === 0}
            activeOpacity={0.85}>
            <Text style={styles.submitBtnText}>Submit Review</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Reschedule modal ─────────────────────────────────────────────────────────

function RescheduleModal({ booking, isDarkMode, onClose }: {
  booking: Booking;
  isDarkMode: boolean;
  onClose: () => void;
}) {
  const dates = generateDates(14);
  const [selectedDate, setSelectedDate] = useState<Date>(dates[0]);
  const [selectedTime, setSelectedTime] = useState<string>(TIME_SLOTS[1]);

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

          <View style={[styles.sectionDivider, { backgroundColor: divider }]} />

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

          <View style={[styles.sectionDivider, { backgroundColor: divider }]} />

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

          <TouchableOpacity style={styles.submitBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.submitBtnText}>
              Confirm — {DAY_SHORT[selectedDate.getDay()]}, {selectedDate.getDate()} {MONTH_SHORT[selectedDate.getMonth()]} at {selectedTime}
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Cancel modal ────────────────────────────────────────────────────────────

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

  // ── Step 1: details + policy ─────────────────────────────────────────────────
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
            <Text style={[styles.cancelTrainer, { color: textColor }]}>
              {booking.emoji}  {booking.trainerName}
            </Text>
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
            <Text style={styles.submitBtnText}>Cancel Booking</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.keepBookingBtn, { borderColor: divider }]}
            onPress={onClose}
            activeOpacity={0.7}>
            <Text style={[styles.keepBookingBtnText, { color: textColor }]}>Keep Booking</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );

  // ── Step 2: final confirmation ───────────────────────────────────────────────
  return (
    <Modal visible transparent animationType="slide" onRequestClose={() => setStep(1)}>
      <Pressable style={styles.overlay} onPress={() => setStep(1)}>
        <Pressable style={[styles.sheet, { backgroundColor: sheetBg }]} onPress={() => {}}>
          <View style={styles.sheetHandle} />

          <Text style={[styles.sheetTitle, { color: textColor, textAlign: 'center' }]}>
            Are you sure?
          </Text>
          <Text style={[styles.cancelFinalSub, { color: textSub }]}>
            This cannot be undone.
          </Text>
          <Text style={[styles.cancelRefundReminder, { color: textSub }]}>
            Refund will be processed within 3–5 business days.
          </Text>

          <TouchableOpacity style={styles.cancelConfirmBtn} onPress={onConfirm} activeOpacity={0.85}>
            <Text style={styles.submitBtnText}>Yes, Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.keepBookingBtn, { borderColor: divider }]}
            onPress={() => setStep(1)}
            activeOpacity={0.7}>
            <Text style={[styles.keepBookingBtnText, { color: textColor }]}>Go Back</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Calendar booking card ────────────────────────────────────────────────────

function CalendarBookingCard({ booking, isDarkMode }: { booking: Booking; isDarkMode: boolean }) {
  const cardBg      = isDarkMode ? '#1F2937' : '#FFFFFF';
  const cardBorder  = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const dividerColor = isDarkMode ? '#374151' : '#F3F4F6';
  const status      = STATUS_CONFIG[booking.status];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}
      onPress={() => router.push(`/booking-detail/${booking.id}`)}
      activeOpacity={0.97}>
      {/* Trainer row */}
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, { backgroundColor: avatarColor(booking.trainerId) }]}>
          <Text style={styles.avatarText}>{booking.initials}</Text>
        </View>
        <View style={styles.cardHeaderInfo}>
          <Text style={[styles.trainerName, { color: textPrimary }]}>{booking.trainerName}</Text>
          <Text style={[styles.sport, { color: textSub }]}>{booking.emoji} {booking.sport}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: isDarkMode ? status.darkBg : status.bg }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: dividerColor }]} />

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Calendar size={14} color={textSub} strokeWidth={2} />
          <Text style={[styles.detailText, { color: textSub }]}>{booking.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Clock size={14} color={textSub} strokeWidth={2} />
          <Text style={[styles.detailText, { color: textSub }]}>{booking.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={14} color={textSub} strokeWidth={2} />
          <Text style={[styles.detailText, { color: textSub }]} numberOfLines={1}>{booking.location}</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: dividerColor }]} />

      {/* Price */}
      <View style={styles.cardFooter}>
        <Text style={[styles.price, { color: textPrimary }]}>
          €{booking.price}<Text style={[styles.priceSub, { color: textSub }]}>/hr</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Month calendar ───────────────────────────────────────────────────────────

function MonthCalendar({ isDarkMode, allBookings }: { isDarkMode: boolean; allBookings: Booking[] }) {
  const { width: screenWidth } = useWindowDimensions();
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  function prevMonth() { setViewDate(new Date(year, month - 1, 1)); setSelectedDay(null); }
  function nextMonth() { setViewDate(new Date(year, month + 1, 1)); setSelectedDay(null); }

  const daysInMonth    = new Date(year, month + 1, 0).getDate();
  const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7; // Mon = 0
  const totalCells     = Math.ceil((firstDayOffset + daysInMonth) / 7) * 7;
  const cells          = Array.from({ length: totalCells }, (_, i) => {
    const d = i - firstDayOffset + 1;
    return d >= 1 && d <= daysInMonth ? d : null;
  });

  function bookingsOnDay(day: number): Booking[] {
    return allBookings.filter(b => {
      const d = parseBookingDate(b.date);
      return d && d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  }

  const cellSize    = Math.floor((screenWidth - 64) / 7);
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#6B7280' : '#9CA3AF';
  const calBg       = isDarkMode ? '#1F2937' : '#FFFFFF';
  const groupLabel  = isDarkMode ? '#6B7280' : '#9CA3AF';

  const todayDate = new Date();
  function isToday(day: number) {
    return day === todayDate.getDate() && month === todayDate.getMonth() && year === todayDate.getFullYear();
  }

  const selectedBookings = selectedDay ? bookingsOnDay(selectedDay) : [];

  return (
    <>
      <View style={[styles.calCard, { backgroundColor: calBg }]}>
        {/* Month nav */}
        <View style={styles.calNav}>
          <TouchableOpacity onPress={prevMonth} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
            <ChevronLeft size={22} color={textPrimary} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={[styles.calMonthLabel, { color: textPrimary }]}>
            {MONTH_NAMES[month]} {year}
          </Text>
          <TouchableOpacity onPress={nextMonth} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
            <ChevronRight size={22} color={textPrimary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Day-of-week headers */}
        <View style={styles.calDayHeaders}>
          {CAL_HEADERS.map((h, i) => (
            <View key={i} style={{ width: cellSize, alignItems: 'center' }}>
              <Text style={[styles.calDayHeaderText, { color: textSub }]}>{h}</Text>
            </View>
          ))}
        </View>

        {/* Days grid */}
        <View style={styles.calGrid}>
          {cells.map((day, i) => {
            if (day === null) {
              return <View key={i} style={{ width: cellSize, height: 60 }} />;
            }
            const dayBookings = bookingsOnDay(day);
            const hasBooking  = dayBookings.length > 0;
            const isSelected  = selectedDay === day;
            const isTodayDay  = isToday(day);
            const firstBooking = dayBookings[0];

            const numColor = isTodayDay && !isSelected
              ? '#FFFFFF'
              : isSelected
              ? BLUE
              : textPrimary;

            const pillBg = firstBooking?.status === 'completed' ? '#9CA3AF' : BLUE;

            return (
              <TouchableOpacity
                key={i}
                style={[styles.calCell, { width: cellSize, height: 60 }]}
                onPress={() => setSelectedDay(isSelected ? null : day)}
                activeOpacity={0.7}>

                {/* Day number circle */}
                <View style={[
                  styles.calDayCircle,
                  isTodayDay && !isSelected && styles.calDayCircleToday,
                  isSelected && styles.calDayCircleSelected,
                ]}>
                  <Text style={[styles.calDayNum, { color: numColor }]}>{day}</Text>
                </View>

                {/* Event pill */}
                {hasBooking && (
                  <View style={[styles.calEventPill, { backgroundColor: pillBg, maxWidth: cellSize - 4 }]}>
                    <Text style={styles.calEventText} numberOfLines={1}>
                      {firstBooking.emoji} {firstBooking.sport}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Selected day cards */}
      {selectedDay !== null && selectedBookings.length > 0 && (
        <View style={styles.calDaySection}>
          <Text style={[styles.calDayLabel, { color: groupLabel }]}>
            {DAY_SHORT[new Date(year, month, selectedDay).getDay()]}, {selectedDay} {MONTH_SHORT[month]} {year}
          </Text>
          {selectedBookings.map(b => (
            <CalendarBookingCard key={b.id} booking={b} isDarkMode={isDarkMode} />
          ))}
        </View>
      )}
    </>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const { currentUser } = useAuthContext();
  const { width: screenWidth } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState(0);
  const [upcoming, setUpcoming]   = useState<Booking[]>([]);
  const [past,     setPast]       = useState<Booking[]>([]);
  const [loading,  setLoading]    = useState(true);
  const [reviewBooking,     setReviewBooking]     = useState<Booking | null>(null);
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [cancelBooking,     setCancelBooking]     = useState<Booking | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    async function fetchBookings() {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('id, trainer_id, date, time_slot, status, price, trainers(full_name, city, sports(name, emoji))')
        .eq('client_id', currentUser!.id)
        .order('date', { ascending: true });
      if (!error && data) {
        const mapped = (data as unknown as BookingRow[]).map(mapBooking);
        setUpcoming(mapped.filter(b => b.status === 'confirmed' || b.status === 'pending'));
        setPast(mapped.filter(b => b.status === 'completed' || b.status === 'cancelled'));
      }
      setLoading(false);
    }
    fetchBookings();
  }, [currentUser]);

  async function handleCancel(booking: Booking) {
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id);
    setUpcoming(prev => prev.filter(b => b.id !== booking.id));
    setPast(prev => [{ ...booking, status: 'cancelled' as const }, ...prev]);
    setCancelBooking(null);
  }

  const pageRef    = useRef<ScrollView>(null);
  const underlineX = useSharedValue(0);
  const tabWidth   = screenWidth / 2;

  const underlineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: underlineX.value }],
  }));

  function switchTab(index: number) {
    setActiveTab(index);
    underlineX.value = withTiming(index * tabWidth, { duration: 200 });
    pageRef.current?.scrollTo({ x: index * screenWidth, animated: true });
  }

  function handlePageScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const page = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    if (page !== activeTab) {
      setActiveTab(page);
      underlineX.value = withTiming(page * tabWidth, { duration: 150 });
    }
  }

  const bg           = isDarkMode ? '#111827' : '#F3F4F6';
  const textPrimary  = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub      = isDarkMode ? '#9CA3AF' : '#6B7280';
  const headerBg     = isDarkMode ? '#111827' : '#FFFFFF';
  const borderColor  = isDarkMode ? '#1F2937' : '#F3F4F6';
  const tabBorderColor = isDarkMode ? '#1F2937' : '#F0F0F0';
  const tabInactive  = isDarkMode ? '#6B7280' : '#9CA3AF';
  const sectionColor = isDarkMode ? '#6B7280' : '#9CA3AF';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: headerBg, borderBottomColor: borderColor }]}>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>My Bookings</Text>
      </View>

      {/* Tab bar */}
      <View style={[styles.tabBar, { backgroundColor: headerBg, borderBottomColor: tabBorderColor }]}>
        <Pressable style={[styles.tabItem, { width: tabWidth }]} onPress={() => switchTab(0)}>
          <Text style={[styles.tabLabel, { color: activeTab === 0 ? BLUE : tabInactive }]}>
            Bookings
          </Text>
        </Pressable>
        <Pressable style={[styles.tabItem, { width: tabWidth }]} onPress={() => switchTab(1)}>
          <Text style={[styles.tabLabel, { color: activeTab === 1 ? BLUE : tabInactive }]}>
            Calendar
          </Text>
        </Pressable>
        <Animated.View style={[styles.tabUnderline, { width: tabWidth }, underlineStyle]} />
      </View>

      {/* Paged content */}
      <ScrollView
        ref={pageRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handlePageScroll}
        style={styles.pager}>

        {/* Bookings page */}
        <View style={{ width: screenWidth, flex: 1 }}>
          <ScrollView
            contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
            showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.empty}>
                <ActivityIndicator size="large" color={BLUE} />
              </View>
            ) : upcoming.length === 0 && past.length === 0 ? (
              <View style={styles.empty}>
                <Calendar size={40} color={isDarkMode ? '#374151' : '#E5E7EB'} strokeWidth={1.5} />
                <Text style={[styles.emptyTitle, { color: textPrimary }]}>No bookings yet</Text>
                <Text style={[styles.emptySub, { color: textSub }]}>
                  Book a session with a trainer to get started.
                </Text>
              </View>
            ) : (
              <>
                {upcoming.length > 0 && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: sectionColor }]}>Upcoming</Text>
                    {upcoming.map(booking => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        isDarkMode={isDarkMode}
                        onPress={() => router.push(`/booking-detail/${booking.id}`)}
                        onLeaveReview={() => setReviewBooking(booking)}
                        onReschedule={() => setRescheduleBooking(booking)}
                        onCancel={() => setCancelBooking(booking)}
                      />
                    ))}
                  </View>
                )}
                {past.length > 0 && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: sectionColor }]}>Past</Text>
                    {past.map(booking => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        isDarkMode={isDarkMode}
                        onPress={() => router.push(`/booking-detail/${booking.id}`)}
                        onLeaveReview={() => setReviewBooking(booking)}
                        onReschedule={() => setRescheduleBooking(booking)}
                        onCancel={() => {}}
                      />
                    ))}
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>

        {/* Calendar page */}
        <View style={{ width: screenWidth, flex: 1 }}>
          <ScrollView
            contentContainerStyle={[styles.calScrollContent, { paddingBottom: insets.bottom + 24 }]}
            showsVerticalScrollIndicator={false}>
            <MonthCalendar isDarkMode={isDarkMode} allBookings={[...upcoming, ...past]} />
          </ScrollView>
        </View>
      </ScrollView>

      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          isDarkMode={isDarkMode}
          onClose={() => setReviewBooking(null)}
        />
      )}
      {rescheduleBooking && (
        <RescheduleModal
          booking={rescheduleBooking}
          isDarkMode={isDarkMode}
          onClose={() => setRescheduleBooking(null)}
        />
      )}
      {cancelBooking && (
        <CancelModal
          booking={cancelBooking}
          isDarkMode={isDarkMode}
          onConfirm={() => handleCancel(cancelBooking)}
          onClose={() => setCancelBooking(null)}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    position: 'relative',
  },
  tabItem: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2,
    backgroundColor: BLUE,
    borderRadius: 1,
  },
  pager: {
    flex: 1,
  },

  // List
  list: {
    padding: 16,
    gap: 20,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    paddingHorizontal: 4,
  },

  // Card
  card: {
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  cardHeaderInfo: {
    flex: 1,
    gap: 3,
  },
  trainerName: {
    fontSize: 15,
    fontWeight: '600',
  },
  sport: {
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    flexShrink: 0,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },

  // Details
  details: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    flex: 1,
  },

  // Footer
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
  },
  priceSub: {
    fontSize: 13,
    fontWeight: '400',
  },
  footerBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  rescheduleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  rescheduleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: BLUE,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  reviewBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: BLUE,
  },
  reviewBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Empty
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
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
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 2,
  },

  // Review modal
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  ratingLabel: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    marginTop: -8,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    minHeight: 100,
  },
  submitBtn: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitBtnText: {
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

  // Calendar tab
  calScrollContent: {
    padding: 16,
    gap: 16,
  },
  calCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  calNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  calMonthLabel: {
    fontSize: 17,
    fontWeight: '700',
  },
  calDayHeaders: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  calDayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calCell: {
    alignItems: 'center',
    paddingTop: 6,
    gap: 4,
  },
  calDayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calDayCircleToday: {
    backgroundColor: BLUE,
  },
  calDayCircleSelected: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: BLUE,
    backgroundColor: 'transparent',
  },
  calDayNum: {
    fontSize: 15,
    fontWeight: '500',
  },
  calEventPill: {
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  calEventText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  calDaySection: {
    gap: 10,
  },
  calDayLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    paddingHorizontal: 4,
  },
  calBookingCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  calBookingInfo: {
    flex: 1,
    gap: 4,
  },
  calBookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calBookingMeta: {
    fontSize: 12,
  },
});

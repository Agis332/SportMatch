import { router } from 'expo-router';
import { Calendar, ChevronLeft, Clock, MapPin, Star, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';

const BLUE = '#208AEF';

const AVATAR_COLORS = [
  '#B5C9E4', '#C8DDB5', '#E4CDB5', '#D4B5E4', '#B5E4D4',
  '#E4B5C8', '#C8B5E4', '#E4E4B5',
];
function avatarColor(id: string) {
  return AVATAR_COLORS[parseInt(id, 10) % AVATAR_COLORS.length];
}

const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
const DAY_SHORT  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function generateDates(count = 14): Date[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });
}

type Status = 'confirmed' | 'pending' | 'completed';

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

const UPCOMING: Booking[] = [
  {
    id: '1', trainerId: '1',
    trainerName: 'Mantas Petrauskas', initials: 'MP',
    sport: 'Football', emoji: '⚽',
    date: 'Tue, 24 Jun 2026', time: '10:00',
    location: 'Vingis Park, Vilnius',
    status: 'confirmed', price: 35,
  },
  {
    id: '2', trainerId: '2',
    trainerName: 'Rūta Kazlauskaitė', initials: 'RK',
    sport: 'Yoga', emoji: '🧘',
    date: 'Thu, 26 Jun 2026', time: '09:00',
    location: 'Studio Zen, Vilnius',
    status: 'confirmed', price: 45,
  },
  {
    id: '3', trainerId: '5',
    trainerName: 'Darius Paulauskas', initials: 'DP',
    sport: 'Boxing', emoji: '🥊',
    date: 'Sat, 28 Jun 2026', time: '18:00',
    location: 'Fight Club Gym, Klaipėda',
    status: 'pending', price: 40,
  },
];

const PAST: Booking[] = [
  {
    id: '4', trainerId: '2',
    trainerName: 'Rūta Kazlauskaitė', initials: 'RK',
    sport: 'Yoga', emoji: '🧘',
    date: 'Mon, 16 Jun 2026', time: '09:00',
    location: 'Studio Zen, Vilnius',
    status: 'completed', price: 45,
  },
  {
    id: '5', trainerId: '1',
    trainerName: 'Mantas Petrauskas', initials: 'MP',
    sport: 'Football', emoji: '⚽',
    date: 'Wed, 11 Jun 2026', time: '10:00',
    location: 'Vingis Park, Vilnius',
    status: 'completed', price: 35,
  },
  {
    id: '6', trainerId: '4',
    trainerName: 'Aistė Mikalauskaitė', initials: 'AM',
    sport: 'Tennis', emoji: '🎾',
    date: 'Sat, 7 Jun 2026', time: '11:00',
    location: 'Lazdynai Tennis Courts, Vilnius',
    status: 'completed', price: 50,
  },
];

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; darkBg: string }> = {
  confirmed: { label: 'Confirmed', color: '#16A34A', bg: '#DCFCE7', darkBg: '#052E16' },
  pending:   { label: 'Pending',   color: '#D97706', bg: '#FEF3C7', darkBg: '#2D1A00' },
  completed: { label: 'Completed', color: '#6B7280', bg: '#F3F4F6', darkBg: '#1F2937' },
};

// ─── Booking card ─────────────────────────────────────────────────────────────

function BookingCard({ booking, isDarkMode, onLeaveReview, onReschedule }: {
  booking: Booking;
  isDarkMode: boolean;
  onLeaveReview: () => void;
  onReschedule: () => void;
}) {
  const cardBg      = isDarkMode ? '#1F2937' : '#FFFFFF';
  const cardBorder  = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const divider     = isDarkMode ? '#374151' : '#F3F4F6';
  const cancelBorder = isDarkMode ? '#4B5563' : '#E5E7EB';

  const status = STATUS_CONFIG[booking.status];
  const isUpcoming = booking.status !== 'completed';

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
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
              style={[styles.rescheduleBtn, { borderColor: BLUE }]}
              onPress={onReschedule}
              activeOpacity={0.75}>
              <Text style={styles.rescheduleBtnText}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: cancelBorder }]}
              activeOpacity={0.75}>
              <Text style={[styles.cancelBtnText, { color: textSub }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.reviewBtn} onPress={onLeaveReview} activeOpacity={0.85}>
            <Text style={styles.reviewBtnText}>Leave Review</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
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
          {/* Handle */}
          <View style={styles.sheetHandle} />

          {/* Title */}
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: textColor }]}>Leave a Review</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color={textSub} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.sheetSub, { color: textSub }]}>
            {booking.emoji} {booking.trainerName} · {booking.sport}
          </Text>

          {/* Stars */}
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

          {/* Comment */}
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

          {/* Submit */}
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

          {/* Date */}
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
                  style={[
                    styles.dateChip,
                    { backgroundColor: isSelected ? BLUE : chipBg },
                  ]}
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

          {/* Time */}
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

          {/* Confirm */}
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

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);

  const bg          = isDarkMode ? '#111827' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const headerBg    = isDarkMode ? '#111827' : '#FFFFFF';
  const borderColor = isDarkMode ? '#1F2937' : '#F3F4F6';
  const tabBarBg    = isDarkMode ? '#1F2937' : '#FFFFFF';
  const tabBorder   = isDarkMode ? '#374151' : '#E5E7EB';

  const data = tab === 'upcoming' ? UPCOMING : PAST;

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
        <Text style={[styles.headerTitle, { color: textPrimary }]}>My Bookings</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: tabBarBg, borderBottomColor: tabBorder }]}>
        {(['upcoming', 'past'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
            activeOpacity={0.7}>
            <Text style={[styles.tabText, { color: tab === t ? BLUE : textSub }, tab === t && styles.tabTextActive]}>
              {t === 'upcoming' ? 'Upcoming' : 'Past'}
            </Text>
            {tab === t && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}>
        {data.length === 0 ? (
          <View style={styles.empty}>
            <Calendar size={40} color={isDarkMode ? '#374151' : '#E5E7EB'} strokeWidth={1.5} />
            <Text style={[styles.emptyTitle, { color: textPrimary }]}>No bookings yet</Text>
            <Text style={[styles.emptySub, { color: textSub }]}>
              Book a session with a trainer to get started.
            </Text>
          </View>
        ) : (
          data.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              isDarkMode={isDarkMode}
              onLeaveReview={() => setReviewBooking(booking)}
              onReschedule={() => setRescheduleBooking(booking)}
            />
          ))
        )}
      </ScrollView>

      {/* Modals */}
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
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
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

  // Tabs
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    position: 'relative',
  },
  tabActive: {},
  tabText: {
    fontSize: 15,
    fontWeight: '500',
  },
  tabTextActive: {
    fontWeight: '700',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 2,
    borderRadius: 1,
    backgroundColor: BLUE,
  },

  // List
  list: {
    padding: 16,
    gap: 14,
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
});

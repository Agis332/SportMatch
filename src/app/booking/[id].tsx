import { router, useLocalSearchParams } from 'expo-router';
import { Check, ChevronLeft, User, Users } from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

const BLUE = '#208AEF';

// ─── Static data ─────────────────────────────────────────────────────────────

const TRAINER_INFO: Record<string, { name: string; sport: string; emoji: string; price: number }> = {
  '1': { name: 'Mantas Petrauskas',   sport: 'Football',    emoji: '⚽', price: 35 },
  '2': { name: 'Rūta Kazlauskaitė',  sport: 'Yoga',        emoji: '🧘', price: 45 },
  '3': { name: 'Tomas Žukauskas',    sport: 'Basketball',  emoji: '🏀', price: 30 },
  '4': { name: 'Aistė Mikalauskaitė',sport: 'Tennis',      emoji: '🎾', price: 50 },
  '5': { name: 'Darius Paulauskas',  sport: 'Boxing',      emoji: '🥊', price: 40 },
  '6': { name: 'Laura Stankevičiūtė',sport: 'CrossFit',    emoji: '💪', price: 35 },
  '7': { name: 'Erikas Butkus',      sport: 'Running',     emoji: '🏃', price: 28 },
  '8': { name: 'Ingrida Vaitkutė',  sport: 'Swimming',    emoji: '🏊', price: 55 },
  '9': { name: 'Aurimas Grigas',     sport: 'Martial Arts',emoji: '🥋', price: 38 },
};

const DEFAULT_TRAINER = { name: 'Trainer', sport: 'Sport', emoji: '🏅', price: 35 };

const MOCK_PROFILE = {
  firstName: 'Augustinas',
  lastName:  'Barkus',
  phone:     '+370 612 34567',
  email:     'augustinas.barkus@gmail.com',
};

const TIME_SLOTS = [
  { time: '08:00', available: false },
  { time: '09:00', available: true  },
  { time: '10:00', available: true  },
  { time: '11:00', available: false },
  { time: '12:00', available: true  },
  { time: '13:00', available: true  },
  { time: '14:00', available: false },
  { time: '15:00', available: true  },
  { time: '16:00', available: true  },
  { time: '17:00', available: true  },
  { time: '18:00', available: false },
  { time: '19:00', available: true  },
];

const DAY_SHORT  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_LONG   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function generateDates(count = 14): Date[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

function formatDate(d: Date) {
  return `${DAY_LONG[d.getDay()]}, ${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ current, stepLabels }: { current: number; stepLabels: string[] }) {
  const items: React.ReactNode[] = [];
  [1, 2, 3, 4].forEach((step, i) => {
    const done   = step < current;
    const active = step === current;
    items.push(
      <View key={`s${step}`} style={styles.progItem}>
        <View style={[styles.progCircle, done ? styles.progDone : active ? styles.progActive : styles.progFuture]}>
          <Text style={[styles.progNum, (done || active) && styles.progNumActive]}>
            {done ? '✓' : String(step)}
          </Text>
        </View>
        <Text style={[styles.progLabel, active && styles.progLabelActive]}>
          {stepLabels[i]}
        </Text>
      </View>,
    );
    if (i < 3) {
      items.push(
        <View key={`l${step}`} style={[styles.progLine, done && styles.progLineDone]} />,
      );
    }
  });
  return <View style={styles.progressBar}>{items}</View>;
}

// ─── Form input ───────────────────────────────────────────────────────────────

function FormInput({
  label, value, onChangeText, placeholder, keyboardType, multiline, inputBg, textColor, borderColor,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
  multiline?: boolean;
  inputBg: string;
  textColor: string;
  borderColor: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: textColor }]}>{label}</Text>
      <TextInput
        style={[
          styles.fieldInput,
          { backgroundColor: inputBg, color: textColor, borderColor },
          multiline && styles.fieldTextarea,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#AAAAAA"
        keyboardType={keyboardType ?? 'default'}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
      />
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function BookingScreen() {
  const { id }   = useLocalSearchParams<{ id: string }>();
  const insets   = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);

  const trainer = TRAINER_INFO[id] ?? DEFAULT_TRAINER;
  const dates   = useMemo(() => generateDates(14), []);

  const [step,          setStep]          = useState<1|2|3|4>(1);
  const [selectedDate,  setSelectedDate]  = useState<Date | null>(null);
  const [selectedTime,  setSelectedTime]  = useState<string | null>(null);
  const [sessionType,   setSessionType]   = useState<'individual' | 'group'>('individual');
  const [firstName,     setFirstName]     = useState(MOCK_PROFILE.firstName);
  const [lastName,      setLastName]      = useState(MOCK_PROFILE.lastName);
  const [phone,         setPhone]         = useState(MOCK_PROFILE.phone);
  const [email,         setEmail]         = useState(MOCK_PROFILE.email);
  const [notes,         setNotes]         = useState('');
  const [booked,        setBooked]        = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);
  const [saveDetails,    setSaveDetails]    = useState(true);

  const bg          = isDarkMode ? '#111827' : '#FFFFFF';
  const cardBg      = isDarkMode ? '#1F2937' : '#F9FAFB';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const borderColor = isDarkMode ? '#374151' : '#F3F4F6';
  const inputBg     = isDarkMode ? '#1F2937' : '#F9FAFB';
  const chipBg      = isDarkMode ? '#1F2937' : '#F3F4F6';

  const slotWidth = (width - 40 - 16) / 3; // 40px sides padding, 2×8px gaps

  const canProceed = useMemo(() => {
    if (step === 1) return selectedDate !== null;
    if (step === 2) return selectedTime !== null;
    if (step === 3) return true;
    return firstName.trim() !== '' && lastName.trim() !== '' &&
           phone.trim() !== '' && email.trim() !== '';
  }, [step, selectedDate, selectedTime, firstName, lastName, phone, email]);

  function handleBack() {
    if (step > 1) {
      setStep(s => (s - 1) as 1|2|3|4);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    } else {
      router.back();
    }
  }

  function handleNext() {
    if (step < 4) {
      setStep(s => (s + 1) as 1|2|3|4);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    } else {
      setBooked(true);
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (booked) {
    return (
      <View style={[styles.successScreen, { backgroundColor: bg, paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.successIcon}>
          <Check size={36} color="#FFFFFF" strokeWidth={2.5} />
        </View>
        <Text style={[styles.successTitle, { color: textPrimary }]}>{t.booking.confirmed}</Text>
        <Text style={[styles.successSub, { color: textSub }]}>
          {t.booking.sessionWith} {trainer.name} {t.booking.bookedFor}{'\n'}
          {selectedDate ? formatDate(selectedDate) : ''} {t.booking.at} {selectedTime}.
        </Text>
        <View style={[styles.successCard, { backgroundColor: cardBg, borderColor }]}>
          {([
            [t.booking.trainer, `${trainer.emoji} ${trainer.name}`],
            [t.booking.sport,   trainer.sport],
            [t.booking.session, sessionType === 'individual' ? t.booking.individual : t.booking.group],
            [t.booking.total,   `€${trainer.price}`],
          ] as [string, string][]).map(([label, val]) => (
            <View key={label} style={styles.successRow}>
              <Text style={[styles.successRowLabel, { color: textSub }]}>{label}</Text>
              <Text style={[styles.successRowValue, { color: textPrimary }]}>{val}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={styles.successBtn}
          onPress={() => { router.back(); router.back(); }}
          activeOpacity={0.85}>
          <Text style={styles.successBtnText}>{t.booking.backToHome}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Booking flow ───────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: bg }]}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: bg, borderBottomColor: borderColor }]}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={24} color={textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>{t.booking.headerTitle}</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Progress bar */}
      <View style={[styles.progressWrap, { backgroundColor: bg, borderBottomColor: borderColor }]}>
        <ProgressBar
          current={step}
          stepLabels={[t.booking.steps.date, t.booking.steps.time, t.booking.steps.type, t.booking.steps.details]}
        />
      </View>

      {/* Content */}
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>

          {/* ── Step 1: Date ── */}
          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: textPrimary }]}>{t.booking.selectDate}</Text>
              <Text style={[styles.stepSub, { color: textSub }]}>{t.booking.selectDateSub}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.datesRow}>
                {dates.map((date, i) => {
                  const isSelected = selectedDate?.toDateString() === date.toDateString();
                  const isToday    = i === 0;
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[styles.dateCard, { backgroundColor: isSelected ? BLUE : cardBg, borderColor: isSelected ? BLUE : borderColor }]}
                      onPress={() => setSelectedDate(date)}
                      activeOpacity={0.75}>
                      <Text style={[styles.dateDayName, { color: isSelected ? 'rgba(255,255,255,0.8)' : textSub }]}>
                        {DAY_SHORT[date.getDay()]}
                      </Text>
                      <Text style={[styles.dateDayNum, { color: isSelected ? '#FFFFFF' : textPrimary }]}>
                        {date.getDate()}
                      </Text>
                      <Text style={[styles.dateMonth, { color: isSelected ? 'rgba(255,255,255,0.7)' : textSub }]}>
                        {MONTH_SHORT[date.getMonth()]}
                      </Text>
                      {isToday && !isSelected && (
                        <View style={[styles.todayDot, { backgroundColor: BLUE }]} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              {selectedDate && (
                <View style={[styles.selectionBadge, { backgroundColor: chipBg }]}>
                  <Text style={[styles.selectionBadgeText, { color: textPrimary }]}>
                    📅  {formatDate(selectedDate)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ── Step 2: Time ── */}
          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: textPrimary }]}>{t.booking.selectTime}</Text>
              <Text style={[styles.stepSub, { color: textSub }]}>
                {selectedDate ? formatDate(selectedDate) : ''}
              </Text>
              <View style={styles.timeGrid}>
                {TIME_SLOTS.map(slot => {
                  const isSelected = selectedTime === slot.time;
                  const isDisabled = !slot.available;
                  return (
                    <TouchableOpacity
                      key={slot.time}
                      style={[
                        styles.timeSlot,
                        { width: slotWidth, backgroundColor: isSelected ? BLUE : isDisabled ? (isDarkMode ? '#1F2937' : '#F9FAFB') : cardBg },
                        { borderColor: isSelected ? BLUE : borderColor },
                        isDisabled && styles.timeSlotDisabled,
                      ]}
                      onPress={() => setSelectedTime(slot.time)}
                      disabled={isDisabled}
                      activeOpacity={0.75}>
                      <Text style={[
                        styles.timeSlotText,
                        { color: isSelected ? '#FFFFFF' : isDisabled ? (isDarkMode ? '#4B5563' : '#D1D5DB') : textPrimary },
                      ]}>
                        {slot.time}
                      </Text>
                      {isDisabled && (
                        <Text style={[styles.bookedLabel, { color: isDarkMode ? '#4B5563' : '#D1D5DB' }]}>{t.booking.booked}</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* ── Step 3: Session type ── */}
          {step === 3 && (
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: textPrimary }]}>{t.booking.sessionType}</Text>
              <Text style={[styles.stepSub, { color: textSub }]}>{t.booking.sessionTypeSub}</Text>
              <View style={styles.sessionRow}>
                {([
                  { type: 'individual' as const, Icon: User,  label: t.booking.individual, sub: t.booking.individualSub },
                  { type: 'group'      as const, Icon: Users, label: t.booking.group,       sub: t.booking.groupSub },
                ]).map(({ type, Icon, label, sub }) => {
                  const active = sessionType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[styles.sessionCard, { backgroundColor: active ? BLUE : cardBg, borderColor: active ? BLUE : borderColor }]}
                      onPress={() => setSessionType(type)}
                      activeOpacity={0.8}>
                      <View style={[styles.sessionIconWrap, { backgroundColor: active ? 'rgba(255,255,255,0.2)' : chipBg }]}>
                        <Icon size={22} color={active ? '#FFFFFF' : BLUE} strokeWidth={1.75} />
                      </View>
                      <Text style={[styles.sessionCardTitle, { color: active ? '#FFFFFF' : textPrimary }]}>{label}</Text>
                      <Text style={[styles.sessionCardSub, { color: active ? 'rgba(255,255,255,0.75)' : textSub }]}>{sub}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={[styles.sessionPriceBadge, { backgroundColor: chipBg }]}>
                <Text style={[styles.sessionPriceBadgeText, { color: textSub }]}>
                  {sessionType === 'group'
                    ? `${t.booking.groupRate}: €${Math.round(trainer.price * 0.6)}/hr ${t.booking.perPerson}`
                    : `${t.booking.individualRate}: €${trainer.price}/hr`}
                </Text>
              </View>
            </View>
          )}

          {/* ── Step 4: Details + Summary ── */}
          {step === 4 && (
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: textPrimary }]}>{t.booking.yourDetails}</Text>

              {/* Booking-as card */}
              <View style={[styles.bookingAsCard, { backgroundColor: cardBg, borderColor }]}>
                <View style={[styles.bookingAsAvatar, { backgroundColor: BLUE + '1A' }]}>
                  <User size={18} color={BLUE} strokeWidth={2} />
                </View>
                <View style={styles.bookingAsInfo}>
                  <Text style={[styles.bookingAsHeading, { color: textSub }]}>Booking as</Text>
                  <Text style={[styles.bookingAsName, { color: textPrimary }]}>
                    {firstName} {lastName}
                  </Text>
                  <Text style={[styles.bookingAsEmail, { color: textSub }]} numberOfLines={1}>
                    {email}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setEditingDetails(v => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}>
                  <Text style={[styles.bookingAsEdit, { color: BLUE }]}>
                    {editingDetails ? 'Done' : 'Edit'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Expandable form */}
              {editingDetails && (
                <View style={styles.formSection}>
                  <View style={[styles.prefilledNote, { backgroundColor: BLUE + '0D' }]}>
                    <User size={14} color={BLUE} strokeWidth={2} />
                    <Text style={[styles.prefilledText, { color: BLUE }]}>
                      Your details are pre-filled from your profile
                    </Text>
                  </View>
                  <View style={styles.formGrid}>
                    <View style={styles.formRow}>
                      <View style={styles.formHalf}>
                        <FormInput label={t.booking.name} value={firstName} onChangeText={setFirstName}
                          placeholder={t.booking.namePlaceholder} inputBg={inputBg} textColor={textPrimary} borderColor={borderColor} />
                      </View>
                      <View style={styles.formHalf}>
                        <FormInput label={t.booking.surname} value={lastName} onChangeText={setLastName}
                          placeholder={t.booking.surnamePlaceholder} inputBg={inputBg} textColor={textPrimary} borderColor={borderColor} />
                      </View>
                    </View>
                    <FormInput label={t.booking.phone} value={phone} onChangeText={setPhone}
                      placeholder={t.booking.phonePlaceholder} keyboardType="phone-pad"
                      inputBg={inputBg} textColor={textPrimary} borderColor={borderColor} />
                    <FormInput label={t.booking.email} value={email} onChangeText={setEmail}
                      placeholder={t.booking.emailPlaceholder} keyboardType="email-address"
                      inputBg={inputBg} textColor={textPrimary} borderColor={borderColor} />
                    <FormInput label={t.booking.notes} value={notes} onChangeText={setNotes}
                      placeholder={t.booking.notesPlaceholder} multiline
                      inputBg={inputBg} textColor={textPrimary} borderColor={borderColor} />
                  </View>
                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setSaveDetails(v => !v)}
                    activeOpacity={0.7}>
                    <View style={[styles.checkbox, { borderColor }, saveDetails && styles.checkboxChecked]}>
                      {saveDetails && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                    </View>
                    <Text style={[styles.checkboxLabel, { color: textSub }]}>
                      Save these details for future bookings
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Summary */}
              <Text style={[styles.summaryTitle, { color: textPrimary }]}>{t.booking.bookingSummary}</Text>
              <View style={[styles.summaryCard, { backgroundColor: cardBg, borderColor }]}>
                {([
                  [t.booking.trainer, `${trainer.emoji} ${trainer.name}`],
                  [t.booking.sport,   trainer.sport],
                  [t.booking.date,    selectedDate ? formatDate(selectedDate) : '—'],
                  [t.booking.time,    selectedTime ?? '—'],
                  [t.booking.session, sessionType === 'individual' ? t.booking.individual : t.booking.group],
                ] as [string, string][]).map(([label, val]) => (
                  <View key={label} style={[styles.summaryRow, { borderBottomColor: borderColor }]}>
                    <Text style={[styles.summaryLabel, { color: textSub }]}>{label}</Text>
                    <Text style={[styles.summaryValue, { color: textPrimary }]}>{val}</Text>
                  </View>
                ))}
                <View style={styles.summaryTotal}>
                  <Text style={[styles.summaryTotalLabel, { color: textPrimary }]}>{t.booking.total}</Text>
                  <Text style={styles.summaryTotalValue}>
                    €{sessionType === 'group' ? Math.round(trainer.price * 0.6) : trainer.price}/hr
                  </Text>
                </View>
              </View>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12, backgroundColor: bg, borderTopColor: borderColor }]}>
        <TouchableOpacity
          style={[styles.actionBtn, !canProceed && styles.actionBtnDisabled]}
          onPress={handleNext}
          disabled={!canProceed}
          activeOpacity={0.85}>
          <Text style={styles.actionBtnText}>
            {step < 4 ? t.booking.next : t.booking.bookNow}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex:      { flex: 1 },

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

  // Progress
  progressWrap: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  progItem: {
    alignItems: 'center',
    gap: 6,
  },
  progCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progActive: {
    backgroundColor: BLUE,
  },
  progDone: {
    backgroundColor: BLUE,
  },
  progFuture: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  progNum: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  progNumActive: {
    color: '#FFFFFF',
  },
  progLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  progLabelActive: {
    color: BLUE,
    fontWeight: '600',
  },
  progLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#E5E7EB',
    marginTop: 14,
    marginHorizontal: 4,
  },
  progLineDone: {
    backgroundColor: BLUE,
  },

  // Scroll
  scroll: {
    paddingTop: 4,
  },
  stepContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  stepSub: {
    fontSize: 14,
    marginTop: -8,
  },

  // Date picker
  datesRow: {
    gap: 8,
    paddingRight: 20,
  },
  dateCard: {
    width: 60,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 2,
  },
  dateDayName: {
    fontSize: 11,
    fontWeight: '500',
  },
  dateDayNum: {
    fontSize: 20,
    fontWeight: '700',
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: '400',
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 2,
  },
  selectionBadge: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  selectionBadgeText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Time grid
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 2,
  },
  timeSlotDisabled: {
    opacity: 0.5,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bookedLabel: {
    fontSize: 9,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Session type
  sessionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sessionCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 10,
  },
  sessionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionCardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sessionCardSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  sessionPriceBadge: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'center',
  },
  sessionPriceBadgeText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Form
  formGrid: {
    gap: 12,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formHalf: {
    flex: 1,
  },
  fieldWrap: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  fieldInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  fieldTextarea: {
    minHeight: 90,
    textAlignVertical: 'top',
    paddingTop: 12,
  },

  // Booking-as card
  bookingAsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  bookingAsAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  bookingAsInfo: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  bookingAsHeading: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bookingAsName: {
    fontSize: 15,
    fontWeight: '600',
  },
  bookingAsEmail: {
    fontSize: 13,
  },
  bookingAsEdit: {
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 0,
  },

  // Expandable form section
  formSection: {
    gap: 14,
  },
  prefilledNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  prefilledText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },

  // Checkbox
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },
  checkboxLabel: {
    fontSize: 14,
    flex: 1,
  },

  // Summary
  summaryTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 8,
  },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: BLUE,
  },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Success
  successScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 16,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  successSub: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  successCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
  },
  successRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  successRowLabel: {
    fontSize: 14,
  },
  successRowValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  successBtn: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingHorizontal: 40,
    paddingVertical: 14,
    marginTop: 8,
  },
  successBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

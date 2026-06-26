import { router, useLocalSearchParams } from 'expo-router';
import { Check, ChevronLeft, CreditCard, MapPin, User } from 'lucide-react-native';
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

import { useBooking } from '@/context/BookingContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { getTrainerMockProfile, type Schedule } from '@/context/TrainerProfileContext';

const BLUE = '#208AEF';

// ─── Static data ─────────────────────────────────────────────────────────────

const TRAINER_INFO: Record<string, { name: string; sport: string; emoji: string; price: number }> = {
  '1': { name: 'Mantas Petrauskas',    sport: 'Football',     emoji: '⚽', price: 35 },
  '2': { name: 'Rūta Kazlauskaitė',   sport: 'Yoga',         emoji: '🧘', price: 45 },
  '3': { name: 'Lukas Jankauskas',    sport: 'Boxing',       emoji: '🥊', price: 40 },
  '4': { name: 'Aistė Rimkutė',      sport: 'Running',      emoji: '🏃', price: 25 },
  '5': { name: 'Jonas Kazlauskas',    sport: 'Tennis',       emoji: '🎾', price: 50 },
  '6': { name: 'Laura Stankevičiūtė', sport: 'CrossFit',     emoji: '💪', price: 35 },
  '7': { name: 'Erikas Butkus',       sport: 'Swimming',     emoji: '🏊', price: 55 },
  '8': { name: 'Ingrida Vaitkutė',   sport: 'Martial Arts', emoji: '🥋', price: 38 },
  '9': { name: 'Aurimas Grigas',      sport: 'Volleyball',   emoji: '🏐', price: 30 },
};

const DEFAULT_TRAINER = { name: 'Trainer', sport: 'Sport', emoji: '🏅', price: 35 };

const MOCK_PROFILE = {
  firstName: 'Augustinas',
  lastName:  'Barkus',
  phone:     '+370 612 34567',
  email:     'augustinas.barkus@gmail.com',
};

const PAYMENT_METHODS = [
  { id: 'visa_4242', label: 'Visa •••• 4242',       brand: 'Visa',       expiry: '12/26' },
  { id: 'mc_8888',   label: 'Mastercard •••• 8888',  brand: 'Mastercard', expiry: '03/25' },
  { id: 'apple_pay', label: 'Apple Pay',             brand: 'Apple',      expiry: null    },
];

const JS_DAY_TO_KEY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_SHORT   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_LONG    = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

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

function parseLocationStr(loc: string): { city: string; address: string } {
  const sep = loc.indexOf(' • ');
  if (sep === -1) return { city: loc, address: '' };
  return { city: loc.slice(0, sep), address: loc.slice(sep + 3) };
}

function generateSlots(windowStart: string, windowEnd: string, durationMins: number): { start: string; end: string }[] {
  const toMins = (t: string) => { const [h, m = 0] = t.split(':').map(Number); return h * 60 + (m || 0); };
  const fmt    = (m: number) => `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`;
  const startM = toMins(windowStart);
  const endM   = toMins(windowEnd);
  const result: { start: string; end: string }[] = [];
  for (let t = startM; t + durationMins <= endM; t += durationMins) {
    result.push({ start: fmt(t), end: fmt(t + durationMins) });
  }
  return result;
}

interface BookingSlot { start: string; end: string; location: string; }

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ current, stepLabels }: { current: number; stepLabels: string[] }) {
  const items: React.ReactNode[] = [];
  stepLabels.forEach((label, i) => {
    const s = i + 1;
    const done   = s < current;
    const active = s === current;
    items.push(
      <View key={`s${s}`} style={styles.progItem}>
        <View style={[styles.progCircle, done ? styles.progDone : active ? styles.progActive : styles.progFuture]}>
          <Text style={[styles.progNum, (done || active) && styles.progNumActive]}>
            {done ? '✓' : String(s)}
          </Text>
        </View>
        <Text style={[styles.progLabel, active && styles.progLabelActive]}>{label}</Text>
      </View>,
    );
    if (i < stepLabels.length - 1) {
      items.push(<View key={`l${s}`} style={[styles.progLine, done && styles.progLineDone]} />);
    }
  });
  return <View style={styles.progressBar}>{items}</View>;
}

// ─── Form input ───────────────────────────────────────────────────────────────

function FormInput({
  label, value, onChangeText, placeholder, keyboardType, multiline, inputBg, textColor, borderColor,
}: {
  label: string; value: string; onChangeText: (t: string) => void; placeholder: string;
  keyboardType?: 'default' | 'phone-pad' | 'email-address'; multiline?: boolean;
  inputBg: string; textColor: string; borderColor: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: textColor }]}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, { backgroundColor: inputBg, color: textColor, borderColor }, multiline && styles.fieldTextarea]}
        value={value} onChangeText={onChangeText} placeholder={placeholder}
        placeholderTextColor="#AAAAAA" keyboardType={keyboardType ?? 'default'}
        multiline={multiline} numberOfLines={multiline ? 3 : 1}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
      />
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function BookingScreen() {
  const { id }         = useLocalSearchParams<{ id: string }>();
  const insets         = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const { t }          = useLanguage();
  const { width }      = useWindowDimensions();
  const scrollRef      = useRef<ScrollView>(null);

  const { bookSlot, isBooked } = useBooking();

  // Load the booked trainer's availability from mock profiles
  const trainerProfile  = useMemo(() => getTrainerMockProfile(id), [id]);
  const locations       = trainerProfile?.locations ?? [];
  const schedule        = (trainerProfile?.schedule  ?? {}) as Schedule;
  const sessionDuration = trainerProfile?.sessionDuration ?? 60;

  const trainer  = TRAINER_INFO[id] ?? DEFAULT_TRAINER;
  const allDates = useMemo(() => generateDates(14), []);

  const [step,            setStep]            = useState<1|2|3|4|5>(1);
  const [selectedLocId,   setSelectedLocId]   = useState<string | null>(null);
  const [selectedDate,    setSelectedDate]    = useState<Date | null>(null);
  const [selectedSlot,    setSelectedSlot]    = useState<BookingSlot | null>(null);
  const [firstName,       setFirstName]       = useState(MOCK_PROFILE.firstName);
  const [lastName,        setLastName]        = useState(MOCK_PROFILE.lastName);
  const [phone,           setPhone]           = useState(MOCK_PROFILE.phone);
  const [email,           setEmail]           = useState(MOCK_PROFILE.email);
  const [notes,           setNotes]           = useState('');
  const [editingDetails,  setEditingDetails]  = useState(false);
  const [saveDetails,     setSaveDetails]     = useState(true);
  const [paymentMethodId, setPaymentMethodId] = useState(PAYMENT_METHODS[0].id);

  const bg          = isDarkMode ? '#111827' : '#FFFFFF';
  const cardBg      = isDarkMode ? '#1F2937' : '#F9FAFB';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const borderColor = isDarkMode ? '#374151' : '#F3F4F6';
  const inputBg     = isDarkMode ? '#1F2937' : '#F9FAFB';
  const chipBg      = isDarkMode ? '#1F2937' : '#F3F4F6';
  const dimColor    = isDarkMode ? '#4B5563' : '#9CA3AF';

  const chipWidth = (width - 40 - 8) / 2;

  const selectedLocObj = locations.find(l => l.id === selectedLocId) ?? null;
  const selectedLocStr = selectedLocObj ? `${selectedLocObj.city} • ${selectedLocObj.address}` : null;

  const slotGroups = useMemo(() => {
    if (!selectedDate || !selectedLocStr) return [];
    const dayKey = JS_DAY_TO_KEY[selectedDate.getDay()];
    const cfg = schedule[dayKey];
    if (!cfg?.enabled) return [];
    return cfg.slots
      .filter(w => !w.location || w.location === selectedLocStr)
      .map(w => ({
        windowId:    w.id,
        location:    w.location || 'No location',
        windowRange: `${w.start} – ${w.end}`,
        slots:       generateSlots(w.start, w.end, sessionDuration),
      }));
  }, [selectedDate, schedule, sessionDuration, selectedLocStr]);

  const serviceFee = Math.round(trainer.price * 0.05);
  const totalPrice = trainer.price + serviceFee;

  const canProceed = useMemo(() => {
    if (step === 1) return selectedLocId !== null;
    if (step === 2) return selectedDate !== null && selectedSlot !== null;
    if (step === 3) return firstName.trim() !== '' && lastName.trim() !== '' &&
                          phone.trim() !== '' && email.trim() !== '';
    return true; // step 4: payment method always selected
  }, [step, selectedLocId, selectedDate, selectedSlot, firstName, lastName, phone, email]);

  function handleDateSelect(date: Date) { setSelectedDate(date); setSelectedSlot(null); }

  function handleBack() {
    if (step > 1) { setStep(s => (s - 1) as 1|2|3|4|5); scrollRef.current?.scrollTo({ y: 0, animated: false }); }
    else { router.back(); }
  }

  function handleNext() {
    if (step < 4) { setStep(s => (s + 1) as 1|2|3|4|5); scrollRef.current?.scrollTo({ y: 0, animated: false }); }
    else { bookSlot(id, selectedDate!, selectedSlot!.start); setStep(5); }
  }

  // ── Step 5: Success ────────────────────────────────────────────────────────
  if (step === 5) {
    return (
      <View style={[styles.successScreen, { backgroundColor: bg, paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.successIcon}>
          <Check size={36} color="#FFFFFF" strokeWidth={2.5} />
        </View>
        <Text style={[styles.successTitle, { color: textPrimary }]}>{t.booking.confirmed}</Text>
        <Text style={[styles.successSub, { color: textSub }]}>
          {t.booking.sessionWith} {trainer.name} {t.booking.bookedFor}{'\n'}
          {selectedDate ? formatDate(selectedDate) : ''}{'\n'}
          {selectedSlot ? `${selectedSlot.start} – ${selectedSlot.end}` : ''}
        </Text>
        <View style={[styles.successCard, { backgroundColor: cardBg, borderColor }]}>
          {([
            [t.booking.trainer, `${trainer.emoji} ${trainer.name}`],
            [t.booking.sport,   trainer.sport],
            [t.booking.date,    selectedDate ? formatDate(selectedDate) : '—'],
            [t.booking.time,    selectedSlot ? `${selectedSlot.start} – ${selectedSlot.end}` : '—'],
            ['Location',        selectedLocObj?.city ?? '—'],
            [t.booking.total,   `€${totalPrice}`],
          ] as [string, string][]).map(([label, val]) => (
            <View key={label} style={[styles.successRow, { borderBottomColor: borderColor }]}>
              <Text style={[styles.successRowLabel, { color: textSub }]}>{label}</Text>
              <Text style={[styles.successRowValue, { color: textPrimary }]} numberOfLines={2}>{val}</Text>
            </View>
          ))}
        </View>
        <View style={styles.successBtns}>
          <TouchableOpacity
            style={[styles.successBtnSecondary, { borderColor }]}
            onPress={() => {
              const pm  = PAYMENT_METHODS.find(p => p.id === paymentMethodId);
              const dur = sessionDuration < 60
                ? `${sessionDuration} min`
                : `${sessionDuration / 60}h`;
              router.push({
                pathname: '/booking-detail/new',
                params: {
                  trainerId:    id,
                  trainerName:  trainer.name,
                  sport:        trainer.sport,
                  emoji:        trainer.emoji,
                  date:         selectedDate ? formatDate(selectedDate) : '',
                  time:         selectedSlot
                                  ? `${selectedSlot.start} – ${selectedSlot.end}`
                                  : '',
                  location:     selectedLocObj
                                  ? [selectedLocObj.city, selectedLocObj.address]
                                      .filter(Boolean).join(', ')
                                  : '',
                  price:        String(trainer.price),
                  paymentMethod: pm?.label ?? 'Card',
                  duration:     dur,
                },
              } as never);
            }}
            activeOpacity={0.85}>
            <Text style={[styles.successBtnSecondaryText, { color: textPrimary }]}>View Booking</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.successBtn}
            onPress={() => { router.back(); router.back(); }}
            activeOpacity={0.85}>
            <Text style={styles.successBtnText}>{t.booking.backToHome}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Steps 1–4 ─────────────────────────────────────────────────────────────
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

      {/* Progress bar — 4 visible steps, success is step 5 outside the bar */}
      <View style={[styles.progressWrap, { backgroundColor: bg, borderBottomColor: borderColor }]}>
        <ProgressBar
          current={step}
          stepLabels={['Location', 'Schedule', t.booking.steps.details, 'Payment']}
        />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>

          {/* ── Step 1: Location ── */}
          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: textPrimary }]}>Choose Location</Text>
              <Text style={[styles.stepSub, { color: textSub }]}>Where would you like to train?</Text>

              {locations.length === 0 ? (
                <View style={[styles.emptyState, { backgroundColor: chipBg }]}>
                  <Text style={[styles.emptyStateText, { color: textSub }]}>No locations available</Text>
                </View>
              ) : (
                locations.map(loc => {
                  const isSel = selectedLocId === loc.id;
                  return (
                    <TouchableOpacity
                      key={loc.id}
                      style={[
                        styles.locationSelectCard,
                        { backgroundColor: isSel ? BLUE + '08' : cardBg, borderColor: isSel ? BLUE : borderColor },
                      ]}
                      onPress={() => setSelectedLocId(loc.id)}
                      activeOpacity={0.75}>
                      <View style={[styles.locationSelectIcon, { backgroundColor: isSel ? BLUE : BLUE + '15' }]}>
                        <MapPin size={20} color={isSel ? '#FFFFFF' : BLUE} strokeWidth={2} />
                      </View>
                      <View style={styles.locationSelectText}>
                        <Text style={[styles.locationSelectCity, { color: textPrimary }]}>{loc.city}</Text>
                        {loc.address ? (
                          <Text style={[styles.locationSelectAddr, { color: textSub }]}>{loc.address}</Text>
                        ) : null}
                      </View>
                      <View style={[styles.radioOuter, { borderColor: isSel ? BLUE : dimColor }]}>
                        {isSel && <View style={[styles.radioDot, { backgroundColor: BLUE }]} />}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          )}

          {/* ── Step 2: Date + Time ── */}
          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: textPrimary }]}>Select Date & Time</Text>
              <Text style={[styles.stepSub, { color: textSub }]}>Choose a day, then pick an available slot</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.datesRow}>
                {allDates.map((date, i) => {
                  const dayKey  = JS_DAY_TO_KEY[date.getDay()];
                  const cfg     = schedule[dayKey];
                  const isAvail = cfg?.enabled && (
                    selectedLocStr
                      ? cfg.slots.some(s => !s.location || s.location === selectedLocStr)
                      : cfg.slots.length > 0
                  );
                  const isSel   = selectedDate?.toDateString() === date.toDateString();
                  const isToday = date.toDateString() === new Date().toDateString();
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.dateCard,
                        isSel
                          ? { backgroundColor: BLUE, borderColor: BLUE }
                          : isAvail
                            ? { backgroundColor: cardBg, borderColor }
                            : [styles.dateCardUnavailable, { borderColor }],
                      ]}
                      onPress={() => handleDateSelect(date)}
                      disabled={!isAvail}
                      activeOpacity={0.75}>
                      <Text style={[styles.dateDayName, { color: isSel ? 'rgba(255,255,255,0.8)' : isAvail ? textSub : dimColor }]}>
                        {DAY_SHORT[date.getDay()]}
                      </Text>
                      <Text style={[
                        styles.dateDayNum,
                        { color: isSel ? '#FFFFFF' : isAvail ? textPrimary : dimColor },
                        !isAvail && styles.dateDayNumUnavailable,
                      ]}>
                        {date.getDate()}
                      </Text>
                      <Text style={[styles.dateMonth, { color: isSel ? 'rgba(255,255,255,0.7)' : isAvail ? textSub : dimColor }]}>
                        {MONTH_SHORT[date.getMonth()]}
                      </Text>
                      {isToday && !isSel && (
                        <View style={[styles.todayDot, { backgroundColor: isAvail ? BLUE : dimColor }]} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {selectedDate && (
                slotGroups.length === 0 ? (
                  <View style={[styles.emptyState, { backgroundColor: chipBg }]}>
                    <Text style={[styles.emptyStateText, { color: textSub }]}>No time slots available for this day</Text>
                  </View>
                ) : (
                  slotGroups.map(group => {
                    const loc = parseLocationStr(group.location);
                    return (
                      <View key={group.windowId} style={styles.windowGroup}>
                        <View style={styles.locationHeader}>
                          <MapPin size={14} color={BLUE} strokeWidth={2} style={{ marginTop: 1 }} />
                          <View style={styles.locationHeaderText}>
                            <Text style={[styles.locationCity, { color: textPrimary }]}>{loc.city}</Text>
                            {loc.address ? <Text style={[styles.locationAddr, { color: textSub }]}>{loc.address}</Text> : null}
                            <Text style={[styles.windowRange, { color: textSub }]}>{group.windowRange}</Text>
                          </View>
                        </View>
                        {group.slots.length === 0 ? (
                          <Text style={[styles.noSlotsText, { color: textSub }]}>
                            Window too short for a {sessionDuration} min session
                          </Text>
                        ) : (
                          <View style={styles.chipsGrid}>
                            {group.slots.map(slot => {
                              const slotBooked = isBooked(id, selectedDate!, slot.start);
                              const slotSel    = selectedSlot?.start === slot.start;
                              return (
                                <TouchableOpacity
                                  key={slot.start}
                                  style={[
                                    styles.chip,
                                    { width: chipWidth },
                                    slotSel    && styles.chipSelected,
                                    slotBooked && styles.chipBooked,
                                    !slotSel && !slotBooked && { backgroundColor: cardBg, borderColor },
                                  ]}
                                  onPress={() => setSelectedSlot({ start: slot.start, end: slot.end, location: group.location })}
                                  disabled={slotBooked}
                                  activeOpacity={0.75}>
                                  <Text style={[styles.chipTime, { color: slotSel ? '#FFFFFF' : slotBooked ? dimColor : textPrimary }]}>
                                    {slot.start} – {slot.end}
                                  </Text>
                                  {slotBooked && <Text style={[styles.chipSecondary, { color: dimColor }]}>Booked</Text>}
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        )}
                      </View>
                    );
                  })
                )
              )}

              {selectedDate && selectedSlot && (
                <View style={[styles.selectionBadge, { backgroundColor: chipBg }]}>
                  <Text style={[styles.selectionBadgeText, { color: textPrimary }]}>
                    📅  {formatDate(selectedDate)}{'  ·  '}🕐  {selectedSlot.start} – {selectedSlot.end}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ── Step 3: Details ── */}
          {step === 3 && (
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: textPrimary }]}>{t.booking.yourDetails}</Text>

              <View style={[styles.bookingAsCard, { backgroundColor: cardBg, borderColor }]}>
                <View style={[styles.bookingAsAvatar, { backgroundColor: BLUE + '1A' }]}>
                  <User size={18} color={BLUE} strokeWidth={2} />
                </View>
                <View style={styles.bookingAsInfo}>
                  <Text style={[styles.bookingAsHeading, { color: textSub }]}>Booking as</Text>
                  <Text style={[styles.bookingAsName, { color: textPrimary }]}>{firstName} {lastName}</Text>
                  <Text style={[styles.bookingAsEmail, { color: textSub }]} numberOfLines={1}>{email}</Text>
                </View>
                <TouchableOpacity onPress={() => setEditingDetails(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
                  <Text style={[styles.bookingAsEdit, { color: BLUE }]}>{editingDetails ? 'Done' : 'Edit'}</Text>
                </TouchableOpacity>
              </View>

              {editingDetails && (
                <View style={styles.formSection}>
                  <View style={[styles.prefilledNote, { backgroundColor: BLUE + '0D' }]}>
                    <User size={14} color={BLUE} strokeWidth={2} />
                    <Text style={[styles.prefilledText, { color: BLUE }]}>Your details are pre-filled from your profile</Text>
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
                  <TouchableOpacity style={styles.checkboxRow} onPress={() => setSaveDetails(v => !v)} activeOpacity={0.7}>
                    <View style={[styles.checkbox, { borderColor }, saveDetails && styles.checkboxChecked]}>
                      {saveDetails && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                    </View>
                    <Text style={[styles.checkboxLabel, { color: textSub }]}>Save these details for future bookings</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={[styles.sectionTitle, { color: textPrimary }]}>{t.booking.bookingSummary}</Text>
              <View style={[styles.summaryCard, { backgroundColor: cardBg, borderColor }]}>
                {([
                  [t.booking.trainer, `${trainer.emoji} ${trainer.name}`],
                  [t.booking.sport,   trainer.sport],
                  [t.booking.date,    selectedDate ? formatDate(selectedDate) : '—'],
                  [t.booking.time,    selectedSlot ? `${selectedSlot.start} – ${selectedSlot.end}` : '—'],
                  ['Location',        selectedLocObj?.city ?? '—'],
                ] as [string, string][]).map(([label, val]) => (
                  <View key={label} style={[styles.summaryRow, { borderBottomColor: borderColor }]}>
                    <Text style={[styles.summaryLabel, { color: textSub }]}>{label}</Text>
                    <Text style={[styles.summaryValue, { color: textPrimary }]}>{val}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── Step 4: Payment ── */}
          {step === 4 && (
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: textPrimary }]}>Payment</Text>
              <Text style={[styles.stepSub, { color: textSub }]}>Review your booking and confirm</Text>

              {/* Booking summary */}
              <View style={[styles.summaryCard, { backgroundColor: cardBg, borderColor }]}>
                <Text style={[styles.cardSectionLabel, { color: textSub }]}>BOOKING SUMMARY</Text>
                {([
                  [t.booking.trainer, `${trainer.emoji} ${trainer.name}`],
                  [t.booking.date,    selectedDate ? formatDate(selectedDate) : '—'],
                  [t.booking.time,    selectedSlot ? `${selectedSlot.start} – ${selectedSlot.end}` : '—'],
                  ['Location',        selectedLocObj?.city ?? '—'],
                ] as [string, string][]).map(([label, val]) => (
                  <View key={label} style={[styles.summaryRow, { borderBottomColor: borderColor }]}>
                    <Text style={[styles.summaryLabel, { color: textSub }]}>{label}</Text>
                    <Text style={[styles.summaryValue, { color: textPrimary }]}>{val}</Text>
                  </View>
                ))}
              </View>

              {/* Price breakdown */}
              <View style={[styles.summaryCard, { backgroundColor: cardBg, borderColor }]}>
                <Text style={[styles.cardSectionLabel, { color: textSub }]}>PRICE BREAKDOWN</Text>
                <View style={[styles.summaryRow, { borderBottomColor: borderColor }]}>
                  <Text style={[styles.summaryLabel, { color: textSub }]}>
                    Session ({sessionDuration >= 60 ? `${sessionDuration / 60}h` : `${sessionDuration} min`})
                  </Text>
                  <Text style={[styles.summaryValue, { color: textPrimary }]}>€{trainer.price}</Text>
                </View>
                <View style={[styles.summaryRow, { borderBottomColor: borderColor }]}>
                  <Text style={[styles.summaryLabel, { color: textSub }]}>Service fee (5%)</Text>
                  <Text style={[styles.summaryValue, { color: textPrimary }]}>€{serviceFee}</Text>
                </View>
                <View style={styles.summaryTotalRow}>
                  <Text style={[styles.summaryTotalLabel, { color: textPrimary }]}>{t.booking.total}</Text>
                  <Text style={styles.summaryTotalValue}>€{totalPrice}</Text>
                </View>
              </View>

              {/* Payment methods */}
              <Text style={[styles.sectionTitle, { color: textPrimary }]}>Payment Method</Text>
              {PAYMENT_METHODS.map(pm => {
                const isSel = paymentMethodId === pm.id;
                return (
                  <TouchableOpacity
                    key={pm.id}
                    style={[
                      styles.paymentCard,
                      { backgroundColor: isSel ? BLUE + '06' : cardBg, borderColor: isSel ? BLUE : borderColor },
                    ]}
                    onPress={() => setPaymentMethodId(pm.id)}
                    activeOpacity={0.75}>
                    <View style={[styles.paymentCardIcon, { backgroundColor: isSel ? BLUE + '15' : chipBg }]}>
                      <CreditCard size={18} color={isSel ? BLUE : textSub} strokeWidth={2} />
                    </View>
                    <View style={styles.paymentCardInfo}>
                      <Text style={[styles.paymentCardLabel, { color: textPrimary }]}>{pm.label}</Text>
                      {pm.expiry ? <Text style={[styles.paymentCardSub, { color: textSub }]}>Expires {pm.expiry}</Text> : null}
                    </View>
                    <View style={[styles.radioOuter, { borderColor: isSel ? BLUE : dimColor }]}>
                      {isSel && <View style={[styles.radioDot, { backgroundColor: BLUE }]} />}
                    </View>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity style={[styles.addCardBtn, { borderColor, backgroundColor: cardBg }]} activeOpacity={0.75}>
                <Text style={[styles.addCardBtnText, { color: BLUE }]}>+ Add new card</Text>
              </TouchableOpacity>
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
            {step === 4 ? 'Confirm & Pay' : t.booking.next}
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

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600' },

  progressWrap: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  progressBar:  { flexDirection: 'row', alignItems: 'flex-start' },
  progItem:     { alignItems: 'center', gap: 6 },
  progCircle:   { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  progActive:   { backgroundColor: BLUE },
  progDone:     { backgroundColor: BLUE },
  progFuture:   { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#D1D5DB' },
  progNum:      { fontSize: 13, fontWeight: '700', color: '#9CA3AF' },
  progNumActive:{ color: '#FFFFFF' },
  progLabel:    { fontSize: 10, fontWeight: '500', color: '#9CA3AF' },
  progLabelActive: { color: BLUE, fontWeight: '600' },
  progLine:     { flex: 1, height: 1.5, backgroundColor: '#E5E7EB', marginTop: 14, marginHorizontal: 4 },
  progLineDone: { backgroundColor: BLUE },

  scroll:      { paddingTop: 4 },
  stepContent: { paddingHorizontal: 20, paddingTop: 24, gap: 16 },
  stepTitle:   { fontSize: 20, fontWeight: '700' },
  stepSub:     { fontSize: 14, marginTop: -8 },
  sectionTitle:{ fontSize: 17, fontWeight: '700', marginTop: 4 },

  emptyState:     { borderRadius: 14, paddingHorizontal: 20, paddingVertical: 24, alignItems: 'center' },
  emptyStateText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  // Step 1 — location cards
  locationSelectCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 16, borderWidth: 1.5, padding: 16,
  },
  locationSelectIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  locationSelectText: { flex: 1, gap: 3 },
  locationSelectCity: { fontSize: 16, fontWeight: '700' },
  locationSelectAddr: { fontSize: 13 },

  // Shared radio button
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  radioDot:   { width: 10, height: 10, borderRadius: 5 },

  // Step 2 — date row
  datesRow:            { gap: 8, paddingRight: 20 },
  dateCard:            { width: 60, alignItems: 'center', paddingVertical: 12, borderRadius: 14, borderWidth: 1, gap: 2 },
  dateCardUnavailable: { backgroundColor: 'transparent', opacity: 0.4 },
  dateDayNumUnavailable: { textDecorationLine: 'line-through' },
  dateDayName: { fontSize: 11, fontWeight: '500' },
  dateDayNum:  { fontSize: 20, fontWeight: '700' },
  dateMonth:   { fontSize: 10, fontWeight: '400' },
  todayDot:    { width: 5, height: 5, borderRadius: 3, marginTop: 2 },

  selectionBadge:     { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, alignSelf: 'flex-start' },
  selectionBadgeText: { fontSize: 14, fontWeight: '500' },

  // Step 2 — time slot chips
  windowGroup:      { gap: 10 },
  locationHeader:   { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  locationHeaderText:{ flex: 1, gap: 2 },
  locationCity:     { fontSize: 14, fontWeight: '700' },
  locationAddr:     { fontSize: 12 },
  windowRange:      { fontSize: 12, fontWeight: '500', marginTop: 1 },
  noSlotsText:      { fontSize: 13, fontStyle: 'italic' },
  chipsGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:             { alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, borderWidth: 1, gap: 3 },
  chipSelected:     { backgroundColor: BLUE, borderColor: BLUE },
  chipBooked:       { backgroundColor: 'transparent', borderColor: '#E5E7EB', opacity: 0.55 },
  chipTime:         { fontSize: 14, fontWeight: '600' },
  chipSecondary:    { fontSize: 11, fontWeight: '500' },

  // Step 3 — details form
  bookingAsCard:    { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, borderWidth: 1, padding: 14 },
  bookingAsAvatar:  { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  bookingAsInfo:    { flex: 1, gap: 2, minWidth: 0 },
  bookingAsHeading: { fontSize: 11, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  bookingAsName:    { fontSize: 15, fontWeight: '600' },
  bookingAsEmail:   { fontSize: 13 },
  bookingAsEdit:    { fontSize: 14, fontWeight: '600', flexShrink: 0 },
  formSection:      { gap: 14 },
  prefilledNote:    { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  prefilledText:    { fontSize: 13, fontWeight: '500', flex: 1 },
  formGrid:         { gap: 12 },
  formRow:          { flexDirection: 'row', gap: 12 },
  formHalf:         { flex: 1 },
  fieldWrap:        { gap: 6 },
  fieldLabel:       { fontSize: 13, fontWeight: '600' },
  fieldInput:       { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  fieldTextarea:    { minHeight: 90, textAlignVertical: 'top', paddingTop: 12 },
  checkboxRow:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox:         { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  checkboxChecked:  { backgroundColor: BLUE, borderColor: BLUE },
  checkboxLabel:    { fontSize: 14, flex: 1 },

  // Steps 3+4 — summary card
  summaryCard:      { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  cardSectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  summaryRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth },
  summaryLabel:     { fontSize: 14 },
  summaryValue:     { fontSize: 14, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  summaryTotalRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  summaryTotalLabel:{ fontSize: 15, fontWeight: '700' },
  summaryTotalValue:{ fontSize: 18, fontWeight: '700', color: BLUE },

  // Step 4 — payment cards
  paymentCard:     { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 14, borderWidth: 1.5, padding: 14 },
  paymentCardIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  paymentCardInfo: { flex: 1, gap: 3 },
  paymentCardLabel:{ fontSize: 15, fontWeight: '600' },
  paymentCardSub:  { fontSize: 12 },
  addCardBtn:      { borderRadius: 14, borderWidth: 1, paddingVertical: 14, alignItems: 'center' },
  addCardBtnText:  { fontSize: 15, fontWeight: '600' },

  bottomBar:       { paddingHorizontal: 20, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth },
  actionBtn:       { backgroundColor: BLUE, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  actionBtnDisabled:{ backgroundColor: '#D1D5DB' },
  actionBtnText:   { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  // Step 5 — success
  successScreen:   { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 16 },
  successIcon:     { width: 80, height: 80, borderRadius: 40, backgroundColor: '#22C55E', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  successTitle:    { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  successSub:      { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  successCard:     { width: '100%', borderRadius: 16, borderWidth: 1, marginTop: 8 },
  successRow:      { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  successRowLabel: { fontSize: 14 },
  successRowValue: { fontSize: 14, fontWeight: '600', maxWidth: '55%', textAlign: 'right' },
  successBtns:     { width: '100%', gap: 10, marginTop: 8 },
  successBtn:      { backgroundColor: BLUE, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  successBtnText:  { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  successBtnSecondary:    { borderRadius: 14, borderWidth: 1, paddingVertical: 14, alignItems: 'center' },
  successBtnSecondaryText:{ fontSize: 16, fontWeight: '600' },
});

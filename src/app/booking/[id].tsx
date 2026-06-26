import { router, useLocalSearchParams } from 'expo-router';
import { Check, ChevronLeft, MapPin, User } from 'lucide-react-native';
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
import { AvailabilitySlot, useTrainerProfile } from '@/context/TrainerProfileContext';

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

// Maps JS Date.getDay() (0=Sun) to schedule keys
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

// Breaks a trainer availability window into booking slots of `durationMins` length.
// e.g. "09:00"–"12:00" with 30 min → 09:00–09:30, 09:30–10:00, …, 11:30–12:00
function generateSlots(windowStart: string, windowEnd: string, durationMins: number): { start: string; end: string }[] {
  const toMins = (t: string) => {
    const [h, m = 0] = t.split(':').map(Number);
    return h * 60 + (m || 0);
  };
  const fmt = (mins: number) =>
    `${Math.floor(mins / 60).toString().padStart(2, '0')}:${(mins % 60).toString().padStart(2, '0')}`;

  const startM = toMins(windowStart);
  const endM   = toMins(windowEnd);
  const result: { start: string; end: string }[] = [];
  for (let t = startM; t + durationMins <= endM; t += durationMins) {
    result.push({ start: fmt(t), end: fmt(t + durationMins) });
  }
  return result;
}

interface BookingSlot {
  start: string;
  end: string;
  location: string;
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

  const { schedule }            = useTrainerProfile();
  const { bookSlot, isBooked }  = useBooking();

  const trainer = TRAINER_INFO[id] ?? DEFAULT_TRAINER;
  const allDates = useMemo(() => generateDates(14), []);

  // Only show dates where the trainer has enabled slots
  const availableDates = useMemo(() =>
    allDates.filter(d => {
      const dayKey = JS_DAY_TO_KEY[d.getDay()];
      const cfg = schedule[dayKey];
      return cfg?.enabled && cfg.slots.length > 0;
    }),
  [allDates, schedule]);

  const [step,          setStep]          = useState<1|2|3|4>(1);
  const [selectedDate,  setSelectedDate]  = useState<Date | null>(null);
  const [selectedSlot,  setSelectedSlot]  = useState<BookingSlot | null>(null);
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

  // stepContent has 20px horizontal padding each side; 3 chips per row with 8px gaps
  const chipWidth = (width - 40 - 16) / 3;

  // One entry per availability window, each expanded into booking slots of the trainer's duration
  const slotGroups = useMemo(() => {
    if (!selectedDate) return [];
    const dayKey = JS_DAY_TO_KEY[selectedDate.getDay()];
    const cfg = schedule[dayKey];
    if (!cfg?.enabled) return [];

    return cfg.slots.map(window => {
      const duration = window.duration ?? 60;
      return {
        windowId:    window.id,
        location:    window.location || 'No location',
        windowRange: `${window.start} – ${window.end}`,
        duration,
        slots: generateSlots(window.start, window.end, duration),
      };
    });
  }, [selectedDate, schedule]);

  const selectedLocation = selectedSlot
    ? parseLocationStr(selectedSlot.location)
    : null;

  const canProceed = useMemo(() => {
    if (step === 1) return selectedDate !== null;
    if (step === 2) return selectedSlot !== null;
    if (step === 3) return true;
    return firstName.trim() !== '' && lastName.trim() !== '' &&
           phone.trim() !== '' && email.trim() !== '';
  }, [step, selectedDate, selectedSlot, firstName, lastName, phone, email]);

  function handleDateSelect(date: Date) {
    setSelectedDate(date);
    setSelectedSlot(null);
  }

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
      bookSlot(id, selectedDate!, selectedSlot!.start);
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
          {selectedDate ? formatDate(selectedDate) : ''}{'\n'}
          {selectedSlot ? `${selectedSlot.start} – ${selectedSlot.end}` : ''}
        </Text>
        <View style={[styles.successCard, { backgroundColor: cardBg, borderColor }]}>
          {([
            [t.booking.trainer,  `${trainer.emoji} ${trainer.name}`],
            [t.booking.sport,    trainer.sport],
            [t.booking.date,     selectedDate ? formatDate(selectedDate) : '—'],
            [t.booking.time,     selectedSlot ? `${selectedSlot.start} – ${selectedSlot.end}` : '—'],
            ['Location',         selectedSlot?.location ?? '—'],
            [t.booking.total,    `€${trainer.price}`],
          ] as [string, string][]).map(([label, val]) => (
            <View key={label} style={styles.successRow}>
              <Text style={[styles.successRowLabel, { color: textSub }]}>{label}</Text>
              <Text style={[styles.successRowValue, { color: textPrimary }]} numberOfLines={2}>{val}</Text>
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
          stepLabels={[t.booking.steps.date, t.booking.steps.time, t.booking.steps.location, t.booking.steps.details]}
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

              {availableDates.length === 0 ? (
                <View style={[styles.emptyState, { backgroundColor: chipBg }]}>
                  <Text style={[styles.emptyStateText, { color: textSub }]}>
                    No available dates in the next 2 weeks
                  </Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.datesRow}>
                  {availableDates.map((date, i) => {
                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                    const isToday    = date.toDateString() === new Date().toDateString();
                    return (
                      <TouchableOpacity
                        key={i}
                        style={[styles.dateCard, { backgroundColor: isSelected ? BLUE : cardBg, borderColor: isSelected ? BLUE : borderColor }]}
                        onPress={() => handleDateSelect(date)}
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
              )}

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

              {slotGroups.length === 0 ? (
                <View style={[styles.emptyState, { backgroundColor: chipBg }]}>
                  <Text style={[styles.emptyStateText, { color: textSub }]}>
                    No time slots available for this day
                  </Text>
                </View>
              ) : (
                slotGroups.map(group => {
                  const loc = parseLocationStr(group.location);
                  return (
                    <View key={group.windowId} style={styles.windowGroup}>
                      {/* Location + window range header */}
                      <View style={styles.locationHeader}>
                        <MapPin size={14} color={BLUE} strokeWidth={2} style={{ marginTop: 1 }} />
                        <View style={styles.locationHeaderText}>
                          <Text style={[styles.locationCity, { color: textPrimary }]}>{loc.city}</Text>
                          {loc.address ? (
                            <Text style={[styles.locationAddr, { color: textSub }]}>{loc.address}</Text>
                          ) : null}
                          <Text style={[styles.windowRange, { color: textSub }]}>{group.windowRange}</Text>
                        </View>
                      </View>

                      {/* Booking chips — one per session slot */}
                      {group.slots.length === 0 ? (
                        <Text style={[styles.noSlotsText, { color: textSub }]}>
                          Window too short for a {group.duration} min session
                        </Text>
                      ) : (
                        <View style={styles.chipsGrid}>
                          {group.slots.map(slot => {
                            const slotBooked = isBooked(id, selectedDate!, slot.start);
                            const selected   = selectedSlot?.start === slot.start;
                            const dimColor   = isDarkMode ? '#4B5563' : '#9CA3AF';
                            return (
                              <TouchableOpacity
                                key={slot.start}
                                style={[
                                  styles.chip,
                                  { width: chipWidth },
                                  selected   && styles.chipSelected,
                                  slotBooked && styles.chipBooked,
                                  !selected && !slotBooked && { backgroundColor: cardBg, borderColor },
                                ]}
                                onPress={() => setSelectedSlot({ start: slot.start, end: slot.end, location: group.location })}
                                disabled={slotBooked}
                                activeOpacity={0.75}>
                                <Text style={[
                                  styles.chipTime,
                                  { color: selected ? '#FFFFFF' : slotBooked ? dimColor : textPrimary },
                                ]}>
                                  {slot.start}
                                </Text>
                                {slotBooked ? (
                                  <Text style={[styles.chipSecondary, { color: dimColor }]}>Booked</Text>
                                ) : (
                                  <Text style={[
                                    styles.chipSecondary,
                                    { color: selected ? 'rgba(255,255,255,0.75)' : textSub },
                                  ]}>
                                    – {slot.end}
                                  </Text>
                                )}
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  );
                })
              )}

              {selectedSlot && (
                <View style={[styles.selectionBadge, { backgroundColor: chipBg }]}>
                  <Text style={[styles.selectionBadgeText, { color: textPrimary }]}>
                    🕐  {selectedSlot.start} – {selectedSlot.end}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ── Step 3: Location (auto-filled) ── */}
          {step === 3 && selectedSlot && (
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: textPrimary }]}>Location</Text>
              <Text style={[styles.stepSub, { color: textSub }]}>Confirmed from your selected session</Text>

              <View style={[styles.locationConfirmCard, { backgroundColor: cardBg, borderColor }]}>
                <View style={[styles.locationIconWrap, { backgroundColor: BLUE + '18' }]}>
                  <MapPin size={22} color={BLUE} strokeWidth={2} />
                </View>
                <View style={styles.locationConfirmInfo}>
                  <Text style={[styles.locationConfirmCity, { color: textPrimary }]}>
                    {selectedLocation?.city}
                  </Text>
                  {selectedLocation?.address ? (
                    <Text style={[styles.locationConfirmAddr, { color: textSub }]}>
                      {selectedLocation.address}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={[styles.sessionTimeBadge, { backgroundColor: chipBg }]}>
                <Text style={[styles.sessionTimeBadgeText, { color: textSub }]}>
                  🕐  {selectedSlot.start} – {selectedSlot.end}
                  {'  ·  '}
                  {selectedDate ? formatDate(selectedDate) : ''}
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
                  [t.booking.time,    selectedSlot ? `${selectedSlot.start} – ${selectedSlot.end}` : '—'],
                  ['Location',        selectedSlot?.location ?? '—'],
                ] as [string, string][]).map(([label, val]) => (
                  <View key={label} style={[styles.summaryRow, { borderBottomColor: borderColor }]}>
                    <Text style={[styles.summaryLabel, { color: textSub }]}>{label}</Text>
                    <Text style={[styles.summaryValue, { color: textPrimary }]}>{val}</Text>
                  </View>
                ))}
                <View style={styles.summaryTotal}>
                  <Text style={[styles.summaryTotalLabel, { color: textPrimary }]}>{t.booking.total}</Text>
                  <Text style={styles.summaryTotalValue}>€{trainer.price}/hr</Text>
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

  // Empty state
  emptyState: {
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
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

  // Window groups + chips (Step 2)
  windowGroup: {
    gap: 10,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  locationHeaderText: {
    flex: 1,
    gap: 2,
  },
  locationCity: {
    fontSize: 14,
    fontWeight: '700',
  },
  locationAddr: {
    fontSize: 12,
  },
  windowRange: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  noSlotsText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 3,
  },
  chipSelected: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },
  chipBooked: {
    backgroundColor: 'transparent',
    borderColor: '#E5E7EB',
    opacity: 0.55,
  },
  chipTime: {
    fontSize: 14,
    fontWeight: '600',
  },
  chipSecondary: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Location confirmation (Step 3)
  locationConfirmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  locationIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  locationConfirmInfo: {
    flex: 1,
    gap: 4,
  },
  locationConfirmCity: {
    fontSize: 18,
    fontWeight: '700',
  },
  locationConfirmAddr: {
    fontSize: 14,
  },
  sessionTimeBadge: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sessionTimeBadgeText: {
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
    maxWidth: '55%',
    textAlign: 'right',
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

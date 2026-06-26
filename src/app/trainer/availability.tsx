import { router } from 'expo-router';
import { ChevronDown, ChevronLeft, MapPin, Plus, Trash2 } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';
import { AvailabilitySlot, DayConfig, Schedule, useTrainerProfile } from '@/context/TrainerProfileContext';

const BLUE = '#208AEF';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_FULL: Record<string, string> = {
  Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday',
  Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday',
};

const HOURS   = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
const ITEM_H  = 52;
const WHEEL_H = ITEM_H * 5;

let slotCounter = 10;
function newId() { return String(++slotCounter); }

const CITIES = [
  'Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys',
  'Alytus', 'Marijampolė', 'Mažeikiai', 'Jonava', 'Utena',
];

function fmtLoc(city: string, address: string) { return `${city} • ${address}`; }

type Slot = AvailabilitySlot;

const DURATIONS: { label: string; value: number }[] = [
  { label: '30m',  value: 30  },
  { label: '45m',  value: 45  },
  { label: '1h',   value: 60  },
  { label: '1.5h', value: 90  },
  { label: '2h',   value: 120 },
  { label: '2.5h', value: 150 },
  { label: '3h',   value: 180 },
];

function minutesFromSlot(start: string, end: string): number {
  const [sh, sm = 0] = start.split(':').map(Number);
  const [eh, em = 0] = end.split(':').map(Number);
  return Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
}

function formatDuration(mins: number): string {
  if (mins <= 0) return '0 hrs';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `${h} hr${h !== 1 ? 's' : ''}`;
  return `${h}h ${m}m`;
}

function totalWeekMinutes(schedule: Schedule): number {
  return Object.values(schedule).reduce((sum, day) => {
    if (!day.enabled) return sum;
    return sum + day.slots.reduce((s, slot) => s + minutesFromSlot(slot.start, slot.end), 0);
  }, 0);
}

function toMins(t: string): number {
  const [h, m = 0] = t.split(':').map(Number);
  return h * 60 + m;
}

function overlaps(
  a: { start: string; end: string },
  b: { start: string; end: string },
): boolean {
  return toMins(a.start) < toMins(b.end) && toMins(b.start) < toMins(a.end);
}

function hasOverlap(slots: Slot[], excludeId: string, start: string, end: string): boolean {
  return slots.some(s => s.id !== excludeId && overlaps({ start, end }, s));
}

// Returns default [start, end] for a new slot that won't overlap existing ones,
// or null when there's no meaningful time left in the day.
function nextSlotDefault(slots: Slot[]): { start: string; end: string } | null {
  if (slots.length === 0) return { start: '09:00', end: '17:00' };
  const maxEnd = slots.reduce((m, s) => Math.max(m, toMins(s.end)), 0);
  if (maxEnd >= 23 * 60) return null;
  const end = Math.min(maxEnd + 60, 24 * 60 - 1);
  const fmt = (m: number) =>
    `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`;
  return { start: fmt(maxEnd), end: fmt(end) };
}

type PickerTarget = { day: string; slotId: string; field: 'start' | 'end' };

// ─── Scroll wheel column ──────────────────────────────────────────────────────

function WheelColumn({ items, selectedIdx, onChange, isDarkMode }: {
  items: string[];
  selectedIdx: number;
  onChange: (i: number) => void;
  isDarkMode: boolean;
}) {
  const n       = items.length;
  const tripled = [...items, ...items, ...items];
  const ref     = useRef<ScrollView>(null);
  const [ready, setReady] = useState(false);

  // Always scroll to equivalent position in the middle copy
  function scrollToLogical(idx: number, animated: boolean) {
    ref.current?.scrollTo({ y: (n + idx) * ITEM_H, animated });
  }

  useEffect(() => {
    if (ready) scrollToLogical(selectedIdx, false);
  }, [selectedIdx, ready]);

  function onScrollEnd(e: { nativeEvent: { contentOffset: { y: number } } }) {
    const rawY    = e.nativeEvent.contentOffset.y;
    const rawIdx  = Math.round(rawY / ITEM_H);
    const logical = ((rawIdx % n) + n) % n;
    // Silently reset to middle copy so both ends are always available to scroll into
    if (rawIdx < n || rawIdx >= n * 2) {
      ref.current?.scrollTo({ y: (n + logical) * ITEM_H, animated: false });
    }
    onChange(logical);
  }

  // Shortest circular distance between two indices
  function circDist(a: number, b: number): number {
    const d = Math.abs(a - b) % n;
    return Math.min(d, n - d);
  }

  const textColor  = isDarkMode ? '#FFFFFF' : '#111827';
  const selectorBg = isDarkMode ? BLUE + '22' : BLUE + '14';
  const selBorder  = isDarkMode ? BLUE + '55' : BLUE + '40';

  return (
    <View style={wStyles.wrap}>
      <View pointerEvents="none" style={[wStyles.selector, {
        backgroundColor: selectorBg,
        borderColor: selBorder,
      }]} />
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: ITEM_H * 2 }}
        onLayout={() => setReady(true)}
        onMomentumScrollEnd={onScrollEnd}
        onScrollEndDrag={onScrollEnd}
        scrollEventThrottle={32}>
        {tripled.map((item, i) => {
          const logicalI   = i % n;
          const isSelected = logicalI === selectedIdx;
          const dist       = circDist(logicalI, selectedIdx);
          const opacity    = dist === 0 ? 1 : dist === 1 ? 0.45 : dist === 2 ? 0.2 : 0.1;
          return (
            <TouchableOpacity
              key={i}
              style={wStyles.item}
              onPress={() => onChange(logicalI)}
              activeOpacity={0.7}>
              <Text style={[wStyles.text, {
                color:      isSelected ? BLUE : textColor,
                fontWeight: isSelected ? '700' : '400',
                opacity,
              }]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const wStyles = StyleSheet.create({
  wrap: {
    height: WHEEL_H,
    width: 80,
    overflow: 'hidden',
  },
  selector: {
    position: 'absolute',
    top: ITEM_H * 2,
    left: 0,
    right: 0,
    height: ITEM_H,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    zIndex: 1,
  },
  item: {
    height: ITEM_H,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
  },
});

// ─── Time picker modal ────────────────────────────────────────────────────────

function TimePicker({ label, initialTime, onSave, onCancel, isDarkMode, error }: {
  label: string;
  initialTime: string;
  onSave: (t: string) => void;
  onCancel: () => void;
  isDarkMode: boolean;
  error?: string | null;
}) {
  function parse(t: string) {
    const parts = t.split(':').map(Number);
    const h  = isNaN(parts[0]) ? 9  : Math.min(23, Math.max(0, parts[0]));
    const m  = isNaN(parts[1]) ? 0  : parts[1];
    const mi = Math.min(11, Math.max(0, Math.round(m / 5)));
    return { h, mi };
  }

  const init = parse(initialTime);
  const [hourIdx,    setHourIdx]    = useState(init.h);
  const [minIdx,     setMinIdx]     = useState(init.mi);
  const [manualMode, setManualMode] = useState(false);
  const [digits,     setDigits]     = useState('');
  const inputRef = useRef<TextInput>(null);

  function enterManual() {
    setManualMode(true);
    setDigits('');
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleDigits(text: string) {
    const d = text.replace(/\D/g, '').slice(0, 4);
    setDigits(d);
    if (d.length >= 2) {
      const h = parseInt(d.slice(0, 2), 10);
      if (h <= 23) setHourIdx(h);
    }
    if (d.length === 4) {
      const m = parseInt(d.slice(2), 10);
      if (m <= 59) setMinIdx(Math.min(11, Math.round(m / 5)));
    }
  }

  function handleSave() {
    if (manualMode && digits.length === 4) {
      const h = parseInt(digits.slice(0, 2), 10);
      const m = parseInt(digits.slice(2), 10);
      if (h <= 23 && m <= 59) {
        const sm = Math.round(m / 5) * 5 % 60;
        onSave(`${HOURS[h]}:${MINUTES[sm / 5]}`);
        return;
      }
    }
    onSave(`${HOURS[hourIdx]}:${MINUTES[minIdx]}`);
  }

  const display = manualMode
    ? `${digits[0] ?? '_'}${digits[1] ?? '_'}:${digits[2] ?? '_'}${digits[3] ?? '_'}`
    : `${HOURS[hourIdx]}:${MINUTES[minIdx]}`;

  const cardBg   = isDarkMode ? '#1F2937' : '#FFFFFF';
  const textPri  = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub  = isDarkMode ? '#9CA3AF' : '#6B7280';
  const inputBg  = isDarkMode ? '#374151' : '#F3F4F6';
  const divColor = isDarkMode ? '#374151' : '#F3F4F6';

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={tpStyles.overlay} onPress={onCancel}>
        <Pressable style={[tpStyles.card, { backgroundColor: cardBg }]} onPress={() => {}}>

          <Text style={[tpStyles.title, { color: textSub }]}>{label}</Text>

          {/* Time display — tap to type */}
          <TouchableOpacity
            style={[tpStyles.displayBtn, { backgroundColor: inputBg }]}
            onPress={enterManual}
            activeOpacity={0.75}>
            <Text style={[tpStyles.displayText, { color: manualMode ? BLUE : textPri }]}>
              {display}
            </Text>
            {manualMode && (
              <TextInput
                ref={inputRef}
                value={digits}
                onChangeText={handleDigits}
                keyboardType="number-pad"
                maxLength={4}
                style={tpStyles.hiddenInput}
                caretHidden
              />
            )}
          </TouchableOpacity>
          <Text style={[tpStyles.hint, { color: textSub }]}>
            {manualMode ? 'Type 4 digits · hours then minutes' : 'Tap time to type manually'}
          </Text>

          {/* Scroll wheels */}
          <View style={tpStyles.wheelRow}>
            <WheelColumn
              items={HOURS}
              selectedIdx={hourIdx}
              isDarkMode={isDarkMode}
              onChange={(i) => { setManualMode(false); setHourIdx(i); }}
            />
            <Text style={[tpStyles.colon, { color: textSub }]}>:</Text>
            <WheelColumn
              items={MINUTES}
              selectedIdx={minIdx}
              isDarkMode={isDarkMode}
              onChange={(i) => { setManualMode(false); setMinIdx(i); }}
            />
          </View>

          {/* Validation error */}
          {error ? (
            <Text style={tpStyles.errorText}>{error}</Text>
          ) : null}

          {/* Cancel / Save */}
          <View style={[tpStyles.btnRow, { borderColor: divColor }]}>
            <TouchableOpacity onPress={onCancel} activeOpacity={0.7} style={tpStyles.btn}>
              <Text style={[tpStyles.cancelText, { color: textSub }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} activeOpacity={0.85} style={tpStyles.btn}>
              <Text style={tpStyles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

        </Pressable>
      </Pressable>
    </Modal>
  );
}

const tpStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 20,
    width: '100%',
    maxWidth: 340,
    paddingTop: 22,
    paddingBottom: 20,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 14,
  },
  displayBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  displayText: {
    fontSize: 34,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  hint: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 2,
  },
  wheelRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  colon: {
    fontSize: 22,
    fontWeight: '500',
    marginHorizontal: 6,
    marginBottom: 2,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '500',
  },
  saveText: {
    color: BLUE,
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AvailabilityScreen() {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const { locations, addLocation, schedule, setSchedule, sessionDuration, setSessionDuration } = useTrainerProfile();
  const [picker,        setPicker]        = useState<PickerTarget | null>(null);
  const [locPicker,     setLocPicker]     = useState<{ day: string; slotId: string } | null>(null);

  const [pendingSlot,   setPendingSlot]   = useState<{ day: string; slotId: string } | null>(null);
  const [showQuickAdd,  setShowQuickAdd]  = useState(false);
  const [quickCity,     setQuickCity]     = useState('Vilnius');
  const [quickAddr,     setQuickAddr]     = useState('');
  const [quickCityOpen, setQuickCityOpen] = useState(false);
  const [pickerError,   setPickerError]   = useState<string | null>(null);
  const [dayErrors,     setDayErrors]     = useState<Record<string, string>>({});

  useEffect(() => { setPickerError(null); }, [picker]);

  const bg          = isDarkMode ? '#111827' : '#F3F4F6';
  const headerBg    = isDarkMode ? '#111827' : '#FFFFFF';
  const cardBg      = isDarkMode ? '#1F2937' : '#FFFFFF';
  const borderColor = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const divColor    = isDarkMode ? '#374151' : '#F3F4F6';
  const timeBtnBg   = isDarkMode ? '#374151' : '#F3F4F6';
  const switchOff   = isDarkMode ? '#374151' : '#E5E7EB';
  const sheetBg     = isDarkMode ? '#1F2937' : '#FFFFFF';

  function toggleDay(day: string) {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  }

  function addSlot(day: string) {
    const existing = schedule[day].slots;
    const defaults = nextSlotDefault(existing);
    if (!defaults) {
      setDayErrors(prev => ({ ...prev, [day]: 'No time left in the day to add another slot.' }));
      return;
    }
    setDayErrors(prev => { const n = { ...prev }; delete n[day]; return n; });
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, {
          id: newId(), start: defaults.start, end: defaults.end,
          location: locations.length > 0 ? fmtLoc(locations[0].city, locations[0].address) : '',
          notes: '', duration: sessionDuration,
        }],
      },
    }));
  }

  function setLocation(day: string, slotId: string, location: string) {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map(s => s.id === slotId ? { ...s, location } : s),
      },
    }));
    setLocPicker(null);
  }

  function removeSlot(day: string, slotId: string) {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], slots: prev[day].slots.filter(s => s.id !== slotId) },
    }));
  }

  function setTime(day: string, slotId: string, field: 'start' | 'end', time: string) {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map(s => s.id === slotId ? { ...s, [field]: time } : s),
      },
    }));
    setPicker(null);
  }

  function setNotes(day: string, slotId: string, notes: string) {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map(s => s.id === slotId ? { ...s, notes } : s),
      },
    }));
  }

  function changeSessionDuration(value: number) {
    setSessionDuration(value);
    setSchedule(prev => {
      const next = { ...prev };
      for (const day of Object.keys(next)) {
        next[day] = { ...next[day], slots: next[day].slots.map(s => ({ ...s, duration: value })) };
      }
      return next;
    });
  }

  const weekMins = totalWeekMinutes(schedule);

  const pickerInitialTime = picker
    ? (schedule[picker.day].slots.find(s => s.id === picker.slotId)?.[picker.field] ?? '09:00')
    : '09:00';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: headerBg, borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={24} color={textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Set Availability</Text>
        <View style={styles.navBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}>

        {/* ── Global session duration ── */}
        <View style={[styles.dayCard, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.durationInlineRow}>
            <Text style={[styles.durationInlineLabel, { color: textSub }]}>Session:</Text>
            <View style={styles.durationChips}>
              {DURATIONS.map(d => {
                const active = sessionDuration === d.value;
                return (
                  <TouchableOpacity
                    key={d.value}
                    style={[styles.durationChip, { backgroundColor: active ? BLUE : timeBtnBg }]}
                    onPress={() => changeSessionDuration(d.value)}
                    activeOpacity={0.7}>
                    <Text style={[styles.durationChipText, { color: active ? '#FFFFFF' : textPrimary }]}>
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {DAYS.map(day => {
          const config = schedule[day];
          const dayMins = config.slots.reduce((s, sl) => s + minutesFromSlot(sl.start, sl.end), 0);
          return (
            <View key={day} style={[styles.dayCard, { backgroundColor: cardBg, borderColor }]}>
              <View style={styles.dayHeader}>
                <View>
                  <Text style={[styles.dayFull, { color: textPrimary }]}>{DAY_FULL[day]}</Text>
                  {config.enabled && config.slots.length > 0 && (
                    <Text style={[styles.dayHours, { color: textSub }]}>
                      {formatDuration(dayMins)} available
                    </Text>
                  )}
                  {!config.enabled && (
                    <Text style={[styles.dayHours, { color: textSub }]}>Day off</Text>
                  )}
                </View>
                <Switch
                  value={config.enabled}
                  onValueChange={() => toggleDay(day)}
                  trackColor={{ false: switchOff, true: BLUE }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={switchOff}
                />
              </View>

              {config.enabled && (
                <>
                  {config.slots.length > 0 && (
                    <View style={[styles.slotsDivider, { backgroundColor: divColor }]} />
                  )}
                  <View style={styles.slotsWrap}>
                    {config.slots.map((slot, i) => (
                      <View key={slot.id}>
                        <View style={styles.slotBlock}>
                          {/* Times + delete */}
                          <View style={styles.slotRow}>
                            <TouchableOpacity
                              style={[styles.timeBtn, { backgroundColor: timeBtnBg }]}
                              onPress={() => setPicker({ day, slotId: slot.id, field: 'start' })}
                              activeOpacity={0.7}>
                              <Text style={[styles.timeBtnText, { color: textPrimary }]}>{slot.start}</Text>
                            </TouchableOpacity>
                            <Text style={[styles.toLabel, { color: textSub }]}>–</Text>
                            <TouchableOpacity
                              style={[styles.timeBtn, { backgroundColor: timeBtnBg }]}
                              onPress={() => setPicker({ day, slotId: slot.id, field: 'end' })}
                              activeOpacity={0.7}>
                              <Text style={[styles.timeBtnText, { color: textPrimary }]}>{slot.end}</Text>
                            </TouchableOpacity>
                            <View style={{ flex: 1 }} />
                            <TouchableOpacity
                              style={styles.deleteBtn}
                              onPress={() => removeSlot(day, slot.id)}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              activeOpacity={0.7}>
                              <Trash2 size={16} color={textSub} strokeWidth={2} />
                            </TouchableOpacity>
                          </View>

                          {/* Location */}
                          <TouchableOpacity
                            style={[styles.locFullBtn, { backgroundColor: timeBtnBg }]}
                            onPress={() => setLocPicker({ day, slotId: slot.id })}
                            activeOpacity={0.7}>
                            <MapPin size={13} color={textSub} strokeWidth={2} />
                            <Text
                              style={[styles.locFullBtnText, {
                                color: slot.location ? textPrimary : textSub,
                              }]}
                              numberOfLines={1}>
                              {slot.location || 'Select location'}
                            </Text>
                            <ChevronDown size={13} color={textSub} strokeWidth={2} />
                          </TouchableOpacity>

                          {/* Notes */}
                          <TextInput
                            style={[styles.notesInput, { color: textSub }]}
                            value={slot.notes}
                            onChangeText={(text) => setNotes(day, slot.id, text)}
                            placeholder="Add notes (optional)"
                            placeholderTextColor={isDarkMode ? '#4B5563' : '#D1D5DB'}
                            multiline
                            maxLength={200}
                          />
                        </View>
                        {i < config.slots.length - 1 && (
                          <View style={[styles.slotDivider, { backgroundColor: divColor }]} />
                        )}
                      </View>
                    ))}
                    <TouchableOpacity
                      style={[styles.addSlotBtn, { borderColor: BLUE + '50' }]}
                      onPress={() => addSlot(day)}
                      activeOpacity={0.7}>
                      <Plus size={14} color={BLUE} strokeWidth={2.5} />
                      <Text style={[styles.addSlotText, { color: BLUE }]}>Add slot</Text>
                    </TouchableOpacity>
                    {dayErrors[day] ? (
                      <Text style={styles.dayErrorText}>{dayErrors[day]}</Text>
                    ) : null}
                  </View>
                </>
              )}
            </View>
          );
        })}

        {/* Weekly summary */}
        <View style={[styles.summaryCard, {
          backgroundColor: isDarkMode ? '#1E3A5F' : '#EFF6FF',
          borderColor: isDarkMode ? '#1E3A5F' : '#BFDBFE',
        }]}>
          <Text style={[styles.summaryLabel, { color: isDarkMode ? '#93C5FD' : '#3B82F6' }]}>
            Total available this week
          </Text>
          <Text style={[styles.summaryValue, { color: BLUE }]}>{formatDuration(weekMins)}</Text>
        </View>

      </ScrollView>

      {/* Save button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12, backgroundColor: headerBg, borderTopColor: borderColor }]}>
        <TouchableOpacity style={styles.saveBtn} onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>Save Availability</Text>
        </TouchableOpacity>
      </View>

      {/* Time picker */}
      {picker && (
        <TimePicker
          label={picker.field === 'start' ? 'Start Time' : 'End Time'}
          initialTime={pickerInitialTime}
          isDarkMode={isDarkMode}
          error={pickerError}
          onSave={(t) => {
            const slot     = schedule[picker.day].slots.find(s => s.id === picker.slotId);
            const newStart = picker.field === 'start' ? t : (slot?.start ?? '09:00');
            const newEnd   = picker.field === 'end'   ? t : (slot?.end   ?? '18:00');
            if (toMins(newEnd) <= toMins(newStart)) {
              setPickerError('End time must be after start time.');
              return;
            }
            if (hasOverlap(schedule[picker.day].slots, picker.slotId, newStart, newEnd)) {
              setPickerError('This time slot overlaps with an existing slot.');
              return;
            }
            setTime(picker.day, picker.slotId, picker.field, t);
          }}
          onCancel={() => setPicker(null)}
        />
      )}

      {/* Location picker */}
      {locPicker && (
        <Modal visible transparent animationType="slide" onRequestClose={() => setLocPicker(null)}>
          <Pressable style={styles.pickerOverlay} onPress={() => setLocPicker(null)}>
            <Pressable style={[styles.pickerSheet, { backgroundColor: sheetBg }]} onPress={() => {}}>
              <View style={styles.pickerHandle} />
              <Text style={[styles.pickerTitle, { color: textPrimary }]}>Select Location</Text>
              {locations.map(loc => {
                const label      = fmtLoc(loc.city, loc.address);
                const currentLoc = schedule[locPicker.day].slots.find(s => s.id === locPicker.slotId)?.location ?? '';
                const selected   = label === currentLoc;
                return (
                  <TouchableOpacity
                    key={loc.id}
                    style={[styles.locPickerItem, selected && { backgroundColor: BLUE }]}
                    onPress={() => setLocation(locPicker.day, locPicker.slotId, label)}
                    activeOpacity={0.7}>
                    <View style={styles.locPickerContent}>
                      <Text
                        style={[styles.locPickerCity, {
                          color: selected ? '#FFFFFF' : textPrimary,
                          fontWeight: selected ? '700' : '500',
                        }]}
                        numberOfLines={1}>
                        {loc.city} • {loc.address}
                      </Text>
                    </View>
                    {selected && <Text style={styles.locPickerCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={styles.locPickerAddBtn}
                onPress={() => {
                  setPendingSlot(locPicker);
                  setLocPicker(null);
                  setQuickCity('Vilnius');
                  setQuickAddr('');
                  setShowQuickAdd(true);
                }}
                activeOpacity={0.7}>
                <Text style={[styles.locPickerAddText, { color: BLUE }]}>+ Add new location</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* Quick-add location */}
      {showQuickAdd && (
        <Modal visible transparent animationType="slide" onRequestClose={() => setShowQuickAdd(false)}>
          <Pressable style={styles.pickerOverlay} onPress={() => setShowQuickAdd(false)}>
            <Pressable style={[styles.pickerSheet, { backgroundColor: sheetBg }]} onPress={() => {}}>
              <View style={styles.pickerHandle} />
              <Text style={[styles.pickerTitle, { color: textPrimary }]}>Add Location</Text>
              <TouchableOpacity
                style={[styles.quickDropdown, { backgroundColor: timeBtnBg }]}
                onPress={() => setQuickCityOpen(v => !v)}
                activeOpacity={0.7}>
                <Text style={[styles.quickDropdownText, { color: textPrimary }]}>{quickCity}</Text>
                <Text style={{ color: textSub, fontSize: 12 }}>▼</Text>
              </TouchableOpacity>
              {quickCityOpen && (
                <ScrollView style={[styles.quickCityList, { backgroundColor: timeBtnBg }]} nestedScrollEnabled>
                  {CITIES.map(c => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.quickCityRow, quickCity === c && { backgroundColor: BLUE + '22' }]}
                      onPress={() => { setQuickCity(c); setQuickCityOpen(false); }}
                      activeOpacity={0.7}>
                      <Text style={[styles.locPickerCity, { color: quickCity === c ? BLUE : textPrimary }]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
              <TextInput
                style={[styles.quickAddrInput, { backgroundColor: timeBtnBg, color: textPrimary }]}
                value={quickAddr}
                onChangeText={setQuickAddr}
                placeholder="Address, e.g. Žalgirio g. 90"
                placeholderTextColor="#AAAAAA"
                autoCapitalize="words"
              />
              <TouchableOpacity
                style={[styles.saveBtn, !quickAddr.trim() && { backgroundColor: '#D1D5DB' }]}
                disabled={!quickAddr.trim()}
                onPress={() => {
                  addLocation(quickCity, quickAddr);
                  if (pendingSlot) {
                    setLocation(pendingSlot.day, pendingSlot.slotId, fmtLoc(quickCity, quickAddr));
                  }
                  setShowQuickAdd(false);
                  setPendingSlot(null);
                  setQuickAddr('');
                }}
                activeOpacity={0.85}>
                <Text style={styles.saveBtnText}>Add Location</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
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
  navBtn: {
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

  scroll: {
    padding: 16,
    gap: 10,
  },

  dayCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dayFull: {
    fontSize: 15,
    fontWeight: '600',
  },
  dayHours: {
    fontSize: 12,
    marginTop: 2,
  },
  slotsDivider: {
    height: StyleSheet.hairlineWidth,
  },
  durationInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  durationInlineLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  durationChips: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  durationChip: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  durationChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  slotsWrap: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 0,
  },
  slotBlock: {
    paddingVertical: 8,
    gap: 8,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slotDivider: {
    height: StyleSheet.hairlineWidth,
  },
  timeBtn: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    minWidth: 76,
    alignItems: 'center',
  },
  timeBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  toLabel: {
    fontSize: 13,
    fontWeight: '400',
  },
  deleteBtn: {
    marginLeft: 4,
    padding: 4,
  },
  locFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  locFullBtnText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  notesInput: {
    fontSize: 12,
    paddingHorizontal: 4,
    paddingVertical: 4,
    minHeight: 28,
  },
  addSlotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderStyle: 'dashed',
  },
  addSlotText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dayErrorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
  },

  summaryCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
  },

  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  saveBtn: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Location / quick-add modals (bottom sheet style)
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 4,
  },
  pickerHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 10,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  locPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
  },
  locPickerContent: {
    flex: 1,
    gap: 2,
  },
  locPickerCity: {
    fontSize: 15,
  },
  locPickerAddr: {
    fontSize: 13,
  },
  locPickerCheck: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  locPickerAddBtn: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 4,
  },
  locPickerAddText: {
    fontSize: 15,
    fontWeight: '600',
  },

  quickDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 8,
  },
  quickDropdownText: {
    fontSize: 15,
    flex: 1,
  },
  quickCityList: {
    borderRadius: 10,
    maxHeight: 160,
    marginTop: 4,
  },
  quickCityRow: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 8,
  },
  quickAddrInput: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginTop: 8,
  },
});

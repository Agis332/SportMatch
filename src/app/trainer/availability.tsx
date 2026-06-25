import { router } from 'expo-router';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import {
  FlatList,
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
import { useTrainerProfile } from '@/context/TrainerProfileContext';

const BLUE = '#208AEF';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_FULL: Record<string, string> = {
  Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday',
  Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday',
};

const TIMES = Array.from({ length: 17 }, (_, i) => {
  const h = 6 + i;
  return `${h.toString().padStart(2, '0')}:00`;
}); // 06:00 – 22:00

let slotCounter = 10;
function newId() { return String(++slotCounter); }

const CITIES = [
  'Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys',
  'Alytus', 'Marijampolė', 'Mažeikiai', 'Jonava', 'Utena',
];

function fmtLoc(city: string, address: string) { return `${city} · ${address}`; }

interface Slot { id: string; start: string; end: string; location: string; }
interface DayConfig { enabled: boolean; slots: Slot[]; }
type Schedule = Record<string, DayConfig>;

function makeInitial(defaultLoc: string): Schedule {
  return {
    Mon: { enabled: true,  slots: [{ id: '1', start: '09:00', end: '18:00', location: defaultLoc }] },
    Tue: { enabled: true,  slots: [{ id: '2', start: '09:00', end: '18:00', location: defaultLoc }] },
    Wed: { enabled: true,  slots: [{ id: '3', start: '09:00', end: '18:00', location: defaultLoc }] },
    Thu: { enabled: true,  slots: [{ id: '4', start: '09:00', end: '18:00', location: defaultLoc }] },
    Fri: { enabled: true,  slots: [{ id: '5', start: '09:00', end: '17:00', location: defaultLoc }] },
    Sat: { enabled: false, slots: [{ id: '6', start: '10:00', end: '14:00', location: defaultLoc }] },
    Sun: { enabled: false, slots: [] },
  };
}

function hoursFromSlot(start: string, end: string): number {
  const sh = parseInt(start.split(':')[0], 10);
  const eh = parseInt(end.split(':')[0], 10);
  return Math.max(0, eh - sh);
}

function totalWeekHours(schedule: Schedule): number {
  return Object.values(schedule).reduce((sum, day) => {
    if (!day.enabled) return sum;
    return sum + day.slots.reduce((s, slot) => s + hoursFromSlot(slot.start, slot.end), 0);
  }, 0);
}

type PickerTarget = { day: string; slotId: string; field: 'start' | 'end' };

export default function AvailabilityScreen() {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const { locations, addLocation } = useTrainerProfile();

  const defaultLoc = locations.length > 0 ? fmtLoc(locations[0].city, locations[0].address) : '';
  const [schedule,      setSchedule]      = useState<Schedule>(() => makeInitial(defaultLoc));
  const [picker,        setPicker]        = useState<PickerTarget | null>(null);
  const [locPicker,     setLocPicker]     = useState<{ day: string; slotId: string } | null>(null);

  // Quick-add location state
  const [pendingSlot,   setPendingSlot]   = useState<{ day: string; slotId: string } | null>(null);
  const [showQuickAdd,  setShowQuickAdd]  = useState(false);
  const [quickCity,     setQuickCity]     = useState('Vilnius');
  const [quickAddr,     setQuickAddr]     = useState('');
  const [quickCityOpen, setQuickCityOpen] = useState(false);

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
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, { id: newId(), start: '09:00', end: '17:00', location: locations.length > 0 ? fmtLoc(locations[0].city, locations[0].address) : '' }],
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

  const weekHours = totalWeekHours(schedule);

  // Current selected time (for highlighting in picker)
  const currentTime = picker
    ? schedule[picker.day].slots.find(s => s.id === picker.slotId)?.[picker.field] ?? ''
    : '';

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

        {DAYS.map(day => {
          const config = schedule[day];
          return (
            <View key={day} style={[styles.dayCard, { backgroundColor: cardBg, borderColor }]}>
              {/* Day header */}
              <View style={styles.dayHeader}>
                <View>
                  <Text style={[styles.dayFull, { color: textPrimary }]}>{DAY_FULL[day]}</Text>
                  {config.enabled && config.slots.length > 0 && (
                    <Text style={[styles.dayHours, { color: textSub }]}>
                      {config.slots.reduce((s, sl) => s + hoursFromSlot(sl.start, sl.end), 0)} hrs available
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

              {/* Time slots */}
              {config.enabled && (
                <>
                  {config.slots.length > 0 && (
                    <View style={[styles.slotsDivider, { backgroundColor: divColor }]} />
                  )}
                  <View style={styles.slotsWrap}>
                    {config.slots.map((slot, i) => (
                      <View key={slot.id}>
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
                          <TouchableOpacity
                            style={[styles.locBtn, { backgroundColor: timeBtnBg, flex: 1 }]}
                            onPress={() => setLocPicker({ day, slotId: slot.id })}
                            activeOpacity={0.7}>
                            <Text style={[styles.locBtnText, { color: textPrimary }]} numberOfLines={1}>
                              {slot.location.split(' · ')[0]}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={() => removeSlot(day, slot.id)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            activeOpacity={0.7}>
                            <Trash2 size={16} color={textSub} strokeWidth={2} />
                          </TouchableOpacity>
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
                  </View>
                </>
              )}
            </View>
          );
        })}

        {/* Weekly summary */}
        <View style={[styles.summaryCard, { backgroundColor: isDarkMode ? '#1E3A5F' : '#EFF6FF', borderColor: isDarkMode ? '#1E3A5F' : '#BFDBFE' }]}>
          <Text style={[styles.summaryLabel, { color: isDarkMode ? '#93C5FD' : '#3B82F6' }]}>
            Total available this week
          </Text>
          <Text style={[styles.summaryValue, { color: BLUE }]}>{weekHours} hours</Text>
        </View>

      </ScrollView>

      {/* Save button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12, backgroundColor: headerBg, borderTopColor: borderColor }]}>
        <TouchableOpacity style={styles.saveBtn} onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>Save Availability</Text>
        </TouchableOpacity>
      </View>

      {/* Time picker modal */}
      {picker && (
        <Modal visible transparent animationType="slide" onRequestClose={() => setPicker(null)}>
          <Pressable style={styles.pickerOverlay} onPress={() => setPicker(null)}>
            <Pressable style={[styles.pickerSheet, { backgroundColor: sheetBg }]} onPress={() => {}}>
              <View style={styles.pickerHandle} />
              <Text style={[styles.pickerTitle, { color: textPrimary }]}>
                Select {picker.field === 'start' ? 'Start' : 'End'} Time
              </Text>
              <FlatList
                data={TIMES}
                keyExtractor={t => t}
                style={styles.pickerList}
                showsVerticalScrollIndicator={false}
                getItemLayout={(_, index) => ({ length: 52, offset: 52 * index, index })}
                initialScrollIndex={Math.max(0, TIMES.indexOf(currentTime))}
                renderItem={({ item: time }) => {
                  const selected = time === currentTime;
                  return (
                    <TouchableOpacity
                      style={[styles.pickerItem, selected && { backgroundColor: BLUE }]}
                      onPress={() => setTime(picker.day, picker.slotId, picker.field, time)}
                      activeOpacity={0.7}>
                      <Text style={[styles.pickerItemText, { color: selected ? '#FFFFFF' : textPrimary }, selected && { fontWeight: '700' }]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* Location picker modal */}
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
                      <Text style={[styles.locPickerCity, { color: selected ? '#FFFFFF' : textPrimary }, selected && { fontWeight: '700' }]}>
                        {loc.city}
                      </Text>
                      <Text style={[styles.locPickerAddr, { color: selected ? 'rgba(255,255,255,0.75)' : textSub }]}>
                        {loc.address}
                      </Text>
                    </View>
                    {selected && <Text style={styles.locPickerCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
              {/* Add new location */}
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

      {/* Quick-add location modal */}
      {showQuickAdd && (
        <Modal visible transparent animationType="slide" onRequestClose={() => setShowQuickAdd(false)}>
          <Pressable style={styles.pickerOverlay} onPress={() => setShowQuickAdd(false)}>
            <Pressable style={[styles.pickerSheet, { backgroundColor: sheetBg }]} onPress={() => {}}>
              <View style={styles.pickerHandle} />
              <Text style={[styles.pickerTitle, { color: textPrimary }]}>Add Location</Text>

              {/* City */}
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

              {/* Address */}
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

  // Day card
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
  slotsWrap: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 0,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
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
  locBtn: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  locBtnText: {
    fontSize: 13,
    fontWeight: '500',
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

  // Summary
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

  // Bottom bar
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

  // Time picker
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
    maxHeight: '60%',
  },
  pickerHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 14,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  pickerList: {
    flexGrow: 0,
  },
  pickerItem: {
    height: 52,
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: 16,
  },
  pickerItemText: {
    fontSize: 17,
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

  // Quick-add modal
  quickDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
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
  },
});

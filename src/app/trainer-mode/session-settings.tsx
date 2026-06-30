import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState, useRef } from 'react';
import {
  PanResponder,
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

// Half-month steps: 0, 0.5, 1, 1.5 … 6  (13 positions)
const ADVANCE_STEPS = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6] as const;

function formatAdvance(months: number): string {
  if (months === 0) return 'No limit';
  if (months % 1 === 0) return months === 1 ? '1 month' : `${months} months`;
  const weeks = Math.round(months * 4);
  return weeks === 1 ? '1 week' : `${weeks} weeks`;
}

const CANCELLATION_OPTIONS = [
  { value: 'flexible', label: 'Flexible', sub: '24h notice' },
  { value: 'moderate', label: 'Moderate', sub: '48h notice' },
  { value: 'strict',   label: 'Strict',   sub: '72h notice' },
] as const;
type CancellationPolicy = typeof CANCELLATION_OPTIONS[number]['value'];

const MIN_NOTICE_OPTIONS = ['1h', '2h', '4h', '12h', '24h'] as const;
type MinNotice = typeof MIN_NOTICE_OPTIONS[number];

// 30-min steps from 0 to 24 h  (49 positions)
const BUFFER_STEPS = Array.from({ length: 49 }, (_, i) => i * 0.5);

function formatBuffer(hours: number): string {
  if (hours === 0)   return '0 min';
  if (hours === 0.5) return '30 min';
  if (hours % 1 === 0) return `${hours}h`;
  return `${hours}h`;
}

const THUMB = 22;
const TRACK_H = 4;

// ─── Generic slider ───────────────────────────────────────────────────────────

function SliderInput({
  stepIndex,
  stepCount,
  onChangeIndex,
  trackBg,
}: {
  stepIndex: number;
  stepCount: number;
  onChangeIndex: (i: number) => void;
  trackBg: string;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const trackWidthRef = useRef(0);
  const startXRef    = useRef(0);

  const max       = stepCount - 1;
  const fillRatio = max > 0 ? stepIndex / max : 0;
  const available = Math.max(0, trackWidth - THUMB);
  const thumbLeft = fillRatio * available;
  const fillWidth = thumbLeft + THUMB / 2;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,
      onPanResponderGrant: (evt) => {
        const x = Math.max(0, Math.min(trackWidthRef.current, evt.nativeEvent.locationX));
        startXRef.current = x;
        onChangeIndex(Math.round((x / Math.max(1, trackWidthRef.current)) * max));
      },
      onPanResponderMove: (_, gs) => {
        const x = Math.max(0, Math.min(trackWidthRef.current, startXRef.current + gs.dx));
        onChangeIndex(Math.round((x / Math.max(1, trackWidthRef.current)) * max));
      },
    })
  ).current;

  return (
    <View
      {...panResponder.panHandlers}
      onLayout={e => {
        const w = e.nativeEvent.layout.width;
        setTrackWidth(w);
        trackWidthRef.current = w;
      }}
      style={styles.sliderTrack}>
      {/* Background */}
      <View style={[styles.sliderBg, { backgroundColor: trackBg }]} />
      {/* Fill */}
      {trackWidth > 0 && (
        <View style={[styles.sliderFill, { width: fillWidth }]} />
      )}
      {/* Thumb */}
      {trackWidth > 0 && (
        <View style={[styles.sliderThumb, { left: thumbLeft }]} />
      )}
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function SessionSettingsScreen() {
  const insets         = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  const { autoConfirm, setAutoConfirm } = useTrainerProfile();

  const [sessionPrice,  setSessionPrice]  = useState('35');
  const [policy,        setPolicy]        = useState<CancellationPolicy>('moderate');
  const [minNotice,     setMinNotice]     = useState<MinNotice>('2h');
  const [maxAdvanceIdx, setMaxAdvanceIdx] = useState(2); // "1 month"
  const [bufferIdx,     setBufferIdx]     = useState(1); // "30 min"

  function handleAutoConfirmToggle(value: boolean) {
    setAutoConfirm(value);
  }

  const bg          = isDarkMode ? '#111827' : '#F3F4F6';
  const headerBg    = isDarkMode ? '#1F2937' : '#FFFFFF';
  const cardBg      = isDarkMode ? '#1F2937' : '#FFFFFF';
  const borderColor = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const divColor    = isDarkMode ? '#374151' : '#F3F4F6';
  const trackOff    = isDarkMode ? '#374151' : '#E5E7EB';
  const sliderBg    = isDarkMode ? '#374151' : '#E5E7EB';
  const chipBg      = isDarkMode ? '#374151' : '#F3F4F6';
  const chipBorder  = isDarkMode ? '#4B5563' : '#E5E7EB';

  function SectionLabel({ title, description }: { title: string; description?: string }) {
    return (
      <View style={styles.sectionLabelWrap}>
        <Text style={[styles.sectionLabel, { color: textSub }]}>{title}</Text>
        {description && <Text style={[styles.sectionDesc, { color: textSub }]}>{description}</Text>}
      </View>
    );
  }

  function Card({ children }: { children: React.ReactNode }) {
    return <View style={[styles.card, { backgroundColor: cardBg }]}>{children}</View>;
  }

  function Divider() {
    return <View style={[styles.divider, { backgroundColor: divColor }]} />;
  }

  function ChipRow<T extends string>({
    options, selected, onSelect,
  }: {
    options: readonly T[];
    selected: T;
    onSelect: (v: T) => void;
  }) {
    return (
      <View style={styles.chipRow}>
        {options.map(opt => {
          const active = opt === selected;
          return (
            <TouchableOpacity
              key={opt}
              style={[
                styles.chip,
                { backgroundColor: active ? BLUE : chipBg, borderColor: active ? BLUE : chipBorder },
              ]}
              onPress={() => onSelect(opt)}
              activeOpacity={0.7}>
              <Text style={[styles.chipText, { color: active ? '#FFFFFF' : textPrimary }]}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: headerBg, borderBottomColor: borderColor }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={24} color={textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Session Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>

        {/* Session Price */}
        <SectionLabel
          title="SESSION PRICE"
          description="The rate clients are charged per session."
        />
        <Card>
          <View style={styles.priceRow}>
            <Text style={[styles.priceSymbol, { color: textSub }]}>€</Text>
            <TextInput
              style={[styles.priceInput, { color: textPrimary }]}
              value={sessionPrice}
              onChangeText={v => setSessionPrice(v.replace(/[^0-9]/g, ''))}
              placeholder="35"
              placeholderTextColor="#AAAAAA"
              keyboardType="numeric"
            />
            <Text style={[styles.priceUnit, { color: textSub }]}>/session</Text>
          </View>
        </Card>

        {/* Cancellation Policy */}
        <SectionLabel
          title="CANCELLATION POLICY"
          description="How much notice clients must give to cancel without penalty."
        />
        <Card>
          {CANCELLATION_OPTIONS.map((opt, i) => {
            const active = policy === opt.value;
            return (
              <View key={opt.value}>
                {i > 0 && <Divider />}
                <TouchableOpacity
                  style={styles.policyRow}
                  onPress={() => setPolicy(opt.value)}
                  activeOpacity={0.7}>
                  <View style={styles.policyText}>
                    <Text style={[styles.policyLabel, { color: textPrimary }]}>{opt.label}</Text>
                    <Text style={[styles.policySub, { color: textSub }]}>{opt.sub}</Text>
                  </View>
                  <View style={[styles.radio, { borderColor: active ? BLUE : (isDarkMode ? '#4B5563' : '#D1D5DB') }]}>
                    {active && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </Card>

        {/* Auto-confirm */}
        <SectionLabel
          title="BOOKING CONFIRMATION"
          description="When enabled, new bookings are confirmed automatically without your review."
        />
        <Card>
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => handleAutoConfirmToggle(!autoConfirm)}
            activeOpacity={0.7}>
            <View style={styles.toggleText}>
              <Text style={[styles.toggleLabel, { color: textPrimary }]}>Auto-confirm Bookings</Text>
              <Text style={[styles.toggleSub, { color: textSub }]}>
                {autoConfirm ? 'New sessions confirmed automatically' : 'You review each request manually'}
              </Text>
            </View>
            <Switch
              value={autoConfirm}
              onValueChange={handleAutoConfirmToggle}
              trackColor={{ false: trackOff, true: BLUE }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={trackOff}
            />
          </TouchableOpacity>
        </Card>

        {/* Minimum notice */}
        <SectionLabel
          title="MINIMUM NOTICE"
          description="How far in advance clients must book a session."
        />
        <Card>
          <View style={styles.chipSection}>
            <ChipRow options={MIN_NOTICE_OPTIONS} selected={minNotice} onSelect={setMinNotice} />
          </View>
        </Card>

        {/* Maximum advance booking — slider */}
        <SectionLabel
          title="MAXIMUM ADVANCE BOOKING"
          description="How far ahead clients can schedule a session."
        />
        <Card>
          <View style={styles.sliderSection}>
            <SliderInput
              stepIndex={maxAdvanceIdx}
              stepCount={ADVANCE_STEPS.length}
              onChangeIndex={setMaxAdvanceIdx}
              trackBg={sliderBg}
            />
            {/* Range labels */}
            <View style={styles.sliderRangeRow}>
              <Text style={[styles.sliderRangeLabel, { color: textSub }]}>0</Text>
              <Text style={[styles.sliderRangeLabel, { color: textSub }]}>6 months</Text>
            </View>
            {/* Current value */}
            <Text style={[styles.sliderValueLabel, { color: textPrimary }]}>
              {formatAdvance(ADVANCE_STEPS[maxAdvanceIdx])}
            </Text>
          </View>
        </Card>

        {/* Buffer time */}
        <SectionLabel
          title="SESSION BUFFER"
          description="Break time reserved between consecutive sessions."
        />
        <Card>
          <View style={styles.sliderSection}>
            <SliderInput
              stepIndex={bufferIdx}
              stepCount={BUFFER_STEPS.length}
              onChangeIndex={setBufferIdx}
              trackBg={sliderBg}
            />
            <View style={styles.sliderRangeRow}>
              <Text style={[styles.sliderRangeLabel, { color: textSub }]}>0h</Text>
              <Text style={[styles.sliderRangeLabel, { color: textSub }]}>24h</Text>
            </View>
            <Text style={[styles.sliderValueLabel, { color: textPrimary }]}>
              {formatBuffer(BUFFER_STEPS[bufferIdx])}
            </Text>
          </View>
        </Card>

        {/* Save */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => router.back()}
          activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>Save Settings</Text>
        </TouchableOpacity>

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginRight: 8,
  },
  headerSpacer: { width: 24 },

  scroll: {
    padding: 16,
    gap: 12,
  },

  sectionLabelWrap: {
    paddingHorizontal: 4,
    gap: 3,
    marginBottom: -2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.7,
  },
  sectionDesc: {
    fontSize: 12,
    lineHeight: 17,
  },

  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },

  // Cancellation policy
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 14,
  },
  policyText: { flex: 1, gap: 2 },
  policyLabel: { fontSize: 15, fontWeight: '500' },
  policySub:   { fontSize: 13 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: BLUE,
  },

  // Auto-confirm toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 14,
  },
  toggleText:  { flex: 1, gap: 2 },
  toggleLabel: { fontSize: 15, fontWeight: '500' },
  toggleSub:   { fontSize: 13 },

  // Chips
  chipSection: { padding: 14 },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 14, fontWeight: '500' },

  // Slider
  sliderSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    gap: 10,
  },
  sliderTrack: {
    height: THUMB,
    justifyContent: 'center',
  },
  sliderBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    backgroundColor: BLUE,
  },
  sliderThumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: BLUE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  sliderRangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderRangeLabel: {
    fontSize: 12,
  },
  sliderValueLabel: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Session price
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 6,
  },
  priceSymbol: {
    fontSize: 22,
    fontWeight: '600',
  },
  priceInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    padding: 0,
  },
  priceUnit: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Save
  saveBtn: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

});

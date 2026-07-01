import { Check } from 'lucide-react-native';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';

const BLUE = '#208AEF';

const SPORTS = [
  { label: 'Football',     emoji: '⚽' },
  { label: 'Basketball',   emoji: '🏀' },
  { label: 'Tennis',       emoji: '🎾' },
  { label: 'Swimming',     emoji: '🏊' },
  { label: 'Boxing',       emoji: '🥊' },
  { label: 'Yoga',         emoji: '🧘' },
  { label: 'CrossFit',     emoji: '💪' },
  { label: 'Running',      emoji: '🏃' },
  { label: 'Martial Arts', emoji: '🥋' },
  { label: 'Cycling',      emoji: '🚴' },
];

const CITIES = ['Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys'];

export default function OnboardingScreen({ onDone }: { onDone?: () => void }) {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const bg          = isDarkMode ? '#111827' : '#F9FAFB';
  const cardBg      = isDarkMode ? '#1F2937' : '#FFFFFF';
  const cardBorder  = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const divider     = isDarkMode ? '#374151' : '#F3F4F6';
  const chipBg      = isDarkMode ? '#1F2937' : '#F3F4F6';
  const chipBorder  = isDarkMode ? '#374151' : '#E5E7EB';

  function toggleSport(label: string) {
    setSelectedSports(prev =>
      prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Skip button */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => onDone?.()} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.skipText, { color: textSub }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}>

        {/* Hero text */}
        <View style={styles.hero}>
          <Text style={[styles.title, { color: textPrimary }]}>Welcome to SportMatch!</Text>
          <Text style={[styles.subtitle, { color: textSub }]}>
            Tell us a bit about you to find the best trainers.
          </Text>
        </View>

        {/* Sports section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: textSub }]}>What sport are you into?</Text>
          <View style={styles.chipsGrid}>
            {SPORTS.map(sport => {
              const active = selectedSports.includes(sport.label);
              return (
                <TouchableOpacity
                  key={sport.label}
                  style={[
                    styles.chip,
                    { backgroundColor: active ? BLUE : chipBg, borderColor: active ? BLUE : chipBorder },
                  ]}
                  onPress={() => toggleSport(sport.label)}
                  activeOpacity={0.75}>
                  <Text style={styles.chipEmoji}>{sport.emoji}</Text>
                  <Text style={[styles.chipLabel, { color: active ? '#FFFFFF' : textPrimary }]}>
                    {sport.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* City section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: textSub }]}>Your city</Text>
          <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            {CITIES.map((city, i) => {
              const active = selectedCity === city;
              return (
                <View key={city}>
                  <TouchableOpacity
                    style={styles.cityRow}
                    onPress={() => setSelectedCity(city)}
                    activeOpacity={0.65}>
                    <Text style={[
                      styles.cityName,
                      { color: active ? BLUE : textPrimary },
                      active && styles.cityNameSelected,
                    ]}>
                      {city}
                    </Text>
                    {active && <Check size={17} color={BLUE} strokeWidth={2.5} />}
                  </TouchableOpacity>
                  {i < CITIES.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: divider }]} />
                  )}
                </View>
              );
            })}
          </View>
        </View>

      </ScrollView>

      {/* Footer CTA */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={[styles.ctaBtn, (!selectedCity && selectedSports.length === 0) && styles.ctaBtnDim]}
          onPress={() => onDone?.()}
          activeOpacity={0.85}>
          <Text style={styles.ctaBtnText}>Let's Go!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  topBar: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '500',
  },

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 32,
  },

  hero: {
    gap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },

  section: {
    gap: 14,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 50,
    borderWidth: 1.5,
  },
  chipEmoji: {
    fontSize: 16,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '500',
  },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  cityName: {
    fontSize: 15,
    fontWeight: '500',
  },
  cityNameSelected: {
    fontWeight: '700',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  ctaBtn: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaBtnDim: {
    opacity: 0.6,
  },
  ctaBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

import { router } from 'expo-router';
import { Check, ChevronLeft, Locate, MapPin, Navigation, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CITIES, useLocation } from '@/context/LocationContext';
import { useTheme } from '@/context/ThemeContext';

const BLUE = '#208AEF';

const RADIUS_OPTIONS = [5, 10, 25, 50, 100];

export default function LocationScreen() {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  const { selectedCity, setSelectedCity } = useLocation();
  const [useGps, setUseGps] = useState(false);
  const [detectedCity] = useState('Vilnius');
  const [localCity, setLocalCity] = useState(selectedCity);
  const [radiusIndex, setRadiusIndex] = useState(2);
  const [query, setQuery] = useState('');

  const bg          = isDarkMode ? '#111827' : '#F3F4F6';
  const headerBg    = isDarkMode ? '#111827' : '#FFFFFF';
  const cardBg      = isDarkMode ? '#1F2937' : '#FFFFFF';
  const cardBorder  = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const borderColor = isDarkMode ? '#1F2937' : '#F3F4F6';
  const searchBg    = isDarkMode ? '#1F2937' : '#F3F4F6';
  const divider     = isDarkMode ? '#374151' : '#F3F4F6';
  const switchOff   = isDarkMode ? '#374151' : '#E5E7EB';
  const radioBorder = isDarkMode ? '#374151' : '#D1D5DB';

  const filteredCities = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? CITIES.filter(c => c.toLowerCase().includes(q)) : CITIES;
  }, [query]);

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
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Location</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Current location */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: textSub }]}>Current Location</Text>
          <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.currentRow}>
              <View style={[styles.locationIconWrap, { backgroundColor: isDarkMode ? '#1E3A5F' : '#EFF6FF' }]}>
                <MapPin size={20} color={BLUE} strokeWidth={2} />
              </View>
              <View style={styles.currentInfo}>
                <Text style={[styles.currentCity, { color: textPrimary }]}>{detectedCity}</Text>
                <Text style={[styles.currentSub, { color: textSub }]}>Detected location</Text>
              </View>
              <TouchableOpacity style={styles.updateBtn} activeOpacity={0.8}>
                <Locate size={14} color={BLUE} strokeWidth={2} />
                <Text style={styles.updateBtnText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Use GPS toggle */}
        <View style={styles.section}>
          <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.toggleRow}>
              <View style={[styles.toggleIcon, { backgroundColor: isDarkMode ? '#052E16' : '#F0FDF4' }]}>
                <Navigation size={18} color="#22C55E" strokeWidth={2} />
              </View>
              <View style={styles.toggleText}>
                <Text style={[styles.toggleTitle, { color: textPrimary }]}>Use My Current Location</Text>
                <Text style={[styles.toggleSub, { color: textSub }]}>
                  Automatically detect and update location
                </Text>
              </View>
              <Switch
                value={useGps}
                onValueChange={setUseGps}
                trackColor={{ false: switchOff, true: BLUE }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={switchOff}
              />
            </View>
          </View>
        </View>

        {/* City selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: textSub }]}>Select City</Text>

          {/* Search */}
          <View style={[styles.searchBar, { backgroundColor: searchBg }]}>
            <Search size={15} color={textSub} strokeWidth={2} />
            <TextInput
              style={[styles.searchInput, { color: textPrimary }]}
              value={query}
              onChangeText={setQuery}
              placeholder="Search cities…"
              placeholderTextColor={textSub}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>

          {/* City list */}
          <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            {filteredCities.length === 0 ? (
              <View style={styles.noResults}>
                <Text style={[styles.noResultsText, { color: textSub }]}>No cities found</Text>
              </View>
            ) : (
              filteredCities.map((city, i) => {
                const selected = localCity === city;
                return (
                  <View key={city}>
                    <TouchableOpacity
                      style={styles.cityRow}
                      onPress={() => { setLocalCity(city); setQuery(''); }}
                      activeOpacity={0.65}>
                      <Text style={[
                        styles.cityName,
                        { color: selected ? BLUE : textPrimary },
                        selected && styles.cityNameSelected,
                      ]}>
                        {city}
                      </Text>
                      {selected && <Check size={17} color={BLUE} strokeWidth={2.5} />}
                    </TouchableOpacity>
                    {i < filteredCities.length - 1 && (
                      <View style={[styles.divider, { backgroundColor: divider }]} />
                    )}
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* Distance radius */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: textSub }]}>Search Radius</Text>
          <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder, paddingVertical: 20, paddingHorizontal: 16, gap: 16 }]}>
            <View style={styles.radiusHeader}>
              <Text style={[styles.radiusLabel, { color: textPrimary }]}>Find trainers within</Text>
              <Text style={styles.radiusValue}>{RADIUS_OPTIONS[radiusIndex]} km</Text>
            </View>
            {/* Segmented control */}
            <View style={[styles.radiusTrack, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}>
              {RADIUS_OPTIONS.map((r, i) => {
                const active = radiusIndex === i;
                return (
                  <TouchableOpacity
                    key={r}
                    style={[styles.radiusSegment, active && styles.radiusSegmentActive]}
                    onPress={() => setRadiusIndex(i)}
                    activeOpacity={0.75}>
                    <Text style={[
                      styles.radiusSegmentText,
                      { color: active ? '#FFFFFF' : textSub },
                      active && { fontWeight: '700' },
                    ]}>
                      {r < 100 ? `${r}` : '100'}
                    </Text>
                    <Text style={[styles.radiusSegmentKm, { color: active ? 'rgba(255,255,255,0.75)' : textSub }]}>
                      km
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={[styles.radiusHint, { color: textSub }]}>
              Trainers in {localCity} within {RADIUS_OPTIONS[radiusIndex]} km will appear in your search results.
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* Save button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12, borderTopColor: borderColor, backgroundColor: headerBg }]}>
        <TouchableOpacity style={styles.saveBtn} onPress={() => { setSelectedCity(localCity); router.back(); }} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>Save Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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

  // Scroll
  scroll: {
    padding: 16,
    gap: 20,
  },

  // Section
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  // Current location
  currentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  locationIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  currentInfo: {
    flex: 1,
    gap: 3,
  },
  currentCity: {
    fontSize: 16,
    fontWeight: '600',
  },
  currentSub: {
    fontSize: 12,
  },
  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1.5,
    borderColor: BLUE,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  updateBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: BLUE,
  },

  // GPS toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  toggleIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  toggleText: {
    flex: 1,
    gap: 3,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  toggleSub: {
    fontSize: 12,
    lineHeight: 17,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },

  // City list
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
  noResults: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
  },

  // Radius
  radiusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  radiusLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  radiusValue: {
    fontSize: 16,
    fontWeight: '700',
    color: BLUE,
  },
  radiusTrack: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    gap: 2,
  },
  radiusSegment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 1,
  },
  radiusSegmentActive: {
    backgroundColor: BLUE,
  },
  radiusSegmentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  radiusSegmentKm: {
    fontSize: 9,
    fontWeight: '400',
  },
  radiusHint: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  saveBtn: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

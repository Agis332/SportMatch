import { LocateFixed, Search } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BLUE = '#208AEF';
const GRAY = '#9CA3AF';

const LITHUANIA = {
  latitude: 55.1694,
  longitude: 23.8813,
  latitudeDelta: 3.8,
  longitudeDelta: 3.8,
};

const TRAINERS = [
  { id: '1', name: 'Tomas', sport: 'Football', emoji: '⚽', latitude: 54.6872, longitude: 25.2797 },
  { id: '2', name: 'Marta', sport: 'Yoga',     emoji: '🧘', latitude: 54.8985, longitude: 23.9036 },
  { id: '3', name: 'Lukas', sport: 'Boxing',   emoji: '🥊', latitude: 55.7033, longitude: 21.1443 },
  { id: '4', name: 'Aiste', sport: 'Running',  emoji: '🏃', latitude: 55.9349, longitude: 23.3137 },
  { id: '5', name: 'Jonas', sport: 'Tennis',   emoji: '🎾', latitude: 55.7345, longitude: 24.3574 },
];

const FILTERS = [
  { label: 'All',        emoji: '🗺️' },
  { label: 'Football',   emoji: '⚽' },
  { label: 'Basketball', emoji: '🏀' },
  { label: 'Tennis',     emoji: '🎾' },
  { label: 'Swimming',   emoji: '🏊' },
  { label: 'Boxing',     emoji: '🥊' },
  { label: 'Yoga',       emoji: '🧘' },
  { label: 'CrossFit',   emoji: '💪' },
  { label: 'Running',    emoji: '🏃' },
  { label: 'Cycling',    emoji: '🚴' },
];

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [activeSport, setActiveSport] = useState('All');

  const visibleTrainers = activeSport === 'All'
    ? TRAINERS
    : TRAINERS.filter(t => t.sport === activeSport);

  function recenter() {
    mapRef.current?.animateToRegion(LITHUANIA, 600);
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={LITHUANIA}
        showsUserLocation={false}
        showsCompass={false}
        showsPointsOfInterest={false}
        showsBuildings={false}
      >
        {visibleTrainers.map(trainer => (
          <Marker
            key={trainer.id}
            coordinate={{ latitude: trainer.latitude, longitude: trainer.longitude }}
            title={`${trainer.name} ${trainer.emoji}`}
            description={`${trainer.sport} trainer`}
            pinColor={BLUE}
          />
        ))}
      </MapView>

      {/* Search bar + filter chips */}
      <View style={[styles.topOverlay, { top: insets.top }]}>
        {/* Search bar */}
        <View style={styles.searchBar}>
          <Search size={16} color={GRAY} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search trainers..."
            placeholderTextColor={GRAY}
            returnKeyType="search"
          />
        </View>

        {/* Sport filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {FILTERS.map(filter => {
            const active = activeSport === filter.label;
            return (
              <TouchableOpacity
                key={filter.label}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setActiveSport(filter.label)}
                activeOpacity={0.75}
              >
                <Text style={styles.chipEmoji}>{filter.emoji}</Text>
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Recenter */}
      <TouchableOpacity
        style={[styles.recenterBtn, { bottom: insets.bottom + 16, right: 16 }]}
        onPress={recenter}
        activeOpacity={0.85}
      >
        <LocateFixed size={20} color={BLUE} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },

  // Top overlay (search + filters)
  topOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    gap: 8,
  },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    padding: 0,
  },

  // Filter chips
  filtersRow: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chipActive: {
    backgroundColor: BLUE,
  },
  chipEmoji: {
    fontSize: 13,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: GRAY,
  },
  chipLabelActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Recenter button
  recenterBtn: {
    position: 'absolute',
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 5,
  },
});

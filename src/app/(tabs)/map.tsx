import { LocateFixed, Search } from 'lucide-react-native';
import { useRef } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BLUE = '#208AEF';
const GRAY = '#6B7280';

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  function recenter() {
    mapRef.current?.animateToRegion(
      { latitude: 55.1694, longitude: 23.8813, latitudeDelta: 3.5, longitudeDelta: 3.5 },
      600,
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{ latitude: 55.1694, longitude: 23.8813, latitudeDelta: 3.5, longitudeDelta: 3.5 }}>

        <Marker coordinate={{ latitude: 54.6872, longitude: 25.2797 }} title="Tomas" tracksViewChanges={false}>
          <View style={styles.marker}><Text style={styles.emoji}>⚽</Text></View>
        </Marker>

        <Marker coordinate={{ latitude: 54.8985, longitude: 23.9036 }} title="Marta" tracksViewChanges={false}>
          <View style={styles.marker}><Text style={styles.emoji}>🧘</Text></View>
        </Marker>

        <Marker coordinate={{ latitude: 55.7033, longitude: 21.1443 }} title="Lukas" tracksViewChanges={false}>
          <View style={styles.marker}><Text style={styles.emoji}>🥊</Text></View>
        </Marker>

        <Marker coordinate={{ latitude: 55.9349, longitude: 23.3137 }} title="Aiste" tracksViewChanges={false}>
          <View style={styles.marker}><Text style={styles.emoji}>🏃</Text></View>
        </Marker>

        <Marker coordinate={{ latitude: 55.7345, longitude: 24.3574 }} title="Jonas" tracksViewChanges={false}>
          <View style={styles.marker}><Text style={styles.emoji}>🎾</Text></View>
        </Marker>

      </MapView>

      {/* Search bar */}
      <View style={[styles.searchContainer, { top: insets.top + 12 }]}>
        <View style={styles.searchBar}>
          <Search size={16} color={GRAY} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search location..."
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Re-center button */}
      <TouchableOpacity
        style={[styles.recenterBtn, { bottom: insets.bottom + 24 }]}
        onPress={recenter}
        activeOpacity={0.85}>
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
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    elevation: 4,
  },
  emoji: {
    fontSize: 20,
  },
  searchContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    padding: 0,
  },
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
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
});

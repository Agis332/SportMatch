import { ChevronDown, Heart, MapPin, Star, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BLUE = '#208AEF';
const GRAY = '#6B7280';
const LIGHT_BG = '#F3F4F6';

const CITIES = ['Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys'];

const SPORTS = [
  'Visi',
  'Futbolas',
  'Krepšinis',
  'Tenisas',
  'Plaukimas',
  'Boksas',
  'Joga',
  'CrossFit',
  'Bėgimas',
  'Kovos menai',
];

interface Trainer {
  id: string;
  name: string;
  sport: string;
  rating: number;
  price: number;
  city: string;
  initials: string;
}

const TRAINERS: Trainer[] = [
  { id: '1', name: 'Mantas Petrauskas', sport: 'Futbolas', rating: 4.8, price: 35, city: 'Vilnius', initials: 'MP' },
  { id: '2', name: 'Rūta Kazlauskaitė', sport: 'Joga', rating: 4.9, price: 45, city: 'Vilnius', initials: 'RK' },
  { id: '3', name: 'Tomas Žukauskas', sport: 'Krepšinis', rating: 4.7, price: 30, city: 'Kaunas', initials: 'TŽ' },
  { id: '4', name: 'Aistė Mikalauskaitė', sport: 'Tenisas', rating: 4.6, price: 50, city: 'Vilnius', initials: 'AM' },
  { id: '5', name: 'Darius Paulauskas', sport: 'Boksas', rating: 4.9, price: 40, city: 'Klaipėda', initials: 'DP' },
  { id: '6', name: 'Laura Stankevičiūtė', sport: 'CrossFit', rating: 4.5, price: 35, city: 'Vilnius', initials: 'LS' },
  { id: '7', name: 'Erikas Butkus', sport: 'Bėgimas', rating: 4.7, price: 28, city: 'Kaunas', initials: 'EB' },
  { id: '8', name: 'Ingrida Vaitkutė', sport: 'Plaukimas', rating: 4.8, price: 55, city: 'Vilnius', initials: 'IV' },
  { id: '9', name: 'Aurimas Grigas', sport: 'Kovos menai', rating: 4.6, price: 38, city: 'Vilnius', initials: 'AG' },
];

const AVATAR_COLORS = [
  '#B5C9E4', '#C8DDB5', '#E4CDB5', '#D4B5E4', '#B5E4D4',
  '#E4B5C8', '#C8B5E4', '#E4E4B5',
];

function avatarColor(id: string) {
  return AVATAR_COLORS[parseInt(id, 10) % AVATAR_COLORS.length];
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCity, setSelectedCity] = useState('Vilnius');
  const [sessionType, setSessionType] = useState<'individual' | 'group'>('individual');
  const [selectedSport, setSelectedSport] = useState('Visi');
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const filteredTrainers = useMemo(
    () =>
      TRAINERS.filter(
        t => t.city === selectedCity && (selectedSport === 'Visi' || t.sport === selectedSport),
      ),
    [selectedCity, selectedSport],
  );

  function toggleFavorite(id: string) {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Location + session type */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.locationRow}
          onPress={() => setCityModalVisible(true)}
          activeOpacity={0.7}>
          <MapPin size={15} color={BLUE} strokeWidth={2.5} />
          <Text style={styles.cityText}>{selectedCity}</Text>
          <ChevronDown size={15} color={GRAY} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.sessionToggle}>
          <TouchableOpacity
            style={[styles.pill, sessionType === 'individual' && styles.pillActive]}
            onPress={() => setSessionType('individual')}
            activeOpacity={0.8}>
            <Text style={[styles.pillText, sessionType === 'individual' && styles.pillTextActive]}>
              Individuali
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pill, sessionType === 'group' && styles.pillActive]}
            onPress={() => setSessionType('group')}
            activeOpacity={0.8}>
            <Text style={[styles.pillText, sessionType === 'group' && styles.pillTextActive]}>
              Grupinė
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sport chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        style={styles.chipsScroll}>
        {SPORTS.map(sport => (
          <TouchableOpacity
            key={sport}
            style={[styles.chip, selectedSport === sport && styles.chipActive]}
            onPress={() => setSelectedSport(sport)}
            activeOpacity={0.7}>
            <Text style={[styles.chipText, selectedSport === sport && styles.chipTextActive]}>
              {sport}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Trainer list */}
      <FlatList
        data={filteredTrainers}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Trenerių nerasta</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={[styles.avatar, { backgroundColor: avatarColor(item.id) }]}>
              <Text style={styles.initials}>{item.initials}</Text>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.trainerName}>{item.name}</Text>
              <Text style={styles.trainerSport}>{item.sport}</Text>
              <View style={styles.cardMeta}>
                <Star size={12} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />
                <Text style={styles.metaText}>{item.rating}</Text>
                <Text style={styles.dot}>·</Text>
                <Text style={styles.metaText}>{item.price}€/val.</Text>
                <Text style={styles.dot}>·</Text>
                <MapPin size={11} color={GRAY} strokeWidth={2} />
                <Text style={styles.metaText}>{item.city}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.heartBtn}
              onPress={() => toggleFavorite(item.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Heart
                size={20}
                color={favorites.has(item.id) ? '#EF4444' : '#D1D5DB'}
                fill={favorites.has(item.id) ? '#EF4444' : 'transparent'}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* City picker */}
      <Modal
        visible={cityModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCityModalVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setCityModalVisible(false)}>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Pasirinkite miestą</Text>
              <TouchableOpacity onPress={() => setCityModalVisible(false)}>
                <X size={20} color={GRAY} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            {CITIES.map(city => (
              <TouchableOpacity
                key={city}
                style={styles.cityRow}
                onPress={() => {
                  setSelectedCity(city);
                  setCityModalVisible(false);
                }}>
                <Text style={[styles.cityRowText, selectedCity === city && styles.cityRowTextActive]}>
                  {city}
                </Text>
                {selectedCity === city && <View style={styles.activeDot} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 14,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cityText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  // Session toggle
  sessionToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 50,
    backgroundColor: LIGHT_BG,
  },
  pillActive: {
    backgroundColor: BLUE,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
    color: GRAY,
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Sport chips
  chipsScroll: {
    flexGrow: 0,
  },
  chipsRow: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 50,
    backgroundColor: LIGHT_BG,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: '#EBF5FF',
    borderColor: BLUE,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: GRAY,
  },
  chipTextActive: {
    color: BLUE,
    fontWeight: '600',
  },

  // Trainer list
  list: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  separator: {
    height: 12,
  },
  empty: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: GRAY,
  },

  // Trainer card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  initials: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  cardBody: {
    flex: 1,
    gap: 3,
  },
  trainerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  trainerSport: {
    fontSize: 13,
    color: GRAY,
    fontWeight: '500',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    color: GRAY,
    fontWeight: '500',
  },
  dot: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  heartBtn: {
    flexShrink: 0,
  },

  // City modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  cityRow: {
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  cityRowText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  cityRowTextActive: {
    color: BLUE,
    fontWeight: '700',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BLUE,
  },
});

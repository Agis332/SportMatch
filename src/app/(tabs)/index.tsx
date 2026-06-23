import { router } from 'expo-router';
import { BadgeCheck, ChevronDown, Heart, MapPin, Search, Star, User, Users, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLanguage } from '@/context/LanguageContext';
import { CITIES, useLocation } from '@/context/LocationContext';
import { useTheme } from '@/context/ThemeContext';
import { AVATAR_COLORS, SPORT_EMOJI, TRAINERS, avatarColor, type Trainer } from '@/data/trainers';
import { toggleFavorite, useFavoriteIds } from '@/store/favorites';

const BLUE = '#208AEF';


const SPORTS = [
  { label: 'All', emoji: '' },
  { label: 'Football', emoji: '⚽' },
  { label: 'Basketball', emoji: '🏀' },
  { label: 'Tennis', emoji: '🎾' },
  { label: 'Swimming', emoji: '🏊' },
  { label: 'Boxing', emoji: '🥊' },
  { label: 'Yoga', emoji: '🧘' },
  { label: 'CrossFit', emoji: '💪' },
  { label: 'Running', emoji: '🏃' },
  { label: 'Martial Arts', emoji: '🥋' },
  { label: 'Cycling', emoji: '🚴' },
];


function SportChip({ label, emoji, isSelected, onPress }: {
  label: string;
  emoji: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  const { isDarkMode } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePress() {
    scale.value = withSequence(
      withSpring(0.88, { damping: 20, stiffness: 400 }),
      withSpring(1, { damping: 12, stiffness: 200 }),
    );
    onPress();
  }

  const chipBg = isSelected
    ? (isDarkMode ? '#1E3A5F' : '#EBF5FF')
    : (isDarkMode ? '#2D3748' : '#F3F4F6');
  const chipBorder = isSelected ? BLUE : 'transparent';
  const textColor = isSelected ? BLUE : (isDarkMode ? '#FFFFFF' : '#6B7280');

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[styles.chip, { backgroundColor: chipBg, borderColor: chipBorder }]}
        onPress={handlePress}
        activeOpacity={0.85}>
        <View style={styles.chipInner}>
          {emoji ? <Text style={styles.chipEmoji}>{emoji}</Text> : null}
          <Text style={[styles.chipText, { color: textColor, fontWeight: isSelected ? '600' : '500' }]}>
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function TrainerCard({ item, isFavorite, onFavorite }: {
  item: Trainer;
  isFavorite: boolean;
  onFavorite: () => void;
}) {
  const { isDarkMode } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const cardBg = isDarkMode ? '#1F2937' : '#FFFFFF';
  const cardBorder = isDarkMode ? '#374151' : '#F3F4F6';
  const nameColor = isDarkMode ? '#FFFFFF' : '#111827';
  const metaColor = isDarkMode ? '#9CA3AF' : '#6B7280';
  const dotColor = isDarkMode ? '#4B5563' : '#D1D5DB';

  return (
    <Animated.View style={[styles.card, animatedStyle, { backgroundColor: cardBg, borderColor: cardBorder }]}>
      <Pressable
        style={styles.cardInner}
        onPress={() => router.push(`/trainer/${item.id}`)}
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 35, stiffness: 500 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 30, stiffness: 450 }); }}>
        <View style={[styles.avatar, { backgroundColor: avatarColor(item.id) }]}>
          <Text style={styles.initials}>{item.initials}</Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.nameRow}>
            <Text style={[styles.trainerName, { color: nameColor }]} numberOfLines={1}>{item.name}</Text>
            {item.verified && (
              <BadgeCheck size={16} color="#FFFFFF" fill="#22C55E" strokeWidth={2.5} />
            )}
          </View>
          <Text style={[styles.trainerSport, { color: metaColor }]}>
            {SPORT_EMOJI[item.sport] ? `${SPORT_EMOJI[item.sport]} ` : ''}{item.sport}
          </Text>
          <View style={styles.cardMeta}>
            <Star size={12} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />
            <Text style={[styles.metaText, { color: metaColor }]}>{item.rating}</Text>
            <Text style={[styles.dot, { color: dotColor }]}>·</Text>
            <Text style={[styles.metaText, { color: metaColor }]}>{item.price}€/hr.</Text>
            <Text style={[styles.dot, { color: dotColor }]}>·</Text>
            <MapPin size={11} color={metaColor} strokeWidth={2} />
            <Text style={[styles.metaText, { color: metaColor }]}>{item.city}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.heartBtn}
          onPress={onFavorite}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Heart
            size={20}
            color={isFavorite ? '#EF4444' : (isDarkMode ? '#4B5563' : '#D1D5DB')}
            fill={isFavorite ? '#EF4444' : 'transparent'}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();

  const { selectedCity, setSelectedCity } = useLocation();
  const [sessionType, setSessionType] = useState<'individual' | 'group'>('individual');
  const [selectedSport, setSelectedSport] = useState('All');
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const favorites = useFavoriteIds();
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTrainers = useMemo(
    () =>
      TRAINERS.filter(t => {
        const matchesCity = t.city === selectedCity;
        const matchesSport = selectedSport === 'All' || t.sport === selectedSport;
        const matchesSearch = !searchQuery.trim() ||
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.sport.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCity && matchesSport && matchesSearch;
      }),
    [selectedCity, selectedSport, searchQuery],
  );

  const bg = isDarkMode ? '#111827' : '#FFFFFF';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSecondary = isDarkMode ? '#9CA3AF' : '#6B7280';
  const pillBg = isDarkMode ? '#1F2937' : '#F3F4F6';
  const sheetBg = isDarkMode ? '#1F2937' : '#FFFFFF';
  const cityRowBorder = isDarkMode ? '#374151' : '#F3F4F6';

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[styles.container, { paddingTop: insets.top, backgroundColor: bg }]}>

      {/* Location + session type */}
      <View style={styles.header}>
        <View style={styles.locationBar}>
          <TouchableOpacity
            style={styles.locationRow}
            onPress={() => setCityModalVisible(true)}
            activeOpacity={0.7}>
            <MapPin size={15} color={BLUE} strokeWidth={2.5} />
            <Text style={[styles.cityText, { color: textPrimary }]}>{selectedCity}</Text>
            <ChevronDown size={15} color={textSecondary} strokeWidth={2.5} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.searchIconBtn, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}
            onPress={() => {
              setSearchVisible(v => !v);
              setSearchQuery('');
            }}
            activeOpacity={0.7}>
            <Search size={18} color={searchVisible ? BLUE : textSecondary} strokeWidth={2} />
            <Text style={styles.searchIconBtnText}>{t.home.search}</Text>
          </TouchableOpacity>
        </View>

        {searchVisible && (
          <View style={[styles.searchBar, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}>
            <Search size={15} color={textSecondary} strokeWidth={2} />
            <TextInput
              style={[styles.searchInput, { color: '#111827' }]}
              placeholder={t.home.searchPlaceholder}
              placeholderTextColor="#AAAAAA"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
            />
            <TouchableOpacity
              onPress={() => { setSearchVisible(false); setSearchQuery(''); }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={16} color={textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.sessionToggle}>
          {([
            { type: 'individual', Icon: User,  label: t.home.individual, sub: t.home.individualSub },
            { type: 'group',      Icon: Users, label: t.home.group,       sub: t.home.groupSub     },
          ] as const).map(({ type, Icon, label, sub }) => {
            const active = sessionType === type;
            const iconColor  = active ? '#FFFFFF' : textSecondary;
            const titleColor = active ? '#FFFFFF' : textPrimary;
            const subColor   = active ? 'rgba(255,255,255,0.72)' : textSecondary;
            return (
              <TouchableOpacity
                key={type}
                style={[styles.sessionBtn, { backgroundColor: active ? BLUE : pillBg }]}
                onPress={() => setSessionType(type)}
                activeOpacity={0.8}>
                <Icon size={18} color={iconColor} strokeWidth={1.75} />
                <Text style={[styles.sessionBtnTitle, { color: titleColor }]}>{label}</Text>
                <Text style={[styles.sessionBtnSub,   { color: subColor   }]}>{sub}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Sport chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        style={styles.chipsScroll}>
        {SPORTS.map(sport => (
          <SportChip
            key={sport.label}
            label={sport.label === 'All' ? t.home.sportAll : sport.label}
            emoji={sport.emoji}
            isSelected={selectedSport === sport.label}
            onPress={() => setSelectedSport(sport.label)}
          />
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
            <Text style={[styles.emptyText, { color: textSecondary }]}>{t.home.noTrainers}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TrainerCard
            item={item}
            isFavorite={favorites.has(item.id)}
            onFavorite={() => toggleFavorite(item.id)}
          />
        )}
      />

      {/* City picker */}
      <Modal
        visible={cityModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCityModalVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setCityModalVisible(false)}>
          <View style={[styles.sheet, { backgroundColor: sheetBg, paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: textPrimary }]}>{t.home.selectCity}</Text>
              <TouchableOpacity onPress={() => setCityModalVisible(false)}>
                <X size={20} color={textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            {CITIES.map(city => (
              <TouchableOpacity
                key={city}
                style={[styles.cityRow, { borderBottomColor: cityRowBorder }]}
                onPress={() => {
                  setSelectedCity(city);
                  setCityModalVisible(false);
                }}>
                <Text style={[
                  styles.cityRowText,
                  { color: selectedCity === city ? BLUE : textPrimary },
                  selectedCity === city && styles.cityRowTextActive,
                ]}>
                  {city}
                </Text>
                {selectedCity === city && <View style={styles.activeDot} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 14,
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cityText: {
    fontSize: 18,
    fontWeight: '700',
  },
  searchIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIconBtnText: {
    fontSize: 14,
    color: '#BBBBBB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },

  // Session toggle
  sessionToggle: {
    flexDirection: 'row',
    gap: 10,
  },
  sessionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
  },
  sessionBtnTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  sessionBtnSub: {
    fontSize: 11,
    fontWeight: '400',
    textAlign: 'center',
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipEmoji: {
    fontSize: 18,
  },
  chipText: {
    fontSize: 12,
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
  },

  // Trainer card
  card: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
  },
  cardInner: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trainerName: {
    fontSize: 15,
    fontWeight: '600',
    flexShrink: 1,
  },
  trainerSport: {
    fontSize: 13,
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
    fontWeight: '500',
  },
  dot: {
    fontSize: 12,
  },
  heartBtn: {
    flexShrink: 0,
  },

  // City modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
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
  },
  cityRow: {
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cityRowText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cityRowTextActive: {
    fontWeight: '700',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BLUE,
  },
});

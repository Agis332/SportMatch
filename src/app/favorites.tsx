import { router } from 'expo-router';
import { BadgeCheck, ChevronLeft, Heart, MapPin, Star } from 'lucide-react-native';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';
import { SPORT_EMOJI, TRAINERS, avatarColor } from '@/data/trainers';
import { toggleFavorite, useFavoriteIds } from '@/store/favorites';

const BLUE = '#208AEF';

function TrainerCard({ item, isFavorite }: {
  item: typeof TRAINERS[0];
  isFavorite: boolean;
}) {
  const { isDarkMode } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const cardBg     = isDarkMode ? '#1F2937' : '#FFFFFF';
  const cardBorder = isDarkMode ? '#374151' : '#F3F4F6';
  const nameColor  = isDarkMode ? '#FFFFFF' : '#111827';
  const metaColor  = isDarkMode ? '#9CA3AF' : '#6B7280';
  const dotColor   = isDarkMode ? '#4B5563' : '#D1D5DB';

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
          onPress={() => toggleFavorite(item.id)}
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

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const favoriteIds = useFavoriteIds();

  const favorited = TRAINERS.filter(t => favoriteIds.has(t.id));

  const bg          = isDarkMode ? '#111827' : '#FFFFFF';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const borderColor = isDarkMode ? '#1F2937' : '#F3F4F6';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={24} color={textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Saved Trainers</Text>
        <View style={styles.backBtn} />
      </View>

      <FlatList
        data={favorited}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Heart size={40} color={isDarkMode ? '#374151' : '#E5E7EB'} strokeWidth={1.5} />
            <Text style={[styles.emptyTitle, { color: textPrimary }]}>No saved trainers</Text>
            <Text style={[styles.emptySub, { color: textSub }]}>
              Tap the heart on any trainer to save them here.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TrainerCard item={item} isFavorite={favoriteIds.has(item.id)} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

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

  // List
  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  separator: {
    height: 12,
  },

  // Card
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

  // Empty state
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
});

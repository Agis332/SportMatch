import { router, useLocalSearchParams } from 'expo-router';
import { BadgeCheck, ChevronLeft, Heart, MapPin, MessageCircle, Star, Timer, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';

const BLUE = '#208AEF';

// ─── Data ────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#B5C9E4', '#C8DDB5', '#E4CDB5', '#D4B5E4', '#B5E4D4',
  '#E4B5C8', '#C8B5E4', '#E4E4B5',
];
function avatarColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function initials(fullName: string) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

interface TrainerRow {
  id: string;
  full_name: string;
  bio: string | null;
  sport_id: string | null;
  city: string | null;
  price_per_hour: number | null;
  rating: number | null;
  review_count: number | null;
  experience_years: number | null;
  is_verified: boolean | null;
  avatar_url: string | null;
  created_at: string | null;
  sports: { name: string; emoji: string } | { name: string; emoji: string }[] | null;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <View style={starStyles.row}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          color="#F59E0B"
          fill={i <= Math.round(rating) ? '#F59E0B' : 'transparent'}
          strokeWidth={i <= Math.round(rating) ? 0 : 1.5}
        />
      ))}
    </View>
  );
}
const starStyles = StyleSheet.create({ row: { flexDirection: 'row', gap: 2 } });

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function TrainerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const [isFavorite, setIsFavorite] = useState(false);
  const [trainer, setTrainer] = useState<TrainerRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrainer() {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('trainers')
        .select('id, full_name, bio, sport_id, city, price_per_hour, rating, review_count, experience_years, is_verified, avatar_url, created_at, sports(name, emoji)')
        .eq('id', id)
        .single();
      if (err) {
        setError(err.message);
      } else {
        setTrainer(data as TrainerRow);
      }
      setLoading(false);
    }
    if (id) fetchTrainer();
  }, [id]);

  function fmtDuration(mins: number): string {
    if (mins < 60) return `${mins} min`;
    return `${mins / 60}h`;
  }

  const sport = (() => {
    if (!trainer?.sports) return { name: '', emoji: '' };
    const raw = trainer.sports;
    return Array.isArray(raw) ? (raw[0] ?? { name: '', emoji: '' }) : raw;
  })();

  const profile = trainer ? {
    id: trainer.id,
    name: trainer.full_name,
    initials: initials(trainer.full_name),
    sport: sport.name,
    emoji: sport.emoji,
    rating: trainer.rating ?? 0,
    reviewCount: trainer.review_count ?? 0,
    online: false,
    price: trainer.price_per_hour ?? 0,
    clients: 0,
    experience: trainer.experience_years ?? 0,
    city: trainer.city ?? '',
    bio: trainer.bio ?? '',
    specializations: [] as string[],
    availability: [false, false, false, false, false, false, false],
    reviews: [] as { id: string; name: string; initials: string; rating: number; comment: string; date: string }[],
    verified: trainer.is_verified ?? false,
    sessionDuration: 60,
  } : null;

  const bg           = isDarkMode ? '#111827' : '#FFFFFF';
  const cardBg       = isDarkMode ? '#1F2937' : '#F9FAFB';
  const textPrimary  = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub      = isDarkMode ? '#9CA3AF' : '#6B7280';
  const borderColor  = isDarkMode ? '#374151' : '#F3F4F6';
  const chipBg       = isDarkMode ? '#1F2937' : '#F3F4F6';
  const chipText     = isDarkMode ? '#D1D5DB' : '#374151';

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color={BLUE} />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: bg }]}>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: cardBg, position: 'absolute', top: insets.top + 8, left: 16 }]}
          onPress={() => router.back()}>
          <ChevronLeft size={22} color={textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.errorText, { color: textSub }]}>
          {error ?? 'Trainer not found'}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: bg, borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: cardBg }]}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={22} color={textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPrimary }]} numberOfLines={1}>
          Trainer Profile
        </Text>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: cardBg }]}
          onPress={() => setIsFavorite(f => !f)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Heart
            size={20}
            color={isFavorite ? '#EF4444' : textSub}
            fill={isFavorite ? '#EF4444' : 'transparent'}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <View style={[styles.avatar, { backgroundColor: avatarColor(profile.id) }]}>
            <Text style={styles.avatarText}>{profile.initials}</Text>
          </View>

          <Text style={[styles.trainerName, { color: textPrimary }]}>{profile.name}</Text>

          {profile.verified && (
            <View style={styles.verifiedRow}>
              <BadgeCheck size={16} color="#FFFFFF" fill="#22C55E" strokeWidth={2.5} />
              <Text style={styles.verifiedText}>Verified Trainer</Text>
            </View>
          )}

          <View style={styles.sportRow}>
            <Text style={styles.sportEmoji}>{profile.emoji}</Text>
            <Text style={[styles.sportName, { color: textSub }]}>{profile.sport}</Text>
          </View>

          <View style={styles.heroMeta}>
            <Stars rating={profile.rating} size={15} />
            <Text style={[styles.ratingText, { color: textPrimary }]}>{profile.rating}</Text>
            <Text style={[styles.reviewCount, { color: textSub }]}>({profile.reviewCount} reviews)</Text>
          </View>

          <View style={styles.heroBadges}>
            <View style={[styles.cityBadge, { backgroundColor: chipBg }]}>
              <MapPin size={11} color={textSub} strokeWidth={2} />
              <Text style={[styles.cityBadgeText, { color: textSub }]}>{profile.city}</Text>
            </View>
            {profile.online && (
              <View style={styles.onlineBadge}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Active now</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Stats ── */}
        <View style={[styles.statsRow, { backgroundColor: cardBg, borderColor }]}>
          {[
            { value: `€${profile.price}`, label: 'per session', Icon: null },
            { value: String(profile.clients), label: 'clients', Icon: Users },
            { value: `${profile.experience} yrs`, label: 'experience', Icon: null },
            { value: fmtDuration(profile.sessionDuration), label: 'session', Icon: Timer },
          ].map((stat, i, arr) => (
            <View key={i} style={[styles.statCell, i < arr.length - 1 && { borderRightWidth: 1, borderRightColor: borderColor }]}>
              <View style={styles.statValueRow}>
                <Text style={[styles.statValue, { color: textPrimary }]}>{stat.value}</Text>
                {stat.Icon && <stat.Icon size={18} color={textSub} strokeWidth={1.75} />}
              </View>
              <Text style={[styles.statLabel, { color: textSub }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* ── About ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>About</Text>
          <Text style={[styles.bioText, { color: textSub }]}>{profile.bio}</Text>
        </View>

        {/* ── Specializations ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Specializations</Text>
          <View style={styles.chipWrap}>
            {profile.specializations.map(s => (
              <View key={s} style={[styles.chip, { backgroundColor: chipBg }]}>
                <Text style={[styles.chipText, { color: chipText }]}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Availability ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Availability</Text>
          <View style={styles.daysRow}>
            {DAYS.map((day, i) => {
              const available = profile.availability[i];
              return (
                <View key={day} style={[
                  styles.dayCell,
                  available
                    ? styles.dayCellActive
                    : [styles.dayCellInactive, { backgroundColor: chipBg }],
                ]}>
                  <Text style={[styles.dayText, { color: available ? '#FFFFFF' : textSub }]}>
                    {day}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Reviews ── */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Reviews</Text>
            <View style={styles.reviewsScore}>
              <Star size={14} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />
              <Text style={[styles.reviewsScoreText, { color: textPrimary }]}>
                {profile.rating} · {profile.reviewCount} reviews
              </Text>
            </View>
          </View>

          {profile.reviews.map(review => (
            <View key={review.id} style={[styles.reviewCard, { backgroundColor: cardBg, borderColor }]}>
              <View style={styles.reviewTop}>
                <View style={[styles.reviewAvatar, { backgroundColor: avatarColor(review.id) }]}>
                  <Text style={styles.reviewInitials}>{review.initials}</Text>
                </View>
                <View style={styles.reviewMeta}>
                  <Text style={[styles.reviewName, { color: textPrimary }]}>{review.name}</Text>
                  <Stars rating={review.rating} size={12} />
                </View>
                <Text style={[styles.reviewDate, { color: textSub }]}>{review.date}</Text>
              </View>
              <Text style={[styles.reviewComment, { color: textSub }]}>{review.comment}</Text>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* ── Sticky bottom bar ── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12, backgroundColor: bg, borderTopColor: borderColor }]}>
        <View>
          <Text style={[styles.bottomPrice, { color: textPrimary }]}>€{profile.price}<Text style={[styles.bottomPriceUnit, { color: textSub }]}>/session</Text></Text>
          <Text style={[styles.bottomPriceNote, { color: textSub }]}>per session</Text>
        </View>
        <View style={styles.bottomRight}>
          <TouchableOpacity style={styles.msgIconBtn} onPress={() => router.push('/chat/1')} activeOpacity={0.85}>
            <MessageCircle size={22} color={BLUE} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.bookBtn} onPress={() => router.push(`/booking/${profile.id}`)} activeOpacity={0.85}>
            <Text style={styles.bookBtnText}>Book Session</Text>
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 32,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Scroll
  scroll: {
    paddingTop: 8,
  },

  // Hero
  hero: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#374151',
  },
  trainerName: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#22C55E',
  },
  sportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sportEmoji: {
    fontSize: 18,
  },
  sportName: {
    fontSize: 15,
    fontWeight: '500',
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
  },
  reviewCount: {
    fontSize: 13,
  },
  heroBadges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  cityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  cityBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 4,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    gap: 3,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '400',
  },

  // Section
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  bioText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
  },

  // Chips
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Availability
  daysRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  dayCellActive: {
    backgroundColor: BLUE,
  },
  dayCellInactive: {},
  dayText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Reviews
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewsScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  reviewsScoreText: {
    fontSize: 13,
    fontWeight: '500',
  },
  reviewCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  reviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  reviewInitials: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  reviewMeta: {
    flex: 1,
    gap: 3,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewDate: {
    fontSize: 12,
  },
  reviewComment: {
    fontSize: 13,
    lineHeight: 20,
  },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  bottomPrice: {
    fontSize: 22,
    fontWeight: '700',
  },
  bottomPriceUnit: {
    fontSize: 14,
    fontWeight: '400',
  },
  bottomPriceNote: {
    fontSize: 12,
    marginTop: 1,
  },
  bottomRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgIconBtn: {
    width: 50,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: BLUE,
    paddingHorizontal: 24,
    height: 52,
    borderRadius: 14,
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

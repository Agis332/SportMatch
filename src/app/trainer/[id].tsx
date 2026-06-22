import { router, useLocalSearchParams } from 'expo-router';
import { Award, ChevronLeft, Clock, Heart, MapPin, Star, Users, Zap } from 'lucide-react-native';
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

// ─── Data ────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#B5C9E4', '#C8DDB5', '#E4CDB5', '#D4B5E4', '#B5E4D4',
  '#E4B5C8', '#C8B5E4', '#E4E4B5',
];
function avatarColor(id: string) {
  return AVATAR_COLORS[parseInt(id, 10) % AVATAR_COLORS.length];
}

interface Review {
  id: string;
  name: string;
  initials: string;
  rating: number;
  comment: string;
  date: string;
}

interface TrainerProfile {
  id: string;
  name: string;
  initials: string;
  sport: string;
  emoji: string;
  rating: number;
  reviewCount: number;
  online: boolean;
  price: number;
  sessions: number;
  experience: number;
  responseTime: string;
  city: string;
  bio: string;
  specializations: string[];
  availability: boolean[];
  reviews: Review[];
}

const PROFILES: Record<string, TrainerProfile> = {
  '1': {
    id: '1', name: 'Mantas Petrauskas', initials: 'MP', sport: 'Football', emoji: '⚽',
    rating: 4.8, reviewCount: 47, online: true, price: 35, sessions: 128, experience: 5,
    responseTime: '~1h', city: 'Vilnius',
    bio: 'Professional football coach with 5 years of experience training players of all skill levels. Former semi-professional player, now dedicated to helping others improve through structured, personalized sessions focused on technique and tactical awareness.',
    specializations: ['Dribbling', 'Shooting', 'Tactics', 'Fitness', 'Set pieces'],
    availability: [true, true, false, true, true, true, false],
    reviews: [
      { id: 'r1', name: 'Lukas V.', initials: 'LV', rating: 5, comment: 'Excellent coach! My technique improved significantly after just 4 sessions. Highly recommend to anyone serious about football.', date: 'Dec 2024' },
      { id: 'r2', name: 'Gabrielė M.', initials: 'GM', rating: 5, comment: 'Very professional and patient. He adapts training to your level and always pushes you forward constructively.', date: 'Nov 2024' },
      { id: 'r3', name: 'Tadas K.', initials: 'TK', rating: 4, comment: 'Great drills and good energy. Would love even more tactical work but overall very satisfied.', date: 'Oct 2024' },
    ],
  },
  '2': {
    id: '2', name: 'Rūta Kazlauskaitė', initials: 'RK', sport: 'Yoga', emoji: '🧘',
    rating: 4.9, reviewCount: 83, online: true, price: 45, sessions: 214, experience: 7,
    responseTime: '<30min', city: 'Vilnius',
    bio: 'Certified yoga instructor trained in Vinyasa and Hatha traditions with 7 years of teaching experience. I believe yoga is for everybody — my sessions are welcoming, mindful, and tailored to each student\'s body and goals.',
    specializations: ['Vinyasa flow', 'Hatha', 'Breathwork', 'Meditation', 'Flexibility'],
    availability: [true, false, true, true, false, true, true],
    reviews: [
      { id: 'r1', name: 'Simona P.', initials: 'SP', rating: 5, comment: 'Rūta is incredible. After just two months with her my flexibility and mindfulness have transformed completely.', date: 'Jan 2025' },
      { id: 'r2', name: 'Andrius B.', initials: 'AB', rating: 5, comment: 'I was skeptical about yoga but Rūta made it accessible and genuinely enjoyable. My back pain is gone!', date: 'Dec 2024' },
    ],
  },
  '3': {
    id: '3', name: 'Tomas Žukauskas', initials: 'TŽ', sport: 'Basketball', emoji: '🏀',
    rating: 4.7, reviewCount: 36, online: false, price: 30, sessions: 95, experience: 4,
    responseTime: '~2h', city: 'Kaunas',
    bio: 'Basketball trainer with a background in Lithuanian youth leagues. I focus on building solid fundamentals while making every session competitive and fun. Great fit for beginners and intermediate players looking to level up.',
    specializations: ['Ball handling', 'Shooting form', 'Defense', 'Footwork', 'Court vision'],
    availability: [false, true, true, false, true, true, false],
    reviews: [
      { id: 'r1', name: 'Mantvydas J.', initials: 'MJ', rating: 5, comment: 'Tomas completely rebuilt my shooting form. My percentage at practice went from 40% to 68% in 6 weeks.', date: 'Nov 2024' },
      { id: 'r2', name: 'Viktorija L.', initials: 'VL', rating: 4, comment: 'Fun and structured sessions. Tomas is great at explaining the why behind each drill. Very knowledgeable.', date: 'Oct 2024' },
    ],
  },
  '4': {
    id: '4', name: 'Aistė Mikalauskaitė', initials: 'AM', sport: 'Tennis', emoji: '🎾',
    rating: 4.6, reviewCount: 29, online: false, price: 50, sessions: 74, experience: 6,
    responseTime: '~3h', city: 'Vilnius',
    bio: 'Former competitive tennis player turned coach. I specialize in technique refinement and match strategy for intermediate to advanced players. My sessions are data-driven — I use video analysis to accelerate improvement.',
    specializations: ['Serve mechanics', 'Baseline game', 'Volleys', 'Match strategy', 'Video analysis'],
    availability: [true, true, false, false, true, true, false],
    reviews: [
      { id: 'r1', name: 'Karolis D.', initials: 'KD', rating: 5, comment: 'The video analysis sessions are a game changer. I could finally see what I was doing wrong on my backhand.', date: 'Dec 2024' },
      { id: 'r2', name: 'Neringa T.', initials: 'NT', rating: 4, comment: 'Very technical coach, thorough and detail-oriented. Perfect if you\'re serious about improving your game.', date: 'Nov 2024' },
    ],
  },
  '5': {
    id: '5', name: 'Darius Paulauskas', initials: 'DP', sport: 'Boxing', emoji: '🥊',
    rating: 4.9, reviewCount: 61, online: true, price: 40, sessions: 183, experience: 8,
    responseTime: '<1h', city: 'Klaipėda',
    bio: 'Licensed boxing coach with 8 years of experience training amateurs and fitness enthusiasts. My sessions combine technical boxing skills with high-intensity conditioning — you\'ll leave every session stronger and more confident.',
    specializations: ['Footwork', 'Combinations', 'Defense', 'Conditioning', 'Sparring'],
    availability: [true, true, true, false, true, false, true],
    reviews: [
      { id: 'r1', name: 'Robertas V.', initials: 'RV', rating: 5, comment: 'Best decision I made this year. Lost 8kg and learned to actually box. Darius is motivating and technically excellent.', date: 'Jan 2025' },
      { id: 'r2', name: 'Ieva S.', initials: 'IS', rating: 5, comment: 'I\'m a complete beginner and never felt intimidated. Darius is encouraging while still pushing you hard. 10/10.', date: 'Dec 2024' },
      { id: 'r3', name: 'Mindaugas P.', initials: 'MP', rating: 5, comment: 'Incredible trainer. My cardio and punch technique both improved massively in just 8 weeks.', date: 'Nov 2024' },
    ],
  },
};

const DEFAULT_PROFILE: TrainerProfile = {
  id: '0', name: 'Trainer', initials: '?', sport: 'Sport', emoji: '🏅',
  rating: 4.5, reviewCount: 12, online: false, price: 35, sessions: 40, experience: 3,
  responseTime: '~2h', city: 'Vilnius',
  bio: 'Experienced sports trainer dedicated to helping clients reach their personal fitness goals through tailored, effective training programs.',
  specializations: ['Fitness', 'Strength', 'Endurance', 'Technique'],
  availability: [true, true, false, true, true, false, false],
  reviews: [
    { id: 'r1', name: 'Jonas K.', initials: 'JK', rating: 5, comment: 'Great trainer, highly recommended!', date: 'Dec 2024' },
    { id: 'r2', name: 'Laura M.', initials: 'LM', rating: 4, comment: 'Very professional and knowledgeable.', date: 'Nov 2024' },
  ],
};

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

  const profile = PROFILES[id] ?? DEFAULT_PROFILE;

  const bg           = isDarkMode ? '#111827' : '#FFFFFF';
  const cardBg       = isDarkMode ? '#1F2937' : '#F9FAFB';
  const textPrimary  = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub      = isDarkMode ? '#9CA3AF' : '#6B7280';
  const borderColor  = isDarkMode ? '#374151' : '#F3F4F6';
  const chipBg       = isDarkMode ? '#1F2937' : '#F3F4F6';
  const chipText     = isDarkMode ? '#D1D5DB' : '#374151';

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
            { value: `€${profile.price}`, label: 'per hour',  Icon: null },
            { value: String(profile.sessions), label: 'clients', Icon: Users },
            { value: `${profile.experience} yrs`, label: 'experience', Icon: null },
            { value: profile.responseTime, label: 'response', Icon: null },
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
          <Text style={[styles.bottomPrice, { color: textPrimary }]}>€{profile.price}<Text style={[styles.bottomPriceUnit, { color: textSub }]}>/hr</Text></Text>
          <Text style={[styles.bottomPriceNote, { color: textSub }]}>per session</Text>
        </View>
        <TouchableOpacity style={styles.bookBtn} onPress={() => router.push(`/booking/${profile.id}`)} activeOpacity={0.85}>
          <Text style={styles.bookBtnText}>Book Session</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  bookBtn: {
    backgroundColor: BLUE,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
